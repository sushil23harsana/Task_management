import React from 'react';
import { Typography, Box } from '@mui/material';

const Test: React.FC = () => {
  return (
    <Box sx={{ p: 4 }}>
      <Typography variant="h4">Test Page</Typography>
      <Typography variant="body1">This is a test page to check if Material-UI is working.</Typography>
    </Box>
  );
};

export default Test;
