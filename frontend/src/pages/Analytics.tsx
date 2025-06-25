import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  Chip,
  LinearProgress,
  CircularProgress,
  Alert,
  IconButton,
  Fade,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  Avatar
} from '@mui/material';
import {
  TrendingUp,
  TrendingDown,
  Psychology,
  AutoAwesome,
  Schedule,
  CheckCircle,
  Insights,
  Refresh,
  ThumbUp,
  ThumbDown,
  Star,
  Timer,
  Analytics as AnalyticsIcon,
  EmojiObjects,
  Assessment
} from '@mui/icons-material';
import { 
  LineChart, 
  Line, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell, 
  BarChart, 
  Bar,
  RadialBarChart,
  RadialBar,
  Legend
} from 'recharts';
import { analyticsService } from '../services/analytics';

interface AnalyticsData {
  user_analytics: {
    productivity_score: number;
    completion_rate: number;
    current_streak: number;
    longest_streak: number;
    total_tasks_created: number;
    total_tasks_completed: number;
    average_completion_time: number;
  };
  recent_insights: Array<{
    id: number;
    title: string;
    content: string;
    insight_type: string;
    confidence_score: number;
    created_at: string;
    is_helpful?: boolean;
  }>;
  weekly_trends: Array<{
    week: string;
    completion_rate: number;
    tasks_completed: number;
  }>;
  focus_sessions_today: Array<{
    id: number;
    duration_minutes: number;
    task_name: string;
    start_time: string;
  }>;
  recommendations: string[];
}

