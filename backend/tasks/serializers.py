from rest_framework import serializers
from .models import Category, Task, SubTask, TaskComment, DayPlanner
from django.contrib.auth import get_user_model
from django.utils import timezone

User = get_user_model()

class CategorySerializer(serializers.ModelSerializer):
    task_count = serializers.SerializerMethodField()
    
    class Meta:
        model = Category
        fields = ['id', 'name', 'color', 'icon', 'created_at', 'task_count']
        read_only_fields = ['id', 'created_at']
    
    def get_task_count(self, obj):
        user = self.context['request'].user if 'request' in self.context else None
        if user:
            return obj.task_set.filter(user=user).count()
        return 0

class SubTaskSerializer(serializers.ModelSerializer):
    class Meta:
        model = SubTask
        fields = ['id', 'title', 'is_completed', 'created_at', 'completed_at']
        read_only_fields = ['id', 'created_at', 'completed_at']

class TaskCommentSerializer(serializers.ModelSerializer):
    user_name = serializers.CharField(source='user.full_name', read_only=True)
    
    class Meta:
        model = TaskComment
        fields = ['id', 'content', 'user', 'user_name', 'created_at']
        read_only_fields = ['id', 'user', 'created_at']

class TaskListSerializer(serializers.ModelSerializer):
    """Lightweight serializer for task lists"""
    category_name = serializers.CharField(source='category.name', read_only=True)
    category_color = serializers.CharField(source='category.color', read_only=True)
    subtask_count = serializers.SerializerMethodField()
    completion_percentage = serializers.SerializerMethodField()
    
    class Meta:
        model = Task
        fields = [
            'id', 'title', 'priority', 'status', 'due_date', 'created_at',
            'category', 'category_name', 'category_color', 'is_completed',
            'is_overdue', 'subtask_count', 'completion_percentage', 'tags'
        ]
    
    def get_subtask_count(self, obj):
        return obj.subtasks.count()
    
    def get_completion_percentage(self, obj):
        subtasks = obj.subtasks.all()
        if not subtasks:
            return 100 if obj.is_completed else 0
        completed = subtasks.filter(is_completed=True).count()
        return int((completed / subtasks.count()) * 100)

class TaskDetailSerializer(serializers.ModelSerializer):
    """Detailed serializer for individual tasks"""
    subtasks = SubTaskSerializer(many=True, read_only=True)
    comments = TaskCommentSerializer(many=True, read_only=True)
    category_name = serializers.CharField(source='category.name', read_only=True)
    user_name = serializers.CharField(source='user.full_name', read_only=True)
    
    class Meta:
        model = Task
        fields = [
            'id', 'title', 'description', 'user', 'user_name', 'category', 'category_name',
            'priority', 'status', 'due_date', 'reminder_date', 'created_at', 'updated_at',
            'completed_at', 'estimated_duration', 'actual_duration', 'tags',
            'is_recurring', 'recurring_pattern', 'is_completed', 'is_overdue',
            'subtasks', 'comments'
        ]
        read_only_fields = ['id', 'user', 'created_at', 'updated_at', 'completed_at', 'is_completed', 'is_overdue']

class TaskCreateUpdateSerializer(serializers.ModelSerializer):
    """Serializer for creating and updating tasks"""
    
    class Meta:
        model = Task
        fields = [
            'title', 'description', 'category', 'priority', 'status',
            'due_date', 'reminder_date', 'estimated_duration', 'tags',
            'is_recurring', 'recurring_pattern'
        ]
    
    def validate_due_date(self, value):
        if value and value < timezone.now():
            raise serializers.ValidationError("Due date cannot be in the past")
        return value

class SubTaskCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = SubTask
        fields = ['title']

class TaskCommentCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = TaskComment
        fields = ['content']

class DayPlannerSerializer(serializers.ModelSerializer):
    tasks = TaskListSerializer(many=True, read_only=True)
    task_ids = serializers.ListField(
        child=serializers.IntegerField(),
        write_only=True,
        required=False
    )
    completed_tasks_count = serializers.SerializerMethodField()
    total_tasks_count = serializers.SerializerMethodField()
    
    class Meta:
        model = DayPlanner
        fields = [
            'id', 'date', 'tasks', 'task_ids', 'notes', 'mood', 'productivity_score',
            'completed_tasks_count', 'total_tasks_count', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'user', 'created_at', 'updated_at']
    
    def get_completed_tasks_count(self, obj):
        return obj.tasks.filter(status='completed').count()
    
    def get_total_tasks_count(self, obj):
        return obj.tasks.count()
    
    def create(self, validated_data):
        task_ids = validated_data.pop('task_ids', [])
        user = self.context['request'].user
        day_planner = DayPlanner.objects.create(user=user, **validated_data)
        
        if task_ids:
            tasks = Task.objects.filter(id__in=task_ids, user=user)
            day_planner.tasks.set(tasks)
        
        return day_planner
    
    def update(self, instance, validated_data):
        task_ids = validated_data.pop('task_ids', None)
        
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        
        if task_ids is not None:
            user = self.context['request'].user
            tasks = Task.objects.filter(id__in=task_ids, user=user)
            instance.tasks.set(tasks)
        
        return instance

class TaskStatsSerializer(serializers.Serializer):
    """Serializer for task statistics"""
    total_tasks = serializers.IntegerField()
    completed_tasks = serializers.IntegerField()
    pending_tasks = serializers.IntegerField()
    overdue_tasks = serializers.IntegerField()
    completion_rate = serializers.FloatField()
    tasks_by_priority = serializers.DictField()
    tasks_by_category = serializers.DictField()
    recent_activity = serializers.ListField()

class CalendarTaskSerializer(serializers.ModelSerializer):
    """Lightweight serializer for calendar view"""
    
    class Meta:
        model = Task
        fields = [
            'id', 'title', 'priority', 'status', 'due_date', 'category',
            'is_completed', 'is_overdue'
        ]
