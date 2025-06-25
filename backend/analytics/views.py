from rest_framework import generics, status, permissions
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.views import APIView
from django.utils import timezone
from django.db.models import Avg, Count, Q
from datetime import datetime, timedelta
from .models import UserAnalytics, WeeklyReport, AIInsight, TaskPrediction, FocusSession
from .serializers import (
    UserAnalyticsSerializer, WeeklyReportSerializer, AIInsightSerializer,
    TaskPredictionSerializer, FocusSessionSerializer, ProductivityDashboardSerializer,
    AnalyticsOverviewSerializer, AIRecommendationSerializer, AIInsightFeedbackSerializer,
    FocusSessionCreateSerializer
)
from .mistral_ai import MistralAnalytics
from tasks.models import Task

class UserAnalyticsView(generics.RetrieveUpdateAPIView):
    serializer_class = UserAnalyticsSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_object(self):
        analytics, created = UserAnalytics.objects.get_or_create(user=self.request.user)
        if created:
            self.update_user_analytics(analytics)
        return analytics
    
    def update_user_analytics(self, analytics):
        """Update user analytics based on current task data"""
        user = analytics.user
        tasks = Task.objects.filter(user=user)
        
        analytics.total_tasks_created = tasks.count()
        analytics.total_tasks_completed = tasks.filter(status='completed').count()
        
        # Calculate average completion time
        completed_tasks = tasks.filter(status='completed', actual_duration__isnull=False)
        if completed_tasks.exists():
            analytics.average_completion_time = completed_tasks.aggregate(
                avg_duration=Avg('actual_duration')
            )['avg_duration'] / 60  # Convert to hours
        
        # Update streak
        today = timezone.now().date()
        if analytics.last_active_date != today:
            # Check if user completed any tasks today
            if tasks.filter(completed_at__date=today).exists():
                if analytics.last_active_date == today - timedelta(days=1):
                    analytics.current_streak += 1
                else:
                    analytics.current_streak = 1
                analytics.last_active_date = today
                
                if analytics.current_streak > analytics.longest_streak:
                    analytics.longest_streak = analytics.current_streak
        
        analytics.save()

class WeeklyReportListView(generics.ListAPIView):
    serializer_class = WeeklyReportSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        return WeeklyReport.objects.filter(user=self.request.user).order_by('-week_start')

class AIInsightListView(generics.ListAPIView):
    serializer_class = AIInsightSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        return AIInsight.objects.filter(user=self.request.user, is_dismissed=False).order_by('-created_at')

class AIInsightDetailView(generics.RetrieveUpdateAPIView):
    serializer_class = AIInsightSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        return AIInsight.objects.filter(user=self.request.user)
    
    def get_serializer_class(self):
        if self.request.method in ['PUT', 'PATCH']:
            return AIInsightFeedbackSerializer
        return AIInsightSerializer
    
    def patch(self, request, *args, **kwargs):
        insight = self.get_object()
        if 'viewed_at' not in request.data and not insight.viewed_at:
            insight.viewed_at = timezone.now()
            insight.save()
        return super().patch(request, *args, **kwargs)

class FocusSessionListCreateView(generics.ListCreateAPIView):
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        return FocusSession.objects.filter(user=self.request.user).order_by('-start_time')
    
    def get_serializer_class(self):
        if self.request.method == 'POST':
            return FocusSessionCreateSerializer
        return FocusSessionSerializer
    
    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

