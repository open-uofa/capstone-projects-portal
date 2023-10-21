import django
from django import forms
from django.contrib import admin
from django.contrib.auth import get_user_model, password_validation
from django.utils.translation import gettext_lazy as _
from django_admin_listfilter_dropdown.filters import (
    ChoiceDropdownFilter,
    DropdownFilter,
    RelatedDropdownFilter,
)
from rest_framework.authtoken.models import TokenProxy

from . import models

admin.site.site_header = "CMPUT 401 Projects Portal Admin"

"""
Custom list filter to filter users based on their project roles
Students, TAs, Client Reps
"""


class UserRoleListFilter(admin.SimpleListFilter):
    # Human-readable title which will be displayed in the
    # right admin sidebar just above the filter options.
    title = _("role")

    # Parameter for the filter that will be used in the URL query.
    parameter_name = "role"

    def lookups(self, request, model_admin):
        """
        Returns a list of tuples. The first element in each
        tuple is the coded value for the option that will
        appear in the URL query. The second element is the
        human-readable name for the option that will appear
        in the right sidebar.
        """
        return (
            ("students", _("Students")),
            ("ta", _("TAs")),
            ("client_rep", _("Client Reps")),
        )

    def queryset(self, request, queryset):
        """
        Returns the filtered queryset based on the value
        provided in the query string and retrievable via
        `self.value()`.
        """
        # Compare the requested value
        # to decide how to filter the queryset.
        if self.value() in ["students", "ta", "client_rep"]:
            # Get all users of a certain role from all projects
            projects = models.Project.objects.values_list(self.value(), flat=True)
            return queryset.filter(id__in=projects)


"""
Custom list filter to filter users based on the term they worked on a project
Also checks if year and role is selected and filter accordingly.
"""


class UserTermListFilter(admin.SimpleListFilter):
    template = "django_admin_listfilter_dropdown/dropdown_filter.html"
    # Human-readable title which will be displayed in the
    # right admin sidebar just above the filter options.
    title = _("term")

    # Parameter for the filter that will be used in the URL query.
    parameter_name = "term"

    def lookups(self, request, model_admin):
        """
        Returns a list of tuples. The first element in each
        tuple is the coded value for the option that will
        appear in the URL query. The second element is the
        human-readable name for the option that will appear
        in the right sidebar.
        """
        return (
            ("F", _("F")),
            ("W", _("W")),
            ("SP", _("SP")),
            ("SM", _("SM")),
        )

    def queryset(self, request, queryset):
        """
        Returns the filtered queryset based on the value
        provided in the query string and retrievable via
        `self.value()`.
        """
        # Compare the requested value
        # to decide how to filter the queryset.
        role = request.GET.get("role", "")
        year = request.GET.get("year", "")

        if self.value() in ["F", "W", "SP", "SM"]:
            # Get all projects of selected term
            projects = models.Project.objects.filter(term=self.value())

            # If a year is given, get all projects from selected term and selected year
            if year:
                projects = (
                    projects & models.Project.objects.filter(year=year)
                ).distinct()

            # If a role is set, get users of that role from the projects
            if role:
                users = projects.values_list(role, flat=True).distinct()
                return queryset.filter(id__in=users)

            # Else get all users from projects
            else:
                students = projects.values_list("students", flat=True).distinct()

                tas = projects.values_list("ta", flat=True).distinct()

                reps = projects.values_list("client_rep", flat=True).distinct()

                return (
                    queryset.filter(id__in=students)
                    | queryset.filter(id__in=tas)
                    | queryset.filter(id__in=reps)
                ).distinct()


"""
Custom list filter to filter users based on the year they worked on a project.
Also checks if term and role is selected and filter accordingly.
"""


class UserYearListFilter(admin.SimpleListFilter):
    template = "django_admin_listfilter_dropdown/dropdown_filter.html"
    # Human-readable title which will be displayed in the
    # right admin sidebar just above the filter options.
    title = _("year")

    # Parameter for the filter that will be used in the URL query.
    parameter_name = "year"
    parameter_values = []

    def lookups(self, request, model_admin):
        """
        Returns a list of tuples. The first element in each
        tuple is the coded value for the option that will
        appear in the URL query. The second element is the
        human-readable name for the option that will appear
        in the right sidebar.
        """
        # Get all years from projects
        project_years = models.Project.objects.values_list("year", flat=True).distinct()

        # Dynamically create filter options
        sidebar_display = []

        for year in project_years:
            self.parameter_values.append(str(year))
            sidebar_display.append((year, str(year)))

        # Put years in order
        sidebar_display.sort()

        return sidebar_display

    def queryset(self, request, queryset):
        """
        Returns the filtered queryset based on the value
        provided in the query string and retrievable via
        `self.value()`.
        """
        # Compare the requested value
        # to decide how to filter the queryset.
        role = request.GET.get("role", "")
        term = request.GET.get("term", "")

        if self.value() in self.parameter_values:
            # Get all projects from selected year
            projects = models.Project.objects.filter(year=self.value())

            # If a term is given, get all projects from selected year and selected term
            if term:
                projects = (
                    projects & models.Project.objects.filter(term=term)
                ).distinct()

            # If a role is set, get users of that role from the projects
            if role:
                users = projects.values_list(role, flat=True).distinct()
                return queryset.filter(id__in=users)

            # Else get all users from projects
            else:
                students = projects.values_list("students", flat=True).distinct()

                tas = projects.values_list("ta", flat=True).distinct()

                reps = projects.values_list("client_rep", flat=True).distinct()

                return (
                    queryset.filter(id__in=students)
                    | queryset.filter(id__in=tas)
                    | queryset.filter(id__in=reps)
                ).distinct()


