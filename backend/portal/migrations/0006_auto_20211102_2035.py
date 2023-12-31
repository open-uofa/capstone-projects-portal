# Generated by Django 3.2.8 on 2021-11-03 02:35

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("portal", "0005_merge_20211028_1701"),
    ]

    operations = [
        migrations.AddField(
            model_name="clientorg",
            name="image",
            field=models.ImageField(
                null=True,
                upload_to="client_orgs/<django.db.models.fields.UUIDField>/org_image/",
            ),
        ),
        migrations.AddField(
            model_name="project",
            name="logo_image",
            field=models.ImageField(
                null=True,
                upload_to="projects/<django.db.models.fields.UUIDField>/logo_image/",
            ),
        ),
        migrations.AddField(
            model_name="user",
            name="image",
            field=models.ImageField(
                null=True,
                upload_to="users/<django.db.models.fields.UUIDField>/user_image/",
            ),
        ),
    ]
