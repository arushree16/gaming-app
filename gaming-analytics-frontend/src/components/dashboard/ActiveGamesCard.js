import React, { useEffect, useState } from 'react';
import { Card, CardContent, Typography, List, ListItem, ListItemText, CircularProgress } from '@mui/material';
import api from '../../services/api/axiosConfig';
import socketService from '../../services/socket/socketService';

function ActiveGamesCard() {
  const [activeGames, setActiveGames] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchActiveGames = async () => {
      try {
        const response = await api.get('/gameAnalysis/active');
        setActiveGames(response.data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching active games:', error);
        setLoading(false);
      }
    };

    fetchActiveGames();
    socketService.subscribeToGameUpdates((data) => {
      setActiveGames(data.activeGames);
    });
  }, []);

  if (loading) return <CircularProgress />;

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Active Gaming Sessions
        </Typography>
        <List>
          {activeGames.map((game) => (
            <ListItem key={game.id}>
              <ListItemText
                primary={game.title}
                secondary={`Duration: ${game.duration} | Player: ${game.playerName}`}
              />
            </ListItem>
          ))}
        </List>
      </CardContent>
    </Card>
  );
}

export default ActiveGamesCard; 