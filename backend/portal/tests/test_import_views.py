import pandas as pd
from django.core.files.uploadedfile import SimpleUploadedFile
from django.urls import reverse
from portal.import_views import CSVData, import_data
from portal.models import ClientOrg, Project, User
from rest_framework.test import APITestCase

VALID_CSV = b"""project_name,project_year,project_term,client_org_name,client_rep_email,client_rep_name,client_rep_github_username,ta_email,ta_name,ta_github_username,student_email,student_name,student_github_username
                CMPUT 401 Project Portal,2021,Fall,CMPUT 401,ildar@ualberta.ca,Ildar Akhmetov,,mohayemin@ualberta.ca,Mohayeminul Islam,,wfenton@ualberta.ca,Will Fenton,willfenton
                CMPUT 401 Project Portal,2021,Fall,CMPUT 401,ildar@ualberta.ca,Ildar Akhmetov,,mohayemin@ualberta.ca,Mohayeminul Islam,,aakindel@ualberta.ca,Ayo Akindele,aakindel
                CMPUT 401 Project Portal,2021,Fall,CMPUT 401,ildar@ualberta.ca,Ildar Akhmetov,,mohayemin@ualberta.ca,Mohayeminul Islam,,mclean1@ualberta.ca,Kyle McLean,kylemclean
                CMPUT 401 Project Portal,2021,Fall,CMPUT 401,ildar@ualberta.ca,Ildar Akhmetov,,mohayemin@ualberta.ca,Mohayeminul Islam,,nahmed2@ualberta.ca,Natasha Osmani,osmani2
                CMPUT 401 Project Portal,2021,Fall,CMPUT 401,ildar@ualberta.ca,Ildar Akhmetov,,mohayemin@ualberta.ca,Mohayeminul Islam,,crasta@ualberta.ca,Alisha Crasta,alisha03
                CMPUT 401 Project Portal,2021,Fall,CMPUT 401,ildar@ualberta.ca,Ildar Akhmetov,,mohayemin@ualberta.ca,Mohayeminul Islam,,essilfie@ualberta.ca,Andrews Essilfie,essilfie
                New Project,2021,Winter,CMPUT 401,ildar@ualberta.ca,Ildar Akhmetov,,mohayemin@ualberta.ca,Mohayeminul Islam,,wfenton@ualberta.ca,Will Fenton,willfenton
                New Project,2021,Winter,CMPUT 401,ildar@ualberta.ca,Ildar Akhmetov,,mohayemin@ualberta.ca,Mohayeminul Islam,,newstudent1@ualberta.ca,New Student 1,newstudent1
                New Project,2021,Winter,CMPUT 401,ildar@ualberta.ca,Ildar Akhmetov,,mohayemin@ualberta.ca,Mohayeminul Islam,,newstudent2@ualberta.ca,New Student 2,"""

# causes an exception when parsing
INVALID_CSV = b"""project_name,"""

# causes an exception when importing
BAD_DATA_CSV = b"""project_name,project_year,project_term,client_org_name,client_rep_email,client_rep_name,client_rep_github_username,ta_email,ta_name,ta_github_username,student_email,student_name,student_github_username
                ,,,,,,,,,,,,"""