class GenerateAIInsightsView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    
    def post(self, request):
        user = request.user
        
        # Get user's tasks for analysis
        tasks = Task.objects.filter(user=user)
        
        if tasks.count() < 5:
            return Response({
                'message': 'Need at least 5 tasks for meaningful AI analysis',
                'insights_generated': 0
            })
        
        # Prepare task data for AI analysis
        task_data = []
        for task in tasks:
            task_data.append({
                'title': task.title,
                'completed': task.is_completed,
                'priority': task.priority,
                'created_at': task.created_at.isoformat(),
                'completed_at': task.completed_at.isoformat() if task.completed_at else None,
                'category': task.category.name if task.category else None,
                'estimated_duration': task.estimated_duration,
                'actual_duration': task.actual_duration,
            })
        
        # Generate AI insights using Mistral
        try:
            mistral_ai = MistralAnalytics()
            analysis_result = mistral_ai.analyze_task_productivity(task_data)
            
            if 'error' not in analysis_result:
                # Create AI insight record
                insight = AIInsight.objects.create(
                    user=user,
                    insight_type='productivity',
                    title=f"Productivity Analysis - {timezone.now().strftime('%B %Y')}",
                    content=f"""
                    **Productivity Score:** {analysis_result.get('productivity_score', 'N/A')}/100
                    
                    **Completion Rate:** {analysis_result.get('completion_rate', 'N/A')}
                    
                    **Most Productive Time:** {analysis_result.get('most_productive_time', 'N/A')}
                    
                    **Key Patterns:** {analysis_result.get('task_patterns', 'N/A')}
                    
                    **Recommendations:**
                    {chr(10).join(['• ' + rec for rec in analysis_result.get('recommendations', [])])}
                    
                    **Weekly Trend:** {analysis_result.get('weekly_trend', 'N/A')}
                    
                    **Focus Areas:**
                    {chr(10).join(['• ' + area for area in analysis_result.get('focus_areas', [])])}
                    """,
                    confidence_score=0.85,
                    data_period_start=(timezone.now() - timedelta(days=30)).date(),
                    data_period_end=timezone.now().date(),
                    tasks_analyzed=tasks.count()
                )
                
                return Response({
                    'message': 'AI insights generated successfully',
                    'insight': AIInsightSerializer(insight).data,
                    'analysis_result': analysis_result
                })
            else:
                return Response({
                    'error': 'Failed to generate AI insights',
                    'details': analysis_result.get('message', 'Unknown error')
                }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
                
        except Exception as e:
            return Response({
                'error': 'AI service temporarily unavailable',
                'details': str(e)
            }, status=status.HTTP_503_SERVICE_UNAVAILABLE)

class ProductivityDashboardView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    
    def get(self, request):
        user = request.user
        
        # Get or create user analytics
        analytics, _ = UserAnalytics.objects.get_or_create(user=user)
        
        # Get recent insights
        recent_insights = AIInsight.objects.filter(
            user=user, 
            is_dismissed=False
        ).order_by('-created_at')[:5]
        
        # Get today's focus sessions
        today = timezone.now().date()
        focus_sessions_today = FocusSession.objects.filter(
            user=user,
            start_time__date=today
        )
        
        # Calculate weekly trends (last 4 weeks)
        weekly_trends = self.calculate_weekly_trends(user)
        
        # Get AI recommendations
        try:
            mistral_ai = MistralAnalytics()
            user_context = {
                'recent_tasks': list(Task.objects.filter(user=user).order_by('-created_at')[:10].values('title', 'priority')),
                'categories': list(Task.objects.filter(user=user, category__isnull=False).values_list('category__name', flat=True).distinct()),
                'current_time': 'morning' if timezone.now().hour < 12 else 'afternoon' if timezone.now().hour < 18 else 'evening'
            }
            recommendations = mistral_ai.generate_task_suggestions(user_context)
        except:
            recommendations = ["Take a short break", "Review your goals", "Plan tomorrow's priorities"]
        
        dashboard_data = {
            'user_analytics': analytics,
            'recent_insights': recent_insights,
            'weekly_trends': weekly_trends,
            'focus_sessions_today': focus_sessions_today,
            'productivity_score_trend': [analytics.productivity_score] * 7,  # Simplified
            'completion_rate_trend': [analytics.completion_rate] * 7,  # Simplified
            'mood_correlation': {'productive_days': 5, 'total_days': 7},
            'recommendations': recommendations
        }
        
        serializer = ProductivityDashboardSerializer(dashboard_data)
        return Response(serializer.data)
    
    def calculate_weekly_trends(self, user):
        """Calculate productivity trends over the last 4 weeks"""
        trends = []
        today = timezone.now().date()
        
        for i in range(4):
            week_start = today - timedelta(days=today.weekday() + (i * 7))
            week_end = week_start + timedelta(days=6)
            
            tasks_completed = Task.objects.filter(
                user=user,
                completed_at__date__range=[week_start, week_end]
            ).count()
            
            total_tasks = Task.objects.filter(
                user=user,
                created_at__date__range=[week_start, week_end]
            ).count()
            
            completion_rate = (tasks_completed / total_tasks * 100) if total_tasks > 0 else 0
            
            trends.append({
                'week': f"Week {i+1}",
                'completion_rate': round(completion_rate, 2),
                'tasks_completed': tasks_completed,
                'total_tasks': total_tasks
            })
        
        return trends

@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def analytics_overview(request):
    """Get comprehensive analytics overview"""
    user = request.user
    
    # Get insights count
    total_insights = AIInsight.objects.filter(user=user).count()
    
    # Calculate average productivity score
    avg_productivity = UserAnalytics.objects.filter(user=user).aggregate(
        avg_score=Avg('productivity_score')
    )['avg_score'] or 0
    
    # Get most productive day and hour
    analytics = UserAnalytics.objects.filter(user=user).first()
    best_day = analytics.peak_productivity_day if analytics else 'Monday'
    productive_hour = analytics.most_productive_hour if analytics else 9
    
    # Calculate completion rate
    tasks = Task.objects.filter(user=user)
    completion_rate = (tasks.filter(status='completed').count() / tasks.count() * 100) if tasks.exists() else 0
    
    overview_data = {
        'total_insights': total_insights,
        'avg_productivity_score': round(avg_productivity, 2),
        'best_day_of_week': best_day,
        'most_productive_hour': productive_hour,
        'current_streak': analytics.current_streak if analytics else 0,
        'completion_rate': round(completion_rate, 2),
        'weekly_goal_progress': 75.0,  # Placeholder
        'monthly_summary': {
            'tasks_completed': tasks.filter(status='completed').count(),
            'total_tasks': tasks.count(),
            'focus_hours': 0,  # Placeholder
            'productivity_trend': 'upward'
        }
    }
    
    serializer = AnalyticsOverviewSerializer(overview_data)
    return Response(serializer.data)

@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def generate_task_suggestions(request):
    """Generate AI-powered task suggestions"""
    user = request.user
    
    try:
        mistral_ai = MistralAnalytics()
        
        # Prepare user context
        recent_tasks = Task.objects.filter(user=user).order_by('-created_at')[:10]
        categories = Task.objects.filter(user=user, category__isnull=False).values_list('category__name', flat=True).distinct()
        
        user_context = {
            'recent_tasks': [task.title for task in recent_tasks],
            'categories': list(categories),
            'current_time': 'morning' if timezone.now().hour < 12 else 'afternoon' if timezone.now().hour < 18 else 'evening'
        }
        
        suggestions = mistral_ai.generate_task_suggestions(user_context)
        
        return Response({
            'suggestions': suggestions,
            'generated_at': timezone.now(),
            'context': user_context
        })
        
    except Exception as e:
        return Response({
            'error': 'Failed to generate suggestions',
            'suggestions': [
                "Review your current project status",
                "Plan your next week's priorities",
                "Take a 15-minute break",
                "Update your task progress",
                "Clean up your workspace"
            ]
        }, status=status.HTTP_200_OK)  # Return fallback suggestions
