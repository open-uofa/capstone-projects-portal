from django.contrib.auth.models import AnonymousUser
from django.test import TestCase
from portal.models import ClientOrg, User


class ClientOrgModelTest(TestCase):
    """
    Testing the custom visible_to method in Client Org models
    """

    fixtures = ["clientorg_model_test.json"]

    def test_visible_to(self):
        # Check only returned orgs IDs
        def transform(org):
            return str(org.id)

        published_orgs = [
            "e80a1f60-bbf6-4460-b9e7-d3800cb19d64",
            "ec91e33d-30c9-4847-8a1a-67dc171af8b2",
        ]

        # Anonymous users should see only orgs with at least one published project
        with self.subTest("Anonymous user"):
            user = AnonymousUser()
            self.assertQuerysetEqual(
                ClientOrg.objects.visible_to(user),
                published_orgs,
                transform,
                ordered=False,
            )

        # Authenticated users with no project relationships should see only orgs with at least one published project
        with self.subTest("Authenticated user with no org relationships"):
            user = User.objects.get(id="6e7577db-978f-4e5f-8e00-c0124e4383d2")
            self.assertQuerysetEqual(
                ClientOrg.objects.visible_to(user),
                published_orgs,
                transform,
                ordered=False,
            )

        # Students should see only published projects and unpublished projects they are a student of
        with self.subTest("Student with unpublished orgs"):
            user = User.objects.get(id="8e89c832-baf7-47a9-b12c-e61aad851724")

            unpublished_orgs_user_is_a_student_of = [
                "372b2e02-957b-4952-844d-ea9d8f06164f"
            ]

            self.assertQuerysetEqual(
                ClientOrg.objects.visible_to(user),
                published_orgs + unpublished_orgs_user_is_a_student_of,
                transform,
                ordered=False,
            )

        # TAs should see only published orgs and unpublished orgs they are a TA of
        with self.subTest("TA with unpublished orgs"):
            user = User.objects.get(id="a8e3ea40-6569-4f37-8221-9cca7e26ea7e")
            unpublished_orgs_user_is_a_ta_of = ["372b2e02-957b-4952-844d-ea9d8f06164f"]
            self.assertQuerysetEqual(
                ClientOrg.objects.visible_to(user),
                published_orgs + unpublished_orgs_user_is_a_ta_of,
                transform,
                ordered=False,
            )

        # Client reps should see only published orgs and unpublished orgs they are a client rep of
        with self.subTest("Client rep with unpublished orgs"):
            user = User.objects.get(id="5f8aa24d-5326-4d94-887c-fa09cf77db3e")
            unpublished_orgs_user_is_a_client_rep_of = [
                "372b2e02-957b-4952-844d-ea9d8f06164f"
            ]
            self.assertQuerysetEqual(
                ClientOrg.objects.visible_to(user),
                published_orgs + unpublished_orgs_user_is_a_client_rep_of,
                transform,
                ordered=False,
            )

        # Users should see only published projects and unpublished projects they are a student, TA, or client rep of
        with self.subTest(
            "User that is a student, TA, and orgs of unpublished projects"
        ):
            user = User.objects.get(id="9b3bbac2-abaf-4e78-8b7e-e8e331767ccb")
            unpublished_orgs_user_is_a_student_or_ta_or_client_rep_of = [
                "3e521e77-10a7-4c01-a830-3932274b9ce4",
                "f3a08ff2-ca7b-471a-8374-30867d91ec49",
                "e7b164bd-f702-48ef-97d3-47eea858f40d",
            ]

            self.assertQuerysetEqual(
                ClientOrg.objects.visible_to(user),
                published_orgs
                + unpublished_orgs_user_is_a_student_or_ta_or_client_rep_of,
                transform,
                ordered=False,
            )

        # Admins should see all orgs (published and unpublished)
        with self.subTest("Admin"):
            user = User.objects.get(id="b7a0b0df-078c-4866-ac17-577b5432c353")
            self.assertQuerysetEqual(
                ClientOrg.objects.visible_to(user),
                ClientOrg.objects.all(),
                ordered=False,
            )
