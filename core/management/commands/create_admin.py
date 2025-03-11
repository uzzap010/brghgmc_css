from django.core.management.base import BaseCommand
from core.models import AdminAccount

class Command(BaseCommand):
    help = 'Creates a new admin account'

    def handle(self, *args, **kwargs):
        try:
            # Delete existing admin accounts
            AdminAccount.objects.all().delete()
            self.stdout.write(self.style.SUCCESS('Deleted existing admin accounts'))

            # Create new admin account
            admin = AdminAccount(
                username='admin',
                email='admin@example.com',
                full_name='Admin User',
                is_active=True
            )
            admin.set_password('admin123')
            admin.save()

            self.stdout.write(self.style.SUCCESS(f'Successfully created admin account'))
            self.stdout.write('Username: admin')
            self.stdout.write('Password: admin123')
        except Exception as e:
            self.stdout.write(self.style.ERROR(f'Error creating admin account: {str(e)}')) 