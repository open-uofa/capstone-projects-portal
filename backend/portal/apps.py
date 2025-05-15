import sys

from django.apps import AppConfig


class PortalConfig(AppConfig):
    default_auto_field = "django.db.models.BigAutoField"
    name = "portal"

    def ready(self):
        if "runserver" in sys.argv:
            from . import jobs

            jobs.start_jobs()
