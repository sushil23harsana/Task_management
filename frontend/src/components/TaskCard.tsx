import React, { useState } from 'react';
import { format } from 'date-fns';
import {
  Card,
  CardContent,
  Typography,
  Chip,
  IconButton,
  Box,
  Checkbox,
  Menu,
  MenuItem,
} from '@mui/material';
import {
  AccessTime as AccessTimeIcon,
  MoreVert as MoreVertIcon,
  Event as EventIcon,
  Label as LabelIcon,
} from '@mui/icons-material';
import { taskService } from '../services/tasks.ts';

interface Task {
  id: number;
  title: string;
  description: string;
  status: string;
  priority: 'high' | 'medium' | 'low';
  due_date: string;
  estimated_hours: number;
  category: any;
}

interface TaskCardProps {
  task: Task;
  onUpdate: any;
  onDelete: any;
  className?: string;
}

const TaskCard: React.FC<TaskCardProps> = ({ task, onUpdate, onDelete, className = '' }) => {
  const [isCompleting, setIsCompleting] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const handleToggleComplete = async () => {
    try {
      setIsCompleting(true);
      const updatedTask = await taskService.updateTask(task.id, {
        ...task,
        status: task.status === 'completed' ? 'pending' : 'completed'
      });
      onUpdate && onUpdate(updatedTask);
    } catch (error) {
      console.error('Failed to update task:', error);
    } finally {
      setIsCompleting(false);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'error';
      case 'medium':
        return 'warning';
      case 'low':
        return 'success';
      default:
        return 'default';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'success';
      case 'in_progress':
        return 'info';
      case 'pending':
        return 'warning';
      default:
        return 'default';
    }
  };

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleDelete = () => {
    onDelete && onDelete(task.id);
    handleMenuClose();
  };

  return (
    <Card 
      sx={{ 
        mb: 2,
        transition: 'all 0.2s ease-in-out',
        '&:hover': {
          transform: 'translateY(-2px)',
          boxShadow: 4,
        },
        opacity: task.status === 'completed' ? 0.7 : 1,
      }}
      className={className}
    >
      <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
        <Box display="flex" alignItems="flex-start" justifyContent="space-between" mb={2}>
          <Box display="flex" alignItems="flex-start" flex={1}>
            <Checkbox
              checked={task.status === 'completed'}
              onChange={handleToggleComplete}
              disabled={isCompleting}
              size="small"
              sx={{ mt: -0.5, mr: 1 }}
            />
            
            <Box flex={1} minWidth={0}>
              <Typography 
                variant="subtitle1" 
                component="h3"
                sx={{
                  textDecoration: task.status === 'completed' ? 'line-through' : 'none',
                  color: task.status === 'completed' ? 'text.secondary' : 'text.primary',
                  fontWeight: 500,
                }}
              >
                {task.title}
              </Typography>
              {task.description && (
                <Typography 
                  variant="body2" 
                  color="text.secondary" 
                  sx={{ 
                    mt: 0.5,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                  }}
                >
                  {task.description}
                </Typography>
              )}
            </Box>
          </Box>
          
          <IconButton 
            size="small" 
            onClick={handleMenuOpen}
            sx={{ ml: 1 }}
          >
            <MoreVertIcon fontSize="small" />
          </IconButton>
          
          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleMenuClose}
            PaperProps={{
              sx: { minWidth: 120 }
            }}
          >
            <MenuItem onClick={handleDelete}>Delete</MenuItem>
          </Menu>
        </Box>

        <Box display="flex" alignItems="center" justifyContent="space-between" flexWrap="wrap" gap={1}>
          <Box display="flex" alignItems="center" gap={2} flexWrap="wrap">
            {task.due_date && (
              <Box display="flex" alignItems="center" gap={0.5}>
                <EventIcon sx={{ fontSize: 14, color: 'text.secondary' }} />
                <Typography variant="caption" color="text.secondary">
                  {format(new Date(task.due_date), 'MMM dd')}
                </Typography>
              </Box>
            )}
            
            {task.category && (
              <Box display="flex" alignItems="center" gap={0.5}>
                <LabelIcon sx={{ fontSize: 14, color: 'text.secondary' }} />
                <Typography variant="caption" color="text.secondary">
                  {task.category.name}
                </Typography>
              </Box>
            )}

            {task.estimated_hours && (
              <Box display="flex" alignItems="center" gap={0.5}>
                <AccessTimeIcon sx={{ fontSize: 14, color: 'text.secondary' }} />
                <Typography variant="caption" color="text.secondary">
                  {task.estimated_hours}h
                </Typography>
              </Box>
            )}
          </Box>

          <Box display="flex" gap={1} flexWrap="wrap">
            <Chip
              label={task.priority}
              size="small"
              color={getPriorityColor(task.priority) as any}
              variant="outlined"
            />
            
            <Chip
              label={task.status.replace('_', ' ')}
              size="small"
              color={getStatusColor(task.status) as any}
              variant="filled"
            />
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
};

export default TaskCard;
