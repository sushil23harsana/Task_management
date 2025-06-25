import React, { useState, useEffect } from 'react';
import { 
  AppBar, 
  Toolbar, 
  Typography, 
  Box, 
  TextField, 
  InputAdornment, 
  IconButton, 
  Avatar, 
  Badge,
  useTheme as useMUITheme
} from '@mui/material';
import { 
  Menu as MenuIcon, 
  Search as SearchIcon, 
  Notifications as NotificationsIcon, 
  Settings as SettingsIcon, 
  Brightness4 as DarkModeIcon, 
  Brightness7 as LightModeIcon 
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext.tsx';
import { useCustomTheme } from '../context/ThemeContext.tsx';
import { authService } from '../services/auth.ts';

const Header = ({ onMenuClick }) => {
  const { user } = useAuth();
  const { isDarkMode, toggleTheme } = useCustomTheme();
  const muiTheme = useMUITheme();
  const [greeting, setGreeting] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetchGreeting = async () => {
      try {
        const data = await authService.getDashboardGreeting();
        setGreeting(data.greeting);
      } catch (error) {
        // Fallback greeting
        const hour = new Date().getHours();
        const timeGreeting = 
          hour < 12 ? 'Good Morning' : 
          hour < 17 ? 'Good Afternoon' : 
          'Good Evening';
        setGreeting(`${timeGreeting}, ${user?.first_name || 'User'}!`);
      }
    };

    if (user) {
      fetchGreeting();
    }
  }, [user]);

  return (
    <AppBar 
      position="static" 
      color="inherit" 
      elevation={1}
      sx={{ 
        backgroundColor: muiTheme.palette.background.paper,
        borderBottom: `1px solid ${muiTheme.palette.divider}`
      }}
    >
      <Toolbar sx={{ justifyContent: 'space-between', py: 1 }}>
        {/* Left side */}
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          {/* Mobile menu button */}
          <IconButton
            edge="start"
            color="inherit"
            aria-label="open drawer"
            onClick={onMenuClick}
            sx={{ 
              mr: 2, 
              display: { lg: 'none' }
            }}
          >
            <MenuIcon />
          </IconButton>

          {/* Greeting */}
          <Box sx={{ ml: { xs: 0, lg: 0 } }}>
            <Typography 
              variant="h5" 
              component="h1" 
              sx={{ 
                fontWeight: 'bold',
                color: muiTheme.palette.text.primary
              }}
            >
              {greeting}
            </Typography>
            <Typography 
              variant="body2" 
              sx={{ 
                color: muiTheme.palette.text.secondary,
                mt: 0.5
              }}
            >
              What do you plan to do today?
            </Typography>
          </Box>
        </Box>

        {/* Right side */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {/* Search */}
          <Box sx={{ display: { xs: 'none', md: 'block' } }}>
            <TextField
              size="small"
              placeholder="Search tasks..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon sx={{ color: muiTheme.palette.text.secondary }} />
                  </InputAdornment>
                ),
              }}
              sx={{ 
                width: 300,
                '& .MuiOutlinedInput-root': {
                  backgroundColor: muiTheme.palette.background.default,
                }
              }}
            />
          </Box>

          {/* User info and actions */}
          {user && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              {/* User info */}
              <Box sx={{ 
                textAlign: 'right', 
                display: { xs: 'none', sm: 'block' },
                mr: 1
              }}>
                <Typography 
                  variant="body2" 
                  sx={{ 
                    fontWeight: 'medium',
                    color: muiTheme.palette.text.primary
                  }}
                >
                  {user.first_name} {user.last_name}
                </Typography>
                <Typography 
                  variant="caption" 
                  sx={{ 
                    color: muiTheme.palette.text.secondary
                  }}
                >
                  1,354 pts
                </Typography>
              </Box>
              
              {/* Avatar */}
              <Avatar 
                sx={{ 
                  bgcolor: muiTheme.palette.primary.main,
                  width: 40,
                  height: 40,
                  fontSize: '0.875rem'
                }}
              >
                {user.first_name?.[0]}{user.last_name?.[0]}
              </Avatar>

              {/* Dark mode toggle */}
              <IconButton
                onClick={toggleTheme}
                title={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
                sx={{ 
                  color: isDarkMode ? '#ffd700' : '#1976d2',
                  backgroundColor: isDarkMode ? 'rgba(255, 215, 0, 0.1)' : 'rgba(25, 118, 210, 0.1)',
                  border: isDarkMode ? '2px solid #ffd700' : '2px solid #1976d2',
                  borderRadius: 2,
                  width: 48,
                  height: 48,
                  '&:hover': {
                    backgroundColor: isDarkMode ? 'rgba(255, 215, 0, 0.2)' : 'rgba(25, 118, 210, 0.2)',
                    transform: 'scale(1.1)',
                    boxShadow: isDarkMode ? '0 0 10px rgba(255, 215, 0, 0.3)' : '0 0 10px rgba(25, 118, 210, 0.3)',
                  },
                  transition: 'all 0.3s ease-in-out',
                  mx: 1
                }}
              >
                {isDarkMode ? <LightModeIcon fontSize="medium" /> : <DarkModeIcon fontSize="medium" />}
              </IconButton>

              {/* Notifications */}
              <IconButton 
                color="inherit"
                sx={{ color: muiTheme.palette.text.secondary }}
              >
                <Badge badgeContent={4} color="error">
                  <NotificationsIcon />
                </Badge>
              </IconButton>

              {/* Settings */}
              <IconButton 
                color="inherit"
                sx={{ color: muiTheme.palette.text.secondary }}
              >
                <SettingsIcon />
              </IconButton>
            </Box>
          )}
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Header;
