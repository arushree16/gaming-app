import React, { useEffect, useState } from 'react';
import { Grid, Paper, Typography, Box } from '@mui/material';
import GamePerformanceChart from '../../components/game-analysis/GamePerformanceChart';
import GameSessionList from '../../components/game-analysis/GameSessionList';
import GameMetricsCard from '../../components/game-analysis/GameMetricsCard';
import PlayerProgressChart from '../../components/game-analysis/PlayerProgressChart';
import api from '../../services/api/axiosConfig';

function GameAnalytics() {
  const [loading, setLoading] = useState(true);
  const [gameData, setGameData] = useState(null);

  useEffect(() => {
    const fetchGameAnalytics = async () => {
      try {
        const response = await api.get('/gameAnalysis/overview');
        setGameData(response.data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching game analytics:', error);
        setLoading(false);
      }
    };

    fetchGameAnalytics();
  }, []);

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Game Analytics
      </Typography>
      <Grid container spacing={3}>
        <Grid item xs={12} lg={8}>
          <GamePerformanceChart />
        </Grid>
        <Grid item xs={12} lg={4}>
          <GameMetricsCard />
        </Grid>
        <Grid item xs={12} lg={6}>
          <PlayerProgressChart />
        </Grid>
        <Grid item xs={12} lg={6}>
          <GameSessionList />
        </Grid>
      </Grid>
    </Box>
  );
}

export default GameAnalytics; 