from django.contrib import admin
from .models import Category, Task, SubTask, TaskComment, DayPlanner

@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ('name', 'color', 'icon', 'created_at')
    search_fields = ('name',)
    list_filter = ('created_at',)

class SubTaskInline(admin.TabularInline):
    model = SubTask
    extra = 0

class TaskCommentInline(admin.TabularInline):
    model = TaskComment
    extra = 0
    readonly_fields = ('created_at',)

@admin.register(Task)
class TaskAdmin(admin.ModelAdmin):
    list_display = ('title', 'user', 'priority', 'status', 'due_date', 'created_at', 'is_overdue')
    list_filter = ('status', 'priority', 'category', 'is_recurring', 'created_at')
    search_fields = ('title', 'description', 'user__email', 'user__first_name', 'user__last_name')
    readonly_fields = ('created_at', 'updated_at', 'completed_at')
    date_hierarchy = 'created_at'
    
    fieldsets = (
        ('Basic Information', {
            'fields': ('title', 'description', 'user', 'category')
        }),
        ('Task Details', {
            'fields': ('priority', 'status', 'tags')
        }),
        ('Dates', {
            'fields': ('due_date', 'reminder_date', 'completed_at')
        }),
        ('Duration', {
            'fields': ('estimated_duration', 'actual_duration')
        }),
        ('Recurring', {
            'fields': ('is_recurring', 'recurring_pattern')
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
    
    inlines = [SubTaskInline, TaskCommentInline]
    
    def is_overdue(self, obj):
        return obj.is_overdue
    is_overdue.boolean = True
    is_overdue.short_description = 'Overdue'

@admin.register(SubTask)
class SubTaskAdmin(admin.ModelAdmin):
    list_display = ('title', 'parent_task', 'is_completed', 'created_at')
    list_filter = ('is_completed', 'created_at')
    search_fields = ('title', 'parent_task__title')

@admin.register(TaskComment)
class TaskCommentAdmin(admin.ModelAdmin):
    list_display = ('task', 'user', 'content', 'created_at')
    list_filter = ('created_at',)
    search_fields = ('content', 'task__title', 'user__email')

@admin.register(DayPlanner)
class DayPlannerAdmin(admin.ModelAdmin):
    list_display = ('user', 'date', 'mood', 'productivity_score', 'created_at')
    list_filter = ('mood', 'date', 'productivity_score')
    search_fields = ('user__email', 'user__first_name', 'user__last_name')
    filter_horizontal = ('tasks',)
