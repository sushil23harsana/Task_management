import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  ButtonGroup,
  Card,
  CardContent,
  Avatar,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Chip,
  CircularProgress,
  Paper,
} from '@mui/material';
import {
  EmojiEvents,
  WorkspacePremium,
  TrendingUp,
  People,
  Assignment,
  LocalFireDepartment,
} from '@mui/icons-material';
import { analyticsService } from '../services/analytics.ts';

interface LeaderboardUser {
  id: number;
  username: string;
  first_name: string;
  last_name: string;
  score: number;
  tasks_completed: number;
  streak_days: number;
  rank: number;
}

interface UserRank {
  rank: number;
  score: number;
  tasks_completed: number;
  streak_days: number;
}

const Leaderboard: React.FC = () => {
  const [leaderboard, setLeaderboard] = useState<LeaderboardUser[]>([]);
  const [userRank, setUserRank] = useState<UserRank | null>(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState('week');

  useEffect(() => {
    fetchLeaderboard();
  }, [period]);

  const fetchLeaderboard = async () => {
    try {
      setLoading(true);
      // Note: This endpoint might not exist yet in the backend
      // For now, we'll create mock data that matches the expected structure
      const mockData = {
        leaderboard: [
          {
            id: 1,
            username: 'ProductivePro',
            first_name: 'John',
            last_name: 'Doe',
            score: 850,
            tasks_completed: 45,
            streak_days: 12,
            rank: 1
          },
          {
            id: 2,
            username: 'TaskMaster',
            first_name: 'Jane',
            last_name: 'Smith',
            score: 720,
            tasks_completed: 38,
            streak_days: 8,
            rank: 2
          },
          {
            id: 3,
            username: 'EfficiencyExpert',
            first_name: 'Mike',
            last_name: 'Johnson',
            score: 680,
            tasks_completed: 32,
            streak_days: 15,
            rank: 3
          },
          {
            id: 4,
            username: 'TimeWarrior',
            first_name: 'Sarah',
            last_name: 'Wilson',
            score: 620,
            tasks_completed: 28,
            streak_days: 6,
            rank: 4
          },
          {
            id: 5,
            username: 'GoalGetter',
            first_name: 'David',
            last_name: 'Brown',
            score: 580,
            tasks_completed: 25,
            streak_days: 9,
            rank: 5
          }
        ],
        user_rank: {
          rank: 8,
          score: 420,
          tasks_completed: 18,
          streak_days: 3
        }
      };
      
      setLeaderboard(mockData.leaderboard);
      setUserRank(mockData.user_rank);
    } catch (error) {
      console.error('Failed to fetch leaderboard:', error);
    } finally {
      setLoading(false);
    }
  };
  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <EmojiEvents sx={{ color: '#FFD700', fontSize: 32 }} />;
      case 2:
        return <WorkspacePremium sx={{ color: '#C0C0C0', fontSize: 32 }} />;
      case 3:
        return <WorkspacePremium sx={{ color: '#CD7F32', fontSize: 32 }} />;
      default:
        return (
          <Avatar sx={{ bgcolor: 'primary.main', width: 32, height: 32 }}>
            <Typography variant="body2" fontWeight="bold">
              {rank}
            </Typography>
          </Avatar>
        );
    }
  };

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName?.charAt(0) || ''}${lastName?.charAt(0) || ''}`.toUpperCase();
  };
  if (loading) {
    return (
      <Box p={3} display="flex" justifyContent="center">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box p={3}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Box>
          <Typography variant="h4" fontWeight="bold" gutterBottom>
            Leaderboard
          </Typography>
          <Typography variant="body1" color="text.secondary">
            See how you stack up against other productive users
          </Typography>
        </Box>
        
        <ButtonGroup>
          {['week', 'month', 'all-time'].map((option) => (
            <Button
              key={option}
              variant={period === option ? 'contained' : 'outlined'}
              onClick={() => setPeriod(option)}
            >
              {option.charAt(0).toUpperCase() + option.slice(1).replace('-', ' ')}
            </Button>
          ))}
        </ButtonGroup>
      </Box>

      {/* User's Current Rank */}
      {userRank && (
        <Card sx={{ mb: 3, background: 'linear-gradient(45deg, #3f51b5, #9c27b0)' }}>
          <CardContent>
            <Box display="flex" justifyContent="space-between" alignItems="center">
              <Box color="white">
                <Typography variant="h6" color="inherit" gutterBottom>
                  Your Current Rank
                </Typography>
                <Box display="flex" alignItems="center" gap={2}>
                  <Typography variant="h3" fontWeight="bold" color="inherit">
                    #{userRank.rank}
                  </Typography>
                  <Box>
                    <Typography variant="body2" color="inherit" sx={{ opacity: 0.9 }}>
                      {userRank.score} points
                    </Typography>
                    <Typography variant="body2" color="inherit" sx={{ opacity: 0.9 }}>
                      {userRank.tasks_completed} tasks completed
                    </Typography>
                  </Box>
                </Box>
              </Box>
              <Box textAlign="right" color="white">
                <Typography variant="body2" color="inherit" sx={{ opacity: 0.9 }}>
                  Current Streak
                </Typography>
                <Typography variant="h4" fontWeight="bold" color="inherit">
                  {userRank.streak_days} days
                </Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>
      )}

      {/* Top Performers */}
      <Card>
        <CardContent>
          <Box display="flex" alignItems="center" mb={2}>
            <People sx={{ mr: 1 }} />
            <Typography variant="h6">Top Performers</Typography>
          </Box>

          <List>
            {leaderboard.map((user, index) => (
              <ListItem key={user.id} divider={index < leaderboard.length - 1}>
                <ListItemAvatar>
                  {getRankIcon(user.rank)}
                </ListItemAvatar>
                
                <Box display="flex" alignItems="center" flexGrow={1} ml={2}>
                  <Avatar sx={{ bgcolor: 'primary.light', mr: 2 }}>
                    {getInitials(user.first_name, user.last_name)}
                  </Avatar>
                  <Box>
                    <Typography variant="subtitle1" fontWeight="medium">
                      {user.first_name} {user.last_name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      @{user.username}
                    </Typography>
                  </Box>
                </Box>

                <Box display="flex" gap={3} alignItems="center">
                  <Box textAlign="center">
                    <Typography variant="h6" fontWeight="bold">
                      {user.score}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Points
                    </Typography>
                  </Box>
                  
                  <Box textAlign="center" display="flex" alignItems="center">
                    <Assignment sx={{ fontSize: 16, mr: 0.5 }} />
                    <Box>
                      <Typography variant="h6" fontWeight="bold">
                        {user.tasks_completed}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Tasks
                      </Typography>
                    </Box>
                  </Box>
                  
                  <Box textAlign="center" display="flex" alignItems="center">
                    <TrendingUp sx={{ fontSize: 16, mr: 0.5 }} />
                    <Box>
                      <Typography variant="h6" fontWeight="bold">
                        {user.streak_days}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Streak
                      </Typography>
                    </Box>
                  </Box>
                </Box>
              </ListItem>
            ))}
          </List>
        </CardContent>
      </Card>

      {/* Achievement Badges Section */}
      <Card sx={{ mt: 3 }}>
        <CardContent>          <Typography variant="h6" gutterBottom>
            Achievement Badges
          </Typography>
          <Box display="flex" flexWrap="wrap" gap={2}>
            {[
              { name: 'Task Master', description: 'Complete 100 tasks', icon: '🏆', earned: true },
              { name: 'Streak Hero', description: '30-day streak', icon: '🔥', earned: false },
              { name: 'Early Bird', description: 'Complete tasks before 9 AM', icon: '🌅', earned: true },
              { name: 'Night Owl', description: 'Complete tasks after 10 PM', icon: '🌙', earned: false },
              { name: 'Productivity Pro', description: 'Maintain 90% completion rate', icon: '⚡', earned: true },
              { name: 'Team Player', description: 'Share 10 impact updates', icon: '🤝', earned: false }
            ].map((badge, index) => (
              <Paper
                key={index}
                sx={{
                  p: 2,
                  textAlign: 'center',
                  bgcolor: badge.earned ? 'success.light' : 'grey.100',
                  opacity: badge.earned ? 1 : 0.7,
                  minWidth: 150,
                  flex: '1 1 150px',
                }}
              >
                <Typography variant="h4" mb={1}>
                  {badge.icon}
                </Typography>
                <Typography
                  variant="subtitle2"
                  fontWeight="medium"
                  color={badge.earned ? 'success.dark' : 'text.secondary'}
                >
                  {badge.name}
                </Typography>
                <Typography
                  variant="caption"
                  color={badge.earned ? 'success.main' : 'text.secondary'}
                  display="block"
                >
                  {badge.description}
                </Typography>
              </Paper>
            ))}
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};

export default Leaderboard;
