import React, { useEffect, useState } from 'react';
import { 
  Card, 
  CardContent, 
  Typography, 
  List, 
  ListItem, 
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Chip
} from '@mui/material';
import { Info } from '@mui/icons-material';
import api from '../../services/api/axiosConfig';

function GameSessionList() {
  const [sessions, setSessions] = useState([]);

  useEffect(() => {
    const fetchSessions = async () => {
      try {
        const response = await api.get('/gameAnalysis/sessions');
        setSessions(response.data);
      } catch (error) {
        console.error('Error fetching game sessions:', error);
      }
    };

    fetchSessions();
  }, []);

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Recent Gaming Sessions
        </Typography>
        <List>
          {sessions.map((session) => (
            <ListItem key={session.id}>
              <ListItemText
                primary={session.gameName}
                secondary={`Duration: ${session.duration} | Score: ${session.score}`}
              />
              <ListItemSecondaryAction>
                <Chip 
                  label={session.result} 
                  color={session.result === 'Win' ? 'success' : 'error'}
                  size="small"
                  sx={{ mr: 1 }}
                />
                <IconButton edge="end" size="small">
                  <Info />
                </IconButton>
              </ListItemSecondaryAction>
            </ListItem>
          ))}
        </List>
      </CardContent>
    </Card>
  );
}

export default GameSessionList; 