class UserCreationForm(django.contrib.auth.forms.UserCreationForm):
    """
    Custom UserCreationForm that makes setting a password optional.
    If the password is not specified, then the user will be created
    with an unusable password.
    """

    password1 = forms.CharField(
        label=_("Password"),
        required=False,
        strip=False,
        widget=forms.PasswordInput(attrs={"autocomplete": "new-password"}),
        help_text=password_validation.password_validators_help_text_html(),
    )
    password2 = forms.CharField(
        label=_("Password confirmation"),
        required=False,
        widget=forms.PasswordInput(attrs={"autocomplete": "new-password"}),
        strip=False,
        help_text=_("Enter the same password as before, for verification."),
    )

    def save(self, commit=True):
        """
        Save the user with the password in hashed format if the password is set.
        Otherwise, save the user with an unusable password.
        """
        user = super().save(commit=False)
        if self.cleaned_data["password1"] != "":
            user.set_password(self.cleaned_data["password1"])
        else:
            user.set_unusable_password()
        if commit:
            user.save()
        return user


@admin.register(get_user_model())
class UserAdmin(django.contrib.auth.admin.UserAdmin):
    exclude = ("username", "first_name", "last_name")
    fieldsets = (
        (None, {"fields": ("email", "password")}),
        (
            _("Profile"),
            {
                "fields": (
                    "name",
                    "bio",
                    "image",
                    "website_link",
                    "linkedin_link",
                )
            },
        ),
        (
            _("Permissions"),
            {
                "fields": (
                    "is_active",
                    "is_staff",
                    "is_superuser",
                    "groups",
                    "user_permissions",
                ),
            },
        ),
        (_("Important dates"), {"fields": ("last_login", "date_joined")}),
    )
    add_form = UserCreationForm
    add_fieldsets = (
        (
            None,
            {
                "classes": ("wide",),
                "fields": (
                    "email",
                    "name",
                    "github_username",
                    "password1",
                    "password2",
                ),
            },
        ),
    )
    list_display = ("email", "name", "is_staff")
    search_fields = ("email", "name", "id")
    ordering = ()
    list_filter = (
        "is_staff",
        "is_superuser",
        "is_active",
        UserRoleListFilter,
        UserTermListFilter,
        UserYearListFilter,
    )


@admin.register(models.ClientOrg)
class ClientOrgAdmin(admin.ModelAdmin):
    list_display = ("name", "type")
    list_filter = ("type",)


@admin.action(description="Publish selected projects")
def make_published(modeladmin, request, queryset):
    queryset.update(is_published=True)


@admin.action(description="Unpublish selected projects")
def make_unpublished(modeladmin, request, queryset):
    queryset.update(is_published=False)


@admin.action(description="Display selected projects on the home page")
def display_on_home(modeladmin, request, queryset):
    queryset.update(display_on_home_page=True)


@admin.action(description="Remove selected projects from the home page")
def remove_from_home(modeladmin, request, queryset):
    queryset.update(display_on_home_page=False)


@admin.register(models.Project)
class ProjectAdmin(admin.ModelAdmin):
    actions = [make_published, make_unpublished, display_on_home, remove_from_home]
    list_display = (
        "name",
        "client_org",
        "ta",
        "is_published",
        "display_on_home_page",
    )

    search_fields = ("year", "name")
    # adds a dropdown menu when filters items exceed 3
    list_filter = (
        ("type", ChoiceDropdownFilter),
        "is_published",
        "display_on_home_page",
        ("year", DropdownFilter),
        ("term", DropdownFilter),
        ("tags", RelatedDropdownFilter),
    )


@admin.register(models.Tag)
class TagAdmin(admin.ModelAdmin):
    search_fields = ("value",)


@admin.register(models.MailingList)
class MailingListAdmin(admin.ModelAdmin):
    search_fields = ("email",)


@admin.register(models.Proposal)
class ProposalAdmin(admin.ModelAdmin):
    list_display = ("rep_name", "short_description", "date")
    list_filter = ("date",)
    search_fields = ("rep_name",)


admin.site.unregister(TokenProxy)
