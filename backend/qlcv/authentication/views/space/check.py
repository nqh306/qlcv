# SPDX-License-Identifier: AGPL-3.0-only
# See the LICENSE file for details.

# Python imports
import os

# Django imports
from django.core.validators import validate_email
from django.core.exceptions import ValidationError

# Third party imports
from rest_framework import status
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView

## Module imports
from qlcv.db.models import User
from qlcv.license.models import Instance
from qlcv.authentication.adapter.error import (
    AUTHENTICATION_ERROR_CODES,
    AuthenticationException,
)
from qlcv.authentication.rate_limit import AuthenticationThrottle
from qlcv.license.utils.instance_value import get_configuration_value


class EmailCheckSpaceEndpoint(APIView):
    permission_classes = [AllowAny]

    throttle_classes = [AuthenticationThrottle]

    def post(self, request):
        # Check instance configuration
        instance = Instance.objects.first()
        if instance is None or not instance.is_setup_done:
            exc = AuthenticationException(
                error_code=AUTHENTICATION_ERROR_CODES["INSTANCE_NOT_CONFIGURED"],
                error_message="INSTANCE_NOT_CONFIGURED",
            )
            return Response(exc.get_error_dict(), status=status.HTTP_400_BAD_REQUEST)

        (EMAIL_HOST, ENABLE_MAGIC_LINK_LOGIN) = get_configuration_value(
            [
                {"key": "EMAIL_HOST", "default": os.environ.get("EMAIL_HOST", "")},
                {
                    "key": "ENABLE_MAGIC_LINK_LOGIN",
                    "default": os.environ.get("ENABLE_MAGIC_LINK_LOGIN", "1"),
                },
            ]
        )

        smtp_configured = bool(EMAIL_HOST)
        is_magic_login_enabled = ENABLE_MAGIC_LINK_LOGIN == "1"

        email = request.data.get("email", False)

        # Return error if email is not present
        if not email:
            exc = AuthenticationException(
                error_code=AUTHENTICATION_ERROR_CODES["EMAIL_REQUIRED"],
                error_message="EMAIL_REQUIRED",
            )
            return Response(exc.get_error_dict(), status=status.HTTP_400_BAD_REQUEST)

        identifier = str(email).lower().strip()
        # Determine if identifier is email or username
        is_email_login = "@" in identifier
        if is_email_login:
            try:
                validate_email(identifier)
            except ValidationError:
                exc = AuthenticationException(
                    error_code=AUTHENTICATION_ERROR_CODES["INVALID_EMAIL"],
                    error_message="INVALID_EMAIL",
                )
                return Response(exc.get_error_dict(), status=status.HTTP_400_BAD_REQUEST)
            existing_user = User.objects.filter(email=identifier).first()
        else:
            existing_user = User.objects.filter(username=identifier).first()

        # If existing user
        if existing_user:
            if not is_email_login:
                auth_status = "CREDENTIAL"
            elif existing_user.is_password_autoset and smtp_configured and is_magic_login_enabled:
                auth_status = "MAGIC_CODE"
            else:
                auth_status = "CREDENTIAL"
            return Response(
                {"existing": True, "status": auth_status},
                status=status.HTTP_200_OK,
            )
        # Else return response — always force sign-in mode (signup is disabled)
        if not is_email_login:
            return Response(
                {"existing": True, "status": "CREDENTIAL"},
                status=status.HTTP_200_OK,
            )
        return Response(
            {
                "existing": True,
                "status": ("MAGIC_CODE" if smtp_configured and is_magic_login_enabled else "CREDENTIAL"),
            },
            status=status.HTTP_200_OK,
        )
