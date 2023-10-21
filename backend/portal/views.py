import json
from typing import Dict

from django.contrib.auth import get_user_model
from django.shortcuts import get_object_or_404
from portal.emails import send_proposal_email
from rest_framework import exceptions, mixins, status, viewsets
from rest_framework.request import Request
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import ClientOrg, MailingList, Project, Proposal, Tag
from .serializers import (
    ClientOrgSerializer,
    ProjectSerializer,
    ProposalSerializer,
    TagSerializer,
    UserSerializer,
    UserShortSerializer,
)


class UserViewSet(
    mixins.RetrieveModelMixin,
    mixins.UpdateModelMixin,
    viewsets.GenericViewSet,
):
    """
    A GenericViewset that allows for retrieve, update, and partial update of user models
    """

    queryset = get_user_model().objects.all()
    serializer_class = UserSerializer

    def update(self, request, pk=None):
        user = get_object_or_404(self.queryset, pk=pk)
        current_user = request.user

        # Only the user themself or an admin can edit user fields
        if user != current_user and not current_user.is_superuser:
            raise exceptions.PermissionDenied()

        else:
            serializer = UserSerializer(
                user, context={"request": request}, data=request.data
            )

        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def partial_update(self, request, pk=None):
        user = get_object_or_404(self.queryset, pk=pk)
        current_user = request.user

        # Only the user themself or an admin can edit user fields
        if user != current_user and not current_user.is_superuser:
            raise exceptions.PermissionDenied()

        else:
            serializer = UserSerializer(
                user, context={"request": request}, data=request.data, partial=True
            )

        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class CurrentUserInfo(APIView):
    def get(self, request: Request) -> Response:
        """
        Get information for the user making a request.
        If the user is not logged in, the returned value will be {"logged_in": false}
        If the user is logged in, the returned value will have the following keys:
        - logged_in: true
        - is_superuser: if the user is a superuser
        - has_password: if the user has a password set
        - all of the keys of the UserShortSerializer
        """
        return Response(data=self.for_request(request))

    @classmethod
    def for_request(cls, request: Request) -> Dict[str, any]:
        user = request.user
        if user.is_anonymous:
            return {"logged_in": False}
        return {
            **{
                "logged_in": True,
                "is_superuser": user.is_superuser,
                "has_password": user.has_usable_password(),
            },
            # Need to pass the request to UserShortSerializer
            # so that the image field will have an absolute URL
            **UserShortSerializer(user, context={"request": request}).data,
        }


