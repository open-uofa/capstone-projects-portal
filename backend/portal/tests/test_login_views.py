import uuid
from typing import Callable
from unittest.mock import MagicMock, patch

from django.conf import settings
from django.core import mail
from django.http.response import HttpResponse
from django.urls import reverse
from portal.login_views import LoginView
from portal.models import PasswordResetRequest, User
from portal.serializers import UserShortSerializer
from rest_framework.authtoken.models import Token
from rest_framework.test import APITestCase


def create_activated_user_with_password(
    test: APITestCase, email: str, password: str
) -> User:
    """
    Creates a test user with the given email and password.
    The user will be activated since they have a password.
    """
    user = User.objects.create_user(email=email, password=password)
    test.assertTrue(user.is_activated)
    return user


def create_activated_user_without_password(
    test: APITestCase, email: str, github_id: str
) -> User:
    """
    Creates a test user with the given email.
    The user will be activated since they have a linked GitHub account.
    """
    user = User.objects.create_user(
        email=email,
        password=None,
        github_username=email.split("@")[0],
        github_user_id=github_id,
    )
    test.assertFalse(user.has_usable_password())
    test.assertTrue(user.is_activated)
    return user


def create_unactivated_user(test: APITestCase, email: str) -> User:
    """
    Creates a test user with the given email.
    The user will not be activated since they have no password
    or linked GitHub account.
    """
    user = User.objects.create_user(email=email, password=None)
    test.assertFalse(user.is_activated)
    return user


def assert_test_user_data(test: APITestCase, user: User, data: dict):
    """
    Asserts that the data matches the user.
    """
    test.assertDictContainsSubset(UserShortSerializer(user).data, data)


def assert_successful_login_response(
    test: APITestCase, user: User, response: HttpResponse
):
    """
    Assert that the response is correct for a successful login.
    """
    test.assertEqual(response.status_code, 200)
    test.assertTrue(response.data["success"])
    test.assertIn("token", response.data)
    assert_test_user_data(test, user, response.data["user"])

    # Assert that the sent token is the one stored in the database
    test.assertEqual(response.data["token"], Token.objects.get(user=user).key)


def assert_unsuccessful_login_response(test: APITestCase, response: HttpResponse):
    """
    Assert that the response is correct for an unsuccessful login.
    """
    test.assertEqual(response.status_code, 401)
    test.assertFalse(response.data["success"])
    test.assertIn("error", response.data)
    test.assertNotIn("token", response.data)
    test.assertNotIn("user", response.data)


def assert_bad_request_login_response(test: APITestCase, response: HttpResponse):
    """
    Assert that the response is correct for a bad login request.
    """
    test.assertEqual(response.status_code, 400)
    test.assertFalse(response.data["success"])
    test.assertIn("error", response.data)
    test.assertNotIn("token", response.data)
    test.assertNotIn("user", response.data)


