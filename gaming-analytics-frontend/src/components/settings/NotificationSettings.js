import React, { useState, useEffect } from 'react';
import { Card, CardContent, Typography, Switch, List, ListItem, ListItemText, ListItemSecondaryAction } from '@mui/material';
import api from '../../services/api/axiosConfig';

function NotificationSettings() {
  const [settings, setSettings] = useState({
    emailNotifications: true,
    pushNotifications: true,
    gameAlerts: true,
    behaviorAlerts: true,
    weeklyReport: true,
    achievementAlerts: true
  });

  useEffect(() => {
    fetchNotificationSettings();
  }, []);

  const fetchNotificationSettings = async () => {
    try {
      const response = await api.get('/user/notification-settings');
      setSettings(response.data);
    } catch (error) {
      console.error('Error fetching notification settings:', error);
    }
  };

  const handleToggle = async (setting) => {
    try {
      const newSettings = { ...settings, [setting]: !settings[setting] };
      await api.put('/user/notification-settings', { [setting]: !settings[setting] });
      setSettings(newSettings);
    } catch (error) {
      console.error('Error updating notification settings:', error);
    }
  };

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Notification Settings
        </Typography>
        <List>
          {Object.entries(settings).map(([key, value]) => (
            <ListItem key={key}>
              <ListItemText
                primary={key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
              />
              <ListItemSecondaryAction>
                <Switch
                  edge="end"
                  checked={value}
                  onChange={() => handleToggle(key)}
                />
              </ListItemSecondaryAction>
            </ListItem>
          ))}
        </List>
      </CardContent>
    </Card>
  );
}

export default NotificationSettings; 