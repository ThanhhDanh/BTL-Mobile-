# Generated by Django 4.2.11 on 2024-06-11 14:38

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('courses', '0012_alter_orders_paymentmethod_and_more'),
    ]

    operations = [
        migrations.AlterField(
            model_name='products',
            name='priceProduct',
            field=models.IntegerField(),
        ),
    ]