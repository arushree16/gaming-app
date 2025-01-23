import React, { useEffect, useState } from 'react';
import { Grid, Typography, Box } from '@mui/material';
import MoodTracker from '../../components/behavior-tracking/MoodTracker';
import BehaviorTimeline from '../../components/behavior-tracking/BehaviorTimeline';
import AlertsCard from '../../components/behavior-tracking/AlertsCard';
import TimeManagementCard from '../../components/behavior-tracking/TimeManagementCard';
import api from '../../services/api/axiosConfig';

function BehaviorTracking() {
  const [behaviorData, setBehaviorData] = useState(null);

  useEffect(() => {
    const fetchBehaviorData = async () => {
      try {
        const response = await api.get('/behavior/overview');
        setBehaviorData(response.data);
      } catch (error) {
        console.error('Error fetching behavior data:', error);
      }
    };

    fetchBehaviorData();
  }, []);

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Behavior Tracking
      </Typography>
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <MoodTracker />
        </Grid>
        <Grid item xs={12} md={6}>
          <TimeManagementCard />
        </Grid>
        <Grid item xs={12}>
          <BehaviorTimeline />
        </Grid>
        <Grid item xs={12} md={6}>
          <AlertsCard />
        </Grid>
      </Grid>
    </Box>
  );
}

export default BehaviorTracking; 