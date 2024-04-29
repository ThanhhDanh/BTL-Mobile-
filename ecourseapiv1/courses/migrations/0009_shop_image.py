# Generated by Django 4.2.11 on 2024-04-29 06:17

import cloudinary.models
from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('courses', '0008_shop_category'),
    ]

    operations = [
        migrations.AddField(
            model_name='shop',
            name='image',
            field=cloudinary.models.CloudinaryField(max_length=255, null=True),
        ),
    ]