class LoginViewTest(APITestCase):
    """
    Tests logging in using the LoginView.
    Uses email and password login as well as GitHub OAuth2 login.
    """

    def test_email_login(self):
        """
        Tests logging in using email and password.
        """
        url = reverse("login", kwargs={"auth_type": "email"})

        # Create a user to log in as
        email = "testlogin@example.com"
        password = "thecorrectpassword"
        user = create_activated_user_with_password(self, email, password)

        with self.subTest("Login with correct email and password"):
            response = self.client.post(url, {"email": email, "password": password})
            assert_successful_login_response(self, user, response)

        with self.subTest("Login with email and password returns same token each time"):
            response1 = self.client.post(url, {"email": email, "password": password})
            assert_successful_login_response(self, user, response1)
            response2 = self.client.post(url, {"email": email, "password": password})
            assert_successful_login_response(self, user, response2)
            self.assertEqual(response1.data["token"], response2.data["token"])

        with self.subTest("Login with incorrect password"):
            response = self.client.post(
                url, {"email": email, "password": "incorrectpassword"}
            )
            assert_unsuccessful_login_response(self, response)

        with self.subTest("Login with incorrect email"):
            response = self.client.post(
                url,
                {
                    "email": "nonexistentuser@example.com",
                    "password": "verygoodpassword",
                },
            )
            assert_unsuccessful_login_response(self, response)

        with self.subTest("Login with malformed request (email missing)"):
            response = self.client.post(
                url,
                {
                    "password": "verygoodpassword",
                },
            )
            assert_bad_request_login_response(self, response)

        with self.subTest("Login with malformed request (password missing)"):
            response = self.client.post(
                url,
                {
                    "email": "testlogin@example.com",
                },
            )
            assert_bad_request_login_response(self, response)

        with self.subTest("Login with malformed request (email & password missing)"):
            response = self.client.post(
                url,
                {"unknown": "value"},
            )
            assert_bad_request_login_response(self, response)

    @patch.object(LoginView, "github_api_get_access_token", return_value="1234567890")
    @patch.object(
        LoginView,
        "github_api_get_user_info",
    )
    def test_github_login(
        self, mock_get_user_info: MagicMock, mock_get_access_token: MagicMock
    ):
        """
        Tests logging in using GitHub OAuth2.
        """
        url = reverse("login", kwargs={"auth_type": "oauth2"})

        with self.subTest("Successful GitHub login to user without a password"):
            # Create user that has a GitHub account but not a password
            user = User.objects.create_user(
                "geoffrey@example.com",
                None,
                github_username="geoffreyongithub",
                github_user_id="2890582",
            )

            mock_get_user_info.return_value = {
                "id": int(user.github_user_id),
                "login": user.github_username,
            }
            response = self.client.post(url, {"provider": "GitHub", "code": "12345"})

            assert_successful_login_response(self, user, response)

        with self.subTest("Successful GitHub login to user with a password"):
            # Create user that has a GitHub account and a password
            user = User.objects.create_user(
                "jeffrey@example.com",
                "thisismypassword",
                github_username="jeffreyongithub",
                github_user_id="289058112",
            )

            mock_get_user_info.return_value = {
                "id": int(user.github_user_id),
                "login": user.github_username,
            }
            response = self.client.post(url, {"provider": "GitHub", "code": "12345"})

            assert_successful_login_response(self, user, response)

        with self.subTest(
            "Successful GitHub login to user with only a GitHub username and no password in the database"
        ):
            # Create user that has only a GitHub username in the database
            user = User.objects.create_user(
                "jason@example.com",
                None,
                github_username="jasonongithub",
            )

            expected_github_id = 1209380520
            mock_get_user_info.return_value = {
                "id": expected_github_id,
                "login": user.github_username,
            }
            response = self.client.post(url, {"provider": "GitHub", "code": "12345"})

            # Assert that the User is updated with the GitHub ID
            user.refresh_from_db()
            self.assertEqual(user.github_user_id, str(expected_github_id))

            assert_successful_login_response(self, user, response)

        with self.subTest(
            "Successful GitHub login to user with only a GitHub username and a password in the database"
        ):
            # Create user that has only a GitHub username in the database
            user = User.objects.create_user(
                "bobby@example.com",
                "bobbyspassword",
                github_username="bobbyongithub",
            )

            expected_github_id = 241424242455
            mock_get_user_info.return_value = {
                "id": expected_github_id,
                "login": user.github_username,
            }
            response = self.client.post(url, {"provider": "GitHub", "code": "12345"})

            # Assert that the User is updated with the GitHub ID
            user.refresh_from_db()
            self.assertEqual(user.github_user_id, str(expected_github_id))

            assert_successful_login_response(self, user, response)

        with self.subTest(
            "Successful GitHub login to user with only a GitHub ID and no password in the database"
        ):
            # Create user that has only a GitHub ID in the database
            user = User.objects.create_user(
                "joshua@example.com", None, github_user_id="9928484701"
            )

            expected_github_username = "joshuaongithub"
            mock_get_user_info.return_value = {
                "id": int(user.github_user_id),
                "login": expected_github_username,
            }
            response = self.client.post(url, {"provider": "GitHub", "code": "12345"})

            assert_successful_login_response(self, user, response)

            # Assert that the User is updated with the GitHub username
            user.refresh_from_db()
            self.assertEqual(user.github_username, expected_github_username)

        with self.subTest(
            "Successful GitHub login to user with only a GitHub ID and a password in the database"
        ):
            # Create user that has only a GitHub ID in the database
            user = User.objects.create_user(
                "jeremy@example.com",
                "thisisacoolpassword",
                github_user_id="378973895324",
            )

            expected_github_username = "jeremyongithub"
            mock_get_user_info.return_value = {
                "id": int(user.github_user_id),
                "login": expected_github_username,
            }
            response = self.client.post(url, {"provider": "GitHub", "code": "12345"})

            assert_successful_login_response(self, user, response)

            # Assert that the User is updated with the GitHub username
            user.refresh_from_db()
            self.assertEqual(user.github_username, expected_github_username)

        with self.subTest(
            "Successful GitHub login to user with a GitHub ID and username and no password, but their GitHub username has changed since we last saw them"
        ):
            old_username = "jonathansoldusername"
            new_username = "jonathansnewusername"

            # Create user that has has a GitHub ID and username in the database
            user = User.objects.create_user(
                "jonathan@example.com",
                None,
                github_username=old_username,
                github_user_id="23891033444",
            )

            # GitHub API returns a different username than the one in the database
            mock_get_user_info.return_value = {
                "id": int(user.github_user_id),
                "login": new_username,
            }
            response = self.client.post(url, {"provider": "GitHub", "code": "12345"})

            assert_successful_login_response(self, user, response)

            # Assert that the User is updated with the new GitHub username
            user.refresh_from_db()
            self.assertEqual(user.github_username, new_username)

        with self.subTest(
            "Successful GitHub login to user with a GitHub ID and username and a password, but their GitHub username has changed since we last saw them"
        ):
            old_username = "jeremiahsoldusername"
            new_username = "jeremiahsnewusername"

            # Create user that has has a GitHub ID and username in the database
            user = User.objects.create_user(
                "jeremiahs@example.com",
                "thisisapasswordthatiuse33333",
                github_username=old_username,
                github_user_id="465456464544411",
            )

            # GitHub API returns a different username than the one in the database
            mock_get_user_info.return_value = {
                "id": int(user.github_user_id),
                "login": new_username,
            }
            response = self.client.post(url, {"provider": "GitHub", "code": "12345"})

            assert_successful_login_response(self, user, response)

            # Assert that the User is updated with the new GitHub username
            user.refresh_from_db()
            self.assertEqual(user.github_username, new_username)

        with self.subTest(
            "Failed GitHub login because GitHub account is not associated with a user"
        ):
            mock_get_user_info.return_value = {
                "id": 1100101019,
                "login": "someotherperson",
            }
            response = self.client.post(url, {"provider": "GitHub", "code": "12345"})

            assert_unsuccessful_login_response(self, response)

        with self.subTest(
            "Failed GitHub login because their GitHub username matches a user we know about that has a different GitHub user ID, and user has no password"
        ):
            existing_github_id = 3459839303
            new_github_id = 128394292958

            # Create a user
            user = User.objects.create_user(
                "jeb@example.com",
                None,
                github_username="jebongithub",
                github_user_id=existing_github_id,
            )

            # GitHub API returns a user with a different ID but same username
            mock_get_user_info.return_value = {
                "id": new_github_id,
                "login": user.github_username,
            }
            response = self.client.post(url, {"provider": "GitHub", "code": "12345"})

            assert_unsuccessful_login_response(self, response)

            # Assert that the user was not updated with the GitHub ID we got from GitHub
            user.refresh_from_db()
            self.assertEqual(user.github_user_id, str(existing_github_id))

        with self.subTest(
            "Failed GitHub login because their GitHub username matches a user we know about that has a different GitHub user ID, and user has a password"
        ):
            existing_github_id = 398453459034
            new_github_id = 27849284829

            # Create a user
            user = User.objects.create_user(
                "job@example.com",
                "jobsamazingpassword11111222",
                github_username="jobongithub",
                github_user_id=existing_github_id,
            )

            # GitHub API returns a user with a different ID but same username
            mock_get_user_info.return_value = {
                "id": new_github_id,
                "login": user.github_username,
            }
            response = self.client.post(url, {"provider": "GitHub", "code": "12345"})

            assert_unsuccessful_login_response(self, response)

            # Assert that the user was not updated with the GitHub ID we got from GitHub
            user.refresh_from_db()
            self.assertEqual(user.github_user_id, str(existing_github_id))

        with self.subTest("Failed GitHub login due to invalid code"):
            mock_get_access_token.return_value = {"error": "no"}
            response = self.client.post(url, {"provider": "GitHub", "code": "12345"})
            assert_unsuccessful_login_response(self, response)

        with self.subTest("Failed GitHub login due to failure to get user info"):
            mock_get_user_info.return_value = {"error": "no"}
            response = self.client.post(url, {"provider": "GitHub", "code": "12345"})
            self.assertEqual(response.status_code, 500)

    def test_oauth2_login(self):
        """
        Miscellaneous tests for OAuth2 login.
        """
        url = reverse("login", kwargs={"auth_type": "oauth2"})

        with self.subTest("Failed OAuth2 login due to invalid provider"):
            response = self.client.post(url, {"provider": "WalMart", "code": "12345"})
            assert_bad_request_login_response(self, response)

        with self.subTest("Failed OAuth2 login due to malformed request (no provider)"):
            response = self.client.post(url, {"code": "12345"})
            assert_bad_request_login_response(self, response)

        with self.subTest("Failed OAuth2 login due to malformed request (no code)"):
            response = self.client.post(url, {"provider": "GitHub"})
            assert_bad_request_login_response(self, response)

        with self.subTest(
            "Failed OAuth2 login due to malformed request (no code or provider)"
        ):
            response = self.client.post(url, {"ham": "eggs"})
            assert_bad_request_login_response(self, response)


