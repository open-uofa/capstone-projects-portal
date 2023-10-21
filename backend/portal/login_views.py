import logging

import requests
from django.conf import settings
from django.contrib.auth import authenticate
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError
from portal.emails import send_password_reset_email
from portal.models import PasswordResetRequest, User
from portal.views import CurrentUserInfo
from rest_framework.authtoken.models import Token
from rest_framework.decorators import APIView
from rest_framework.request import Request
from rest_framework.response import Response


def successful_login_response(request: Request) -> Response:
    """
    Returns a Response indicating a successful login.
    Contains the token and some info about the user making the request.
    """
    user = request.user
    token = Token.objects.get_or_create(user=user)[0].key
    return Response(
        {"success": True, "token": token, "user": CurrentUserInfo.for_request(request)}
    )


class LoginError(Exception):
    def __init__(self, message):
        self.message = message


class LoginView(APIView):
    """
    Log in using either an email or password, or a GitHub OAuth2 code.
    auth_type can be "email" or "oauth2".

    If auth_type is "email", the request must contain the following fields:
    - email
    - password

    If auth_type is "oauth2", the request must contain the following fields:
    - provider
    - code
    """

    def post(self, request: Request, auth_type: str) -> Response:
        try:
            self.login(request, auth_type)
            return successful_login_response(request)
        except LoginError as e:
            return Response(
                status=401,
                data={"success": False, "error": e.message},
            )
        except ValidationError as e:
            return Response(
                status=400,
                data={"success": False, "error": e.message},
            )
        except Exception as e:
            logging.exception(e)
            return Response(
                status=500,
                data={"success": False, "error": "Unknown error occurred"},
            )

    def login(self, request: Request, auth_type: str):
        """
        Logs in a user and sets request.user to the user.
        """
        if auth_type == "email":
            user = self.login_with_email_and_password(request)
        elif auth_type == "oauth2":
            user = self.login_with_oauth2(request)
        else:
            raise ValidationError(f'Unknown authentication type "{auth_type}"')

        request.user = user

    def login_with_email_and_password(self, request: Request) -> User:
        try:
            email = request.data["email"]
            password = request.data["password"]
        except KeyError:
            raise ValidationError("Missing email or password")
        user = authenticate(request, email=email, password=password)
        if user is None:
            raise LoginError("Incorrect email or password")
        return user

    def login_with_oauth2(self, request: Request) -> User:
        try:
            provider = request.data["provider"]
            code = request.data["code"]
        except KeyError:
            raise ValidationError("Missing provider or code")

        if provider == "GitHub":
            return self.login_with_github(code)

        raise ValidationError(f'Unknown provider "{provider}"')

    def login_with_github(self, code: str) -> User:
        # Exchange temporary code for an access token
        access_token = self.github_api_get_access_token(code)

        # Get GitHub user ID and username of logged in user from GitHub
        github_user_info = self.github_api_get_user_info(access_token)
        github_user_id = github_user_info["id"]
        github_username = github_user_info["login"]

        # Try to get user associated with the GitHub user ID
        users_with_matching_github_id = User.objects.filter(
            github_user_id=github_user_id
        )
        if users_with_matching_github_id:
            user = users_with_matching_github_id[0]
            # Store the current GitHub username on the user
            user.github_username = github_username
            user.save()
            return user

        # Try to get user associated with the GitHub username
        # (as long as they don't already have a GitHub user ID)
        users_with_matching_github_username = User.objects.filter(
            github_username=github_username, github_user_id__isnull=True
        )
        if users_with_matching_github_username:
            user = users_with_matching_github_username[0]
            # Store the GitHub user ID on the user
            user.github_user_id = github_user_id
            user.save()
            return user

        raise LoginError(
            "No account exists that is associated with that GitHub user. Try logging in with your email and password."
        )

    def github_api_get_access_token(self, code: str) -> str:
        access_token_response = requests.post(
            "https://github.com/login/oauth/access_token",
            json={
                "client_id": settings.GITHUB_CLIENT_ID,
                "client_secret": settings.GITHUB_CLIENT_SECRET,
                "code": code,
            },
            headers={"Accept": "application/json"},
        )
        access_token_data = access_token_response.json()
        try:
            access_token = access_token_data["access_token"]
        except KeyError:
            logging.error(f"GitHub access token response: {access_token_data}")
            raise LoginError("GitHub authentication failed")
        return access_token

    def github_api_get_user_info(self, access_token: str) -> dict:
        github_user_info_response = requests.get(
            "https://api.github.com/user",
            headers={"Authorization": f"token {access_token}"},
        )
        github_user_info = github_user_info_response.json()
        return github_user_info


def activate(request: Request, user: User, password: str) -> Response:
    """
    Attempts to activate a User, setting their password to the specified password.
    Returns a Response indicating success or failure.
    """
    # Validate the password
    # Returns failure response if the password is invalid
    try:
        validate_password(password, user=user)
    except ValidationError as e:
        return Response(
            status=400,
            data={"success": False, "error": "\n".join(e.messages)},
        )

    # Set the password and remove the activation key
    user.set_password(password)
    user.activation_key = None
    user.save()

    # Log the user in
    request.user = user
    return successful_login_response(request)


