import api from './api';

export const taskService = {
  // Get all tasks
  getTasks: async (params = {}) => {
    const response = await api.get('/tasks/', { params });
    return response.data;
  },

  // Get single task
  getTask: async (id) => {
    const response = await api.get(`/tasks/${id}/`);
    return response.data;
  },

  // Create new task
  createTask: async (taskData) => {
    const response = await api.post('/tasks/', taskData);
    return response.data;
  },

  // Update task
  updateTask: async (id, taskData) => {
    const response = await api.patch(`/tasks/${id}/`, taskData);
    return response.data;
  },

  // Delete task
  deleteTask: async (id) => {
    const response = await api.delete(`/tasks/${id}/`);
    return response.data;
  },

  // Mark task as complete
  markComplete: async (id) => {
    const response = await api.post(`/tasks/${id}/complete/`);
    return response.data;
  },

  // Get today's tasks
  getTodayTasks: async () => {
    const response = await api.get('/tasks/today/');
    return response.data;
  },

  // Get upcoming tasks
  getUpcomingTasks: async () => {
    const response = await api.get('/tasks/upcoming/');
    return response.data;
  },

  // Get calendar tasks
  getCalendarTasks: async (startDate, endDate) => {
    const response = await api.get('/tasks/calendar/', {
      params: { start_date: startDate, end_date: endDate }
    });
    return response.data;
  },

  // Get task statistics
  getTaskStats: async () => {
    const response = await api.get('/tasks/stats/');
    return response.data;
  },

  // Bulk task actions
  bulkTaskAction: async (taskIds, action) => {
    const response = await api.post('/tasks/bulk-action/', {
      task_ids: taskIds,
      action: action
    });
    return response.data;
  },

  // Categories
  getCategories: async () => {
    const response = await api.get('/tasks/categories/');
    return response.data;
  },

  createCategory: async (categoryData) => {
    const response = await api.post('/tasks/categories/', categoryData);
    return response.data;
  },

  // Subtasks
  getSubTasks: async (taskId) => {
    const response = await api.get(`/tasks/${taskId}/subtasks/`);
    return response.data;
  },

  createSubTask: async (taskId, subTaskData) => {
    const response = await api.post(`/tasks/${taskId}/subtasks/`, subTaskData);
    return response.data;
  },

  updateSubTask: async (id, subTaskData) => {
    const response = await api.patch(`/tasks/subtasks/${id}/`, subTaskData);
    return response.data;
  },

  // Comments
  getTaskComments: async (taskId) => {
    const response = await api.get(`/tasks/${taskId}/comments/`);
    return response.data;
  },

  createTaskComment: async (taskId, commentData) => {
    const response = await api.post(`/tasks/${taskId}/comments/`, commentData);
    return response.data;
  },

  // Day Planner
  getDayPlanners: async () => {
    const response = await api.get('/tasks/day-planner/');
    return response.data;
  },

  createDayPlanner: async (plannerData) => {
    const response = await api.post('/tasks/day-planner/', plannerData);
    return response.data;
  },

  updateDayPlanner: async (id, plannerData) => {
    const response = await api.patch(`/tasks/day-planner/${id}/`, plannerData);
    return response.data;
  },
};
