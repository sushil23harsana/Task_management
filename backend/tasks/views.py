from rest_framework import generics, status, permissions, filters, serializers
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.views import APIView
from django_filters.rest_framework import DjangoFilterBackend
from django.utils import timezone
from django.db.models import Q, Count
from datetime import datetime, timedelta
from .models import Category, Task, SubTask, TaskComment, DayPlanner
from .serializers import (
    CategorySerializer, TaskListSerializer, TaskDetailSerializer,
    TaskCreateUpdateSerializer, SubTaskSerializer, SubTaskCreateSerializer,
    TaskCommentSerializer, TaskCommentCreateSerializer, DayPlannerSerializer,
    TaskStatsSerializer, CalendarTaskSerializer
)

class CategoryListCreateView(generics.ListCreateAPIView):
    serializer_class = CategorySerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        return Category.objects.all().order_by('name')

class CategoryDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = CategorySerializer
    permission_classes = [permissions.IsAuthenticated]
    queryset = Category.objects.all()

class TaskListCreateView(generics.ListCreateAPIView):
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['priority', 'status', 'category', 'is_recurring']
    search_fields = ['title', 'description', 'tags']
    ordering_fields = ['created_at', 'due_date', 'priority', 'updated_at']
    ordering = ['-created_at']
    
    def get_queryset(self):
        return Task.objects.filter(user=self.request.user).select_related('category')
    
    def get_serializer_class(self):
        if self.request.method == 'POST':
            return TaskCreateUpdateSerializer
        return TaskListSerializer
    
    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

class TaskDetailView(generics.RetrieveUpdateDestroyAPIView):
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        return Task.objects.filter(user=self.request.user)
    
    def get_serializer_class(self):
        if self.request.method in ['PUT', 'PATCH']:
            return TaskCreateUpdateSerializer
        return TaskDetailSerializer

class TaskMarkCompleteView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    
    def post(self, request, pk):
        try:
            task = Task.objects.get(pk=pk, user=request.user)
            task.mark_completed()
            return Response({
                'message': 'Task marked as completed',
                'task': TaskDetailSerializer(task).data
            })
        except Task.DoesNotExist:
            return Response({'error': 'Task not found'}, status=status.HTTP_404_NOT_FOUND)

class SubTaskListCreateView(generics.ListCreateAPIView):
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        task_id = self.kwargs['task_id']
        return SubTask.objects.filter(parent_task_id=task_id, parent_task__user=self.request.user)
    
    def get_serializer_class(self):
        if self.request.method == 'POST':
            return SubTaskCreateSerializer
        return SubTaskSerializer
    
    def perform_create(self, serializer):
        task_id = self.kwargs['task_id']
        try:
            task = Task.objects.get(id=task_id, user=self.request.user)
            serializer.save(parent_task=task)
        except Task.DoesNotExist:
            raise serializers.ValidationError("Task not found")

class SubTaskDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = SubTaskSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        return SubTask.objects.filter(parent_task__user=self.request.user)

class TaskCommentListCreateView(generics.ListCreateAPIView):
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        task_id = self.kwargs['task_id']
        return TaskComment.objects.filter(task_id=task_id, task__user=self.request.user)
    
    def get_serializer_class(self):
        if self.request.method == 'POST':
            return TaskCommentCreateSerializer
        return TaskCommentSerializer
    
    def perform_create(self, serializer):
        task_id = self.kwargs['task_id']
        try:
            task = Task.objects.get(id=task_id, user=self.request.user)
            serializer.save(task=task, user=self.request.user)
        except Task.DoesNotExist:
            raise serializers.ValidationError("Task not found")

class DayPlannerListCreateView(generics.ListCreateAPIView):
    serializer_class = DayPlannerSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        return DayPlanner.objects.filter(user=self.request.user).order_by('-date')

class DayPlannerDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = DayPlannerSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        return DayPlanner.objects.filter(user=self.request.user)