class ClientOrgViewSet(
    mixins.ListModelMixin,
    mixins.RetrieveModelMixin,
    mixins.UpdateModelMixin,
    viewsets.GenericViewSet,
):
    """
    A GenericViewset that allows for get, retrieve, update, and partial update of client org models visible to the user
    """

    serializer_class = ClientOrgSerializer

    def get_queryset(self):
        return ClientOrg.objects.visible_to(self.request.user)

    def update(self, request, pk=None):
        org = get_object_or_404(self.get_queryset(), pk=pk)
        current_user = request.user

        # Only the orgs client rep or an admin can edit orgs fields
        if current_user.is_anonymous or (
            not current_user.is_rep_of(org) and not current_user.is_superuser
        ):
            raise exceptions.PermissionDenied()

        else:
            serializer = ClientOrgSerializer(
                org, context={"request": request}, data=request.data
            )

        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def partial_update(self, request, pk=None):
        org = get_object_or_404(self.get_queryset(), pk=pk)
        current_user = request.user

        # Only the orgs client rep or an admin can edit orgs fields
        if current_user.is_anonymous or (
            not current_user.is_rep_of(org) and not current_user.is_superuser
        ):
            raise exceptions.PermissionDenied()

        else:
            serializer = ClientOrgSerializer(
                org, context={"request": request}, data=request.data, partial=True
            )

        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class ProjectViewSet(
    mixins.ListModelMixin,
    mixins.RetrieveModelMixin,
    mixins.UpdateModelMixin,
    viewsets.GenericViewSet,
):
    """
    A GenericViewset that allows for get, retrieve, update, and partial update of project models visible to the user
    """

    serializer_class = ProjectSerializer
    # Sets which fields a user can edit
    serializer_fields = [
        "id",
        "students",
        "ta",
        "client_rep",
        "client_org",
        "name",
        "summary",
        "video",
        "tags",
        "type",
        "tagline",
        "year",
        "term",
        "screenshot",
        "presentation",
        "website_url",
        "source_code_url",
        "logo_url",
        "review",
        "storyboard",
    ]

    def get_queryset(self):
        if self.request.query_params.get("home_page") == "true":
            return Project.objects.visible_to(self.request.user).filter(
                display_on_home_page=True
            )
        else:
            return Project.objects.visible_to(self.request.user)

    def update(self, request, pk=None):
        project = get_object_or_404(self.get_queryset(), pk=pk)
        current_user = request.user

        # User has no relation to the project
        if current_user.is_anonymous or (
            current_user.id != project.client_rep.id
            and not current_user.is_student_of(project)
            and not current_user.id == project.ta.id
            and not current_user.is_superuser
        ):
            raise exceptions.PermissionDenied()

        else:

            request_data = request.data.copy()

            # Any related user can edit the tags
            if "tags" in request.data.keys():
                self.set_tags(request.data["tags"], project)
                del request_data["tags"]

            # TAs and Admins can edit all fields of a project
            if current_user.id == project.ta.id or current_user.is_superuser:
                serializer = ProjectSerializer(project, data=request.data)

            # Client reps can edit all fields except publication status of a project
            elif current_user.id == project.client_rep.id:
                serializer = ProjectSerializer(
                    project, data=request_data, fields=self.serializer_fields
                )

            # Students can't edit publication status or client review of a project
            elif current_user.is_student_of(project):
                student_fields = self.serializer_fields[:]
                student_fields.remove("review")

                serializer = ProjectSerializer(
                    project, data=request_data, fields=student_fields
                )

        if serializer.is_valid():
            serializer.save()
            serializer = ProjectSerializer(project)
            return Response(serializer.data)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def partial_update(self, request, pk=None):
        project = get_object_or_404(self.get_queryset(), pk=pk)
        current_user = request.user

        # User has no relation to the project
        if current_user.is_anonymous or (
            current_user.id != project.client_rep.id
            and not current_user.is_student_of(project)
            and not current_user.id == project.ta.id
            and not current_user.is_superuser
        ):
            raise exceptions.PermissionDenied()

        else:

            request_data = request.data.copy()

            # Any related user can edit the tags
            if "tags" in request.data.keys():
                self.set_tags(request.data["tags"], project)
                del request_data["tags"]

            # TAs and Admins can edit all fields of a project
            if current_user.id == project.ta.id or current_user.is_superuser:
                serializer = ProjectSerializer(project, data=request_data, partial=True)

            # Client reps can edit all fields except publication status of a project
            elif current_user.id == project.client_rep.id:
                serializer = ProjectSerializer(
                    project,
                    data=request_data,
                    fields=self.serializer_fields,
                    partial=True,
                )

            # Students can't edit publication status or client review of a project
            elif current_user.is_student_of(project):
                student_fields = self.serializer_fields[:]
                student_fields.remove("review")

                serializer = ProjectSerializer(
                    project, data=request_data, fields=student_fields, partial=True
                )

        if serializer.is_valid():
            serializer.save()
            serializer = ProjectSerializer(project)
            return Response(serializer.data)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    """
    If tags were edited, apply the changes
    """

    def set_tags(self, tags, project):
        json_tags = tags

        if not (type(tags) is list):
            if tags == "[]":
                project.tags.clear()
                return

            json_tags = []
            for tag in tags[1:-1].split(","):
                json_tags.append(json.loads(tag))

        # Remove all tags
        project.tags.clear()
        for tag in json_tags:
            # Create tag if new
            if not Tag.objects.filter(value__iexact=tag["value"]):
                self.create_tag(tag)

            # If tag is not a repeat, add it to tags
            if tag not in project.tags.values():
                t = Tag.objects.get(value__iexact=tag["value"])
                project.tags.add(t)

    """
    If a new tag is discovered, create it
    """

    def create_tag(self, tag):
        # Create a new tag
        serializer = TagSerializer(data=tag)
        if serializer.is_valid():
            serializer.save()

        else:
            raise exceptions.ValidationError()


class ProposalViewSet(mixins.CreateModelMixin, viewsets.GenericViewSet):
    """
    A GenericViewset that only allows creation of proposal models, and sends an email on creation.
    """

    queryset = Proposal.objects.all()
    serializer_class = ProposalSerializer

    def create(self, request):
        serializer = ProposalSerializer(data=request.data)

        if serializer.is_valid():
            proposal_instance = serializer.save()

            mail_queryset = MailingList.objects.all()

            # If there are emails in the mailing list, send an email to them
            if mail_queryset:
                send_proposal_email(
                    proposal_instance,
                    [subscriber.email for subscriber in mail_queryset],
                )

            return Response(serializer.data, status=status.HTTP_200_OK)

        return Response(status=status.HTTP_400_BAD_REQUEST)
