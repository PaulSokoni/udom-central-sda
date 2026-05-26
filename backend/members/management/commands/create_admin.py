import os
from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model

User = get_user_model()


class Command(BaseCommand):
    help = 'Create superuser from ADMIN_USERNAME / ADMIN_EMAIL / ADMIN_PASSWORD env vars'

    def handle(self, *args, **options):
        username = os.environ.get('ADMIN_USERNAME', 'admin')
        email = os.environ.get('ADMIN_EMAIL', '')
        password = os.environ.get('ADMIN_PASSWORD')

        if not password:
            self.stderr.write('ADMIN_PASSWORD env var is required')
            return

        if User.objects.filter(username=username).exists():
            self.stdout.write(f'User "{username}" already exists — skipping')
            return

        User.objects.create_superuser(username=username, email=email, password=password)
        self.stdout.write(self.style.SUCCESS(f'Superuser "{username}" created'))
