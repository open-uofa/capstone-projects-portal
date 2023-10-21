from django.urls import reverse
from portal.models import User
from portal.serializers import UserShortSerializer
from rest_framework.test import APITestCase


class UserViewSetTest(APITestCase):
    """
    Testing the custom update and partial update methods for user models, depending on the type of user logged in.
    """

    fixtures = ["user_viewset_test.json"]

    def test_update(self):
        # Anon Users cannot update another user's profile
        with self.subTest("Anon User Profile Update"):
            update_user = self.client.put(
                reverse("user-detail", args=("caf5c326-9275-45f7-9b97-8cba2bdf425c",)),
                {
                    "email": "edituser@example.com",
                    "name": "Edit User",
                    "bio": "New Bio",
                },
            )

            self.assertEqual(update_user.status_code, 403)

            response = self.client.get(
                reverse("user-detail", args=("caf5c326-9275-45f7-9b97-8cba2bdf425c",))
            )

            self.assertNotEqual(response.data["bio"], "New Bio")

        # Admins can update any user's profile
        with self.subTest("Admin Profile Update"):
            user = User.objects.get(id="2daa98fb-ddc8-4ec4-80cb-8c141b5ea8fd")
            self.client.force_authenticate(user=user)

            update_user = self.client.put(
                reverse("user-detail", args=("caf5c326-9275-45f7-9b97-8cba2bdf425c",)),
                {
                    "email": "edituser@example.com",
                    "name": "Edit User",
                    "bio": "Admin Bio",
                },
            )

            self.assertEqual(update_user.status_code, 200)

            response = self.client.get(
                reverse("user-detail", args=("caf5c326-9275-45f7-9b97-8cba2bdf425c",))
            )

            self.assertEqual(response.data["bio"], "Admin Bio")

        # User can update their own profile
        with self.subTest("User Profile Update"):
            user = User.objects.get(id="caf5c326-9275-45f7-9b97-8cba2bdf425c")
            self.client.force_authenticate(user=user)

            update_user = self.client.put(
                reverse("user-detail", args=("caf5c326-9275-45f7-9b97-8cba2bdf425c",)),
                {
                    "email": "edituser@example.com",
                    "name": "Edit User",
                    "bio": "User Bio",
                },
            )

            self.assertEqual(update_user.status_code, 200)

            response = self.client.get(
                reverse("user-detail", args=("caf5c326-9275-45f7-9b97-8cba2bdf425c",))
            )

            self.assertEqual(response.data["bio"], "User Bio")

        # Other Users cannot update another user's profile
        with self.subTest("Other User Profile Update"):
            user = User.objects.get(id="702cc082-e726-4d84-b311-2e0ad5d4ca0e")
            self.client.force_authenticate(user=user)

            update_user = self.client.put(
                reverse("user-detail", args=("caf5c326-9275-45f7-9b97-8cba2bdf425c",)),
                {
                    "email": "edituser@example.com",
                    "name": "Edit User",
                    "bio": "New Bio",
                },
            )

            self.assertEqual(update_user.status_code, 403)

            response = self.client.get(
                reverse("user-detail", args=("caf5c326-9275-45f7-9b97-8cba2bdf425c",))
            )

            self.assertNotEqual(response.data["bio"], "New Bio")

        # Admins can't update certain fields
        with self.subTest("Admin Failed Client Org Update"):
            user = User.objects.get(id="2daa98fb-ddc8-4ec4-80cb-8c141b5ea8fd")
            self.client.force_authenticate(user=user)

            update_org = self.client.put(
                reverse("user-detail", args=("caf5c326-9275-45f7-9b97-8cba2bdf425c",)),
                {
                    "email": "edituser@example.com",
                    "name": "Edit User",
                    "github_username": "Username",
                },
            )

            self.assertEqual(update_org.status_code, 200)

            response = self.client.get(
                reverse("user-detail", args=("caf5c326-9275-45f7-9b97-8cba2bdf425c",))
            )

            self.assertNotEqual(response.data["github_username"], "Username")

        # User can't update certain fields
        with self.subTest("User Failed Profile Update"):
            user = User.objects.get(id="caf5c326-9275-45f7-9b97-8cba2bdf425c")
            self.client.force_authenticate(user=user)

            update_org = self.client.put(
                reverse("user-detail", args=("caf5c326-9275-45f7-9b97-8cba2bdf425c",)),
                {
                    "email": "edituser@example.com",
                    "name": "Edit User",
                    "github_username": "Username",
                },
            )

            self.assertEqual(update_org.status_code, 200)

            response = self.client.get(
                reverse("user-detail", args=("caf5c326-9275-45f7-9b97-8cba2bdf425c",))
            )

            self.assertNotEqual(response.data["github_username"], "Username")

    def test_partial_update(self):
        # Anon Users cannot update another user's profile
        with self.subTest("Anon User Profile Update"):
            update_user = self.client.patch(
                reverse("user-detail", args=("caf5c326-9275-45f7-9b97-8cba2bdf425c",)),
                {"bio": "New Bio"},
            )

            self.assertEqual(update_user.status_code, 403)

            response = self.client.get(
                reverse("user-detail", args=("caf5c326-9275-45f7-9b97-8cba2bdf425c",))
            )

            self.assertNotEqual(response.data["bio"], "New Bio")

        # Admins can update any user's profile
        with self.subTest("Admin Profile Update"):
            user = User.objects.get(id="2daa98fb-ddc8-4ec4-80cb-8c141b5ea8fd")
            self.client.force_authenticate(user=user)

            update_user = self.client.patch(
                reverse("user-detail", args=("caf5c326-9275-45f7-9b97-8cba2bdf425c",)),
                {"bio": "Admin Bio"},
            )

            self.assertEqual(update_user.status_code, 200)

            response = self.client.get(
                reverse("user-detail", args=("caf5c326-9275-45f7-9b97-8cba2bdf425c",))
            )

            self.assertEqual(response.data["bio"], "Admin Bio")

        # User can update their profile
        with self.subTest("User Profile Update"):
            user = User.objects.get(id="caf5c326-9275-45f7-9b97-8cba2bdf425c")
            self.client.force_authenticate(user=user)

            update_user = self.client.patch(
                reverse("user-detail", args=("caf5c326-9275-45f7-9b97-8cba2bdf425c",)),
                {"bio": "User Bio"},
            )

            self.assertEqual(update_user.status_code, 200)

            response = self.client.get(
                reverse("user-detail", args=("caf5c326-9275-45f7-9b97-8cba2bdf425c",))
            )

            self.assertEqual(response.data["bio"], "User Bio")

        # Other Users cannot update another user's profile
        with self.subTest("Other User Profile Update"):
            user = User.objects.get(id="702cc082-e726-4d84-b311-2e0ad5d4ca0e")
            self.client.force_authenticate(user=user)

            update_user = self.client.patch(
                reverse("user-detail", args=("caf5c326-9275-45f7-9b97-8cba2bdf425c",)),
                {"bio": "New Bio"},
            )

            self.assertEqual(update_user.status_code, 403)

            response = self.client.get(
                reverse("user-detail", args=("caf5c326-9275-45f7-9b97-8cba2bdf425c",))
            )

            self.assertNotEqual(response.data["bio"], "New Bio")

        # Admins can't update certain fields
        with self.subTest("Admin Failed Profile Partial Update"):
            user = User.objects.get(id="2daa98fb-ddc8-4ec4-80cb-8c141b5ea8fd")
            self.client.force_authenticate(user=user)

            update_org = self.client.patch(
                reverse("user-detail", args=("caf5c326-9275-45f7-9b97-8cba2bdf425c",)),
                {"github_username": "Username"},
            )

            self.assertEqual(update_org.status_code, 200)

            response = self.client.get(
                reverse("user-detail", args=("caf5c326-9275-45f7-9b97-8cba2bdf425c",))
            )

            self.assertNotEqual(response.data["github_username"], "Username")

        # User can't update certain fields
        with self.subTest("User Failed Profile Partial Update"):
            user = User.objects.get(id="caf5c326-9275-45f7-9b97-8cba2bdf425c")
            self.client.force_authenticate(user=user)

            update_org = self.client.patch(
                reverse("user-detail", args=("caf5c326-9275-45f7-9b97-8cba2bdf425c",)),
                {"github_username": "Username"},
            )

            self.assertEqual(update_org.status_code, 200)

            response = self.client.get(
                reverse("user-detail", args=("caf5c326-9275-45f7-9b97-8cba2bdf425c",))
            )

            self.assertNotEqual(response.data["github_username"], "Username")

    def test_retrieve(self):
        """
        Tests that retrieving a user has the correct response.
        """
        expected_data_without_email = {
            "id": "702cc082-e726-4d84-b311-2e0ad5d4ca0e",
            "name": "Another User",
            "bio": "",
            "image": None,
            "website_link": "",
            "linkedin_link": "",
            "github_user_id": None,
            "github_username": "",
            "student_projects": [],
            "ta_projects": [],
            "client_rep_projects": [],
        }
        expected_data_with_email = {
            **expected_data_without_email,
            "email": "anotheruser@example.com",
        }

        def assert_correct_response(expected_data: dict):
            response = self.client.get(
                reverse("user-detail", args=("702cc082-e726-4d84-b311-2e0ad5d4ca0e",))
            )
            self.assertEqual(response.status_code, 200)
            self.assertDictEqual(response.data, expected_data)

        with self.subTest("Anonymous request"):
            self.client.force_authenticate(None)
            assert_correct_response(expected_data_without_email)

        with self.subTest(
            "Authenticated request as user different from one being requested"
        ):
            self.client.force_authenticate(
                User.objects.get(id="caf5c326-9275-45f7-9b97-8cba2bdf425c")
            )
            assert_correct_response(expected_data_without_email)

        with self.subTest("Authenticated request as user requesting own profile"):
            self.client.force_authenticate(
                User.objects.get(id="702cc082-e726-4d84-b311-2e0ad5d4ca0e")
            )
            assert_correct_response(expected_data_with_email)

        with self.subTest("Authenticated request as admin"):
            self.client.force_authenticate(
                User.objects.get(id="2daa98fb-ddc8-4ec4-80cb-8c141b5ea8fd")
            )
            assert_correct_response(expected_data_with_email)


