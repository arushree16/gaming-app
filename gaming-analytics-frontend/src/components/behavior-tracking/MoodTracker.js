import React, { useState, useEffect } from 'react';
import { Card, CardContent, Typography, Box, Button, Rating } from '@mui/material';
import { SentimentVeryDissatisfied, SentimentDissatisfied, SentimentNeutral, SentimentSatisfied, SentimentVerySatisfied } from '@mui/icons-material';
import api from '../../services/api/axiosConfig';

const customIcons = {
  1: { icon: <SentimentVeryDissatisfied />, label: 'Very Unhappy' },
  2: { icon: <SentimentDissatisfied />, label: 'Unhappy' },
  3: { icon: <SentimentNeutral />, label: 'Neutral' },
  4: { icon: <SentimentSatisfied />, label: 'Happy' },
  5: { icon: <SentimentVerySatisfied />, label: 'Very Happy' },
};

function MoodTracker() {
  const [mood, setMood] = useState(3);
  const [moodHistory, setMoodHistory] = useState([]);

  useEffect(() => {
    fetchMoodHistory();
  }, []);

  const fetchMoodHistory = async () => {
    try {
      const response = await api.get('/behavior/mood-history');
      setMoodHistory(response.data);
    } catch (error) {
      console.error('Error fetching mood history:', error);
    }
  };

  const handleMoodSubmit = async () => {
    try {
      await api.post('/behavior/mood', { mood });
      fetchMoodHistory();
    } catch (error) {
      console.error('Error submitting mood:', error);
    }
  };

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Mood Tracker
        </Typography>
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', my: 2 }}>
          <Rating
            name="mood-rating"
            value={mood}
            onChange={(event, newValue) => {
              setMood(newValue);
            }}
            max={5}
            icon={customIcons[5].icon}
            emptyIcon={customIcons[1].icon}
          />
          <Button 
            variant="contained" 
            color="primary" 
            onClick={handleMoodSubmit}
            sx={{ mt: 2 }}
          >
            Log Mood
          </Button>
        </Box>
        <Typography variant="subtitle2" gutterBottom>
          Recent Mood History
        </Typography>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
          {moodHistory.slice(-5).map((entry, index) => (
            <Box key={index} sx={{ textAlign: 'center' }}>
              {customIcons[entry.mood].icon}
              <Typography variant="caption" display="block">
                {entry.timestamp}
              </Typography>
            </Box>
          ))}
        </Box>
      </CardContent>
    </Card>
  );
}

export default MoodTracker; 