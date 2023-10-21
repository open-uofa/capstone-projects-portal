import uuid

from django.contrib.auth import get_user_model
from django.contrib.auth.base_user import BaseUserManager
from django.contrib.auth.models import AbstractUser
from django.db import models
from django.db.models.signals import post_save
from django.dispatch import receiver
from django.template.defaultfilters import truncatechars
from django.utils import timezone

from .emails import send_activation_email


class UserManager(BaseUserManager):
    use_in_migrations = True

    def create_user(self, email, password, **extra_fields):
        """Creates, saves and returns a User."""
        user = self.model(email=self.normalize_email(email), **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, email, password, **extra_fields):
        """Creates a User, sets it to be staff and superuser, and saves and returns it."""
        extra_fields["is_staff"] = True
        extra_fields["is_superuser"] = True
        return self.create_user(email, password, **extra_fields)


class User(AbstractUser):
    # Remove unwanted fields from AbstractUser
    username = None
    first_name = None
    last_name = None

    # Use UserManager
    objects = UserManager()

    # Fields
    # Set email field as username field
    email = models.EmailField(unique=True)
    USERNAME_FIELD = "email"
    REQUIRED_FIELDS = []

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=90)
    bio = models.TextField(blank=True)
    image = models.ImageField(null=True, blank=True, upload_to=("users/user_image/"))
    website_link = models.URLField(blank=True)
    linkedin_link = models.URLField(blank=True)
    github_username = models.CharField(max_length=60, blank=True)
    github_user_id = models.CharField(max_length=35, null=True, blank=True, unique=True)
    activation_key = models.UUIDField(null=True, unique=True, editable=False)

    def is_student_of(self, project):
        return self in project.students.all()

    def is_rep_of(self, org):
        return self in org.reps.all()

    @property
    def is_activated(self):
        return self.activation_key is None

    def __str__(self):
        return f'<{self.__class__.__name__} id="{self.id}" email="{self.email}" name="{self.name}" github_username="{self.github_username}">'


@receiver(post_save, sender=User)
def user_post_save(sender, instance, created, **kwargs):
    """
    Called after a User instance is saved.
    """
    if created:
        # User is newly-created
        if not instance.has_usable_password() and not instance.github_username:
            # User has no password or GitHub username, so generate an activation key and send an activation email
            instance.activation_key = uuid.uuid4()
            instance.save()
            send_activation_email(instance)


class ClientOrgManager(models.Manager):
    # Defines which client orgs are visible to current user
    def visible_to(self, user):
        # Admins can see all orgs
        if user.is_superuser:
            return self.all()

        projects = Project.objects.visible_to(user)
        visible = self.filter(id__in=projects.values("client_org"))

        # Anons can only see projects visible to them
        if user.is_anonymous:
            return visible

        # Everyone else sees visible projects and any they are the rep of
        return (visible | self.filter(reps=user)).distinct("id")