const Analytics: React.FC = () => {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const response = await analyticsService.getProductivityDashboard();
      setData(response);
      setError(null);
    } catch (err) {
      setError('Failed to load analytics data');
      console.error('Analytics fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  const generateInsights = async () => {
    try {
      setGenerating(true);
      await analyticsService.generateAIInsights();
      await fetchAnalytics(); // Refresh data
    } catch (err) {
      setError('Failed to generate AI insights');
      console.error('Generate insights error:', err);
    } finally {
      setGenerating(false);
    }
  };

  const handleInsightFeedback = async (insightId: number, isHelpful: boolean) => {
    try {
      await analyticsService.updateInsightFeedback(insightId, { is_helpful: isHelpful });
      await fetchAnalytics(); // Refresh data
    } catch (err) {
      console.error('Feedback error:', err);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="400px">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box p={3}>
        <Alert severity="error" action={
          <Button color="inherit" size="small" onClick={fetchAnalytics}>
            Retry
          </Button>
        }>
          {error}
        </Alert>
      </Box>
    );
  }

  if (!data) return null;

  const { user_analytics, recent_insights, weekly_trends, focus_sessions_today, recommendations } = data;

  // Chart colors
  const colors = ['#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#00ff88'];

  // Productivity score color based on value
  const getScoreColor = (score: number) => {
    if (score >= 80) return 'success';
    if (score >= 60) return 'warning';
    return 'error';
  };

  // Focus sessions chart data
  const focusChartData = focus_sessions_today.map((session, index) => ({
    name: session.task_name || `Session ${index + 1}`,
    duration: session.duration_minutes,
    time: new Date(session.start_time).toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit' 
    })
  }));

  return (
    <Box p={3}>
      <Box display="flex" justifyContent="between" alignItems="center" mb={3}>
        <Typography variant="h4" component="h1" gutterBottom>
          <AnalyticsIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
          Analytics Dashboard
        </Typography>
        <Box>
          <Button
            variant="outlined"
            startIcon={<Refresh />}
            onClick={fetchAnalytics}
            sx={{ mr: 2 }}
          >
            Refresh
          </Button>
          <Button
            variant="contained"
            startIcon={generating ? <CircularProgress size={20} /> : <Psychology />}
            onClick={generateInsights}
            disabled={generating}
          >
            {generating ? 'Generating...' : 'Generate AI Insights'}
          </Button>
        </Box>
      </Box>

      <Grid container spacing={3}>
        {/* Key Metrics */}
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" mb={2}>
                <Avatar sx={{ bgcolor: 'primary.main', mr: 2 }}>
                  <Star />
                </Avatar>
                <Typography variant="h6">Productivity Score</Typography>
              </Box>
              <Typography variant="h3" color={`${getScoreColor(user_analytics.productivity_score)}.main`}>
                {user_analytics.productivity_score}/100
              </Typography>
              <LinearProgress
                variant="determinate"
                value={user_analytics.productivity_score}
                color={getScoreColor(user_analytics.productivity_score)}
                sx={{ mt: 1, height: 8, borderRadius: 4 }}
              />
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" mb={2}>
                <Avatar sx={{ bgcolor: 'success.main', mr: 2 }}>
                  <CheckCircle />
                </Avatar>
                <Typography variant="h6">Completion Rate</Typography>
              </Box>
              <Typography variant="h3" color="success.main">
                {user_analytics.completion_rate.toFixed(1)}%
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {user_analytics.total_tasks_completed} of {user_analytics.total_tasks_created} tasks
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" mb={2}>
                <Avatar sx={{ bgcolor: 'warning.main', mr: 2 }}>
                  <Schedule />
                </Avatar>
                <Typography variant="h6">Current Streak</Typography>
              </Box>
              <Typography variant="h3" color="warning.main">
                {user_analytics.current_streak}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Best: {user_analytics.longest_streak} days
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" mb={2}>
                <Avatar sx={{ bgcolor: 'info.main', mr: 2 }}>
                  <Timer />
                </Avatar>
                <Typography variant="h6">Avg. Time</Typography>
              </Box>
              <Typography variant="h3" color="info.main">
                {user_analytics.average_completion_time?.toFixed(1) || '0'}h
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Per task completion
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Weekly Trends Chart */}
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                <TrendingUp sx={{ mr: 1, verticalAlign: 'middle' }} />
                Weekly Performance Trends
              </Typography>
              <Box height={300}>
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={weekly_trends}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="week" />
                    <YAxis />
                    <Tooltip 
                      formatter={(value, name) => [`${value}%`, 'Completion Rate']}
                      labelFormatter={(label) => `Week: ${label}`}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="completion_rate" 
                      stroke="#8884d8" 
                      fill="#8884d8" 
                      fillOpacity={0.3}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Focus Sessions Today */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                <Timer sx={{ mr: 1, verticalAlign: 'middle' }} />
                Today's Focus Sessions
              </Typography>
              {focus_sessions_today.length > 0 ? (
                <List dense>
                  {focus_sessions_today.slice(0, 5).map((session, index) => (
                    <ListItem key={session.id}>
                      <ListItemIcon>
                        <Avatar sx={{ width: 32, height: 32, bgcolor: colors[index % colors.length] }}>
                          {session.duration_minutes}
                        </Avatar>
                      </ListItemIcon>
                      <ListItemText
                        primary={session.task_name || `Session ${index + 1}`}
                        secondary={`${session.duration_minutes} min at ${new Date(session.start_time).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}`}
                      />
                    </ListItem>
                  ))}
                </List>
              ) : (
                <Typography variant="body2" color="text.secondary" textAlign="center" py={4}>
                  No focus sessions today. Start one from the Focus Timer!
                </Typography>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* AI Insights */}
        <Grid item xs={12} md={8}>
          <Card sx={{ 
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white',
            position: 'relative',
            overflow: 'hidden'
          }}>
            <Box sx={{
              position: 'absolute',
              top: 0,
              right: 0,
              width: '100px',
              height: '100px',
              background: 'rgba(255,255,255,0.1)',
              borderRadius: '50%',
              transform: 'translate(50%, -50%)'
            }} />
            <CardContent>
              <Box display="flex" alignItems="center" mb={2}>
                <Psychology sx={{ mr: 1, verticalAlign: 'middle', color: 'white' }} />
                <Typography variant="h6" sx={{ color: 'white' }}>
                  AI-Powered Insights
                </Typography>
                <Box ml="auto">
                  <Button
                    variant="contained"
                    size="small"
                    sx={{ 
                      backgroundColor: 'rgba(255,255,255,0.2)',
                      color: 'white',
                      '&:hover': { backgroundColor: 'rgba(255,255,255,0.3)' }
                    }}
                    startIcon={generating ? <CircularProgress size={16} sx={{ color: 'white' }} /> : <AutoAwesome />}
                    onClick={generateInsights}
                    disabled={generating}
                  >
                    {generating ? 'Generating...' : 'New Insights'}
                  </Button>
                </Box>
              </Box>
              {recent_insights.length > 0 ? (
                <Box>
                  {recent_insights.slice(0, 3).map((insight, index) => (
                    <Fade in key={insight.id} timeout={500 * (index + 1)}>
                      <Paper elevation={3} sx={{ 
                        p: 3, 
                        mb: 2, 
                        background: 'rgba(255,255,255,0.1)',
                        backdropFilter: 'blur(10px)',
                        border: '1px solid rgba(255,255,255,0.2)'
                      }}>
                        <Box display="flex" justifyContent="between" alignItems="flex-start">
                          <Box flex={1}>
                            <Typography variant="subtitle1" fontWeight="bold" gutterBottom sx={{ color: 'white' }}>
                              <AutoAwesome sx={{ mr: 1, fontSize: 20 }} />
                              {insight.title}
                            </Typography>
                            <Typography 
                              variant="body2" 
                              sx={{ 
                                whiteSpace: 'pre-line',
                                color: 'rgba(255,255,255,0.9)',
                                lineHeight: 1.6
                              }}
                            >
                              {insight.content}
                            </Typography>
                            <Box mt={2} display="flex" alignItems="center" gap={1}>
                              <Chip 
                                size="small" 
                                label={`${(insight.confidence_score * 100).toFixed(0)}% confidence`}
                                sx={{
                                  backgroundColor: 'rgba(255,255,255,0.2)',
                                  color: 'white',
                                  fontWeight: 'bold'
                                }}
                              />
                              <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.7)' }}>
                                {new Date(insight.created_at).toLocaleDateString()}
                              </Typography>
                            </Box>
                          </Box>
                          <Box ml={2}>
                            <IconButton 
                              size="small" 
                              sx={{ 
                                color: insight.is_helpful === true ? '#4caf50' : 'rgba(255,255,255,0.7)',
                                '&:hover': { backgroundColor: 'rgba(255,255,255,0.1)' }
                              }}
                              onClick={() => handleInsightFeedback(insight.id, true)}
                            >
                              <ThumbUp fontSize="small" />
                            </IconButton>
                            <IconButton 
                              size="small"
                              sx={{ 
                                color: insight.is_helpful === false ? '#f44336' : 'rgba(255,255,255,0.7)',
                                '&:hover': { backgroundColor: 'rgba(255,255,255,0.1)' }
                              }}
                              onClick={() => handleInsightFeedback(insight.id, false)}
                            >
                              <ThumbDown fontSize="small" />
                            </IconButton>
                          </Box>
                        </Box>
                      </Paper>
                    </Fade>
                  ))}
                </Box>
              ) : (
                <Box textAlign="center" py={4}>
                  <Psychology sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
                  <Typography variant="body1" color="text.secondary" gutterBottom>
                    No AI insights yet
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Generate your first AI insights to get personalized productivity recommendations
                  </Typography>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* AI Recommendations */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                <EmojiObjects sx={{ mr: 1, verticalAlign: 'middle' }} />
                Smart Suggestions
              </Typography>
              <List dense>
                {recommendations.slice(0, 5).map((suggestion, index) => (
                  <ListItem key={index}>
                    <ListItemIcon>
                      <AutoAwesome color="primary" />
                    </ListItemIcon>
                    <ListItemText primary={suggestion} />
                  </ListItem>
                ))}
              </List>
              <Button
                variant="outlined"
                fullWidth
                startIcon={<Refresh />}
                sx={{ mt: 2 }}
                onClick={() => {
                  // Refresh suggestions by refetching analytics
                  fetchAnalytics();
                }}
              >
                Refresh Suggestions
              </Button>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* New Enhanced AI Section */}
      <Box mt={4}>
        <Grid container spacing={3}>
          {/* Productivity Score Visualization */}
          <Grid item xs={12} md={6}>
            <Card sx={{ 
              background: 'linear-gradient(135deg, #ff9a9e 0%, #fecfef 50%, #fecfef 100%)',
              color: 'white',
              height: '300px'
            }}>
              <CardContent sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                <Typography variant="h6" gutterBottom sx={{ color: 'white' }}>
                  <Assessment sx={{ mr: 1, verticalAlign: 'middle' }} />
                  Productivity Score Breakdown
                </Typography>
                <Box flex={1} display="flex" alignItems="center" justifyContent="center">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={[
                          { name: 'Completed', value: user_analytics.productivity_score, fill: '#4caf50' },
                          { name: 'Remaining', value: 100 - user_analytics.productivity_score, fill: 'rgba(255,255,255,0.3)' }
                        ]}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        startAngle={90}
                        endAngle={-270}
                        dataKey="value"
                      >
                        {[
                          { name: 'Completed', value: user_analytics.productivity_score, fill: '#4caf50' },
                          { name: 'Remaining', value: 100 - user_analytics.productivity_score, fill: 'rgba(255,255,255,0.3)' }
                        ].map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.fill} />
                        ))}
                      </Pie>
                      <text 
                        x="50%" 
                        y="50%" 
                        textAnchor="middle" 
                        dominantBaseline="middle" 
                        fontSize="24" 
                        fontWeight="bold" 
                        fill="white"
                      >
                        {user_analytics.productivity_score}%
                      </text>
                    </PieChart>
                  </ResponsiveContainer>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* AI Task Suggestions */}
          <Grid item xs={12} md={6}>
            <Card sx={{ 
              background: 'linear-gradient(135deg, #84fab0 0%, #8fd3f4 100%)',
              color: 'white',
              height: '300px'
            }}>
              <CardContent>
                <Typography variant="h6" gutterBottom sx={{ color: 'white' }}>
                  <EmojiObjects sx={{ mr: 1, verticalAlign: 'middle' }} />
                  AI Smart Recommendations
                </Typography>
                <List dense>
                  {recommendations.slice(0, 4).map((suggestion, index) => (
                    <Fade in timeout={300 * (index + 1)} key={index}>
                      <ListItem sx={{ 
                        backgroundColor: 'rgba(255,255,255,0.1)', 
                        borderRadius: 2, 
                        mb: 1,
                        backdropFilter: 'blur(10px)'
                      }}>
                        <ListItemIcon>
                          <AutoAwesome sx={{ color: 'white' }} />
                        </ListItemIcon>
                        <ListItemText 
                          primary={suggestion} 
                          sx={{ 
                            '& .MuiListItemText-primary': { 
                              color: 'white',
                              fontSize: '0.9rem'
                            } 
                          }}
                        />
                      </ListItem>
                    </Fade>
                  ))}
                </List>
              </CardContent>
            </Card>
          </Grid>

          {/* Weekly Progress Chart */}
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  <Insights sx={{ mr: 1, verticalAlign: 'middle' }} />
                  Weekly Progress & AI Insights
                </Typography>
                <Box height={250}>
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={weekly_trends}>
                      <defs>
                        <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8}/>
                          <stop offset="95%" stopColor="#8884d8" stopOpacity={0.1}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="week" />
                      <YAxis />
                      <Tooltip 
                        contentStyle={{
                          backgroundColor: 'rgba(255,255,255,0.95)',
                          border: 'none',
                          borderRadius: '8px',
                          boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
                        }}
                        formatter={(value, name) => [`${value}%`, 'Completion Rate']}
                      />
                      <Area 
                        type="monotone" 
                        dataKey="completion_rate" 
                        stroke="#8884d8" 
                        fill="url(#colorGradient)"
                        strokeWidth={3}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
};

export default Analytics;
