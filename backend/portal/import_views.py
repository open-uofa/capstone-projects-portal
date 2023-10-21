import traceback
from dataclasses import dataclass

import pandas as pd
from django.core.files.uploadedfile import UploadedFile
from django.db import transaction
from rest_framework import status
from rest_framework.decorators import api_view
from rest_framework.request import Request
from rest_framework.response import Response

from .models import ClientOrg, Project, User
from .serializers import ClientOrgSerializer, ProjectSerializer, UserSerializer


@dataclass
class ParsedUsers:
    new_users: list[User]
    existing_users: list[User]
    errors: list[str]


@dataclass
class ParsedOrgs:
    new_orgs: list[ClientOrg]
    existing_orgs: list[ClientOrg]
    errors: list[str]


@dataclass
class ParsedProjects:
    new_projects: list[Project]
    existing_projects: list[Project]
    errors: list[str]


@dataclass
class CSVData:
    users: pd.DataFrame
    client_orgs: pd.DataFrame
    projects: pd.DataFrame
    links: pd.DataFrame


@dataclass
class ImportedData:
    new_users: list[User]
    existing_users: list[User]

    new_orgs: list[ClientOrg]
    existing_orgs: list[ClientOrg]

    new_projects: list[Project]
    existing_projects: list[Project]

    errors: list[str]
    warnings: list[str]


def parse_users(dataframe: pd.DataFrame) -> ParsedUsers:
    parsed_users = ParsedUsers([], [], [])

    # drop any rows with the same email, keeps first
    dataframe = dataframe.drop_duplicates(ignore_index=True, subset=["email"])

    for index, row in dataframe.iterrows():
        user = User(
            email=row["email"],
            name=row["name"],
            github_username=row["github_username"],
        )

        try:
            existing_user = User.objects.get(email=user.email)
            parsed_users.existing_users.append(existing_user)
        except User.DoesNotExist:
            # check for existing users with different email but same name or github username
            if user.name != "":
                users_matching_name = User.objects.filter(name=user.name)
                if len(users_matching_name) > 0:
                    parsed_users.errors.append(
                        f'Users already exist with name "{user.name}": {users_matching_name}'
                    )
            if user.github_username != "":
                users_matching_github_username = User.objects.filter(
                    github_username=user.github_username
                )
                if len(users_matching_github_username) > 0:
                    parsed_users.errors.append(
                        f'Users already exist with github username "{user.github_username}": {users_matching_github_username}'
                    )

            user.save()
            parsed_users.new_users.append(user)

    return parsed_users


def parse_orgs(dataframe: pd.DataFrame) -> ParsedOrgs:
    parsed_orgs = ParsedOrgs([], [], [])

    # drop any rows with the same name, keeps first
    dataframe = dataframe.drop_duplicates(ignore_index=True, subset=["client_org_name"])

    for index, row in dataframe.iterrows():
        org = ClientOrg(name=row["client_org_name"])

        try:
            existing_org = ClientOrg.objects.get(name=org.name)
            parsed_orgs.existing_orgs.append(existing_org)
        except ClientOrg.DoesNotExist:
            org.save()
            parsed_orgs.new_orgs.append(org)

    return parsed_orgs


def parse_projects(dataframe: pd.DataFrame) -> ParsedProjects:
    parsed_projects = ParsedProjects([], [], [])

    # drop any rows with the same name, keeps first
    dataframe = dataframe.drop_duplicates(ignore_index=True, subset=["project_name"])

    for index, row in dataframe.iterrows():
        project = Project(
            name=row["project_name"],
            year=int(row["project_year"]),
            term=row["project_term"],
            is_published=False,
        )

        try:
            existing_project = Project.objects.get(name=project.name)
            parsed_projects.existing_projects.append(existing_project)
        except Project.DoesNotExist:
            project.save()
            parsed_projects.new_projects.append(project)

    return parsed_projects


def parse_csv(csv_file: UploadedFile) -> CSVData:
    dataframe = pd.read_csv(csv_file).fillna("")

    students = dataframe[
        ["student_email", "student_name", "student_github_username"]
    ].rename(
        columns={
            "student_email": "email",
            "student_name": "name",
            "student_github_username": "github_username",
        }
    )
    client_reps = dataframe[
        ["client_rep_email", "client_rep_name", "client_rep_github_username"]
    ].rename(
        columns={
            "client_rep_email": "email",
            "client_rep_name": "name",
            "client_rep_github_username": "github_username",
        }
    )
    tas = dataframe[["ta_email", "ta_name", "ta_github_username"]].rename(
        columns={
            "ta_email": "email",
            "ta_name": "name",
            "ta_github_username": "github_username",
        }
    )
    client_orgs = dataframe[["client_org_name"]]
    projects = dataframe[["project_name", "project_year", "project_term"]]
    links = dataframe[
        [
            "project_name",
            "client_org_name",
            "client_rep_email",
            "ta_email",
            "student_email",
        ]
    ]

    # combine students, TAs, and client reps into a single users dataframe
    users = pd.concat([students, tas, client_reps], ignore_index=True).drop_duplicates(
        ignore_index=True
    )

    return CSVData(users, client_orgs, projects, links)


