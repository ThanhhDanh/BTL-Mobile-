# Generated by Django 4.2.11 on 2024-06-12 07:53

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('courses', '0013_alter_products_priceproduct'),
    ]

    operations = [
        migrations.AddField(
            model_name='products',
            name='gender',
            field=models.CharField(blank=True, choices=[('male', 'Male'), ('female', 'Female'), ('unisex', 'Unisex')], max_length=10, null=True),
        ),
    ]