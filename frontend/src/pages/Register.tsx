import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import {
  Box,
  Paper,
  TextField,
  Button,
  Typography,
  Alert,
  Container,
  InputAdornment,
  IconButton,
  Grid,
} from '@mui/material';
import { 
  Visibility, 
  VisibilityOff, 
  PersonAdd as PersonAddIcon 
} from '@mui/icons-material';
import { authService } from '../services/auth.ts';

const schema = yup.object({
  username: yup.string().required('Username is required').min(3, 'Username must be at least 3 characters'),
  email: yup.string().email('Enter a valid email').required('Email is required'),
  first_name: yup.string().required('First name is required'),
  last_name: yup.string().required('Last name is required'),
  password: yup.string().required('Password is required').min(6, 'Password must be at least 6 characters'),
  confirmPassword: yup.string()
    .required('Please confirm your password')
    .oneOf([yup.ref('password')], 'Passwords must match')
});

const Register = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors },
    setError
  } = useForm({
    resolver: yupResolver(schema)
  });
  const onSubmit = async (data: any) => {
    try {
      setIsLoading(true);
      // Transform the data to match backend expectations
      const registerData = {
        username: data.username,
        email: data.email,
        first_name: data.first_name,
        last_name: data.last_name,
        password: data.password,
        password_confirm: data.confirmPassword, // Backend expects password_confirm
        theme_preference: 'light', // Default theme
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC' // User's timezone
      };
      
      await authService.register(registerData);
      navigate('/login', {
        state: { message: 'Account created successfully! Please log in.' }
      });
    } catch (error) {
      console.error('Registration failed:', error);
      const errorData = error.response?.data;      if (errorData) {
        Object.keys(errorData).forEach(field => {
          // Map backend field names to frontend field names
          const frontendField = field === 'password_confirm' ? 'confirmPassword' : field;
          // Only set error if the field exists in our form schema
          const validFields = ['email', 'password', 'username', 'first_name', 'last_name', 'confirmPassword'];
          if (validFields.includes(frontendField)) {
            setError(frontendField as any, {
              message: Array.isArray(errorData[field]) ? errorData[field][0] : errorData[field]
            });
          }
        });
      } else {
        setError('root', {
          message: 'Registration failed. Please try again.'
        });
      }
    } finally {
      setIsLoading(false);
    }
  };  return (
    <Container component="main" maxWidth="sm">
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          py: 2,
        }}
      >
        <Paper
          elevation={12}
          sx={{
            padding: 3,
            borderRadius: 3,
            background: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            width: '100%',
            maxWidth: 480,
            maxHeight: '95vh',
            overflow: 'auto',
          }}
        >
          <Box display="flex" flexDirection="column" alignItems="center" mb={2}>
            <Box
              sx={{
                width: 50,
                height: 50,
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                mb: 1.5,
                boxShadow: 3,
              }}
            >
              <PersonAddIcon sx={{ color: 'white', fontSize: 26 }} />
            </Box>
            <Typography variant="h5" component="h1" gutterBottom sx={{ fontWeight: 600, color: '#333', mb: 1 }}>
              Join BetterTasks
            </Typography>
            <Typography variant="body2" color="text.secondary" align="center">
              Already have an account?{' '}
              <Link to="/login" style={{ color: '#667eea', textDecoration: 'none', fontWeight: 500 }}>
                Sign in here
              </Link>
            </Typography>
          </Box>          <Box component="form" onSubmit={handleSubmit(onSubmit)} sx={{ mt: 1 }}>
            <Box sx={{ display: 'flex', gap: 1.5, mb: 1.5 }}>
              <TextField
                {...register('first_name')}
                fullWidth
                label="First Name"
                variant="outlined"
                size="small"
                error={!!errors.first_name}
                helperText={errors.first_name?.message}
              />
              <TextField
                {...register('last_name')}
                fullWidth
                label="Last Name"
                variant="outlined"
                size="small"
                error={!!errors.last_name}
                helperText={errors.last_name?.message}
              />
            </Box>

            <TextField
              {...register('username')}
              fullWidth
              label="Username"
              variant="outlined"
              size="small"
              error={!!errors.username}
              helperText={errors.username?.message}
              sx={{ mb: 1.5 }}
            />

            <TextField
              {...register('email')}
              fullWidth
              label="Email Address"
              type="email"
              variant="outlined"
              size="small"
              error={!!errors.email}
              helperText={errors.email?.message}
              sx={{ mb: 1.5 }}
            />

            <TextField
              {...register('password')}
              fullWidth
              label="Password"
              type={showPassword ? 'text' : 'password'}
              variant="outlined"
              size="small"
              error={!!errors.password}
              helperText={errors.password?.message}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowPassword(!showPassword)}
                      edge="end"
                      aria-label="toggle password visibility"
                      size="small"
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
              sx={{ mb: 1.5 }}
            />

            <TextField
              {...register('confirmPassword')}
              fullWidth
              label="Confirm Password"
              type={showConfirmPassword ? 'text' : 'password'}
              variant="outlined"
              size="small"
              error={!!errors.confirmPassword}
              helperText={errors.confirmPassword?.message}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      edge="end"
                      aria-label="toggle confirm password visibility"
                      size="small"
                    >
                      {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
              sx={{ mb: 1.5 }}
            />

            {errors.root && (
              <Alert severity="error" sx={{ mb: 1.5 }}>
                {errors.root.message}
              </Alert>
            )}

            <Button
              type="submit"
              fullWidth
              variant="contained"
              disabled={isLoading}
              sx={{
                mt: 1,
                mb: 1,
                py: 1.2,
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                '&:hover': {
                  background: 'linear-gradient(135deg, #5a6fd8 0%, #6b4190 100%)',
                  transform: 'translateY(-2px)',
                },
                '&:disabled': {
                  background: '#ccc',
                },
                transition: 'all 0.2s ease-in-out',
                textTransform: 'none',
                fontSize: '1rem',
                fontWeight: 600,
              }}
            >
              {isLoading ? 'Creating account...' : 'Create Account'}
            </Button>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};

export default Register;