# Generated by Django 3.2.8 on 2021-10-22 06:14

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("portal", "0003_clientorg_testimonial"),
    ]

    operations = [
        migrations.AlterField(
            model_name="clientorg",
            name="testimonial",
            field=models.TextField(blank=True),
        ),
    ]