class CSVImportTest(APITestCase):
    """
    Testing the CSV validation and importing functionality.
    """

    # "CMPUT 401 Project Portal" and its org/users created, but not "New Project"
    fixtures = ["csv_import_test.json"]

    # Test the CSV validation view
    def test_validate_view(self):
        with self.subTest("Anonymous users can't validate"):
            # Act
            response = self.client.post(reverse("validate_csv"))

            # Assert
            self.assertEqual(response.status_code, 403)
            self.assertTrue("Must be admin to import data" in response.data["errors"])

        with self.subTest("Non-admins can't validate"):
            # Arrange
            user = User.objects.get(
                id="10d5efa9-0f37-4fab-88f3-ed036ab2442e"
            )  # Non-admin
            self.client.force_authenticate(user=user)

            # Act
            response = self.client.post(reverse("validate_csv"))

            # Assert
            self.assertEqual(response.status_code, 403)
            self.assertTrue("Must be admin to import data" in response.data["errors"])

        with self.subTest("Admins can validate"):
            # Arrange
            user = User.objects.get(id="656098e6-990b-41e2-9c01-5686798f5bc0")  # Admin
            self.client.force_authenticate(user=user)

            # Act
            csv_file = SimpleUploadedFile("data.csv", VALID_CSV)
            response = self.client.post(reverse("validate_csv"), {"file": csv_file})

            # Assert
            self.assertEqual(response.status_code, 200)
            self.assertEqual(len(response.data["errors"]), 0)
            self.assertEqual(len(response.data["warnings"]), 0)

        with self.subTest("400 response if no file is uploaded"):
            # Arrange
            user = User.objects.get(id="656098e6-990b-41e2-9c01-5686798f5bc0")  # Admin
            self.client.force_authenticate(user=user)

            # Act
            response = self.client.post(reverse("validate_csv"))

            # Assert
            self.assertEqual(response.status_code, 400)
            self.assertTrue(response.data["errors"][0].startswith("Error parsing CSV"))

        with self.subTest("400 response if CSV is invalid"):
            # Arrange
            user = User.objects.get(id="656098e6-990b-41e2-9c01-5686798f5bc0")  # Admin
            self.client.force_authenticate(user=user)

            # Act
            csv_file = SimpleUploadedFile("data.csv", INVALID_CSV)
            response = self.client.post(reverse("validate_csv"), {"file": csv_file})

            # Assert
            self.assertEqual(response.status_code, 400)
            self.assertTrue(response.data["errors"][0].startswith("Error parsing CSV"))

        with self.subTest("400 response if data import fails"):
            # Arrange
            user = User.objects.get(id="656098e6-990b-41e2-9c01-5686798f5bc0")  # Admin
            self.client.force_authenticate(user=user)

            # Act
            csv_file = SimpleUploadedFile("data.csv", BAD_DATA_CSV)
            response = self.client.post(reverse("validate_csv"), {"file": csv_file})

            # Assert
            self.assertEqual(response.status_code, 400)
            self.assertTrue(
                response.data["errors"][0].startswith("Error importing data")
            )

        with self.subTest("Validate endpoint does not modify any data"):
            # Arrange
            user = User.objects.get(id="656098e6-990b-41e2-9c01-5686798f5bc0")  # Admin
            self.client.force_authenticate(user=user)

            # Act
            csv_file = SimpleUploadedFile("data.csv", VALID_CSV)
            response = self.client.post(reverse("validate_csv"), {"file": csv_file})

            # Assert
            self.assertEqual(response.status_code, 200)
            self.assertEqual(len(response.data["errors"]), 0)
            self.assertEqual(len(response.data["warnings"]), 0)
            self.assertEqual(Project.objects.filter(name="New Project").count(), 0)
            self.assertEqual(
                User.objects.filter(email__startswith="newstudent").count(), 0
            )

    def test_import_data_happy_path(self):
        with self.subTest("Happy path"):
            # Arrange
            users = pd.DataFrame(
                [
                    ["student1@example.com", "Student 1", "student1"],
                    ["student2@example.com", "Student 2", "student2"],
                    ["ta@example.com", "Teaching Assistant", "ta"],
                    ["rep@example.com", "Client Representative", "rep"],
                ],
                columns=["email", "name", "github_username"],
            )
            client_orgs = pd.DataFrame(
                [["Client Organization"]], columns=["client_org_name"]
            )
            projects = pd.DataFrame(
                [["Project", "2021", "Fall"]],
                columns=["project_name", "project_year", "project_term"],
            )
            links = pd.DataFrame(
                [
                    [
                        "Project",
                        "Client Organization",
                        "rep@example.com",
                        "ta@example.com",
                        "student1@example.com",
                    ],
                    [
                        "Project",
                        "Client Organization",
                        "rep@example.com",
                        "ta@example.com",
                        "student2@example.com",
                    ],
                ],
                columns=[
                    "project_name",
                    "client_org_name",
                    "client_rep_email",
                    "ta_email",
                    "student_email",
                ],
            )
            csv_data = CSVData(users, client_orgs, projects, links)

            # Act
            imported_data = import_data(csv_data)

            # Assert
            self.assertEqual(len(imported_data.errors), 0)
            self.assertEqual(len(imported_data.warnings), 0)
            self.assertEqual(len(imported_data.new_users), 4)
            self.assertEqual(len(imported_data.existing_users), 0)
            self.assertEqual(len(imported_data.new_orgs), 1)
            self.assertEqual(len(imported_data.existing_orgs), 0)
            self.assertEqual(len(imported_data.new_projects), 1)
            self.assertEqual(len(imported_data.existing_projects), 0)

            student1 = User.objects.get(email="student1@example.com")
            self.assertEqual(student1.name, "Student 1")
            self.assertEqual(student1.github_username, "student1")

            student2 = User.objects.get(email="student2@example.com")
            self.assertEqual(student2.name, "Student 2")
            self.assertEqual(student2.github_username, "student2")

            ta = User.objects.get(email="ta@example.com")
            self.assertEqual(ta.name, "Teaching Assistant")
            self.assertEqual(ta.github_username, "ta")

            rep = User.objects.get(email="rep@example.com")
            self.assertEqual(rep.name, "Client Representative")
            self.assertEqual(rep.github_username, "rep")

            org = ClientOrg.objects.get(name="Client Organization")
            self.assertTrue(org.reps.filter(email=rep.email).exists())
            self.assertEqual(org.reps.count(), 1)

            project = Project.objects.get(name="Project")
            self.assertEqual(project.year, 2021)
            self.assertEqual(project.term, "Fall")
            self.assertEqual(project.client_org, org)
            self.assertEqual(project.ta, ta)
            self.assertTrue(project.students.filter(email=student1.email).exists())
            self.assertTrue(project.students.filter(email=student2.email).exists())
            self.assertEqual(project.students.count(), 2)

        with self.subTest("Happy path using existing data"):
            # Arrange
            users = pd.DataFrame(
                [["wfenton@ualberta.ca", "", ""], ["aakindel@ualberta.ca", "", ""]],
                columns=["email", "name", "github_username"],
            )
            client_orgs = pd.DataFrame(
                [["Client Organization"]], columns=["client_org_name"]
            )
            projects = pd.DataFrame(
                [["Project", "2021", "Fall"]],
                columns=["project_name", "project_year", "project_term"],
            )
            links = pd.DataFrame(
                [
                    [
                        "Project",
                        "Client Organization",
                        "rep@example.com",
                        "ta@example.com",
                        "aakindel@ualberta.ca",
                    ],
                    [
                        "Project",
                        "Client Organization",
                        "rep@example.com",
                        "ta@example.com",
                        "wfenton@ualberta.ca",
                    ],
                ],
                columns=[
                    "project_name",
                    "client_org_name",
                    "client_rep_email",
                    "ta_email",
                    "student_email",
                ],
            )
            csv_data = CSVData(users, client_orgs, projects, links)

            # Act
            imported_data = import_data(csv_data)

            # Assert
            self.assertEqual(len(imported_data.errors), 0)
            self.assertEqual(len(imported_data.warnings), 0)
            self.assertEqual(len(imported_data.new_users), 0)
            self.assertEqual(len(imported_data.existing_users), 2)
            self.assertEqual(len(imported_data.new_orgs), 0)
            self.assertEqual(len(imported_data.existing_orgs), 1)
            self.assertEqual(len(imported_data.new_projects), 0)
            self.assertEqual(len(imported_data.existing_projects), 1)

            student1 = User.objects.get(email="aakindel@ualberta.ca")
            student2 = User.objects.get(email="wfenton@ualberta.ca")

            project = Project.objects.get(name="Project")
            self.assertTrue(project.students.filter(email=student1.email).exists())
            self.assertTrue(project.students.filter(email=student2.email).exists())
            self.assertEqual(project.students.count(), 4)

    def test_import_data_sad_path(self):
        with self.subTest("Error when importing user with same name as existing user"):
            # Arrange
            users = pd.DataFrame(
                [
                    ["student1@example.com", "Student 1", "student1"],
                    ["student2@example.com", "Student 2", "student2"],
                    ["ta@example.com", "Teaching Assistant", "ta"],
                    # there is already a user with the name "Ildar Akhmetov"
                    ["rep@example.com", "Ildar Akhmetov", "rep"],
                ],
                columns=["email", "name", "github_username"],
            )
            client_orgs = pd.DataFrame(
                [["Client Organization"]], columns=["client_org_name"]
            )
            projects = pd.DataFrame(
                [["Project", "2021", "Fall"]],
                columns=["project_name", "project_year", "project_term"],
            )
            links = pd.DataFrame(
                [
                    [
                        "Project",
                        "Client Organization",
                        "rep@example.com",
                        "ta@example.com",
                        "student1@example.com",
                    ],
                    [
                        "Project",
                        "Client Organization",
                        "rep@example.com",
                        "ta@example.com",
                        "student2@example.com",
                    ],
                ],
                columns=[
                    "project_name",
                    "client_org_name",
                    "client_rep_email",
                    "ta_email",
                    "student_email",
                ],
            )
            csv_data = CSVData(users, client_orgs, projects, links)

            # Act
            imported_data = import_data(csv_data)

            # Assert
            self.assertEqual(len(imported_data.errors), 1)
            self.assertTrue(
                imported_data.errors[0].startswith(
                    'Users already exist with name "Ildar Akhmetov"'
                )
            )

            # Nothing was saved to the DB
            self.assertEqual(
                User.objects.filter(email__startswith="student").count(), 0
            )
            self.assertEqual(User.objects.filter(email__startswith="ta").count(), 0)
            self.assertEqual(User.objects.filter(email__startswith="rep").count(), 0)
            self.assertEqual(
                ClientOrg.objects.filter(name="Client Organization").count(), 0
            )
            self.assertEqual(Project.objects.filter(name="Project").count(), 0)

        with self.subTest(
            "Error when importing user with same github username as existing user"
        ):
            # Arrange
            users = pd.DataFrame(
                [
                    ["student1@example.com", "Student 1", "student1"],
                    ["student2@example.com", "Student 2", "student2"],
                    ["ta@example.com", "Teaching Assistant", "ta"],
                    # there is already a user with the github username "aakindel"
                    ["rep@example.com", "Client Representative", "aakindel"],
                ],
                columns=["email", "name", "github_username"],
            )
            client_orgs = pd.DataFrame(
                [["Client Organization"]], columns=["client_org_name"]
            )
            projects = pd.DataFrame(
                [["Project", "2021", "Fall"]],
                columns=["project_name", "project_year", "project_term"],
            )
            links = pd.DataFrame(
                [
                    [
                        "Project",
                        "Client Organization",
                        "rep@example.com",
                        "ta@example.com",
                        "student1@example.com",
                    ],
                    [
                        "Project",
                        "Client Organization",
                        "rep@example.com",
                        "ta@example.com",
                        "student2@example.com",
                    ],
                ],
                columns=[
                    "project_name",
                    "client_org_name",
                    "client_rep_email",
                    "ta_email",
                    "student_email",
                ],
            )
            csv_data = CSVData(users, client_orgs, projects, links)

            # Act
            imported_data = import_data(csv_data)

            # Assert
            self.assertEqual(len(imported_data.errors), 1)
            self.assertTrue(
                imported_data.errors[0].startswith(
                    'Users already exist with github username "aakindel"'
                )
            )

            # Nothing was saved to the DB
            self.assertEqual(
                User.objects.filter(email__startswith="student").count(), 0
            )
            self.assertEqual(User.objects.filter(email__startswith="ta").count(), 0)
            self.assertEqual(User.objects.filter(email__startswith="rep").count(), 0)
            self.assertEqual(
                ClientOrg.objects.filter(name="Client Organization").count(), 0
            )
            self.assertEqual(Project.objects.filter(name="Project").count(), 0)
