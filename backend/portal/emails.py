import logging
from textwrap import dedent
from typing import TYPE_CHECKING

from django.conf import settings
from django.core.mail import send_mail

if TYPE_CHECKING:
    from portal.models import PasswordResetRequest, Proposal, User


def send_activation_email(user: "User"):
    """
    Sends an email containing the activation URL to the user.
    """
    logging.debug(f"Sending an activation email to {user.email}")

    # Ensure that the user is unactivated and has an activation key
    if user.is_activated:
        raise ValueError("User is already activated")

    subject = "Capstone Projects Portal Account Activation"
    activation_url = f"{settings.FRONTEND_BASE_URL}/activate/{user.activation_key}"

    message = dedent(
        f"""
        Hello {user.name},

        Your account on the Capstone Projects Portal has been created.

        To start using the portal, you must activate your account by clicking on the following link:

        {activation_url}
        """
    )
    send_mail(subject, message, None, [user.email], fail_silently=False)


def send_password_reset_email(user: "User", reset_request: "PasswordResetRequest"):
    """
    Sends an email to the user with a link to reset their password.
    """

    logging.debug(f"Sending a password reset email to {user.email}")

    # Ensure that the user the reset request is for the correct user
    assert reset_request.user == user

    subject = "Reset your password for the Capstone Projects Portal"
    reset_password_url = (
        f"{settings.FRONTEND_BASE_URL}/reset-password/{reset_request.key}"
    )

    message = dedent(
        f"""
        Hello {user.name},

        A password reset request was received for your Capstone Projects Portal Account.

        To reset your password, click the link below:
        {reset_password_url}

        If you did not request this, you can ignore this email and your password will remain unchanged.
        """
    )
    send_mail(subject, message, None, [user.email], fail_silently=False)


def send_proposal_email(proposal: "Proposal", recipients: list[str]):
    """
    Sends an email to the user with a link to view the proposal.
    """

    subject = f"New Capstone Projects Portal proposal from {proposal.rep_name}"

    message = f"NAME: {proposal.rep_name}\nEMAIL: {proposal.email}\nDATE: {proposal.date}\nPROJECT INFO: {proposal.project_info}\n"
    message += "--" * 20

    send_mail(subject, message, settings.EMAIL_HOST_USER, recipients)
