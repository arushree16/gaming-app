import React, { useEffect, useState } from 'react';
import { Card, CardContent, Typography, List, ListItem, ListItemIcon, ListItemText, Chip } from '@mui/material';
import { Warning, Info, CheckCircle } from '@mui/icons-material';
import api from '../../services/api/axiosConfig';

function AlertsCard() {
  const [alerts, setAlerts] = useState([]);

  useEffect(() => {
    const fetchAlerts = async () => {
      try {
        const response = await api.get('/behavior/alerts');
        setAlerts(response.data);
      } catch (error) {
        console.error('Error fetching alerts:', error);
      }
    };

    fetchAlerts();
  }, []);

  const getAlertIcon = (severity) => {
    switch (severity) {
      case 'high':
        return <Warning color="error" />;
      case 'medium':
        return <Info color="warning" />;
      case 'low':
        return <CheckCircle color="success" />;
      default:
        return <Info />;
    }
  };

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Behavior Alerts
        </Typography>
        <List>
          {alerts.map((alert, index) => (
            <ListItem key={index}>
              <ListItemIcon>
                {getAlertIcon(alert.severity)}
              </ListItemIcon>
              <ListItemText
                primary={alert.title}
                secondary={alert.description}
              />
              <Chip
                label={alert.severity}
                color={
                  alert.severity === 'high' ? 'error' :
                  alert.severity === 'medium' ? 'warning' : 'success'
                }
                size="small"
              />
            </ListItem>
          ))}
        </List>
      </CardContent>
    </Card>
  );
}

export default AlertsCard; 