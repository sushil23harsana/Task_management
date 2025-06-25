import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Paper,
  CircularProgress,
  InputAdornment,
} from '@mui/material';
import {
  Add,
  Search,
  AccessTime,
  CalendarToday,
  Bolt,
  Psychology,
} from '@mui/icons-material';
import { taskService } from '../services/tasks.ts';
import { analyticsService } from '../services/analytics.ts';
import TaskCard from '../components/TaskCard';
import CreateTaskModal from '../components/CreateTaskModal';

const Dashboard = () => {
  const [tasks, setTasks] = useState([]);
  const [todayTasks, setTodayTasks] = useState([]);
  const [projects, setProjects] = useState([]);
  const [stats, setStats] = useState(null);
  const [isCreateTaskModalOpen, setIsCreateTaskModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPriority, setSelectedPriority] = useState('');

  useEffect(() => {
    fetchDashboardData();
  }, []);
  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [tasksData, todayData, statsData, categoriesData] = await Promise.all([
        taskService.getTasks({ limit: 10 }),
        taskService.getTasks({ limit: 10, ordering: '-created_at' }), // Get recent tasks instead of just today's
        taskService.getTaskStats(),
        taskService.getCategories(),
      ]);

      setTasks(tasksData.results || tasksData);
      setTodayTasks(todayData.results || todayData); // Handle both paginated and non-paginated responses
      setStats(statsData);
      setProjects(categoriesData);
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };
  const handleTaskCreate = (newTask) => {
    setTasks([newTask, ...tasks]);
    setTodayTasks([newTask, ...todayTasks]);
    // Refresh stats to update the counters
    fetchDashboardData();
  };  const handleTaskUpdate = (updatedTask: any) => {
    setTasks(tasks.map(task => task.id === updatedTask.id ? updatedTask : task));
    setTodayTasks(todayTasks.map(task => task.id === updatedTask.id ? updatedTask : task));
    // Refresh stats to update the counters
    fetchDashboardData();
  };
  const handleTaskDelete = async (taskId: number) => {
    try {
      await taskService.deleteTask(taskId);
      setTasks(tasks.filter(task => task.id !== taskId));
      setTodayTasks(todayTasks.filter(task => task.id !== taskId));
      // Refresh stats to update the counters
      fetchDashboardData();
    } catch (error) {
      console.error('Failed to delete task:', error);
    }
  };

  const handleTaskEdit = (task: any) => {
    setEditingTask(task);
  };

  const handleTaskUpdated = (updatedTask: any) => {
    setTasks(tasks.map(task => task.id === updatedTask.id ? updatedTask : task));
    setTodayTasks(todayTasks.map(task => task.id === updatedTask.id ? updatedTask : task));
    setEditingTask(null);
    // Refresh stats to update the counters
    fetchDashboardData();
  };

  const filteredTasks = todayTasks.filter(task => {
    const matchesSearch = task.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesPriority = !selectedPriority || task.priority === selectedPriority;
    return matchesSearch && matchesPriority;
  });
  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box p={3}>
      <Typography variant="h4" fontWeight="bold" gutterBottom>
        Good morning! 👋
      </Typography>
      <Typography variant="body1" color="text.secondary" mb={4}>
        Here's what's happening with your tasks today.
      </Typography>      <Box display="flex" gap={3} mb={4} flexWrap="wrap">
        <Card sx={{ flex: 1, minWidth: 250 }}>
          <CardContent>
            <Box display="flex" alignItems="center" justifyContent="space-between">
              <Box>
                <Typography color="text.secondary" gutterBottom>
                  Total Tasks
                </Typography>
                <Typography variant="h4" fontWeight="bold">
                  {stats?.total_tasks ?? 0}
                </Typography>
              </Box>
              <Psychology color="primary" sx={{ fontSize: 40 }} />
            </Box>
          </CardContent>
        </Card>

        <Card sx={{ flex: 1, minWidth: 250 }}>
          <CardContent>
            <Box display="flex" alignItems="center" justifyContent="space-between">
              <Box>
                <Typography color="text.secondary" gutterBottom>
                  Tasks Completed
                </Typography>
                <Typography variant="h4" fontWeight="bold">
                  {stats?.completed_tasks ?? 0}
                </Typography>
              </Box>
              <Bolt color="success" sx={{ fontSize: 40 }} />
            </Box>
          </CardContent>
        </Card>
      </Box>

      <Box display="flex" gap={2} mb={3} flexWrap="wrap">
        <TextField
          placeholder="Search tasks..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          size="small"
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Search />
              </InputAdornment>
            ),
          }}
          sx={{ flexGrow: 1, minWidth: 200 }}
        />
        
        <FormControl size="small" sx={{ minWidth: 120 }}>
          <InputLabel>Priority</InputLabel>
          <Select
            value={selectedPriority}
            label="Priority"
            onChange={(e) => setSelectedPriority(e.target.value)}
          >
            <MenuItem value="">All</MenuItem>
            <MenuItem value="high">High</MenuItem>
            <MenuItem value="medium">Medium</MenuItem>
            <MenuItem value="low">Low</MenuItem>
          </Select>
        </FormControl>

        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => setIsCreateTaskModalOpen(true)}
        >
          Add Task
        </Button>
      </Box>      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Recent Tasks
          </Typography>
          
          {filteredTasks.length > 0 ? (
            <Box display="flex" flexDirection="column" gap={2}>
              {filteredTasks.map((task) => (
                <TaskCard
                  key={task.id}
                  task={task}
                  onUpdate={handleTaskUpdate}
                  onDelete={handleTaskDelete}
                  onEdit={handleTaskEdit}
                />
              ))}
            </Box>
          ) : (            <Box textAlign="center" py={4}>
              <CalendarToday sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
              <Typography variant="h6" color="text.secondary">
                No tasks found
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Add a task to get started!
              </Typography>
            </Box>
          )}
        </CardContent>
      </Card>      <CreateTaskModal
        isOpen={isCreateTaskModalOpen || !!editingTask}
        onClose={() => {
          setIsCreateTaskModalOpen(false);
          setEditingTask(null);
        }}
        onTaskCreated={editingTask ? handleTaskUpdated : handleTaskCreate}
        editingTask={editingTask}
      /></Box>
  );
};

export default Dashboard;
