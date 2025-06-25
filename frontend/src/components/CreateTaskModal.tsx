import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  IconButton,
  Typography,
  Chip,
} from '@mui/material';
import {
  Close as CloseIcon,
  Event as EventIcon,
  AccessTime as AccessTimeIcon,
  Label as LabelIcon,
} from '@mui/icons-material';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { format } from 'date-fns';
import { taskService } from '../services/tasks.ts';

interface CreateTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onTaskCreated: (task: any) => void;
  editingTask?: any;
  defaultDate?: string;
}

const schema = yup.object({
  title: yup.string().required('Task title is required'),
  description: yup.string(),
  due_date: yup.date(),
  priority: yup.string().oneOf(['low', 'medium', 'high']).required(),
  estimated_hours: yup.number().min(0).max(24),
  category: yup.number()
});

const CreateTaskModal: React.FC<CreateTaskModalProps> = ({ isOpen, onClose, onTaskCreated, editingTask, defaultDate }) => {
  const [categories, setCategories] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    control,
    watch,
    setValue
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      priority: 'medium'
    }
  });

  const selectedPriority = watch('priority');
  const selectedCategory = watch('category');  useEffect(() => {
    if (isOpen) {
      fetchCategories();
      
      if (editingTask) {
        // Populate form with editing task data
        setValue('title', editingTask.title);
        setValue('description', editingTask.description || '');
        setValue('priority', editingTask.priority);
        setValue('estimated_hours', editingTask.estimated_hours || 0);
        setValue('category', editingTask.category?.id || '');
        if (editingTask.due_date) {
          setValue('due_date', new Date(editingTask.due_date));
        }
      } else if (defaultDate) {
        setValue('due_date', new Date(defaultDate));
      }
    }
  }, [isOpen, editingTask, defaultDate, setValue]);

  const fetchCategories = async () => {
    try {
      const data = await taskService.getCategories();
      setCategories(data);
    } catch (error) {
      console.error('Failed to fetch categories:', error);
    }
  };

  const onSubmit = async (data: any) => {
    try {
      setIsSubmitting(true);
      const taskData = {
        ...data,
        due_date: data.due_date ? format(new Date(data.due_date), 'yyyy-MM-dd') : null
      };
      
      let result;
      if (editingTask) {
        // Update existing task
        result = await taskService.updateTask(editingTask.id, taskData);
      } else {
        // Create new task
        result = await taskService.createTask(taskData);
      }
      
      onTaskCreated && onTaskCreated(result);
      handleClose();
    } catch (error) {
      console.error(`Failed to ${editingTask ? 'update' : 'create'} task:`, error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const priorityOptions = [
    { value: 'low', label: 'Low', color: 'success' },
    { value: 'medium', label: 'Medium', color: 'warning' },
    { value: 'high', label: 'High', color: 'error' }
  ];

  return (
    <Dialog 
      open={isOpen} 
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 2,
          minHeight: 400,
        }
      }}
    >
      <DialogTitle>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h6" component="div">
            {editingTask ? 'Edit Task' : 'Create New Task'}
          </Typography>
          <IconButton 
            edge="end" 
            color="inherit" 
            onClick={handleClose}
            sx={{ p: 1 }}
          >
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent dividers>
        <Box component="form" sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          <TextField
            {...register('title')}
            label="Task Title"
            fullWidth
            required
            error={!!errors.title}
            helperText={errors.title?.message}
            variant="outlined"
          />

          <TextField
            {...register('description')}
            label="Description"
            fullWidth
            multiline
            rows={3}
            error={!!errors.description}
            helperText={errors.description?.message}
            variant="outlined"
          />

          <TextField
            {...register('due_date')}
            label="Due Date"
            type="date"
            fullWidth
            InputLabelProps={{
              shrink: true,
            }}
            InputProps={{
              startAdornment: <EventIcon sx={{ mr: 1, color: 'action.active' }} />,
            }}
            error={!!errors.due_date}
            helperText={errors.due_date?.message}
          />

          <Controller
            name="priority"
            control={control}
            render={({ field }) => (
              <FormControl fullWidth>
                <InputLabel>Priority</InputLabel>
                <Select
                  {...field}
                  label="Priority"
                  error={!!errors.priority}
                >
                  {priorityOptions.map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                      <Box display="flex" alignItems="center" gap={1}>
                        <Chip 
                          label={option.label} 
                          size="small" 
                          color={option.color as any}
                          variant="outlined"
                        />
                      </Box>
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            )}
          />

          <TextField
            {...register('estimated_hours')}
            label="Estimated Hours"
            type="number"
            fullWidth
            inputProps={{ min: 0, max: 24, step: 0.5 }}
            InputProps={{
              startAdornment: <AccessTimeIcon sx={{ mr: 1, color: 'action.active' }} />,
            }}
            error={!!errors.estimated_hours}
            helperText={errors.estimated_hours?.message}
          />

          {categories.length > 0 && (
            <Controller
              name="category"
              control={control}
              render={({ field }) => (
                <FormControl fullWidth>
                  <InputLabel>Category</InputLabel>
                  <Select
                    {...field}
                    label="Category"
                    error={!!errors.category}
                  >
                    {categories.map((category: any) => (
                      <MenuItem key={category.id} value={category.id}>
                        <Box display="flex" alignItems="center" gap={1}>
                          <Box
                            sx={{
                              width: 16,
                              height: 16,
                              borderRadius: '50%',
                              backgroundColor: category.color || '#3B82F6',
                            }}
                          />
                          {category.icon && <span style={{ fontSize: '16px' }}>{category.icon}</span>}
                          {category.name}
                        </Box>
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              )}
            />
          )}
        </Box>
      </DialogContent>

      <DialogActions sx={{ p: 3, gap: 1 }}>
        <Button onClick={handleClose} variant="outlined">
          Cancel
        </Button>
        <Button 
          onClick={handleSubmit(onSubmit)}
          variant="contained"
          disabled={isSubmitting}
          sx={{
            minWidth: 120,
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            '&:hover': {
              background: 'linear-gradient(135deg, #5a6fd8 0%, #6b4190 100%)',
            },
          }}
        >
          {isSubmitting 
            ? (editingTask ? 'Updating...' : 'Creating...') 
            : (editingTask ? 'Update Task' : 'Create Task')
          }
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default CreateTaskModal;