@transaction.atomic
def import_data(data: CSVData) -> ImportedData:
    parsed_users = parse_users(data.users)
    parsed_orgs = parse_orgs(data.client_orgs)
    parsed_projects = parse_projects(data.projects)

    warnings = []
    errors = parsed_users.errors + parsed_orgs.errors + parsed_projects.errors
    new_projects = []
    existing_projects = []

    # error parsing CSV, can't go any further
    if len(errors) > 0:
        transaction.set_rollback(True)
    else:
        for index, row in data.links.iterrows():
            project = Project.objects.get(name=row["project_name"])
            org = ClientOrg.objects.get(name=row["client_org_name"])
            rep = User.objects.get(email=row["client_rep_email"])
            ta = User.objects.get(email=row["ta_email"])
            student = User.objects.get(email=row["student_email"])

            project.client_org = org
            project.client_rep = rep
            project.ta = ta
            project.students.add(student)
            org.reps.add(rep)

            student.save()
            ta.save()
            rep.save()
            org.save()
            project.save()
            if project in parsed_projects.new_projects:
                new_projects.append(project)
            elif project in parsed_projects.existing_projects:
                existing_projects.append(project)

    new_projects = list(set(new_projects))
    existing_projects = list(set(existing_projects))

    return ImportedData(
        new_users=parsed_users.new_users,
        existing_users=parsed_users.existing_users,
        new_orgs=parsed_orgs.new_orgs,
        existing_orgs=parsed_orgs.existing_orgs,
        new_projects=new_projects,
        existing_projects=existing_projects,
        errors=errors,
        warnings=warnings,
    )


def generate_response(data: ImportedData, request: Request) -> dict:
    return {
        "errors": data.errors,
        "warnings": data.warnings,
        "users": {
            "new": UserSerializer(
                data.new_users, many=True, context={"request": request}
            ).data,
            "existing": UserSerializer(
                data.existing_users, many=True, context={"request": request}
            ).data,
        },
        "orgs": {
            "new": ClientOrgSerializer(
                data.new_orgs, many=True, context={"request": request}
            ).data,
            "existing": ClientOrgSerializer(
                data.existing_orgs, many=True, context={"request": request}
            ).data,
        },
        "projects": {
            "new": ProjectSerializer(
                data.new_projects, many=True, context={"request": request}
            ).data,
            "existing": ProjectSerializer(
                data.existing_projects, many=True, context={"request": request}
            ).data,
        },
    }


@api_view(["POST"])
@transaction.atomic
def validate_csv(request):
    """
    Validates a CSV file and returns a list of errors and warnings.
    """
    if not request.user.is_superuser:
        return Response(
            {"errors": ["Must be admin to import data"], "warnings": []},
            status=status.HTTP_403_FORBIDDEN,
        )

    try:
        csv_file = request.FILES["file"]
        data = parse_csv(csv_file)
    except Exception:
        return Response(
            {
                "errors": [f"Error parsing CSV: {traceback.format_exc()}"],
                "warnings": [],
            },
            status=status.HTTP_400_BAD_REQUEST,
        )

    try:
        imported_data = import_data(data)
    except Exception:
        return Response(
            {
                "errors": [f"Error importing data: {traceback.format_exc()}"],
                "warnings": [],
            },
            status=status.HTTP_400_BAD_REQUEST,
        )

    response_body = generate_response(imported_data, request)
    response_status = (
        status.HTTP_200_OK
        if len(imported_data.errors) == 0
        else status.HTTP_400_BAD_REQUEST
    )

    # validating, so rollback any changes that were made
    transaction.set_rollback(True)

    return Response(response_body, status=response_status)


@api_view(["POST"])
@transaction.atomic  # all or nothing, rollback if any database errors occur
def import_csv(request):
    """
    Imports a CSV file and returns a list of errors and warnings.
    """
    if not request.user.is_superuser:
        return Response(
            {"errors": ["Must be admin to import data"], "warnings": []},
            status=status.HTTP_403_FORBIDDEN,
        )

    try:
        csv_file = request.FILES["file"]
        data = parse_csv(csv_file)
    except Exception:
        return Response(
            {
                "errors": [f"Error parsing CSV: {traceback.format_exc()}"],
                "warnings": [],
            },
            status=status.HTTP_400_BAD_REQUEST,
        )

    try:
        imported_data = import_data(data)
    except Exception:
        return Response(
            {
                "errors": [f"Error importing data: {traceback.format_exc()}"],
                "warnings": [],
            },
            status=status.HTTP_400_BAD_REQUEST,
        )

    response_body = generate_response(imported_data, request)
    response_status = (
        status.HTTP_200_OK
        if len(imported_data.errors) == 0
        else status.HTTP_400_BAD_REQUEST
    )

    return Response(response_body, status=response_status)
