# SPDX-License-Identifier: AGPL-3.0-only
# See the LICENSE file for details.

# Django imports
from django.core.exceptions import ValidationError
from django.core.validators import validate_email
from django.http import HttpResponseRedirect
from django.views import View

# Module imports
from qlcv.authentication.provider.credentials.email import EmailProvider
from qlcv.authentication.utils.login import user_login
from qlcv.license.models import Instance
from qlcv.authentication.utils.host import base_host
from qlcv.authentication.utils.redirection_path import get_redirection_path
from qlcv.authentication.utils.user_auth_workflow import post_user_auth_workflow
from qlcv.db.models import User
from qlcv.authentication.adapter.error import (
    AuthenticationException,
    AUTHENTICATION_ERROR_CODES,
)
from qlcv.utils.path_validator import get_safe_redirect_url


class SignInAuthEndpoint(View):
    def post(self, request):
        next_path = request.POST.get("next_path")
        # Check instance configuration
        instance = Instance.objects.first()
        if instance is None or not instance.is_setup_done:
            # Redirection params
            exc = AuthenticationException(
                error_code=AUTHENTICATION_ERROR_CODES["INSTANCE_NOT_CONFIGURED"],
                error_message="INSTANCE_NOT_CONFIGURED",
            )
            params = exc.get_error_dict()
            # Base URL join
            url = get_safe_redirect_url(
                base_url=base_host(request=request, is_app=True),
                next_path=next_path,
                params=params,
            )
            return HttpResponseRedirect(url)

        # set the referer as session to redirect after login
        identifier = request.POST.get("email", False)
        password = request.POST.get("password", False)

        ## Raise exception if any of the above are missing
        if not identifier or not password:
            # Redirection params
            exc = AuthenticationException(
                error_code=AUTHENTICATION_ERROR_CODES["REQUIRED_EMAIL_PASSWORD_SIGN_IN"],
                error_message="REQUIRED_EMAIL_PASSWORD_SIGN_IN",
                payload={"email": str(identifier)},
            )
            params = exc.get_error_dict()
            # Next path
            url = get_safe_redirect_url(
                base_url=base_host(request=request, is_app=True),
                next_path=next_path,
                params=params,
            )
            return HttpResponseRedirect(url)

        # Determine if identifier is email or username
        identifier = identifier.strip().lower()
        if "@" in identifier:
            # Validate email format
            email = identifier
            try:
                validate_email(email)
            except ValidationError:
                exc = AuthenticationException(
                    error_code=AUTHENTICATION_ERROR_CODES["INVALID_EMAIL_SIGN_IN"],
                    error_message="INVALID_EMAIL_SIGN_IN",
                    payload={"email": str(email)},
                )
                params = exc.get_error_dict()
                url = get_safe_redirect_url(
                    base_url=base_host(request=request, is_app=True),
                    next_path=next_path,
                    params=params,
                )
                return HttpResponseRedirect(url)
            existing_user = User.objects.filter(email=email).first()
        else:
            # Lookup by username
            existing_user = User.objects.filter(username=identifier).first()
            email = existing_user.email if existing_user else identifier

        if not existing_user:
            exc = AuthenticationException(
                error_code=AUTHENTICATION_ERROR_CODES["USER_DOES_NOT_EXIST"],
                error_message="USER_DOES_NOT_EXIST",
                payload={"email": str(email)},
            )
            params = exc.get_error_dict()
            url = get_safe_redirect_url(
                base_url=base_host(request=request, is_app=True),
                next_path=next_path,
                params=params,
            )
            return HttpResponseRedirect(url)

        try:
            # Use existing_user.email as key so EmailProvider can find the user by email
            provider = EmailProvider(
                request=request,
                key=existing_user.email,
                code=password,
                is_signup=False,
                callback=post_user_auth_workflow,
            )
            user = provider.authenticate()
            # Login the user and record his device info
            user_login(request=request, user=user, is_app=True)
            # Get the redirection path
            if next_path:
                path = next_path
            else:
                path = get_redirection_path(user=user)

            # Get the safe redirect URL
            url = get_safe_redirect_url(
                base_url=base_host(request=request, is_app=True),
                next_path=path,
                params={},
            )
            return HttpResponseRedirect(url)
        except AuthenticationException as e:
            params = e.get_error_dict()
            url = get_safe_redirect_url(
                base_url=base_host(request=request, is_app=True),
                next_path=next_path,
                params=params,
            )
            return HttpResponseRedirect(url)


class SignUpAuthEndpoint(View):
    def post(self, request):
        next_path = request.POST.get("next_path")
        # Check instance configuration
        instance = Instance.objects.first()
        if instance is None or not instance.is_setup_done:
            # Redirection params
            exc = AuthenticationException(
                error_code=AUTHENTICATION_ERROR_CODES["INSTANCE_NOT_CONFIGURED"],
                error_message="INSTANCE_NOT_CONFIGURED",
            )
            params = exc.get_error_dict()
            url = get_safe_redirect_url(
                base_url=base_host(request=request, is_app=True),
                next_path=next_path,
                params=params,
            )
            return HttpResponseRedirect(url)

        email = request.POST.get("email", False)
        password = request.POST.get("password", False)
        ## Raise exception if any of the above are missing
        if not email or not password:
            # Redirection params
            exc = AuthenticationException(
                error_code=AUTHENTICATION_ERROR_CODES["REQUIRED_EMAIL_PASSWORD_SIGN_UP"],
                error_message="REQUIRED_EMAIL_PASSWORD_SIGN_UP",
                payload={"email": str(email)},
            )
            params = exc.get_error_dict()
            url = get_safe_redirect_url(
                base_url=base_host(request=request, is_app=True),
                next_path=next_path,
                params=params,
            )
            return HttpResponseRedirect(url)
        # Validate the email
        email = email.strip().lower()
        try:
            validate_email(email)
        except ValidationError:
            # Redirection params
            exc = AuthenticationException(
                error_code=AUTHENTICATION_ERROR_CODES["INVALID_EMAIL_SIGN_UP"],
                error_message="INVALID_EMAIL_SIGN_UP",
                payload={"email": str(email)},
            )
            params = exc.get_error_dict()
            url = get_safe_redirect_url(
                base_url=base_host(request=request, is_app=True),
                next_path=next_path,
                params=params,
            )
            return HttpResponseRedirect(url)

        # Existing user
        existing_user = User.objects.filter(email=email).first()

        if existing_user:
            # Existing User
            exc = AuthenticationException(
                error_code=AUTHENTICATION_ERROR_CODES["USER_ALREADY_EXIST"],
                error_message="USER_ALREADY_EXIST",
                payload={"email": str(email)},
            )
            params = exc.get_error_dict()
            url = get_safe_redirect_url(
                base_url=base_host(request=request, is_app=True),
                next_path=next_path,
                params=params,
            )
            return HttpResponseRedirect(url)

        try:
            provider = EmailProvider(
                request=request,
                key=email,
                code=password,
                is_signup=True,
                callback=post_user_auth_workflow,
            )
            user = provider.authenticate()
            # Login the user and record his device info
            user_login(request=request, user=user, is_app=True)
            # Get the redirection path
            if next_path:
                path = next_path
            else:
                path = get_redirection_path(user=user)

            url = get_safe_redirect_url(
                base_url=base_host(request=request, is_app=True),
                next_path=path,
                params={},
            )
            return HttpResponseRedirect(url)
        except AuthenticationException as e:
            params = e.get_error_dict()
            url = get_safe_redirect_url(
                base_url=base_host(request=request, is_app=True),
                next_path=next_path,
                params=params,
            )
            return HttpResponseRedirect(url)
