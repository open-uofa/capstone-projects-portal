# Generated by Django 3.2.9 on 2021-11-12 19:31

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("portal", "0011_merge_0009_auto_20211111_1157_0010_project_screenshot"),
    ]

    operations = [
        migrations.AlterField(
            model_name="project",
            name="screenshot",
            field=models.ImageField(
                blank=True, null=True, upload_to="projects/screenshot/"
            ),
        ),
    ]