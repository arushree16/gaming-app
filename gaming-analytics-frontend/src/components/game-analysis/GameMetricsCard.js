import React, { useEffect, useState } from 'react';
import { Card, CardContent, Typography, Box, Divider } from '@mui/material';
import api from '../../services/api/axiosConfig';

function GameMetricsCard() {
  const [metrics, setMetrics] = useState(null);

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        const response = await api.get('/gameAnalysis/metrics');
        setMetrics(response.data);
      } catch (error) {
        console.error('Error fetching game metrics:', error);
      }
    };

    fetchMetrics();
  }, []);

  const MetricItem = ({ label, value, unit }) => (
    <Box sx={{ mb: 2 }}>
      <Typography variant="subtitle2" color="text.secondary">
        {label}
      </Typography>
      <Typography variant="h5">
        {value}{unit}
      </Typography>
    </Box>
  );

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Key Metrics
        </Typography>
        {metrics && (
          <>
            <MetricItem 
              label="Average Score" 
              value={metrics.averageScore} 
              unit=" pts"
            />
            <Divider sx={{ my: 2 }} />
            <MetricItem 
              label="Win Rate" 
              value={metrics.winRate} 
              unit="%"
            />
            <Divider sx={{ my: 2 }} />
            <MetricItem 
              label="Peak Performance" 
              value={metrics.peakPerformance} 
              unit=" pts"
            />
            <Divider sx={{ my: 2 }} />
            <MetricItem 
              label="Total Games" 
              value={metrics.totalGames} 
              unit=""
            />
          </>
        )}
      </CardContent>
    </Card>
  );
}

export default GameMetricsCard; 