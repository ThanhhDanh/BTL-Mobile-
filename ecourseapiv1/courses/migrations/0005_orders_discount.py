# Generated by Django 4.2.11 on 2024-05-23 08:13

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('courses', '0004_products_content'),
    ]

    operations = [
        migrations.AddField(
            model_name='orders',
            name='discount',
            field=models.DecimalField(decimal_places=2, default=0, max_digits=5),
        ),
    ]
