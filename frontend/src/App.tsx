import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import CssBaseline from '@mui/material/CssBaseline';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider as CustomThemeProvider, useCustomTheme } from './context/ThemeContext';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import Dashboard from './pages/Dashboard';
import Analytics from './pages/Analytics';
import Calendar from './pages/Calendar';
import FocusTimer from './pages/FocusTimer';
import Login from './pages/Login';
import Register from './pages/Register';
import Test from './pages/Test';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
      retry: 1,
    },
  },
});

// Component that provides Material-UI theme based on dark mode state
const MaterialUIThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isDarkMode } = useCustomTheme();
  
  const theme = createTheme({
    palette: {
      mode: isDarkMode ? 'dark' : 'light',
      primary: {
        main: '#3f51b5',
      },
      secondary: {
        main: '#f50057',
      },
      background: {
        default: isDarkMode ? '#121212' : '#fafafa',
        paper: isDarkMode ? '#1e1e1e' : '#ffffff',
      },
    },
    components: {
      MuiCssBaseline: {
        styleOverrides: {
          body: {
            transition: 'background-color 0.3s ease, color 0.3s ease',
          },
        },
      },
    },
  });

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      {children}
    </ThemeProvider>
  );
};

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <CustomThemeProvider>
        <AuthProvider>
          <MaterialUIThemeProvider>
            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <Router>
                <Routes>
                  <Route path="/login" element={<Login />} />
                  <Route path="/register" element={<Register />} />
                  <Route path="/test" element={<Test />} />
                  <Route path="/" element={
                    <ProtectedRoute>
                      <Layout />
                    </ProtectedRoute>
                  }>
                    <Route index element={<Navigate to="/dashboard" replace />} />
                    <Route path="dashboard" element={<Dashboard />} />
                    <Route path="analytics" element={<Analytics />} />
                    <Route path="calendar" element={<Calendar />} />
                    <Route path="focus-timer" element={<FocusTimer />} />
                  </Route>
                </Routes>
              </Router>
            </LocalizationProvider>
          </MaterialUIThemeProvider>
        </AuthProvider>
      </CustomThemeProvider>
    </QueryClientProvider>
  );
}

export default App
