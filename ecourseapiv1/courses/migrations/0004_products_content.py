# Generated by Django 4.2.11 on 2024-05-17 16:44

import ckeditor.fields
from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('courses', '0003_user_address'),
    ]

    operations = [
        migrations.AddField(
            model_name='products',
            name='content',
            field=ckeditor.fields.RichTextField(default=1),
            preserve_default=False,
        ),
    ]