from django.conf import settings
from django.contrib.auth.models import AnonymousUser
from django.core import mail
from django.test import TestCase
from portal.models import Project, User


class ProjectModelTest(TestCase):
    fixtures = ["project_model_test.json"]

    def test_visible_to(self):
        # Check only returned project IDs
        def transform(project):
            return str(project.id)

        published_projects = [
            "c467e9ba-3893-4698-948f-b3a2a63f7a7e",
            "a540b66c-430d-435d-9ac1-b89a2d28f37f",
            "ef570865-ece8-43a8-a468-7b52e1b41950",
        ]

        # Anonymous users should see only published projects
        with self.subTest("Anonymous user"):
            user = AnonymousUser()
            self.assertQuerysetEqual(
                Project.objects.visible_to(user),
                published_projects,
                transform,
                ordered=False,
            )

        # Authenticated users with no project relationships should see only published projects
        with self.subTest("Authenticated user with no project relationships"):
            user = User.objects.get(id="98669b94-088b-4a86-bc48-bab46d3199db")
            self.assertQuerysetEqual(
                Project.objects.visible_to(user),
                published_projects,
                transform,
                ordered=False,
            )

        # Students should see only published projects and unpublished projects they are a student of
        with self.subTest("Student with unpublished projects"):
            user = User.objects.get(id="7e10fc7c-d245-4bb5-9f4a-b84560eb6aa6")
            unpublished_projects_user_is_a_student_of = [
                "818ca049-0e2c-4051-8c20-7793469e1298",
                "67f1a493-c4f1-4def-81d2-08bceb1e7347",
            ]
            self.assertQuerysetEqual(
                Project.objects.visible_to(user),
                published_projects + unpublished_projects_user_is_a_student_of,
                transform,
                ordered=False,
            )

        # TAs should see only published projects and unpublished projects they are a TA of
        with self.subTest("TA with unpublished projects"):
            user = User.objects.get(id="ce78059b-45fe-40ef-a65b-6d6cb5ca6417")
            unpublished_projects_user_is_a_ta_of = [
                "818ca049-0e2c-4051-8c20-7793469e1298",
                "3606e866-2614-4383-b031-69f70a737603",
            ]
            self.assertQuerysetEqual(
                Project.objects.visible_to(user),
                published_projects + unpublished_projects_user_is_a_ta_of,
                transform,
                ordered=False,
            )

        # Client reps should see only published projects and unpublished projects they are a client rep of
        with self.subTest("Client rep with unpublished projects"):
            user = User.objects.get(id="e958905d-aec4-4e68-94b1-b5b5ba352f69")
            unpublished_projects_user_is_a_client_rep_of = [
                "67f1a493-c4f1-4def-81d2-08bceb1e7347",
                "3606e866-2614-4383-b031-69f70a737603",
            ]
            self.assertQuerysetEqual(
                Project.objects.visible_to(user),
                published_projects + unpublished_projects_user_is_a_client_rep_of,
                transform,
                ordered=False,
            )

        # Users should see only published projects and unpublished projects they are a student, TA, or client rep of
        with self.subTest(
            "User that is a student, TA, and rep of unpublished projects"
        ):
            user = User.objects.get(id="7333b2fb-efa0-4062-a193-9e813796257b")
            unpublished_projects_user_is_a_student_or_ta_or_client_rep_of = [
                "818ca049-0e2c-4051-8c20-7793469e1298",
                "3606e866-2614-4383-b031-69f70a737603",
            ]
            self.assertQuerysetEqual(
                Project.objects.visible_to(user),
                published_projects
                + unpublished_projects_user_is_a_student_or_ta_or_client_rep_of,
                transform,
                ordered=False,
            )

        # Admins should see all projects (published and unpublished)
        with self.subTest("Admin"):
            user = User.objects.get(id="de3f8966-05e0-4928-85d2-44481e80f664")
            self.assertQuerysetEqual(
                Project.objects.visible_to(user), Project.objects.all(), ordered=False
            )


class UserModelTest(TestCase):
    def setUp(self):
        # Set the email backend to an in-memory backend so sent emails can be checked
        settings.EMAIL_BACKEND = "django.core.mail.backends.locmem.EmailBackend"

        # Keep track of the number of emails sent before each test
        self.num_sent_emails_before = len(mail.outbox)

        # Set the ACTIVATION_URL_TEMPLATE to a known value
        settings.ACTIVATION_URL_TEMPLATE = (
            "http://example.com/activate/{activation_key}"
        )

    def test_creating_user_with_password(self):
        # Try to create a user with a password
        user = User.objects.create_user("testuser@example.com", "password")

        # Assert that the user is saved
        self.assertIsNotNone(user.pk)

        # Assert that the user is activated
        self.assertTrue(user.is_activated)

        # Assert that an activation email was not sent
        self.assertEqual(len(mail.outbox), self.num_sent_emails_before)

    def test_creating_user_without_password(self):
        # Try to create a user without a password
        user = User.objects.create_user("testuser@example.com", None)

        # Assert that the user is saved
        self.assertIsNotNone(user.pk)

        # Assert that the user is not activated
        self.assertFalse(user.is_activated)

        # Assert that an activation email was sent
        self.assertEqual(len(mail.outbox), self.num_sent_emails_before + 1)
        email = mail.outbox[-1]

        # Assert that the email is to the correct address
        self.assertIn(user.email, email.to)

        # Assert that the email contains the activation URL
        expected_activation_url = f"http://example.com/activate/{user.activation_key}"
        self.assertIn(expected_activation_url, email.body)

    def test_creating_user_without_password_but_with_github_username(self):
        # Try to create a user without a password but with a github username
        user = User.objects.create_user(
            "testuser@example.com", None, github_username="testuser"
        )

        # Assert that the user is saved
        self.assertIsNotNone(user.pk)

        # Assert that the user's github username is set
        self.assertEqual(user.github_username, "testuser")

        # Assert that the user is activated
        self.assertTrue(user.is_activated)

        # Assert that an activation email was not sent
        self.assertEqual(len(mail.outbox), self.num_sent_emails_before)
