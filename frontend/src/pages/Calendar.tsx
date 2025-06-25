import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  Chip,
  Paper,
  CircularProgress,
  IconButton,
  Tooltip,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  useTheme,
  alpha,
} from '@mui/material';
import {
  CalendarToday,
  ChevronLeft,
  ChevronRight,
  Today,
  Add,
  Event,
  Assignment,
  CheckCircle,
  Schedule,
} from '@mui/icons-material';
import dayjs, { Dayjs } from 'dayjs';
import { taskService } from '../services/tasks.ts';
import CreateTaskModal from '../components/CreateTaskModal';

interface Task {
  id: number;
  title: string;
  description: string;
  due_date: string;
  priority: 'high' | 'medium' | 'low';
  status: 'todo' | 'in_progress' | 'completed';
  category: {
    id: number;
    name: string;
    color: string;
  } | null;
}

interface CalendarTask extends Task {
  date: string;
}

const Calendar: React.FC = () => {
  const theme = useTheme();
  const [selectedDate, setSelectedDate] = useState<Dayjs>(dayjs());
  const [currentMonth, setCurrentMonth] = useState<Dayjs>(dayjs());
  const [tasks, setTasks] = useState<CalendarTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDateTasks, setSelectedDateTasks] = useState<CalendarTask[]>([]);
  const [isCreateTaskModalOpen, setIsCreateTaskModalOpen] = useState(false);

  useEffect(() => {
    fetchCalendarTasks();
  }, [currentMonth]);

  useEffect(() => {
    const tasksForDate = tasks.filter(task => 
      dayjs(task.due_date).format('YYYY-MM-DD') === selectedDate.format('YYYY-MM-DD')
    );
    setSelectedDateTasks(tasksForDate);
  }, [selectedDate, tasks]);

  const fetchCalendarTasks = async () => {
    try {
      setLoading(true);
      const startDate = currentMonth.startOf('month').format('YYYY-MM-DD');
      const endDate = currentMonth.endOf('month').format('YYYY-MM-DD');
      
      const response = await taskService.getCalendarTasks(startDate, endDate);
      setTasks(response);
    } catch (error) {
      console.error('Failed to fetch calendar tasks:', error);
      setTasks([]);
    } finally {
      setLoading(false);
    }
  };

  const handleMonthChange = (newMonth: Dayjs) => {
    setCurrentMonth(newMonth);
  };

  const handleDateClick = (date: Dayjs) => {
    setSelectedDate(date);
  };

  const handleTaskCreate = (newTask: Task) => {
    const calendarTask: CalendarTask = {
      ...newTask,
      date: newTask.due_date
    };
    setTasks([...tasks, calendarTask]);
  };

  const getTasksForDate = (date: Dayjs): CalendarTask[] => {
    return tasks.filter(task => 
      dayjs(task.due_date).format('YYYY-MM-DD') === date.format('YYYY-MM-DD')
    );
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return theme.palette.error.main;
      case 'medium': return theme.palette.warning.main;
      case 'low': return theme.palette.success.main;
      default: return theme.palette.grey[500];
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle sx={{ color: theme.palette.success.main }} />;
      case 'in_progress': return <Schedule sx={{ color: theme.palette.warning.main }} />;
      default: return <Assignment sx={{ color: theme.palette.grey[500]} } />;
    }
  };

  const renderCalendarDay = (day: Dayjs) => {
    const dayTasks = getTasksForDate(day);
    const isSelected = day.format('YYYY-MM-DD') === selectedDate.format('YYYY-MM-DD');
    const isToday = day.format('YYYY-MM-DD') === dayjs().format('YYYY-MM-DD');
    const outsideCurrentMonth = !day.isSame(currentMonth, 'month');

    return (
      <Box
        key={day.format('YYYY-MM-DD')}
        sx={{
          position: 'relative',
          width: '100%',
          height: 80,
          border: `1px solid ${theme.palette.divider}`,
          backgroundColor: outsideCurrentMonth 
            ? alpha(theme.palette.grey[300], 0.3)
            : isSelected 
              ? alpha(theme.palette.primary.main, 0.1)
              : isToday
                ? alpha(theme.palette.secondary.main, 0.1)
                : 'transparent',
          cursor: 'pointer',
          '&:hover': {
            backgroundColor: alpha(theme.palette.primary.main, 0.05),
          },
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-start',
          justifyContent: 'flex-start',
          p: 0.5,
        }}
        onClick={() => handleDateClick(day)}
      >
        <Typography
          variant="body2"
          sx={{
            fontWeight: isToday ? 'bold' : 'normal',
            color: outsideCurrentMonth 
              ? theme.palette.text.disabled 
              : isToday 
                ? theme.palette.secondary.main 
                : theme.palette.text.primary,
            mb: 0.5,
          }}
        >
          {day.date()}
        </Typography>
        
        {dayTasks.length > 0 && (
          <Box sx={{ width: '100%' }}>
            {dayTasks.slice(0, 2).map((task, index) => (
              <Box
                key={task.id}
                sx={{
                  width: '100%',
                  height: 4,
                  backgroundColor: getPriorityColor(task.priority),
                  borderRadius: 1,
                  mb: 0.25,
                  opacity: task.status === 'completed' ? 0.5 : 1,
                }}
              />
            ))}
            {dayTasks.length > 2 && (
              <Typography variant="caption" sx={{ fontSize: '0.6rem', color: theme.palette.text.secondary }}>
                +{dayTasks.length - 2} more
              </Typography>
            )}
          </Box>
        )}
      </Box>
    );
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box p={3}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" fontWeight="bold">
          Calendar View
        </Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => setIsCreateTaskModalOpen(true)}
          sx={{
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            '&:hover': {
              background: 'linear-gradient(135deg, #5a6fd8 0%, #6b4190 100%)',
            },
          }}
        >
          Add Task
        </Button>
      </Box>

      <Box display="flex" gap={3}>
        {/* Calendar */}
        <Card sx={{ flex: 2 }}>
          <CardContent>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
              <Typography variant="h6">
                {currentMonth.format('MMMM YYYY')}
              </Typography>
              <Box>
                <IconButton onClick={() => handleMonthChange(currentMonth.subtract(1, 'month'))}>
                  <ChevronLeft />
                </IconButton>
                <IconButton onClick={() => handleMonthChange(dayjs())}>
                  <Today />
                </IconButton>
                <IconButton onClick={() => handleMonthChange(currentMonth.add(1, 'month'))}>
                  <ChevronRight />
                </IconButton>
              </Box>
            </Box>            <Paper elevation={0} sx={{ p: 2, border: `1px solid ${theme.palette.divider}` }}>
              {/* Calendar Header */}
              <Box display="flex" sx={{ mb: 1 }}>
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                  <Box key={day} sx={{ flex: 1, textAlign: 'center' }}>
                    <Typography
                      variant="subtitle2"
                      sx={{ fontWeight: 'bold', color: theme.palette.text.secondary, py: 1 }}
                    >
                      {day}
                    </Typography>
                  </Box>
                ))}
              </Box>

              {/* Calendar Grid */}
              <Box display="flex" flexWrap="wrap">
                {(() => {
                  const startOfMonth = currentMonth.startOf('month');
                  const endOfMonth = currentMonth.endOf('month');
                  const startOfWeek = startOfMonth.startOf('week');
                  const endOfWeek = endOfMonth.endOf('week');
                  
                  const days = [];
                  let current = startOfWeek;
                  
                  while (current.isBefore(endOfWeek) || current.isSame(endOfWeek, 'day')) {
                    days.push(current);
                    current = current.add(1, 'day');
                  }
                  
                  return days.map((day) => (
                    <Box key={day.format('YYYY-MM-DD')} sx={{ width: 'calc(100% / 7)' }}>
                      {renderCalendarDay(day)}
                    </Box>
                  ));
                })()}
              </Box>
            </Paper>
          </CardContent>
        </Card>

        {/* Selected Date Tasks */}
        <Card sx={{ flex: 1, minWidth: 300 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              {selectedDate.format('MMMM D, YYYY')}
            </Typography>
            
            {selectedDateTasks.length > 0 ? (
              <List dense>
                {selectedDateTasks.map((task) => (
                  <ListItem
                    key={task.id}
                    sx={{
                      border: `1px solid ${theme.palette.divider}`,
                      borderRadius: 1,
                      mb: 1,
                      backgroundColor: task.status === 'completed' 
                        ? alpha(theme.palette.success.main, 0.1)
                        : 'transparent',
                    }}
                  >
                    <ListItemIcon>
                      {getStatusIcon(task.status)}
                    </ListItemIcon>
                    <ListItemText
                      primary={
                        <Typography
                          variant="body2"
                          sx={{
                            textDecoration: task.status === 'completed' ? 'line-through' : 'none',
                            opacity: task.status === 'completed' ? 0.7 : 1,
                          }}
                        >
                          {task.title}
                        </Typography>
                      }
                      secondary={
                        <Box display="flex" alignItems="center" gap={1} mt={0.5}>
                          <Chip
                            size="small"
                            label={task.priority}
                            sx={{
                              backgroundColor: alpha(getPriorityColor(task.priority), 0.2),
                              color: getPriorityColor(task.priority),
                              fontSize: '0.7rem',
                              height: 20,
                            }}
                          />
                          {task.category && (
                            <Chip
                              size="small"
                              label={task.category.name}
                              sx={{
                                backgroundColor: alpha(task.category.color || theme.palette.grey[500], 0.2),
                                color: task.category.color || theme.palette.grey[700],
                                fontSize: '0.7rem',
                                height: 20,
                              }}
                            />
                          )}
                        </Box>
                      }
                    />
                  </ListItem>
                ))}
              </List>
            ) : (
              <Box textAlign="center" py={4}>
                <Event sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
                <Typography variant="body2" color="text.secondary">
                  No tasks for this date
                </Typography>
                <Button
                  size="small"
                  startIcon={<Add />}
                  onClick={() => setIsCreateTaskModalOpen(true)}
                  sx={{ mt: 1 }}
                >
                  Add Task
                </Button>
              </Box>
            )}
          </CardContent>
        </Card>
      </Box>

      {/* Legend */}
      <Card sx={{ mt: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Legend
          </Typography>
          <Box display="flex" gap={3} flexWrap="wrap">
            <Box display="flex" alignItems="center" gap={1}>
              <Box sx={{ width: 16, height: 4, backgroundColor: theme.palette.error.main, borderRadius: 1 }} />
              <Typography variant="body2">High Priority</Typography>
            </Box>
            <Box display="flex" alignItems="center" gap={1}>
              <Box sx={{ width: 16, height: 4, backgroundColor: theme.palette.warning.main, borderRadius: 1 }} />
              <Typography variant="body2">Medium Priority</Typography>
            </Box>
            <Box display="flex" alignItems="center" gap={1}>
              <Box sx={{ width: 16, height: 4, backgroundColor: theme.palette.success.main, borderRadius: 1 }} />
              <Typography variant="body2">Low Priority</Typography>
            </Box>
            <Box display="flex" alignItems="center" gap={1}>
              <CheckCircle sx={{ color: theme.palette.success.main, fontSize: 16 }} />
              <Typography variant="body2">Completed</Typography>
            </Box>
            <Box display="flex" alignItems="center" gap={1}>
              <Schedule sx={{ color: theme.palette.warning.main, fontSize: 16 }} />
              <Typography variant="body2">In Progress</Typography>
            </Box>
          </Box>
        </CardContent>
      </Card>

      <CreateTaskModal
        isOpen={isCreateTaskModalOpen}
        onClose={() => setIsCreateTaskModalOpen(false)}
        onTaskCreated={handleTaskCreate}
        defaultDate={selectedDate.format('YYYY-MM-DD')}
      />
    </Box>
  );
};

export default Calendar;
