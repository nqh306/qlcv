# SPDX-License-Identifier: AGPL-3.0-only
# See the LICENSE file for details.

from django.apps import AppConfig


class ApiConfig(AppConfig):
    name = "qlcv.api"

    def ready(self):
        # Import authentication extensions to register them with drf-spectacular
        try:
            import qlcv.utils.openapi.auth  # noqa
        except ImportError:
            pass
