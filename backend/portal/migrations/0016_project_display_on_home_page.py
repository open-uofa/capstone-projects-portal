# Generated by Django 3.2.9 on 2021-11-21 00:38

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("portal", "0015_auto_20211116_2138"),
    ]

    operations = [
        migrations.AddField(
            model_name="project",
            name="display_on_home_page",
            field=models.BooleanField(default=False),
        ),
    ]
