from django.contrib import admin
from .models import UserAnalytics, WeeklyReport, AIInsight, TaskPrediction, FocusSession

@admin.register(UserAnalytics)
class UserAnalyticsAdmin(admin.ModelAdmin):
    list_display = ('user', 'total_tasks_completed', 'productivity_score', 'current_streak', 'updated_at')
    list_filter = ('most_productive_hour', 'peak_productivity_day', 'updated_at')
    search_fields = ('user__email', 'user__first_name', 'user__last_name')
    readonly_fields = ('completion_rate', 'updated_at')
    
    fieldsets = (
        ('User', {
            'fields': ('user',)
        }),
        ('Statistics', {
            'fields': ('total_tasks_created', 'total_tasks_completed', 'total_time_spent', 'completion_rate')
        }),
        ('Performance', {
            'fields': ('productivity_score', 'consistency_score', 'average_completion_time')
        }),
        ('Patterns', {
            'fields': ('most_productive_hour', 'preferred_task_duration', 'peak_productivity_day')
        }),
        ('Streaks', {
            'fields': ('current_streak', 'longest_streak', 'last_active_date')
        }),
    )

@admin.register(WeeklyReport)
class WeeklyReportAdmin(admin.ModelAdmin):
    list_display = ('user', 'week_start', 'week_end', 'tasks_completed', 'productivity_score', 'completion_rate')
    list_filter = ('week_start', 'productivity_score')
    search_fields = ('user__email', 'user__first_name', 'user__last_name')
    date_hierarchy = 'week_start'

@admin.register(AIInsight)
class AIInsightAdmin(admin.ModelAdmin):
    list_display = ('user', 'insight_type', 'title', 'confidence_score', 'is_helpful', 'created_at')
    list_filter = ('insight_type', 'is_helpful', 'is_dismissed', 'created_at')
    search_fields = ('title', 'content', 'user__email')
    readonly_fields = ('created_at',)
    
    fieldsets = (
        ('Insight Details', {
            'fields': ('user', 'insight_type', 'title', 'content', 'confidence_score')
        }),
        ('Data Period', {
            'fields': ('data_period_start', 'data_period_end', 'tasks_analyzed')
        }),
        ('User Interaction', {
            'fields': ('is_helpful', 'is_dismissed', 'viewed_at')
        }),
    )

@admin.register(TaskPrediction)
class TaskPredictionAdmin(admin.ModelAdmin):
    list_display = ('user', 'predicted_completion_time', 'predicted_difficulty', 'predicted_success_rate', 'prediction_accuracy')
    list_filter = ('predicted_difficulty', 'time_of_day', 'day_of_week', 'created_at')
    search_fields = ('user__email', 'task_description')
    
    fieldsets = (
        ('Prediction', {
            'fields': ('user', 'predicted_completion_time', 'predicted_difficulty', 'predicted_success_rate')
        }),
        ('Context', {
            'fields': ('task_description', 'historical_similar_tasks', 'user_current_workload', 'time_of_day', 'day_of_week')
        }),
        ('Actual Results', {
            'fields': ('actual_completion_time', 'actual_completion_status', 'prediction_accuracy')
        }),
    )

@admin.register(FocusSession)
class FocusSessionAdmin(admin.ModelAdmin):
    list_display = ('user', 'task', 'duration', 'focus_score', 'start_time', 'interruptions')
    list_filter = ('focus_score', 'time_of_day', 'location', 'start_time')
    search_fields = ('user__email', 'task__title', 'notes')
    date_hierarchy = 'start_time'
