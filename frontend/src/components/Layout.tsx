import React from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import {
  Box,
  AppBar,
  Toolbar,
  Typography,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  CssBaseline,
  Avatar,
  Button,
} from '@mui/material';
import {
  Dashboard,
  Analytics,
  CalendarMonth,
  Timer,
  Settings,
  Logout,
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';

const drawerWidth = 240;

const Layout: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const menuItems = [
    { text: 'Dashboard', icon: <Dashboard />, path: '/dashboard' },
    { text: 'Focus Timer', icon: <Timer />, path: '/focus-timer' },
    { text: 'Analytics', icon: <Analytics />, path: '/analytics' },
    { text: 'Calendar', icon: <CalendarMonth />, path: '/calendar' },
  ];

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />
      
      {/* App Bar */}
      <AppBar
        position="fixed"
        sx={{
          width: `calc(100% - ${drawerWidth}px)`,
          ml: `${drawerWidth}px`,
        }}
      >
        <Toolbar>
          <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
            BetterTasks
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Avatar sx={{ width: 32, height: 32 }}>
              {user?.first_name?.[0]}{user?.last_name?.[0]}
            </Avatar>
            <Typography variant="body2">
              {user?.first_name} {user?.last_name}
            </Typography>
            <Button color="inherit" onClick={handleLogout} startIcon={<Logout />}>
              Logout
            </Button>
          </Box>
        </Toolbar>
      </AppBar>

      {/* Drawer */}
      <Drawer
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: drawerWidth,
            boxSizing: 'border-box',
          },
        }}
        variant="permanent"
        anchor="left"
      >
        <Toolbar>
          <Typography variant="h6" noWrap component="div">
            BetterTasks
          </Typography>
        </Toolbar>
        
        <Box sx={{ overflow: 'auto' }}>
          <List>
            {menuItems.map((item) => (
              <ListItem key={item.text} disablePadding>
                <ListItemButton
                  selected={location.pathname === item.path}
                  onClick={() => navigate(item.path)}
                >
                  <ListItemIcon>
                    {item.icon}
                  </ListItemIcon>
                  <ListItemText primary={item.text} />
                </ListItemButton>
              </ListItem>
            ))}
          </List>
        </Box>
      </Drawer>

      {/* Main content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          bgcolor: 'background.default',
          p: 3,
        }}
      >
        <Toolbar />
        <Outlet />
      </Box>
    </Box>
  );
};

export default Layout;
