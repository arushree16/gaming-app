import React, { useEffect, useState } from 'react';
import { Card, CardContent, Typography, Box, LinearProgress } from '@mui/material';
import api from '../../services/api/axiosConfig';

function PlayerStatsCard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await api.get('/gameAnalysis/player-stats');
        setStats(response.data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching player stats:', error);
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) return <LinearProgress />;

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Player Statistics
        </Typography>
        <Box sx={{ mt: 2 }}>
          <Typography variant="body2" color="text.secondary">
            Total Play Time
          </Typography>
          <Typography variant="h4">
            {stats?.totalPlayTime || '0h'}
          </Typography>
        </Box>
        <Box sx={{ mt: 2 }}>
          <Typography variant="body2" color="text.secondary">
            Average Session Duration
          </Typography>
          <Typography variant="h4">
            {stats?.avgSessionDuration || '0m'}
          </Typography>
        </Box>
        <Box sx={{ mt: 2 }}>
          <Typography variant="body2" color="text.secondary">
            Games Played Today
          </Typography>
          <Typography variant="h4">
            {stats?.gamesPlayedToday || 0}
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );
}

export default PlayerStatsCard; 