from django.urls import path
from .views import (
    UserAnalyticsView, WeeklyReportListView, AIInsightListView, AIInsightDetailView,
    FocusSessionListCreateView, GenerateAIInsightsView, ProductivityDashboardView,
    analytics_overview, generate_task_suggestions
)

urlpatterns = [
    # User Analytics
    path('user-analytics/', UserAnalyticsView.as_view(), name='user_analytics'),
    path('weekly-reports/', WeeklyReportListView.as_view(), name='weekly_reports'),
    
    # AI Insights
    path('insights/', AIInsightListView.as_view(), name='ai_insights'),
    path('insights/<int:pk>/', AIInsightDetailView.as_view(), name='ai_insight_detail'),
    path('generate-insights/', GenerateAIInsightsView.as_view(), name='generate_insights'),
    
    # Focus Sessions
    path('focus-sessions/', FocusSessionListCreateView.as_view(), name='focus_sessions'),
    
    # Dashboard & Overview
    path('dashboard/', ProductivityDashboardView.as_view(), name='productivity_dashboard'),
    path('overview/', analytics_overview, name='analytics_overview'),
    
    # AI Features
    path('suggestions/', generate_task_suggestions, name='task_suggestions'),
]
