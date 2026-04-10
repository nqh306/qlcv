# SPDX-License-Identifier: AGPL-3.0-only
# See the LICENSE file for details.

"""qlcv URL Configuration"""

from django.conf import settings
from django.urls import include, path, re_path
from drf_spectacular.views import (
    SpectacularAPIView,
    SpectacularRedocView,
    SpectacularSwaggerView,
)

handler404 = "qlcv.app.views.error_404.custom_404_view"

urlpatterns = [
    path("api/", include("qlcv.app.urls")),
    path("api/public/", include("qlcv.space.urls")),
    path("api/instances/", include("qlcv.license.urls")),
    path("api/v1/", include("qlcv.api.urls")),
    path("auth/", include("qlcv.authentication.urls")),
    path("", include("qlcv.web.urls")),
]

if settings.ENABLE_DRF_SPECTACULAR:
    urlpatterns += [
        path("api/schema/", SpectacularAPIView.as_view(), name="schema"),
        path(
            "api/schema/swagger-ui/",
            SpectacularSwaggerView.as_view(url_name="schema"),
            name="swagger-ui",
        ),
        path(
            "api/schema/redoc/",
            SpectacularRedocView.as_view(url_name="schema"),
            name="redoc",
        ),
    ]

if settings.DEBUG:
    try:
        import debug_toolbar

        urlpatterns = [re_path(r"^__debug__/", include(debug_toolbar.urls))] + urlpatterns
    except ImportError:
        pass
