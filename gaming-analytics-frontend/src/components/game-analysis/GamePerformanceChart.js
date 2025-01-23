import React, { useEffect, useState } from 'react';
import { Card, CardContent, Typography, FormControl, Select, MenuItem } from '@mui/material';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import api from '../../services/api/axiosConfig';

function GamePerformanceChart() {
  const [performanceData, setPerformanceData] = useState([]);
  const [timeRange, setTimeRange] = useState('week');

  useEffect(() => {
    const fetchPerformanceData = async () => {
      try {
        const response = await api.get(`/gameAnalysis/performance?range=${timeRange}`);
        setPerformanceData(response.data);
      } catch (error) {
        console.error('Error fetching performance data:', error);
      }
    };

    fetchPerformanceData();
  }, [timeRange]);

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Performance Trends
        </Typography>
        <FormControl size="small" sx={{ mb: 2 }}>
          <Select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
          >
            <MenuItem value="day">Last 24 Hours</MenuItem>
            <MenuItem value="week">Last Week</MenuItem>
            <MenuItem value="month">Last Month</MenuItem>
          </Select>
        </FormControl>
        <ResponsiveContainer width="100%" height={400}>
          <LineChart data={performanceData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="score" stroke="#8884d8" name="Score" />
            <Line type="monotone" dataKey="accuracy" stroke="#82ca9d" name="Accuracy" />
            <Line type="monotone" dataKey="speed" stroke="#ffc658" name="Speed" />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

export default GamePerformanceChart; 