class ActivateViewTest(APITestCase):
    """
    Tests activating user accounts using ActivateView.
    """

    url = reverse("activate")

    def test_successful_activation(self):
        """
        Tests a successful activation.
        """
        # Create a user that needs to be activated
        user = create_unactivated_user(self, "person1@example.com")

        desired_password = "thenewpassword"

        # Activate the user
        response = self.client.post(
            self.url,
            {"activationKey": user.activation_key, "newPassword": desired_password},
        )
        assert_successful_login_response(self, user, response)

        # Assert that the user is now activated and has the new password
        user.refresh_from_db()
        self.assertTrue(user.is_activated)
        self.assertTrue(user.check_password(desired_password))

    def test_failed_activation_due_to_invalid_activation_key(self):
        """
        Tests a failed activation due to an invalid activation key.
        """
        # Create a user that needs to be activated
        user = create_unactivated_user(self, "person2@example.com")

        desired_password = "iwishthiswasmynewpassword"

        # Try some invalid activation keys
        invalid_activation_keys = {
            "Wrong activation key": str(uuid.uuid4()),
            "Not a UUID": "justplainwrong",
        }
        for description, key in invalid_activation_keys.items():
            with self.subTest(description):
                response = self.client.post(
                    self.url,
                    {
                        "activationKey": key,
                        "password": desired_password,
                    },
                )
                self.assertEqual(response.status_code, 400)
                self.assertFalse(response.data["success"])
                self.assertIn("error", response.data)

                # Assert that the user is still not activated and has an unusable password
                user.refresh_from_db()
                self.assertFalse(user.is_activated)
                self.assertFalse(user.has_usable_password())

    def test_failed_activation_due_to_invalid_password(self):
        """
        Tests a failed activation due to an invalid password.
        """
        # Create a user that needs to be activated
        user = create_unactivated_user(self, "person3@example.com")

        # Empty password is invalid
        desired_password = ""

        # Try to activate the user
        response = self.client.post(
            self.url,
            {
                "activationKey": user.activation_key,
                "password": desired_password,
            },
        )
        self.assertEqual(response.status_code, 400)
        self.assertFalse(response.data["success"])
        self.assertIn("error", response.data)

        # Assert that the user is still not activated and has an unusable password
        user.refresh_from_db()
        self.assertFalse(user.is_activated)
        self.assertFalse(user.has_usable_password())

    def test_failed_activation_due_to_user_already_activated(self):
        """
        Tests a failed activation due to a user already being activated.
        """
        # Create a user that does not need to be activated
        existing_password = "thisismyexistingpassword"
        user = create_activated_user_with_password(
            self, "person4@example.com", existing_password
        )

        # Try to activate the user
        response = self.client.post(
            self.url,
            {
                "activationKey": "",
                "password": "iwouldlikethistobemynewpassword",
            },
        )
        self.assertEqual(response.status_code, 400)
        self.assertFalse(response.data["success"])
        self.assertIn("error", response.data)

        # Assert that the user is still activated and has the existing password
        user.refresh_from_db()
        self.assertTrue(user.is_activated)
        self.assertTrue(user.check_password(existing_password))


