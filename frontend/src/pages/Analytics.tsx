import React, { useState } from 'react';
import {
  Box, Button, Card, CardContent, CardHeader, Typography, CircularProgress, Alert
} from '@mui/material';
import {
  Insights as InsightsIcon,
  TipsAndUpdates as SuggestionsIcon,
  Dashboard as DashboardIcon,
  CheckCircle as CheckIcon,
  Error as ErrorIcon
} from '@mui/icons-material';
import axios from 'axios';

const Analytics: React.FC = () => {
  const [aiInsights, setAiInsights] = useState<any[]>([]);
  const [taskSuggestions, setTaskSuggestions] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const getToken = () => localStorage.getItem('access_token');
  const API_BASE = 'http://localhost:8000/api/analytics';

  const testAIInsights = async () => {
    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      const res = await axios.post(`${API_BASE}/generate-insights/`, {}, {
        headers: { Authorization: `Bearer ${getToken()}` }
      });
      setSuccess('AI Insights generated successfully!');
      await fetchAIInsights();
    } catch (err: any) {
      setError(err.response?.data?.error || err.message);
    } finally {
      setLoading(false);
    }
  };

  const testTaskSuggestions = async () => {
    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      const res = await axios.post(`${API_BASE}/suggestions/`, {}, {
        headers: { Authorization: `Bearer ${getToken()}` }
      });
      setTaskSuggestions(res.data.suggestions || []);
      setSuccess('Task suggestions generated successfully!');
    } catch (err: any) {
      setError(err.response?.data?.error || err.message);
    } finally {
      setLoading(false);
    }
  };

  const testDashboard = async () => {
    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      await axios.get(`${API_BASE}/dashboard/`, {
        headers: { Authorization: `Bearer ${getToken()}` }
      });
      setSuccess('Dashboard loaded successfully!');
    } catch (err: any) {
      setError(err.response?.data?.error || err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchAIInsights = async () => {
    try {
      const res = await axios.get(`${API_BASE}/insights/`, {
        headers: { Authorization: `Bearer ${getToken()}` }
      });
      setAiInsights(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <Box sx={{ p: 4, bgcolor: '#f1f4f9', minHeight: '100vh' }}>
      <Card sx={{ mb: 4, borderRadius: 3, boxShadow: 3 }}>
        <CardHeader
          avatar={<InsightsIcon color="primary" />}
          title={<Typography variant="h6" fontWeight={600}>AI Analytics</Typography>}
          subheader="Smart insights & task suggestions using Mistral AI"
        />
      </Card>

      {loading && <Alert icon={<CircularProgress size={20} />} severity="info" sx={{ mb: 2 }}>Processing AI request...</Alert>}
      {error && <Alert icon={<ErrorIcon />} severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {success && <Alert icon={<CheckIcon />} severity="success" sx={{ mb: 2 }}>{success}</Alert>}

      <Card sx={{ mb: 4, p: 2, borderRadius: 3, boxShadow: 2 }}>
        <CardContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Button
              fullWidth
              variant="contained"
              startIcon={<InsightsIcon />}
              onClick={testAIInsights}
              sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 500 }}
              disabled={loading}
            >
              Generate AI Insights
            </Button>
            <Button
              fullWidth
              variant="outlined"
              color="secondary"
              startIcon={<SuggestionsIcon />}
              onClick={testTaskSuggestions}
              sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 500 }}
              disabled={loading}
            >
              Get Task Suggestions
            </Button>
            <Button
              fullWidth
              variant="contained"
              color="success"
              startIcon={<DashboardIcon />}
              onClick={testDashboard}
              sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 500 }}
              disabled={loading}
            >
              Load Dashboard
            </Button>
          </Box>
        </CardContent>
      </Card>

      {aiInsights.length > 0 && (
        <Card sx={{ mb: 4, borderRadius: 3, boxShadow: 3 }}>
          <CardHeader title="AI Insights" />
          <CardContent>
            {aiInsights.map((insight, i) => (
              <Box
                key={i}
                sx={{
                  mb: 3,
                  p: 2,
                  border: '1px solid #dbeafe',
                  borderRadius: 2,
                  bgcolor: '#e0f2fe',
                }}
              >
                <Typography variant="subtitle1" fontWeight={600}>
                  {insight.title}
                </Typography>
                <Typography variant="body2" sx={{ mt: 1, whiteSpace: 'pre-wrap' }}>
                  {insight.content}
                </Typography>
                <Typography variant="caption" sx={{ display: 'block', mt: 1 }} color="text.secondary">
                  {new Date(insight.created_at).toLocaleString()}
                </Typography>
              </Box>
            ))}
          </CardContent>
        </Card>
      )}

      {taskSuggestions.length > 0 && (
        <Card sx={{ borderRadius: 3, boxShadow: 3 }}>
          <CardHeader title="Task Suggestions" />
          <CardContent>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {taskSuggestions.map((s, i) => (
                <Box
                  key={i}
                  sx={{
                    p: 2,
                    borderRadius: 2,
                    bgcolor: '#f3e8ff',
                    border: '1px solid #e0d4f7',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}
                >
                  <Typography variant="body2" sx={{ color: '#6b21a8', fontWeight: 500 }}>
                    {s}
                  </Typography>
                  <Button variant="outlined" size="small">Add</Button>
                </Box>
              ))}
            </Box>
          </CardContent>
        </Card>
      )}
    </Box>
  );
};

export default Analytics;
