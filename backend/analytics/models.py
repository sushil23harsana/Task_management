from django.db import models
from django.contrib.auth import get_user_model
from django.utils import timezone

User = get_user_model()

class UserAnalytics(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='analytics')
    
    # Overall statistics
    total_tasks_created = models.PositiveIntegerField(default=0)
    total_tasks_completed = models.PositiveIntegerField(default=0)
    total_time_spent = models.PositiveIntegerField(default=0)  # in minutes
    
    # Performance metrics
    average_completion_time = models.FloatField(null=True, blank=True)  # in hours
    productivity_score = models.FloatField(default=0.0)  # 0-100 scale
    consistency_score = models.FloatField(default=0.0)  # 0-100 scale
    
    # Behavioral patterns
    most_productive_hour = models.PositiveIntegerField(null=True, blank=True)  # 0-23
    preferred_task_duration = models.PositiveIntegerField(null=True, blank=True)  # in minutes
    peak_productivity_day = models.CharField(max_length=10, null=True, blank=True)  # monday, tuesday, etc.
    
    # Streaks
    current_streak = models.PositiveIntegerField(default=0)  # days
    longest_streak = models.PositiveIntegerField(default=0)  # days
    last_active_date = models.DateField(null=True, blank=True)
    
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"Analytics for {self.user.full_name}"
    
    @property
    def completion_rate(self):
        if self.total_tasks_created == 0:
            return 0
        return (self.total_tasks_completed / self.total_tasks_created) * 100

class WeeklyReport(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='weekly_reports')
    week_start = models.DateField()  # Monday of the week
    week_end = models.DateField()    # Sunday of the week
    
    # Week statistics
    tasks_completed = models.PositiveIntegerField(default=0)
    tasks_created = models.PositiveIntegerField(default=0)
    total_time_spent = models.PositiveIntegerField(default=0)  # in minutes
    
    # Performance metrics
    productivity_score = models.FloatField(default=0.0)
    completion_rate = models.FloatField(default=0.0)
    
    # AI generated insights
    ai_insights = models.JSONField(default=dict, blank=True)
    ai_recommendations = models.JSONField(default=list, blank=True)
    
    # Mood and energy tracking
    average_mood = models.FloatField(null=True, blank=True)
    energy_levels = models.JSONField(default=list, blank=True)  # Daily energy ratings
    
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        unique_together = ['user', 'week_start']
        ordering = ['-week_start']
    
    def __str__(self):
        return f"{self.user.full_name} - Week of {self.week_start}"

class AIInsight(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='ai_insights')
    insight_type = models.CharField(
        max_length=20,
        choices=[
            ('productivity', 'Productivity'),
            ('time_management', 'Time Management'),
            ('goal_setting', 'Goal Setting'),
            ('work_life_balance', 'Work-Life Balance'),
            ('motivation', 'Motivation'),
        ]
    )
    title = models.CharField(max_length=200)
    content = models.TextField()
    confidence_score = models.FloatField(default=0.0)  # AI confidence in the insight
    
    # Data that generated this insight
    data_period_start = models.DateField()
    data_period_end = models.DateField()
    tasks_analyzed = models.PositiveIntegerField(default=0)
    
    # User interaction
    is_helpful = models.BooleanField(null=True, blank=True)  # User feedback
    is_dismissed = models.BooleanField(default=False)
    viewed_at = models.DateTimeField(null=True, blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.insight_type.title()} insight for {self.user.full_name}"

class TaskPrediction(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='task_predictions')
    
    # Prediction details
    predicted_completion_time = models.PositiveIntegerField()  # in minutes
    predicted_difficulty = models.CharField(
        max_length=10,
        choices=[
            ('easy', 'Easy'),
            ('medium', 'Medium'),
            ('hard', 'Hard'),
        ]
    )
    predicted_success_rate = models.FloatField()  # 0-100%
    
    # Context that influenced prediction
    task_description = models.TextField()
    historical_similar_tasks = models.PositiveIntegerField(default=0)
    user_current_workload = models.PositiveIntegerField(default=0)
    time_of_day = models.PositiveIntegerField()  # 0-23
    day_of_week = models.PositiveIntegerField()  # 0-6 (Monday=0)
    
    # Actual results (filled after task completion)
    actual_completion_time = models.PositiveIntegerField(null=True, blank=True)
    actual_completion_status = models.CharField(max_length=20, null=True, blank=True)
    prediction_accuracy = models.FloatField(null=True, blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return f"Prediction for {self.user.full_name} - {self.predicted_completion_time}min"

class FocusSession(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='focus_sessions')
    task = models.ForeignKey('tasks.Task', on_delete=models.CASCADE, null=True, blank=True)
    
    # Session details
    duration = models.PositiveIntegerField()  # in minutes
    start_time = models.DateTimeField()
    end_time = models.DateTimeField()
    
    # Session quality
    focus_score = models.PositiveIntegerField(null=True, blank=True)  # 1-10
    interruptions = models.PositiveIntegerField(default=0)
    mood_before = models.CharField(max_length=20, null=True, blank=True)
    mood_after = models.CharField(max_length=20, null=True, blank=True)
    
    # Environment context
    time_of_day = models.CharField(max_length=20, null=True, blank=True)
    location = models.CharField(max_length=50, null=True, blank=True)
    
    notes = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return f"Focus session - {self.user.full_name} ({self.duration}min)"