class ClientOrg(models.Model):
    objects = ClientOrgManager()

    CLIENT_TYPES = [
        ("SP", "Startup"),
        ("NP", "Non-profit"),
        ("AC", "Academic"),
        ("CSL", "Community Service Learning"),
        ("OTH", "Other"),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(
        max_length=60, unique=True
    )  # unique because it's used as a primary key for the CSV import
    about = models.TextField(blank=True)
    image = models.ImageField(
        null=True, blank=True, upload_to=("client_orgs/org_image/")
    )
    website_link = models.URLField(blank=True)
    type = models.CharField(max_length=60, choices=CLIENT_TYPES, default="OTH")
    reps = models.ManyToManyField(get_user_model(), blank=True)
    testimonial = models.TextField(blank=True)

    def __str__(self):
        return f'<{self.__class__.__name__} id="{self.id}" name="{self.name}">'


class MailingList(models.Model):
    email = models.EmailField(primary_key=True)

    def __str__(self):
        return f'<{self.__class__.__name__} email="{self.email}">'


class Tag(models.Model):
    value = models.CharField(max_length=25, unique=True)

    def __str__(self):
        return self.value


class ProjectManager(models.Manager):
    def visible_to(self, user):
        if user.is_superuser:
            return self.all()

        published = self.filter(is_published=True)

        if user.is_anonymous:
            return published

        return (
            published
            | self.filter(students__in=[user])
            | self.filter(ta=user)
            | self.filter(client_rep=user)
        ).distinct("id")


class Project(models.Model):
    objects = ProjectManager()

    PROJECT_TYPE_CHOICES = [("MA", "Mobile App"), ("WA", "Web App"), ("OTH", "Other")]

    TERM_CHOICES = [("F", "Fall"), ("W", "Winter"), ("SP", "Spring"), ("SM", "Summer")]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    students = models.ManyToManyField(
        get_user_model(), blank=True, related_name="student_projects"
    )
    ta = models.ForeignKey(
        get_user_model(),
        on_delete=models.SET_NULL,
        null=True,
        related_name="ta_projects",
    )
    client_rep = models.ForeignKey(
        get_user_model(),
        on_delete=models.SET_NULL,
        null=True,
        related_name="client_rep_projects",
    )
    client_org = models.ForeignKey(
        ClientOrg, on_delete=models.CASCADE, null=True, related_name="projects"
    )
    name = models.CharField(
        max_length=80, unique=True
    )  # unique because it's used as a primary key for the CSV import
    summary = models.TextField(blank=True)
    video = models.URLField(blank=True)
    tags = models.ManyToManyField(Tag, blank=True)
    type = models.CharField(max_length=50, choices=PROJECT_TYPE_CHOICES, default="OTH")
    tagline = models.CharField(max_length=150, blank=True)
    is_published = models.BooleanField(default=False)
    display_on_home_page = models.BooleanField(default=False)
    year = models.PositiveBigIntegerField()
    term = models.CharField(choices=TERM_CHOICES, max_length=50)
    screenshot = models.ImageField(
        null=True, blank=True, upload_to=("projects/screenshot/")
    )
    presentation = models.URLField(blank=True)
    review = models.TextField(blank=True)
    website_url = models.URLField(blank=True)
    source_code_url = models.URLField(blank=True)
    logo_url = models.URLField(blank=True)
    logo_image = models.ImageField(
        null=True, blank=True, upload_to=("projects/logo_image/")
    )
    storyboard = models.URLField(blank=True)

    def __str__(self):
        return f'<{self.__class__.__name__} id="{self.id}" name="{self.name}">'


class Proposal(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    rep_name = models.CharField(max_length=95)
    email = models.EmailField()
    project_info = models.TextField()
    date = models.DateField()

    @property
    def short_description(self):
        return truncatechars(self.project_info, 50)

    def __str__(self):
        return f'<{self.__class__.__name__} id="{self.id}" rep_name="{self.rep_name}">'


class PasswordResetRequestManager(models.Manager):
    def get_usable_request_with_key(self, key: str):
        """
        Get a usable PasswordResetRequest instance corresponding with the specified key.
        Raises a PasswordResetRequest.DoesNotExist exception if no such
        PasswordResetRequest exists.
        """
        instance = super().get(key=key)
        if instance.is_usable:
            return instance
        raise self.model.DoesNotExist


class PasswordResetRequest(models.Model):
    objects = PasswordResetRequestManager()

    # How long the request is valid for
    VALID_DURATION = timezone.timedelta(hours=1)

    user = models.ForeignKey(get_user_model(), on_delete=models.CASCADE)
    key = models.UUIDField(unique=True, default=uuid.uuid4, editable=False)
    created_at = models.DateTimeField(auto_now_add=True)
    used_at = models.DateTimeField(null=True)

    @property
    def is_usable(self) -> bool:
        """
        Return True iff the request is not used yet and not expired, False otherwise.
        """
        return (
            self.used_at is None
            and self.created_at + self.VALID_DURATION > timezone.now()
        )

    def set_used(self):
        """
        Mark the request as used.
        """
        self.used_at = timezone.now()
        self.save()

    def __str__(self):
        return f"{self.__class__.__name__} {self.id} for user {str(self.user)}"

    @classmethod
    def prune_unusable_requests(cls):
        """
        Prune requests that have expired or are already used.
        """
        (
            cls.objects.filter(created_at__lt=timezone.now() - cls.VALID_DURATION)
            | cls.objects.filter(used_at__isnull=False)
        ).delete()
