import React, { useEffect, useState } from 'react';
import { Grid, Paper, Typography } from '@mui/material';
import { useDispatch, useSelector } from 'react-redux';
import socketService from '../../services/socket/socketService';
import ActiveGamesCard from '../../components/dashboard/ActiveGamesCard';
import PlayerStatsCard from '../../components/dashboard/PlayerStatsCard';
import RealtimeChart from '../../components/dashboard/RealtimeChart';
import BehaviorSummary from '../../components/dashboard/BehaviorSummary';

function Dashboard() {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);

  useEffect(() => {
    socketService.connect(localStorage.getItem('token'));
    return () => socketService.disconnect();
  }, []);

  return (
    <Grid container spacing={3}>
      <Grid item xs={12} md={6} lg={3}>
        <ActiveGamesCard />
      </Grid>
      <Grid item xs={12} md={6} lg={3}>
        <PlayerStatsCard />
      </Grid>
      <Grid item xs={12} lg={6}>
        <BehaviorSummary />
      </Grid>
      <Grid item xs={12}>
        <RealtimeChart />
      </Grid>
    </Grid>
  );
}

export default Dashboard; 