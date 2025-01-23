import React, { useEffect, useState } from 'react';
import { Card, CardContent, Typography } from '@mui/material';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import api from '../../services/api/axiosConfig';

function PlayerProgressChart() {
  const [progressData, setProgressData] = useState([]);

  useEffect(() => {
    const fetchProgressData = async () => {
      try {
        const response = await api.get('/gameAnalysis/progress');
        setProgressData(response.data);
      } catch (error) {
        console.error('Error fetching progress data:', error);
      }
    };

    fetchProgressData();
  }, []);

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Player Progress
        </Typography>
        <ResponsiveContainer width="100%" height={400}>
          <AreaChart data={progressData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Area 
              type="monotone" 
              dataKey="skillLevel" 
              stroke="#8884d8" 
              fill="#8884d8" 
              fillOpacity={0.3}
            />
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

export default PlayerProgressChart; 