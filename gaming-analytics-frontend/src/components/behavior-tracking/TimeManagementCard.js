import React, { useState, useEffect } from 'react';
import { Card, CardContent, Typography, Box, LinearProgress, Button } from '@mui/material';
import api from '../../services/api/axiosConfig';

function TimeManagementCard() {
  const [timeData, setTimeData] = useState(null);

  useEffect(() => {
    fetchTimeData();
  }, []);

  const fetchTimeData = async () => {
    try {
      const response = await api.get('/behavior/time-management');
      setTimeData(response.data);
    } catch (error) {
      console.error('Error fetching time management data:', error);
    }
  };

  const handleSetLimit = async () => {
    try {
      await api.post('/behavior/set-time-limit', {
        dailyLimit: 180 // 3 hours in minutes
      });
      fetchTimeData();
    } catch (error) {
      console.error('Error setting time limit:', error);
    }
  };

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Time Management
        </Typography>
        {timeData && (
          <>
            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle2" gutterBottom>
                Daily Gaming Time
              </Typography>
              <LinearProgress 
                variant="determinate" 
                value={(timeData.timeSpent / timeData.dailyLimit) * 100}
                color={timeData.timeSpent > timeData.dailyLimit ? "error" : "primary"}
                sx={{ height: 10, borderRadius: 5 }}
              />
              <Typography variant="caption" color="text.secondary">
                {timeData.timeSpent} / {timeData.dailyLimit} minutes
              </Typography>
            </Box>
            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle2" gutterBottom>
                Weekly Overview
              </Typography>
              {timeData.weeklyOverview.map((day, index) => (
                <Box key={index} sx={{ mb: 1 }}>
                  <Typography variant="caption">
                    {day.name}: {day.time} minutes
                  </Typography>
                  <LinearProgress 
                    variant="determinate" 
                    value={(day.time / timeData.dailyLimit) * 100}
                    sx={{ height: 5 }}
                  />
                </Box>
              ))}
            </Box>
            <Button 
              variant="outlined" 
              color="primary"
              onClick={handleSetLimit}
            >
              Adjust Time Limit
            </Button>
          </>
        )}
      </CardContent>
    </Card>
  );
}

export default TimeManagementCard; 