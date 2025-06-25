from django.urls import path
from .views import (
    CategoryListCreateView, CategoryDetailView,
    TaskListCreateView, TaskDetailView, TaskMarkCompleteView,
    SubTaskListCreateView, SubTaskDetailView,
    TaskCommentListCreateView,
    DayPlannerListCreateView, DayPlannerDetailView,
    task_stats, calendar_tasks, today_tasks, upcoming_tasks, bulk_task_action
)

urlpatterns = [
    # Categories
    path('categories/', CategoryListCreateView.as_view(), name='category_list_create'),
    path('categories/<int:pk>/', CategoryDetailView.as_view(), name='category_detail'),
    
    # Tasks
    path('', TaskListCreateView.as_view(), name='task_list_create'),
    path('<int:pk>/', TaskDetailView.as_view(), name='task_detail'),
    path('<int:pk>/complete/', TaskMarkCompleteView.as_view(), name='task_complete'),
    
    # SubTasks
    path('<int:task_id>/subtasks/', SubTaskListCreateView.as_view(), name='subtask_list_create'),
    path('subtasks/<int:pk>/', SubTaskDetailView.as_view(), name='subtask_detail'),
    
    # Comments
    path('<int:task_id>/comments/', TaskCommentListCreateView.as_view(), name='comment_list_create'),
    
    # Day Planner
    path('day-planner/', DayPlannerListCreateView.as_view(), name='day_planner_list_create'),
    path('day-planner/<int:pk>/', DayPlannerDetailView.as_view(), name='day_planner_detail'),
    
    # Analytics & Views
    path('stats/', task_stats, name='task_stats'),
    path('calendar/', calendar_tasks, name='calendar_tasks'),
    path('today/', today_tasks, name='today_tasks'),
    path('upcoming/', upcoming_tasks, name='upcoming_tasks'),
    path('bulk-action/', bulk_task_action, name='bulk_task_action'),
]
