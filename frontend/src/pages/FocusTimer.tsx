import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Slider,
  Switch,
  FormControlLabel,
  LinearProgress,
} from '@mui/material';
import {
  PlayArrow,
  Pause,
  Stop,
  Settings,
  Timer,
  Coffee,
  FitnessCenter,
  CheckCircle,
} from '@mui/icons-material';
import { keyframes } from '@mui/system';
import { taskService } from '../services/tasks.ts';

// Animation keyframes
const pulse = keyframes`
  0% {
    transform: scale(1);
    box-shadow: 0 0 0 0 rgba(33, 150, 243, 0.7);
  }
  70% {
    transform: scale(1.05);
    box-shadow: 0 0 0 20px rgba(33, 150, 243, 0);
  }
  100% {
    transform: scale(1);
    box-shadow: 0 0 0 0 rgba(33, 150, 243, 0);
  }
`;

const breathe = keyframes`
  0%, 100% {
    transform: scale(1);
    opacity: 0.8;
  }
  50% {
    transform: scale(1.1);
    opacity: 1;
  }
`;

const ripple = keyframes`
  0% {
    transform: scale(0);
    opacity: 1;
  }
  100% {
    transform: scale(4);
    opacity: 0;
  }
`;

interface TimerSettings {
  focusTime: number; // in minutes
  shortBreak: number; // in minutes
  longBreak: number; // in minutes
  longBreakInterval: number; // after how many focus sessions
}

interface TimerSession {
  type: 'focus' | 'shortBreak' | 'longBreak';
  duration: number;
  taskName?: string;
}

