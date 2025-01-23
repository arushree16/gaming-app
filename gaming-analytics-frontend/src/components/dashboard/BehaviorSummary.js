import React, { useEffect, useState } from 'react';
import { Card, CardContent, Typography, Box, Chip } from '@mui/material';
import api from '../../services/api/axiosConfig';
import socketService from '../../services/socket/socketService';

function BehaviorSummary() {
  const [behavior, setBehavior] = useState(null);

  useEffect(() => {
    const fetchBehaviorData = async () => {
      try {
        const response = await api.get('/behavior/summary');
        setBehavior(response.data);
      } catch (error) {
        console.error('Error fetching behavior data:', error);
      }
    };

    fetchBehaviorData();
    socketService.subscribeToBehaviorUpdates((data) => {
      setBehavior(data);
    });
  }, []);

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Behavior Analysis
        </Typography>
        {behavior && (
          <>
            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle2" color="text.secondary">
                Current Mood
              </Typography>
              <Chip 
                label={behavior.currentMood}
                color={behavior.currentMood === 'Positive' ? 'success' : 'warning'}
              />
            </Box>
            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle2" color="text.secondary">
                Stress Level
              </Typography>
              <Typography variant="body1">
                {behavior.stressLevel}/10
              </Typography>
            </Box>
            <Box>
              <Typography variant="subtitle2" color="text.secondary">
                Recommendations
              </Typography>
              <Typography variant="body1">
                {behavior.recommendation}
              </Typography>
            </Box>
          </>
        )}
      </CardContent>
    </Card>
  );
}

export default BehaviorSummary; 