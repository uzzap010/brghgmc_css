# Generated by Django 5.1.6 on 2025-03-10 03:11

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('core', '0010_infrastructurerating_patientinteractionrating_and_more'),
    ]

    operations = [
        migrations.CreateModel(
            name='AdminAccount',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('username', models.CharField(max_length=100, unique=True)),
                ('password', models.CharField(max_length=255)),
                ('email', models.EmailField(max_length=254, unique=True)),
                ('full_name', models.CharField(max_length=255)),
                ('is_active', models.BooleanField(default=True)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('last_login', models.DateTimeField(blank=True, null=True)),
            ],
            options={
                'verbose_name': 'Admin Account',
                'verbose_name_plural': 'Admin Accounts',
            },
        ),
    ]