const FocusTimer: React.FC = () => {
  const [currentTime, setCurrentTime] = useState(25 * 60); // 25 minutes in seconds
  const [isRunning, setIsRunning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [currentSession, setCurrentSession] = useState<TimerSession>({
    type: 'focus',
    duration: 25 * 60,
  });
  const [sessionCount, setSessionCount] = useState(0);
  const [completedSessions, setCompletedSessions] = useState(0);
  const [taskName, setTaskName] = useState('');
  const [availableTasks, setAvailableTasks] = useState([]);
  const [selectedTask, setSelectedTask] = useState('');
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [settings, setSettings] = useState<TimerSettings>({
    focusTime: 25,
    shortBreak: 5,
    longBreak: 15,
    longBreakInterval: 4,
  });

  const intervalRef = useRef<number | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Load tasks on component mount
  useEffect(() => {
    loadTasks();
    // Create audio context for timer sounds
    audioRef.current = new Audio();
  }, []);

  // Timer countdown effect
  useEffect(() => {
    if (isRunning && !isPaused && currentTime > 0) {
      intervalRef.current = setInterval(() => {
        setCurrentTime((prev) => {
          if (prev <= 1) {
            handleSessionComplete();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRunning, isPaused, currentTime]);

  const loadTasks = async () => {
    try {
      const tasks = await taskService.getTasks({ status: 'pending' });
      setAvailableTasks(tasks.results || tasks);
    } catch (error) {
      console.error('Failed to load tasks:', error);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getProgress = () => {
    return ((currentSession.duration - currentTime) / currentSession.duration) * 100;
  };

  const playNotificationSound = () => {
    // Create a simple beep sound using Web Audio API
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.frequency.value = 800;
    oscillator.type = 'sine';
    
    gainNode.gain.setValueAtTime(0, audioContext.currentTime);
    gainNode.gain.linearRampToValueAtTime(1, audioContext.currentTime + 0.01);
    gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.5);
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.5);
  };

  const handleSessionComplete = () => {
    setIsRunning(false);
    setIsPaused(false);
    playNotificationSound();
    
    if (currentSession.type === 'focus') {
      const newSessionCount = sessionCount + 1;
      setSessionCount(newSessionCount);
      setCompletedSessions(completedSessions + 1);
      
      // Determine next session type
      const isLongBreak = newSessionCount % settings.longBreakInterval === 0;
      const nextSession: TimerSession = {
        type: isLongBreak ? 'longBreak' : 'shortBreak',
        duration: isLongBreak ? settings.longBreak * 60 : settings.shortBreak * 60,
      };
      
      setCurrentSession(nextSession);
      setCurrentTime(nextSession.duration);
    } else {
      // Break completed, start focus session
      const nextSession: TimerSession = {
        type: 'focus',
        duration: settings.focusTime * 60,
        taskName: taskName || selectedTask,
      };
      
      setCurrentSession(nextSession);
      setCurrentTime(nextSession.duration);
    }
  };

  const handleStart = () => {
    if (currentSession.type === 'focus' && !taskName && !selectedTask) {
      alert('Please enter a task name or select a task to focus on');
      return;
    }
    
    setIsRunning(true);
    setIsPaused(false);
  };

  const handlePause = () => {
    setIsPaused(!isPaused);
  };

  const handleStop = () => {
    setIsRunning(false);
    setIsPaused(false);
    setCurrentTime(currentSession.duration);
  };

  const handleReset = () => {
    setIsRunning(false);
    setIsPaused(false);
    setSessionCount(0);
    setCompletedSessions(0);
    setTaskName('');
    setSelectedTask('');
    const initialSession: TimerSession = {
      type: 'focus',
      duration: settings.focusTime * 60,
    };
    setCurrentSession(initialSession);
    setCurrentTime(initialSession.duration);
  };

  const handleSettingsChange = (newSettings: TimerSettings) => {
    setSettings(newSettings);
    if (!isRunning) {
      // Update current session duration if not running
      const newDuration = currentSession.type === 'focus' 
        ? newSettings.focusTime * 60 
        : currentSession.type === 'shortBreak'
        ? newSettings.shortBreak * 60
        : newSettings.longBreak * 60;
      
      setCurrentSession({ ...currentSession, duration: newDuration });
      setCurrentTime(newDuration);
    }
  };

  const getSessionIcon = () => {
    switch (currentSession.type) {
      case 'focus':
        return <FitnessCenter sx={{ fontSize: 32 }} />;
      case 'shortBreak':
        return <Coffee sx={{ fontSize: 32 }} />;
      case 'longBreak':
        return <Timer sx={{ fontSize: 32 }} />;
    }
  };

  const getSessionTitle = () => {
    switch (currentSession.type) {
      case 'focus':
        return 'Focus Time';
      case 'shortBreak':
        return 'Short Break';
      case 'longBreak':
        return 'Long Break';
    }
  };

  const getSessionColor = () => {
    switch (currentSession.type) {
      case 'focus':
        return '#2196f3';
      case 'shortBreak':
        return '#4caf50';
      case 'longBreak':
        return '#ff9800';
    }
  };

  return (
    <Box sx={{ p: 3, maxWidth: 800, mx: 'auto' }}>
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
        <Typography variant="h4" component="h1" fontWeight="bold">
          Focus Timer
        </Typography>
        <IconButton onClick={() => setSettingsOpen(true)} size="large">
          <Settings />
        </IconButton>
      </Box>

      {/* Stats Row */}
      <Box display="flex" gap={2} mb={4}>
        <Card sx={{ flex: 1 }}>
          <CardContent sx={{ textAlign: 'center', py: 2 }}>
            <Typography variant="h6" color="primary">
              {completedSessions}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Completed Sessions
            </Typography>
          </CardContent>
        </Card>
        <Card sx={{ flex: 1 }}>
          <CardContent sx={{ textAlign: 'center', py: 2 }}>
            <Typography variant="h6" color="secondary">
              {sessionCount}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Focus Sessions
            </Typography>
          </CardContent>
        </Card>
        <Card sx={{ flex: 1 }}>
          <CardContent sx={{ textAlign: 'center', py: 2 }}>
            <Typography variant="h6" color="success.main">
              {Math.floor((completedSessions * settings.focusTime) / 60)}h {(completedSessions * settings.focusTime) % 60}m
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Total Focus Time
            </Typography>
          </CardContent>
        </Card>
      </Box>

      {/* Main Timer Card */}
      <Card 
        sx={{ 
          mb: 4,
          background: `linear-gradient(135deg, ${getSessionColor()}20 0%, ${getSessionColor()}10 100%)`,
          border: `2px solid ${getSessionColor()}30`,
        }}
      >
        <CardContent sx={{ p: 4, textAlign: 'center' }}>
          {/* Session Type */}
          <Box display="flex" alignItems="center" justifyContent="center" gap={2} mb={2}>
            <Box sx={{ color: getSessionColor() }}>
              {getSessionIcon()}
            </Box>
            <Typography variant="h5" fontWeight="bold" sx={{ color: getSessionColor() }}>
              {getSessionTitle()}
            </Typography>
          </Box>

          {/* Timer Display */}
          <Box
            sx={{
              position: 'relative',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 300,
              height: 300,
              borderRadius: '50%',
              background: `conic-gradient(${getSessionColor()} ${getProgress() * 3.6}deg, #e0e0e0 0deg)`,
              mb: 3,
              animation: isRunning && !isPaused ? `${pulse} 2s infinite` : 'none',
            }}
          >
            <Box
              sx={{
                width: 280,
                height: 280,
                borderRadius: '50%',
                backgroundColor: 'background.paper',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexDirection: 'column',
                position: 'relative',
                '&::before': isRunning && !isPaused ? {
                  content: '""',
                  position: 'absolute',
                  width: '100%',
                  height: '100%',
                  borderRadius: '50%',
                  background: `${getSessionColor()}20`,
                  animation: `${breathe} 3s ease-in-out infinite`,
                } : {},
              }}
            >
              <Typography variant="h2" component="div" fontWeight="bold" sx={{ color: getSessionColor() }}>
                {formatTime(currentTime)}
              </Typography>
              {currentSession.taskName && (
                <Typography variant="body1" color="text.secondary" sx={{ mt: 1, textAlign: 'center' }}>
                  {currentSession.taskName}
                </Typography>
              )}
            </Box>

            {/* Ripple effect for active timer */}
            {isRunning && !isPaused && (
              <Box
                sx={{
                  position: 'absolute',
                  width: 20,
                  height: 20,
                  borderRadius: '50%',
                  backgroundColor: getSessionColor(),
                  animation: `${ripple} 2s infinite`,
                }}
              />
            )}
          </Box>

          {/* Progress Bar */}
          <LinearProgress
            variant="determinate"
            value={getProgress()}
            sx={{
              mb: 3,
              height: 8,
              borderRadius: 4,
              backgroundColor: '#e0e0e0',
              '& .MuiLinearProgress-bar': {
                backgroundColor: getSessionColor(),
              },
            }}
          />

          {/* Control Buttons */}
          <Box display="flex" gap={2} justifyContent="center">
            {!isRunning ? (
              <Button
                variant="contained"
                size="large"
                onClick={handleStart}
                startIcon={<PlayArrow />}
                sx={{
                  backgroundColor: getSessionColor(),
                  '&:hover': {
                    backgroundColor: getSessionColor(),
                    filter: 'brightness(0.9)',
                  },
                  px: 4,
                  py: 1.5,
                }}
              >
                Start
              </Button>
            ) : (
              <>
                <Button
                  variant="contained"
                  size="large"
                  onClick={handlePause}
                  startIcon={isPaused ? <PlayArrow /> : <Pause />}
                  sx={{
                    backgroundColor: isPaused ? getSessionColor() : 'warning.main',
                    px: 4,
                    py: 1.5,
                  }}
                >
                  {isPaused ? 'Resume' : 'Pause'}
                </Button>
                <Button
                  variant="outlined"
                  size="large"
                  onClick={handleStop}
                  startIcon={<Stop />}
                  sx={{ px: 4, py: 1.5 }}
                >
                  Stop
                </Button>
              </>
            )}
            <Button
              variant="outlined"
              size="large"
              onClick={handleReset}
              sx={{ px: 4, py: 1.5 }}
            >
              Reset
            </Button>
          </Box>
        </CardContent>
      </Card>

      {/* Task Input Section */}
      {currentSession.type === 'focus' && (
        <Card sx={{ mb: 4 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              What are you focusing on?
            </Typography>
            <Box display="flex" gap={2} flexDirection={{ xs: 'column', md: 'row' }}>
              <TextField
                fullWidth
                label="Enter task name"
                value={taskName}
                onChange={(e) => setTaskName(e.target.value)}
                placeholder="e.g., Write project proposal"
              />
              <Typography variant="body2" sx={{ alignSelf: 'center', mx: 2, minWidth: 'fit-content' }}>
                OR
              </Typography>
              <FormControl fullWidth>
                <InputLabel>Select from your tasks</InputLabel>
                <Select
                  value={selectedTask}
                  label="Select from your tasks"
                  onChange={(e) => setSelectedTask(e.target.value)}
                >
                  {availableTasks.map((task: any) => (
                    <MenuItem key={task.id} value={task.title}>
                      <Box>
                        <Typography variant="body2">{task.title}</Typography>
                        {task.priority && (
                          <Chip 
                            label={task.priority} 
                            size="small" 
                            sx={{ ml: 1 }} 
                            color={
                              task.priority === 'high' ? 'error' : 
                              task.priority === 'medium' ? 'warning' : 'success'
                            }
                          />
                        )}
                      </Box>
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>
          </CardContent>
        </Card>
      )}

      {/* Settings Dialog */}
      <Dialog open={settingsOpen} onClose={() => setSettingsOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Timer Settings</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <Typography gutterBottom>Focus Time (minutes)</Typography>
            <Slider
              value={settings.focusTime}
              onChange={(_, value) => setSettings({ ...settings, focusTime: value as number })}
              min={1}
              max={60}
              marks={[
                { value: 15, label: '15m' },
                { value: 25, label: '25m' },
                { value: 45, label: '45m' },
              ]}
              valueLabelDisplay="auto"
              sx={{ mb: 3 }}
            />

            <Typography gutterBottom>Short Break (minutes)</Typography>
            <Slider
              value={settings.shortBreak}
              onChange={(_, value) => setSettings({ ...settings, shortBreak: value as number })}
              min={1}
              max={15}
              marks={[
                { value: 5, label: '5m' },
                { value: 10, label: '10m' },
                { value: 15, label: '15m' },
              ]}
              valueLabelDisplay="auto"
              sx={{ mb: 3 }}
            />

            <Typography gutterBottom>Long Break (minutes)</Typography>
            <Slider
              value={settings.longBreak}
              onChange={(_, value) => setSettings({ ...settings, longBreak: value as number })}
              min={10}
              max={60}
              marks={[
                { value: 15, label: '15m' },
                { value: 30, label: '30m' },
                { value: 45, label: '45m' },
              ]}
              valueLabelDisplay="auto"
              sx={{ mb: 3 }}
            />

            <Typography gutterBottom>Long Break Interval (focus sessions)</Typography>
            <Slider
              value={settings.longBreakInterval}
              onChange={(_, value) => setSettings({ ...settings, longBreakInterval: value as number })}
              min={2}
              max={8}
              marks={[
                { value: 2, label: '2' },
                { value: 4, label: '4' },
                { value: 6, label: '6' },
              ]}
              valueLabelDisplay="auto"
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSettingsOpen(false)}>Cancel</Button>
          <Button 
            onClick={() => {
              handleSettingsChange(settings);
              setSettingsOpen(false);
            }}
            variant="contained"
          >
            Save Settings
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default FocusTimer;
