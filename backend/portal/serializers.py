from django.contrib.auth import get_user_model
from rest_framework import serializers

from .models import ClientOrg, MailingList, Project, Proposal, Tag


class DynamicFieldsModelSerializer(serializers.ModelSerializer):
    """
    A ModelSerializer that takes an additional `fields` argument that
    controls which fields should be displayed.
    """

    def __init__(self, *args, **kwargs):
        # Don't pass the 'fields' arg up to the superclass
        fields = kwargs.pop("fields", None)

        # Instantiate the superclass normally
        super(DynamicFieldsModelSerializer, self).__init__(*args, **kwargs)

        if fields is not None:
            # Drop any fields that are not specified in the `fields` argument.
            allowed = set(fields)
            existing = set(self.fields)
            for field_name in existing - allowed:
                self.fields.pop(field_name)


class TagSerializer(serializers.ModelSerializer):
    class Meta:
        model = Tag
        exclude = ["id"]


class ProjectShortSerializer(serializers.ModelSerializer):
    tags = TagSerializer(many=True, read_only=True)
    # show long versions of choice fields (e.g. "Web App" instead of "WA")
    type = serializers.CharField(source="get_type_display")

    class Meta:
        model = Project
        fields = [
            "id",
            "name",
            "tags",
            "tagline",
            "year",
            "term",
            "logo_url",
            "logo_image",
            "type",
        ]


class UserShortSerializer(serializers.ModelSerializer):
    class Meta:
        model = get_user_model()
        fields = ["id", "name", "image", "github_user_id"]

    read_only_fields = ["github_user_id"]


class ClientOrgShortSerializer(serializers.ModelSerializer):
    # show long versions of choice fields (e.g. "Web App" instead of "WA")
    type = serializers.CharField(source="get_type_display")

    class Meta:
        model = ClientOrg
        fields = ["id", "name", "image", "type"]


class UserSerializer(serializers.ModelSerializer):
    student_projects = serializers.SerializerMethodField()
    ta_projects = serializers.SerializerMethodField()
    client_rep_projects = serializers.SerializerMethodField()

    class Meta:
        model = get_user_model()
        fields = [
            "id",
            "email",
            "name",
            "bio",
            "image",
            "website_link",
            "linkedin_link",
            "github_username",
            "github_user_id",
            "student_projects",
            "ta_projects",
            "client_rep_projects",
        ]
        read_only_fields = ["github_username", "github_user_id"]

    def get_student_projects(self, user_being_serialized):
        requesting_user = serializers.CurrentUserDefault()(self)
        queryset = Project.objects.visible_to(requesting_user).filter(
            students__in=[user_being_serialized]
        )
        return ProjectShortSerializer(instance=queryset, many=True).data

    def get_ta_projects(self, user_being_serialized):
        requesting_user = serializers.CurrentUserDefault()(self)
        queryset = Project.objects.visible_to(requesting_user).filter(
            ta=user_being_serialized
        )
        return ProjectShortSerializer(instance=queryset, many=True).data

    def get_client_rep_projects(self, user_being_serialized):
        requesting_user = serializers.CurrentUserDefault()(self)
        queryset = Project.objects.visible_to(requesting_user).filter(
            client_rep=user_being_serialized
        )
        return ProjectShortSerializer(instance=queryset, many=True).data

    def to_representation(self, instance):
        # Remove 'email' field if user is not superuser or the requesting user
        requesting_user = serializers.CurrentUserDefault()(self)
        if not requesting_user.is_superuser and requesting_user != instance:
            self.fields.pop("email", None)

        return super().to_representation(instance)


class ClientOrgSerializer(serializers.ModelSerializer):
    projects = serializers.SerializerMethodField()
    reps = UserShortSerializer(many=True, read_only=True)

    # show long versions of choice fields (e.g. "Web App" instead of "WA")
    type = serializers.CharField(source="get_type_display")

    class Meta:
        model = ClientOrg
        fields = [
            "id",
            "name",
            "about",
            "image",
            "website_link",
            "type",
            "projects",
            "reps",
            "testimonial",
        ]

    def get_projects(self, client_org):
        requesting_user = serializers.CurrentUserDefault()(self)
        queryset = Project.objects.visible_to(requesting_user).filter(
            client_org=client_org
        )
        return ProjectShortSerializer(instance=queryset, many=True).data


class MailingListSerializer(serializers.ModelSerializer):
    class Meta:
        model = MailingList
        fields = ["email"]


class ProjectSerializer(DynamicFieldsModelSerializer):
    client_org = ClientOrgShortSerializer(read_only=True)
    students = UserShortSerializer(many=True, read_only=True)
    ta = UserShortSerializer(read_only=True)
    client_rep = UserShortSerializer(read_only=True)
    tags = TagSerializer(many=True, required=False)

    # show long versions of choice fields (e.g. "Web App" instead of "WA")
    type = serializers.CharField(source="get_type_display")
    term = serializers.CharField(source="get_term_display")

    class Meta:
        model = Project
        fields = "__all__"


class ProposalSerializer(serializers.ModelSerializer):
    class Meta:
        model = Proposal
        fields = "__all__"
