# Generated by Django 3.2.9 on 2021-11-22 19:21

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ("portal", "0015_auto_20211116_2138"),
    ]

    operations = [
        migrations.RemoveField(
            model_name="clientorg",
            name="logo",
        ),
    ]