class RequestPasswordResetViewTest(APITestCase):
    """
    Tests requesting password resets using RequestPasswordResetView.
    """

    url = reverse("request-password-reset")

    def setUp(self):
        # Set the email backend to an in-memory backend so sent emails can be checked
        settings.EMAIL_BACKEND = "django.core.mail.backends.locmem.EmailBackend"

        # Keep track of the number of emails sent before each test
        self.num_sent_emails_before = len(mail.outbox)

        # Set the R to a known value
        settings.RESET_PASSWORD_URL_TEMPLATE = (
            "http://example.com/reset-password/{reset_key}"
        )

    def assert_successful_response(self, response: HttpResponse):
        """
        Assert that the response indicates success.
        """
        self.assertEqual(response.status_code, 200)
        self.assertTrue(response.data["success"])

    def assert_successful_password_reset_request(
        self, user: User, response: HttpResponse
    ) -> PasswordResetRequest:
        """
        Asserts that the response indicates success,
        a PasswordResetRequest instance was created,
        and the correct email was sent.
        Returns the PasswordResetRequest instance that
        """
        self.assert_successful_response(response)

        # Assert that the last PasswordResetRequest created for that user is usable
        password_reset_request = (
            PasswordResetRequest.objects.filter(user=user)
            .order_by("-created_at")
            .first()
        )
        self.assertTrue(password_reset_request.is_usable)

        # Assert that an email was sent and it contains the link to reset the password
        self.assertEqual(len(mail.outbox), self.num_sent_emails_before + 1)
        email = mail.outbox[-1]
        self.assertEqual(email.to, [user.email])
        self.assertIn(
            f"http://example.com/reset-password/{password_reset_request.key}",
            email.body,
        )

        # Update num_sent_emails_before
        self.num_sent_emails_before = len(mail.outbox)

        return password_reset_request

    def test_request_for_activated_user_with_existing_password(self):
        """
        Tests a password reset request for an activated user with an existing password.
        """
        email = "testuser@example.com"
        existing_password = "thisismyexistingpassword"
        user = create_activated_user_with_password(self, email, existing_password)

        # Request a password reset
        response = self.client.post(self.url, {"email": email})

        self.assert_successful_password_reset_request(user, response)

        # Assert that the user is still activated and has the existing password
        user.refresh_from_db()
        self.assertTrue(user.is_activated)
        self.assertTrue(user.check_password(existing_password))

    def test_request_for_activated_user_with_no_password(self):
        """
        Tests a password reset request for an activated user with no password.
        """
        email = "testuser@example.com"
        user = create_activated_user_without_password(self, email, "2342341")

        # Request a password reset
        response = self.client.post(self.url, {"email": email})

        self.assert_successful_password_reset_request(user, response)

        # Assert that the user is still activated and has no password
        user.refresh_from_db()
        self.assertTrue(user.is_activated)
        self.assertFalse(user.has_usable_password())

    def test_request_for_unactivated_user(self):
        """
        Tests a password reset request for an unactivated user.
        """
        email = "testuser@example.com"
        user = create_unactivated_user(self, email)
        # Creating an unactivated user might send an email, so update num_sent_emails_before
        self.num_sent_emails_before = len(mail.outbox)

        # Request a password reset
        response = self.client.post(self.url, {"email": email})

        self.assert_successful_password_reset_request(user, response)

        # Assert that the user is still not activated and has no password
        user.refresh_from_db()
        self.assertFalse(user.is_activated)
        self.assertFalse(user.has_usable_password())

    def test_two_requests_get_separate_keys(self):
        """
        Tests that two requests for a password reset get separate keys.
        """
        email = "testuser@example.com"
        user = create_activated_user_with_password(self, email, "testpassword55555")

        # Request a password reset for the first time
        response = self.client.post(self.url, {"email": email})

        first_password_reset_request = self.assert_successful_password_reset_request(
            user, response
        )

        # Request a password reset for the second time
        response = self.client.post(self.url, {"email": email})

        second_password_reset_request = self.assert_successful_password_reset_request(
            user, response
        )

        # Assert that the two keys are different
        self.assertNotEqual(
            first_password_reset_request.key, second_password_reset_request.key
        )

    def test_request_for_non_existent_user(self):
        """
        Tests a password reset request for a non-existent user.
        """
        # Request a password reset
        response = self.client.post(self.url, {"email": "nonexistentuser@example.com"})

        # Assert that the response is successful
        self.assert_successful_response(response)

        # Assert that no email was sent
        self.assertEqual(len(mail.outbox), self.num_sent_emails_before)

    def test_missing_email(self):
        """
        Tests a password reset request that is missing the email field.
        """
        response = self.client.post(self.url, {})

        # Assert that the response is unsuccessful and contains an error message
        self.assertEqual(response.status_code, 400)
        self.assertFalse(response.data["success"])
        self.assertIn("error", response.data)


