import api from './api';

export const analyticsService = {
  // Get user analytics
  getUserAnalytics: async () => {
    const response = await api.get('/analytics/user-analytics/');
    return response.data;
  },

  // Get productivity dashboard
  getProductivityDashboard: async () => {
    const response = await api.get('/analytics/dashboard/');
    return response.data;
  },

  // Get analytics overview
  getAnalyticsOverview: async () => {
    const response = await api.get('/analytics/overview/');
    return response.data;
  },

  // Generate AI insights
  generateAIInsights: async () => {
    const response = await api.post('/analytics/generate-insights/');
    return response.data;
  },

  // Get AI insights
  getAIInsights: async () => {
    const response = await api.get('/analytics/insights/');
    return response.data;
  },

  // Update AI insight feedback
  updateInsightFeedback: async (id, feedback) => {
    const response = await api.patch(`/analytics/insights/${id}/`, feedback);
    return response.data;
  },

  // Get task suggestions
  getTaskSuggestions: async () => {
    const response = await api.post('/analytics/suggestions/');
    return response.data;
  },

  // Get weekly reports
  getWeeklyReports: async () => {
    const response = await api.get('/analytics/weekly-reports/');
    return response.data;
  },

  // Focus sessions
  getFocusSessions: async () => {
    const response = await api.get('/analytics/focus-sessions/');
    return response.data;
  },

  createFocusSession: async (sessionData) => {
    const response = await api.post('/analytics/focus-sessions/', sessionData);
    return response.data;
  },
};
