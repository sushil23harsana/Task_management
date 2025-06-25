from rest_framework import serializers
from .models import UserAnalytics, WeeklyReport, AIInsight, TaskPrediction, FocusSession
from django.contrib.auth import get_user_model

User = get_user_model()

class UserAnalyticsSerializer(serializers.ModelSerializer):
    completion_rate = serializers.ReadOnlyField()
    
    class Meta:
        model = UserAnalytics
        fields = [
            'id', 'total_tasks_created', 'total_tasks_completed', 'total_time_spent',
            'average_completion_time', 'productivity_score', 'consistency_score',
            'most_productive_hour', 'preferred_task_duration', 'peak_productivity_day',
            'current_streak', 'longest_streak', 'last_active_date', 'completion_rate',
            'updated_at'
        ]
        read_only_fields = ['id', 'updated_at', 'completion_rate']

class WeeklyReportSerializer(serializers.ModelSerializer):
    class Meta:
        model = WeeklyReport
        fields = [
            'id', 'week_start', 'week_end', 'tasks_completed', 'tasks_created',
            'total_time_spent', 'productivity_score', 'completion_rate',
            'ai_insights', 'ai_recommendations', 'average_mood', 'energy_levels',
            'created_at'
        ]
        read_only_fields = ['id', 'user', 'created_at']

class AIInsightSerializer(serializers.ModelSerializer):
    user_name = serializers.CharField(source='user.full_name', read_only=True)
    
    class Meta:
        model = AIInsight
        fields = [
            'id', 'user', 'user_name', 'insight_type', 'title', 'content',
            'confidence_score', 'data_period_start', 'data_period_end',
            'tasks_analyzed', 'is_helpful', 'is_dismissed', 'viewed_at', 'created_at'
        ]
        read_only_fields = ['id', 'user', 'created_at']

class AIInsightCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = AIInsight
        fields = [
            'insight_type', 'title', 'content', 'confidence_score',
            'data_period_start', 'data_period_end', 'tasks_analyzed'
        ]

class AIInsightFeedbackSerializer(serializers.ModelSerializer):
    class Meta:
        model = AIInsight
        fields = ['is_helpful', 'is_dismissed']

class TaskPredictionSerializer(serializers.ModelSerializer):
    user_name = serializers.CharField(source='user.full_name', read_only=True)
    accuracy_percentage = serializers.SerializerMethodField()
    
    class Meta:
        model = TaskPrediction
        fields = [
            'id', 'user', 'user_name', 'predicted_completion_time', 'predicted_difficulty',
            'predicted_success_rate', 'task_description', 'historical_similar_tasks',
            'user_current_workload', 'time_of_day', 'day_of_week',
            'actual_completion_time', 'actual_completion_status', 'prediction_accuracy',
            'accuracy_percentage', 'created_at'
        ]
        read_only_fields = ['id', 'user', 'created_at', 'accuracy_percentage']
    
    def get_accuracy_percentage(self, obj):
        if obj.prediction_accuracy is not None:
            return f"{obj.prediction_accuracy:.1f}%"
        return "Pending"

class TaskPredictionCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = TaskPrediction
        fields = [
            'predicted_completion_time', 'predicted_difficulty', 'predicted_success_rate',
            'task_description', 'historical_similar_tasks', 'user_current_workload',
            'time_of_day', 'day_of_week'
        ]

class FocusSessionSerializer(serializers.ModelSerializer):
    task_title = serializers.CharField(source='task.title', read_only=True)
    user_name = serializers.CharField(source='user.full_name', read_only=True)
    
    class Meta:
        model = FocusSession
        fields = [
            'id', 'user', 'user_name', 'task', 'task_title', 'duration',
            'start_time', 'end_time', 'focus_score', 'interruptions',
            'mood_before', 'mood_after', 'time_of_day', 'location', 'notes', 'created_at'
        ]
        read_only_fields = ['id', 'user', 'created_at']

class FocusSessionCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = FocusSession
        fields = [
            'task', 'duration', 'start_time', 'end_time', 'focus_score',
            'interruptions', 'mood_before', 'mood_after', 'time_of_day',
            'location', 'notes'
        ]

class ProductivityDashboardSerializer(serializers.Serializer):
    """Serializer for comprehensive productivity dashboard data"""
    user_analytics = UserAnalyticsSerializer()
    recent_insights = AIInsightSerializer(many=True)
    weekly_trends = serializers.ListField()
    focus_sessions_today = FocusSessionSerializer(many=True)
    productivity_score_trend = serializers.ListField()
    completion_rate_trend = serializers.ListField()
    mood_correlation = serializers.DictField()
    recommendations = serializers.ListField()

class AnalyticsOverviewSerializer(serializers.Serializer):
    """Serializer for analytics overview page"""
    total_insights = serializers.IntegerField()
    avg_productivity_score = serializers.FloatField()
    best_day_of_week = serializers.CharField()
    most_productive_hour = serializers.IntegerField()
    current_streak = serializers.IntegerField()
    completion_rate = serializers.FloatField()
    weekly_goal_progress = serializers.FloatField()
    monthly_summary = serializers.DictField()

class AIRecommendationSerializer(serializers.Serializer):
    """Serializer for AI-generated recommendations"""
    recommendation_type = serializers.CharField()
    title = serializers.CharField()
    description = serializers.CharField()
    priority_level = serializers.CharField()
    action_items = serializers.ListField()
    expected_impact = serializers.CharField()
    confidence_score = serializers.FloatField()
