from django.db import models
from django.contrib.auth import get_user_model
from django.utils import timezone

User = get_user_model()

class Category(models.Model):
    name = models.CharField(max_length=50, unique=True)
    color = models.CharField(max_length=7, default='#3B82F6')  # Hex color
    icon = models.CharField(max_length=50, default='📝')  # Emoji or icon name
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        verbose_name_plural = "Categories"
    
    def __str__(self):
        return self.name

class Priority(models.TextChoices):
    LOW = 'low', 'Low'
    MEDIUM = 'medium', 'Medium'
    HIGH = 'high', 'High'
    URGENT = 'urgent', 'Urgent'

class TaskStatus(models.TextChoices):
    TODO = 'todo', 'To Do'
    IN_PROGRESS = 'in_progress', 'In Progress'
    COMPLETED = 'completed', 'Completed'
    CANCELLED = 'cancelled', 'Cancelled'

class Task(models.Model):
    title = models.CharField(max_length=200)
    description = models.TextField(blank=True, null=True)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='tasks')
    category = models.ForeignKey(Category, on_delete=models.SET_NULL, null=True, blank=True)
    
    # Task details
    priority = models.CharField(max_length=10, choices=Priority.choices, default=Priority.MEDIUM)
    status = models.CharField(max_length=15, choices=TaskStatus.choices, default=TaskStatus.TODO)
    
    # Dates
    due_date = models.DateTimeField(null=True, blank=True)
    reminder_date = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    completed_at = models.DateTimeField(null=True, blank=True)
    
    # Estimated time to complete (in minutes)
    estimated_duration = models.PositiveIntegerField(null=True, blank=True, help_text="Duration in minutes")
    actual_duration = models.PositiveIntegerField(null=True, blank=True, help_text="Actual time spent in minutes")
    
    # Additional fields
    tags = models.JSONField(default=list, blank=True)  # List of tags
    is_recurring = models.BooleanField(default=False)
    recurring_pattern = models.CharField(max_length=20, blank=True, null=True)  # daily, weekly, monthly
    
    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['user', 'status']),
            models.Index(fields=['due_date']),
            models.Index(fields=['priority']),
        ]
    
    def __str__(self):
        return f"{self.title} - {self.user.full_name}"
    
    @property
    def is_completed(self):
        return self.status == TaskStatus.COMPLETED
    
    @property
    def is_overdue(self):
        if self.due_date and not self.is_completed:
            return timezone.now() > self.due_date
        return False
    
    def mark_completed(self):
        self.status = TaskStatus.COMPLETED
        self.completed_at = timezone.now()
        self.save()

class SubTask(models.Model):
    parent_task = models.ForeignKey(Task, on_delete=models.CASCADE, related_name='subtasks')
    title = models.CharField(max_length=200)
    is_completed = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    completed_at = models.DateTimeField(null=True, blank=True)
    
    def __str__(self):
        return f"{self.parent_task.title} - {self.title}"

class TaskComment(models.Model):
    task = models.ForeignKey(Task, on_delete=models.CASCADE, related_name='comments')
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    content = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['-created_at']
    
    def __str__(self):
        return f"Comment on {self.task.title} by {self.user.full_name}"

class DayPlanner(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='day_plans')
    date = models.DateField()
    tasks = models.ManyToManyField(Task, blank=True, related_name='planned_days')
    notes = models.TextField(blank=True, null=True)
    mood = models.CharField(
        max_length=20,
        choices=[
            ('excellent', '😊 Excellent'),
            ('good', '😃 Good'),
            ('okay', '😐 Okay'),
            ('poor', '😞 Poor'),
        ],
        null=True, blank=True
    )
    productivity_score = models.PositiveIntegerField(null=True, blank=True)  # 1-10 scale
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        unique_together = ['user', 'date']
        ordering = ['-date']
    
    def __str__(self):
        return f"{self.user.full_name} - {self.date}"
