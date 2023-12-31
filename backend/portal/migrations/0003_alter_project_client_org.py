# Generated by Django 3.2.8 on 2021-10-24 03:36

import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("portal", "0002_auto_20211006_1636"),
    ]

    operations = [
        migrations.AlterField(
            model_name="project",
            name="client_org",
            field=models.ForeignKey(
                null=True,
                on_delete=django.db.models.deletion.CASCADE,
                related_name="projects",
                to="portal.clientorg",
            ),
        ),
    ]