@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def task_stats(request):
    """Get comprehensive task statistics for the user"""
    user = request.user
    tasks = Task.objects.filter(user=user)
    
    total_tasks = tasks.count()
    completed_tasks = tasks.filter(status='completed').count()
    pending_tasks = tasks.filter(status__in=['todo', 'in_progress']).count()
    overdue_tasks = tasks.filter(
        due_date__lt=timezone.now(),
        status__in=['todo', 'in_progress']
    ).count()
    
    completion_rate = (completed_tasks / total_tasks * 100) if total_tasks > 0 else 0
    
    # Tasks by priority
    tasks_by_priority = dict(tasks.values('priority').annotate(count=Count('priority')).values_list('priority', 'count'))
    
    # Tasks by category
    tasks_by_category = dict(
        tasks.filter(category__isnull=False)
        .values('category__name')
        .annotate(count=Count('category'))
        .values_list('category__name', 'count')
    )
    
    # Recent activity (last 7 days)
    last_week = timezone.now() - timedelta(days=7)
    recent_activity = list(
        tasks.filter(updated_at__gte=last_week)
        .order_by('-updated_at')[:10]
        .values('id', 'title', 'status', 'updated_at')
    )
    
    stats_data = {
        'total_tasks': total_tasks,
        'completed_tasks': completed_tasks,
        'pending_tasks': pending_tasks,
        'overdue_tasks': overdue_tasks,
        'completion_rate': round(completion_rate, 2),
        'tasks_by_priority': tasks_by_priority,
        'tasks_by_category': tasks_by_category,
        'recent_activity': recent_activity
    }
    
    serializer = TaskStatsSerializer(stats_data)
    return Response(serializer.data)

@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def calendar_tasks(request):
    """Get tasks for calendar view"""
    user = request.user
    
    # Get date range from query params
    start_date = request.GET.get('start_date')
    end_date = request.GET.get('end_date')
    
    if start_date and end_date:
        try:
            start_date = datetime.strptime(start_date, '%Y-%m-%d').date()
            end_date = datetime.strptime(end_date, '%Y-%m-%d').date()
            
            tasks = Task.objects.filter(
                user=user,
                due_date__date__range=[start_date, end_date]
            ).select_related('category')
        except ValueError:
            return Response({'error': 'Invalid date format. Use YYYY-MM-DD'}, status=status.HTTP_400_BAD_REQUEST)
    else:
        # Default to current month
        today = timezone.now().date()
        start_date = today.replace(day=1)
        end_date = (start_date + timedelta(days=32)).replace(day=1) - timedelta(days=1)
        
        tasks = Task.objects.filter(
            user=user,
            due_date__date__range=[start_date, end_date]
        ).select_related('category')
    
    serializer = CalendarTaskSerializer(tasks, many=True)
    return Response(serializer.data)

@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def today_tasks(request):
    """Get today's tasks"""
    user = request.user
    today = timezone.now().date()
    
    tasks = Task.objects.filter(
        user=user,
        due_date__date=today
    ).select_related('category').order_by('priority', 'created_at')
    
    serializer = TaskListSerializer(tasks, many=True, context={'request': request})
    return Response(serializer.data)

@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def upcoming_tasks(request):
    """Get upcoming tasks (next 7 days)"""
    user = request.user
    today = timezone.now().date()
    next_week = today + timedelta(days=7)
    
    tasks = Task.objects.filter(
        user=user,
        due_date__date__range=[today, next_week],
        status__in=['todo', 'in_progress']
    ).select_related('category').order_by('due_date', 'priority')
    
    serializer = TaskListSerializer(tasks, many=True, context={'request': request})
    return Response(serializer.data)

@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def bulk_task_action(request):
    """Perform bulk actions on tasks"""
    task_ids = request.data.get('task_ids', [])
    action = request.data.get('action')
    
    if not task_ids or not action:
        return Response({'error': 'task_ids and action are required'}, status=status.HTTP_400_BAD_REQUEST)
    
    tasks = Task.objects.filter(id__in=task_ids, user=request.user)
    
    if action == 'mark_completed':
        updated = tasks.update(status='completed', completed_at=timezone.now())
    elif action == 'mark_todo':
        updated = tasks.update(status='todo', completed_at=None)
    elif action == 'delete':
        updated = tasks.count()
        tasks.delete()
    else:
        return Response({'error': 'Invalid action'}, status=status.HTTP_400_BAD_REQUEST)
    
    return Response({
        'message': f'{action} performed on {updated} tasks',
        'updated_count': updated
    })
