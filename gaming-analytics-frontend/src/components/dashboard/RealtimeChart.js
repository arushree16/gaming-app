import React, { useEffect, useState } from 'react';
import { Card, CardContent, Typography } from '@mui/material';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import socketService from '../../services/socket/socketService';

function RealtimeChart() {
  const [data, setData] = useState([]);

  useEffect(() => {
    socketService.subscribeToGameUpdates((update) => {
      setData(prevData => {
        const newData = [...prevData, update];
        if (newData.length > 20) newData.shift();
        return newData;
      });
    });
  }, []);

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Real-time Performance Metrics
        </Typography>
        <ResponsiveContainer width="100%" height={400}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="timestamp" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="performance" stroke="#8884d8" />
            <Line type="monotone" dataKey="engagement" stroke="#82ca9d" />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

export default RealtimeChart; 