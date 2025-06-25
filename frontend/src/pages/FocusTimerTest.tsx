import React from 'react';
import { Box, Typography, Paper } from '@mui/material';

const FocusTimerTest: React.FC = () => {
  return (
    <Box p={3}>
      <Typography variant="h4" gutterBottom>
        Focus Timer Page
      </Typography>
      <Paper elevation={2} sx={{ p: 3, mt: 2 }}>
        <Typography variant="h6">
          🎯 Focus Timer is Working!
        </Typography>
        <Typography variant="body1" sx={{ mt: 1 }}>
          This is a test to ensure the Focus Timer page is accessible.
        </Typography>
      </Paper>
    </Box>
  );
};

export default FocusTimerTest;
