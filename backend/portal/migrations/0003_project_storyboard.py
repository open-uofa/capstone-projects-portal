# Generated by Django 3.2.7 on 2021-10-25 16:48

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("portal", "0002_auto_20211006_1636"),
    ]

    operations = [
        migrations.AddField(
            model_name="project",
            name="storyboard",
            field=models.URLField(blank=True),
        ),
    ]