class ActivateView(APIView):
    """
    Activates an inactive user and sets their password using an activation key and password.
    """

    def post(self, request):
        # Get the activation key and password
        try:
            activation_key = request.data["activationKey"]
            password = request.data["newPassword"]
        except KeyError:
            return Response(
                status=400,
                data={
                    "success": False,
                    "error": "Activation key or password is missing",
                },
            )

        # Get unactivated user with that activation key
        try:
            user = User.objects.get(activation_key=activation_key)
        except (User.DoesNotExist, ValidationError):
            return Response(
                status=400,
                data={
                    "success": False,
                    "error": "Invalid activation key. The account may already be activated.",
                },
            )

        # Try to activate the user and set their password to the specified password
        return activate(request, user, password)


class ResetPasswordView(APIView):
    """
    Sets or changes a user's password.

    If the user is not yet activated, the user will be activated and their password set.

    Handles the following cases:
    1. User is not logged in and provides a valid reset key. Password will be changed.
    2. User is logged in and has no password (current password not required). Password will be set.
    3. User is logged in and already has a password (current password is required). Password will be changed.
    """

    def reset_password(self, request: Request, user: User) -> Response:
        # Try getting the new password
        try:
            new_password = request.data["newPassword"]
        except KeyError:
            return Response(
                status=400,
                data={
                    "success": False,
                    "error": "New password is missing.",
                },
            )

        # If the user is not activated, activate them instead
        if not user.is_activated:
            return activate(request, user, new_password)

        # Validate the new password
        try:
            validate_password(new_password, user=user)
        except ValidationError as e:
            return Response(
                status=400,
                data={"success": False, "error": "\n".join(e.messages)},
            )

        # Set the new password
        user.set_password(new_password)
        user.save()

        # Try to delete the token for the user so existing sessions are invalidated
        Token.objects.filter(user=user).delete()

        # Log the user in with their new token
        request.user = user
        return successful_login_response(request)

    def reset_with_reset_key(self, request: Request, reset_key: str) -> Response:
        # Get the user associated with the reset key
        try:
            reset_request = PasswordResetRequest.objects.get_usable_request_with_key(
                key=reset_key
            )
        except PasswordResetRequest.DoesNotExist:
            return Response(
                status=400,
                data={
                    "success": False,
                    "error": "Invalid reset key. It may have already been used.",
                },
            )

        response = self.reset_password(request, reset_request.user)

        # Delete the reset key if the password was successfully changed
        if response.data["success"] is True:
            reset_request.set_used()

        return response

    def reset_with_current_password(self, request: Request) -> Response:
        # Require that the user is logged in
        if request.user.is_anonymous:
            return Response(
                status=400,
                data={
                    "success": False,
                    "error": "Specify a reset key or log in and try again.",
                },
            )

        # If the user has a password already, try getting the current password
        if request.user.has_usable_password():
            try:
                current_password = request.data["currentPassword"]
            except KeyError:
                return Response(
                    status=400,
                    data={
                        "success": False,
                        "error": "Reset key and current password are missing.",
                    },
                )

            # Validate the current password against the requesting user
            if not request.user.check_password(current_password):
                return Response(
                    status=400,
                    data={
                        "success": False,
                        "error": "Incorrect current password.",
                    },
                )

        return self.reset_password(request, request.user)

    def post(self, request):
        try:
            # If the reset key is present, try resetting the password with that key
            reset_key = request.data["resetKey"]
            return self.reset_with_reset_key(request, reset_key)
        except KeyError:
            pass

        # If no reset key is present, try resetting the password with the current password
        return self.reset_with_current_password(request)


class RequestPasswordResetView(APIView):
    """
    Requests a password reset link to be generated and sent via email.
    """

    class RequestPasswordResetResponse(Response):
        """
        Response for the RequestPasswordResetView that may generate a
        PasswordResetRequest and email it to the user when it is closed.
        """

        def __init__(self, email: str):
            # Always reports success
            super().__init__(data={"success": True})
            self.email = email

        def close(self):
            """
            If the user exists, generate a ResetPasswordToken and email them a link to
            reset their password.

            Doing these checks in the request post handler can leak information about
            whether the user exists or not since it will take longer to respond if we
            send the email. So instead we do it here, after the response has been sent.
            """
            # Get the user
            try:
                user = User.objects.get(email=self.email)
            except User.DoesNotExist:
                return

            # Generate a password reset request
            reset_request = PasswordResetRequest.objects.create(user=user)

            # Email the user a link to reset their password
            send_password_reset_email(user, reset_request)

    def post(self, request):
        try:
            return self.RequestPasswordResetResponse(request.data["email"])
        except KeyError:
            return Response(
                status=400,
                data={
                    "success": False,
                    "error": "Email is missing",
                },
            )


class InvalidateOtherSessionsView(APIView):
    """
    After making a request to this view, the authentication token for the requesting
    user will be regenerated so that all sessions are logged out, and the requesting
    session will be logged back in.
    """

    def post(self, request: Request) -> Response:
        # Require that the user is logged in
        if request.user.is_anonymous:
            return Response(
                status=400,
                data={
                    "success": False,
                    "error": "You must be logged in to invalidate other sessions.",
                },
            )

        # Invalidate all other sessions
        Token.objects.filter(user=request.user).delete()

        # Log the user in with their new token
        return successful_login_response(request)