class CurrentUserInfoViewTest(APITestCase):
    url = reverse("current-user-info")

    def test_for_anonymous_user(self):
        response = self.client.get(self.url)
        self.assertEqual(response.status_code, 200)
        self.assertDictEqual(response.data, {"logged_in": False})

    def test_for_logged_in_user_with_password(self):
        user = User.objects.create_user("testuser@example.com", "testpassword")
        self.client.force_authenticate(user=user)
        response = self.client.get(self.url)
        self.assertEqual(response.status_code, 200)
        self.assertDictEqual(
            response.data,
            {
                "logged_in": True,
                "is_superuser": False,
                "has_password": True,
                **UserShortSerializer(user).data,
            },
        )

    def test_for_logged_in_user_without_password(self):
        user = User.objects.create_user(
            "testuser@example.com",
            None,
            github_username="testuser",
            github_user_id="12391380",
        )
        self.client.force_authenticate(user=user)
        response = self.client.get(self.url)
        self.assertEqual(response.status_code, 200)
        self.assertDictEqual(
            response.data,
            {
                "logged_in": True,
                "is_superuser": False,
                "has_password": False,
                **UserShortSerializer(user).data,
            },
        )

    def test_for_logged_in_superuser(self):
        user = User.objects.create_superuser("testuser@example.com", "testpassword")
        self.client.force_authenticate(user=user)
        response = self.client.get(self.url)
        self.assertEqual(response.status_code, 200)
        self.assertDictEqual(
            response.data,
            {
                "logged_in": True,
                "is_superuser": True,
                "has_password": True,
                **UserShortSerializer(user).data,
            },
        )