class ResetPasswordViewTest(APITestCase):
    """
    Tests resetting user passwords using ResetPasswordView.
    """

    url = reverse("reset-password")

    def setUp(self):
        """
        Reset old password, new password, and user to ensure they do not accidentally persist between tests.
        """
        self.old_password = None
        self.new_password = None
        self.user = None

    def use_activated_user_with_password(self):
        """
        Set up this test to use an activated user with an existing password.
        """
        self.old_password = "thisismyoldpassword"
        self.new_password = "thisismynewpassword"
        self.user = create_activated_user_with_password(
            self, "testuser@example.com", self.old_password
        )

    def use_activated_user_without_password(self):
        """
        Set up this test to use an activated user without an existing password.
        """
        self.old_password = None
        self.new_password = "thisismynewpassword"
        self.user = create_activated_user_without_password(
            self, "testuser@example.com", "458987984"
        )

    def use_unactivated_user(self):
        """
        Set up this test to use an unactivated user.
        """
        self.old_password = None
        self.new_password = "thisismynewpassword"
        self.user = create_unactivated_user(self, "testuser@example.com")

    def generate_reset_request(self) -> PasswordResetRequest:
        """
        Generate and return a PasswordResetRequest for the user being tested.
        """
        return PasswordResetRequest.objects.create(user=self.user)

    def assert_reset_request_used_state(
        self, password_reset_request: PasswordResetRequest, used: bool
    ):
        """
        Assert that the PasswordResetRequest used state is as expected.
        """
        password_reset_request.refresh_from_db()
        self.assertEqual(password_reset_request.used_at is not None, used)

    def do_test_expecting_success(
        self,
        test: Callable[[], HttpResponse],
        check_token_regenerated: bool = True,
    ):
        """
        Runs the given test function, asserting that the response indicates
        a successful password reset and that the password is changed.
        If check_token_regenerated is True, also checks that the token has changed.
        """
        # Make sure a user is set for this test
        # If this fails, the test is missing a use_*_user* method call
        self.assertIsNotNone(self.user)

        if check_token_regenerated:
            # Generate an existing token (to test that it is regenerated)
            old_token_key = Token.objects.get_or_create(user=self.user)[0].key

        # Run the test
        response = test()

        # Assert that the response is a successful login response
        assert_successful_login_response(self, self.user, response)

        # Assert that the user's password was changed
        self.user.refresh_from_db()
        if self.old_password is not None:
            self.assertFalse(self.user.check_password(self.old_password))
        self.assertTrue(self.user.check_password(self.new_password))

        if check_token_regenerated:
            # Assert that the token was regenerated
            self.assertNotEqual(
                old_token_key, Token.objects.get_or_create(user=self.user)[0].key
            )

    def do_test_expecting_failure(self, test: Callable[[], HttpResponse]):
        """
        Generates a reset request and authentication token,
        then runs the given test function,
        asserting that the response indicates a failed password reset.
        Also asserts that the password is not changed,
        the reset request is still usable, and the token has not changed.
        """

        # Generate an existing token (to test that it stays the same)
        old_token_key = Token.objects.get_or_create(user=self.user)[0].key

        # Run the test
        response = test()

        # Assert that the response indicates failure
        self.assertEqual(response.status_code, 400)
        self.assertFalse(response.data["success"])
        self.assertIn("error", response.data)

        # Assert that the user's password was not changed
        self.user.refresh_from_db()
        if self.old_password is not None:
            self.assertTrue(self.user.check_password(self.old_password))
        self.assertFalse(self.user.check_password(self.new_password))

        # Assert that the token was not regenerated
        self.assertEqual(
            old_token_key, Token.objects.get_or_create(user=self.user)[0].key
        )

    def test_reset_using_correct_reset_key(self):
        """
        Tests a successful reset using a PasswordResetRequest's reset key.
        """
        self.use_activated_user_with_password()
        reset_request = self.generate_reset_request()

        def test() -> HttpResponse:
            return self.client.post(
                self.url,
                {"resetKey": str(reset_request.key), "newPassword": self.new_password},
            )

        self.do_test_expecting_success(test)
        self.assert_reset_request_used_state(reset_request, True)

    def test_reset_using_incorrect_reset_key(self):
        """
        Tests a failed reset using an incorrect PasswordResetRequest's reset key.
        """
        self.use_activated_user_with_password()
        reset_request = self.generate_reset_request()

        def test() -> HttpResponse:
            incorrect_reset_key = str(uuid.uuid4())
            return self.client.post(
                self.url,
                {"resetKey": incorrect_reset_key, "newPassword": self.new_password},
            )

        self.do_test_expecting_failure(test)
        self.assert_reset_request_used_state(reset_request, False)

    def test_reset_using_correct_current_password(self):
        """
        Tests a successful reset using the current password.
        No reset key will be generated or used.
        """
        self.use_activated_user_with_password()

        def test() -> HttpResponse:
            self.client.force_authenticate(self.user)
            return self.client.post(
                self.url,
                {
                    "currentPassword": self.old_password,
                    "newPassword": self.new_password,
                },
            )

        self.do_test_expecting_success(test)

    def test_reset_using_correct_current_password_when_reset_key_exists(self):
        """
        Tests a successful reset using the current password.
        A reset key will be generated but not used.
        """
        self.use_activated_user_with_password()
        reset_request = self.generate_reset_request()

        def test() -> HttpResponse:
            self.client.force_authenticate(self.user)
            return self.client.post(
                self.url,
                {
                    "currentPassword": self.old_password,
                    "newPassword": self.new_password,
                },
            )

        self.do_test_expecting_success(test)
        self.assert_reset_request_used_state(reset_request, False)

    def test_reset_for_authenticated_user_without_an_existing_password(self):
        """
        Tests a successful reset for an authenticated user that has no existing password.
        Because they have no existing password, currentPassword does not need to be in their request.
        No reset key will be generated or used.
        """
        self.use_activated_user_without_password()

        def test() -> HttpResponse:
            self.client.force_authenticate(self.user)
            return self.client.post(self.url, {"newPassword": self.new_password})

        self.do_test_expecting_success(test)

    def test_reset_using_incorrect_current_password(self):
        """
        Tests a failed reset using an incorrect current password.
        No reset key will be generated or used.
        """
        self.use_activated_user_with_password()

        def test() -> HttpResponse:
            self.client.force_authenticate(self.user)
            return self.client.post(
                self.url,
                {"currentPassword": "justplainwrong", "newPassword": self.new_password},
            )

        self.do_test_expecting_failure(test)

    def test_reset_using_incorrect_current_password_when_reset_key_exists(self):
        """
        Tests a failed reset using an incorrect current password.
        A reset key will be generated but not used.
        """
        self.use_activated_user_with_password()
        reset_request = self.generate_reset_request()

        def test() -> HttpResponse:
            self.client.force_authenticate(self.user)
            return self.client.post(
                self.url,
                {"currentPassword": "justplainwrong", "newPassword": self.new_password},
            )

        self.do_test_expecting_failure(test)
        self.assert_reset_request_used_state(reset_request, False)

    def test_reset_using_missing_reset_key_and_current_password(self):
        """
        Tests a failed reset due to the reset key and current password being missing.
        """
        self.use_activated_user_with_password()
        reset_request = self.generate_reset_request()

        def test() -> HttpResponse:
            return self.client.post(self.url, {"newPassword": self.new_password})

        self.do_test_expecting_failure(test)
        self.assert_reset_request_used_state(reset_request, False)

    def test_reset_using_reset_key_but_missing_new_password(self):
        """
        Tests a failed reset using a reset key due to the new password being missing.
        """
        self.use_activated_user_with_password()
        reset_request = self.generate_reset_request()

        def test() -> HttpResponse:
            return self.client.post(self.url, {"resetKey": str(reset_request.key)})

        self.do_test_expecting_failure(test)
        self.assert_reset_request_used_state(reset_request, False)

    def test_reset_using_current_password_but_missing_new_password(self):
        """
        Tests a failed reset using a reset key due to the new password being missing.
        """
        self.use_activated_user_with_password()
        reset_request = self.generate_reset_request()

        def test() -> HttpResponse:
            self.client.force_authenticate(self.user)
            return self.client.post(self.url, {"currentPassword": self.old_password})

        self.do_test_expecting_failure(test)
        self.assert_reset_request_used_state(reset_request, False)

    def test_reset_of_unactivated_user_using_reset_key(self):
        """
        Tests a successful reset of an unactivated user using a PasswordResetRequest's reset key.
        """
        self.use_unactivated_user()
        reset_request = self.generate_reset_request()

        def test() -> HttpResponse:
            response = self.client.post(
                self.url,
                {"resetKey": str(reset_request.key), "newPassword": self.new_password},
            )
            return response

        self.do_test_expecting_success(test, False)
        self.assert_reset_request_used_state(reset_request, True)

        # Assert that the user is now activated
        self.user.refresh_from_db()
        self.assertTrue(self.user.is_activated)

    def test_reset_using_reset_key_only_marks_the_used_reset_key_as_used(self):
        """
        Tests that a reset using a reset key marks the used reset key as used.
        """
        self.use_activated_user_with_password()
        reset_request_to_use = self.generate_reset_request()
        reset_request_to_not_use = self.generate_reset_request()

        def test() -> HttpResponse:
            return self.client.post(
                self.url,
                {
                    "resetKey": str(reset_request_to_use.key),
                    "newPassword": self.new_password,
                },
            )

        self.do_test_expecting_success(test)
        self.assert_reset_request_used_state(reset_request_to_use, True)
        self.assert_reset_request_used_state(reset_request_to_not_use, False)


class InvalidateOtherSessionsViewTest(APITestCase):
    """
    Tests the InvalidateOtherSessionsView.
    """

    url = reverse("logout-all")

    def test_for_logged_in_user(self):
        """
        Tests that the user's token changes and they stay logged in.
        """
        # Create user and log in as them
        user = User.objects.create_user("testuser@example.com", "testpassword")
        self.client.force_authenticate(user)

        # Get the user's token
        token_before = Token.objects.get_or_create(user=user)[0].key

        # Make a request to invalidate all sessions
        response = self.client.post(self.url)

        # Assert that the response is successful and contains the new token
        self.assertEqual(response.status_code, 200)
        self.assertTrue(response.data["success"])
        token_after = response.data["token"]
        self.assertEqual(Token.objects.get_or_create(user=user)[0].key, token_after)

        # Assert that the token has changed
        self.assertNotEqual(token_before, token_after)

    def test_for_logged_out_user(self):
        """
        Tests that the user stays logged out.
        """
        # Make a request to invalidate all sessions
        response = self.client.post(self.url)

        # Assert that the response indicates failure
        self.assertEqual(response.status_code, 400)
        self.assertFalse(response.data["success"])
        self.assertIn("error", response.data)
