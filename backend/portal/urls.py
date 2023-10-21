from django.urls import path
from drf_spectacular.views import SpectacularAPIView, SpectacularSwaggerView
from rest_framework import routers

from . import import_views, login_views, views

urlpatterns = []

# User info of logged in user
urlpatterns += [
    path("users/me/", views.CurrentUserInfo.as_view(), name="current-user-info")
]

# CSV import
urlpatterns += [
    path("csv/validate/", import_views.validate_csv, name="validate_csv"),
    path("csv/import/", import_views.import_csv, name="import_csv"),
]

# API router
router = routers.SimpleRouter()
router.register("users", views.UserViewSet)
router.register("orgs", views.ClientOrgViewSet, basename="org")
router.register("projects", views.ProjectViewSet, basename="project")
router.register("proposals", views.ProposalViewSet)
urlpatterns += router.urls

# Authentication
urlpatterns += [
    path("login/<str:auth_type>/", login_views.LoginView.as_view(), name="login"),
    path("activate/", login_views.ActivateView.as_view(), name="activate"),
    path(
        "reset-password/",
        login_views.ResetPasswordView.as_view(),
        name="reset-password",
    ),
    path(
        "request-password-reset/",
        login_views.RequestPasswordResetView.as_view(),
        name="request-password-reset",
    ),
    path(
        "logout-all/",
        login_views.InvalidateOtherSessionsView.as_view(),
        name="logout-all",
    ),
]

# Documentation
urlpatterns += [
    path("docs/", SpectacularSwaggerView.as_view(url_name="schema"), name="docs"),
    path("docs/schema", SpectacularAPIView.as_view(), name="schema"),
]
