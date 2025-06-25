from django.core.management.base import BaseCommand
from tasks.models import Category

class Command(BaseCommand):
    help = 'Create initial task categories'

    def handle(self, *args, **options):
        categories = [
            {'name': 'Work', 'color': '#3B82F6', 'icon': '💼'},
            {'name': 'Personal', 'color': '#10B981', 'icon': '🏠'},
            {'name': 'Health', 'color': '#F59E0B', 'icon': '💪'},
            {'name': 'Learning', 'color': '#8B5CF6', 'icon': '📚'},
            {'name': 'Finance', 'color': '#EF4444', 'icon': '💰'},
            {'name': 'Social', 'color': '#EC4899', 'icon': '👥'},
            {'name': 'Travel', 'color': '#06B6D4', 'icon': '✈️'},
            {'name': 'Shopping', 'color': '#84CC16', 'icon': '🛒'},
        ]
        
        for cat_data in categories:
            category, created = Category.objects.get_or_create(
                name=cat_data['name'],
                defaults={
                    'color': cat_data['color'],
                    'icon': cat_data['icon']
                }
            )
            if created:
                self.stdout.write(
                    self.style.SUCCESS(f'Successfully created category "{category.name}"')
                )
            else:
                self.stdout.write(
                    self.style.WARNING(f'Category "{category.name}" already exists')
                )
