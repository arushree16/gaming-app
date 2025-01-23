import React, { useState, useEffect } from 'react';
import { Card, CardContent, Typography, TextField, Button, FormControl, InputLabel, Select, MenuItem } from '@mui/material';
import api from '../../services/api/axiosConfig';

function GamePreferences() {
  const [preferences, setPreferences] = useState({
    defaultGame: '',
    sessionDuration: 60,
    difficulty: 'medium',
    theme: 'dark'
  });

  useEffect(() => {
    fetchGamePreferences();
  }, []);

  const fetchGamePreferences = async () => {
    try {
      const response = await api.get('/user/game-preferences');
      setPreferences(response.data);
    } catch (error) {
      console.error('Error fetching game preferences:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.put('/user/game-preferences', preferences);
      // Show success message
    } catch (error) {
      console.error('Error updating game preferences:', error);
    }
  };

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Game Preferences
        </Typography>
        <form onSubmit={handleSubmit}>
          <TextField
            fullWidth
            label="Default Game"
            value={preferences.defaultGame}
            onChange={(e) => setPreferences({ ...preferences, defaultGame: e.target.value })}
            margin="normal"
          />
          <TextField
            fullWidth
            label="Session Duration (minutes)"
            type="number"
            value={preferences.sessionDuration}
            onChange={(e) => setPreferences({ ...preferences, sessionDuration: e.target.value })}
            margin="normal"
          />
          <FormControl fullWidth margin="normal">
            <InputLabel>Difficulty</InputLabel>
            <Select
              value={preferences.difficulty}
              onChange={(e) => setPreferences({ ...preferences, difficulty: e.target.value })}
            >
              <MenuItem value="easy">Easy</MenuItem>
              <MenuItem value="medium">Medium</MenuItem>
              <MenuItem value="hard">Hard</MenuItem>
            </Select>
          </FormControl>
          <FormControl fullWidth margin="normal">
            <InputLabel>Theme</InputLabel>
            <Select
              value={preferences.theme}
              onChange={(e) => setPreferences({ ...preferences, theme: e.target.value })}
            >
              <MenuItem value="light">Light</MenuItem>
              <MenuItem value="dark">Dark</MenuItem>
              <MenuItem value="system">System</MenuItem>
            </Select>
          </FormControl>
          <Button
            type="submit"
            variant="contained"
            color="primary"
            sx={{ mt: 2 }}
          >
            Save Preferences
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

export default GamePreferences; 