import React, { useEffect, useState } from 'react';
import { Card, CardContent, Typography } from '@mui/material';
import { SportsEsports, Warning, Mood, AccessTime } from '@mui/icons-material';
import api from '../../services/api/axiosConfig';
import { Timeline, TimelineItem, TimelineSeparator, TimelineDot, TimelineConnector, TimelineContent } from '@mui/lab';

function BehaviorTimeline() {
  const [events, setEvents] = useState([]);

  useEffect(() => {
    const fetchBehaviorEvents = async () => {
      try {
        const response = await api.get('/behavior/timeline');
        setEvents(response.data);
      } catch (error) {
        console.error('Error fetching behavior timeline:', error);
      }
    };

    fetchBehaviorEvents();
  }, []);

  const getEventIcon = (type) => {
    switch (type) {
      case 'gaming':
        return <SportsEsports />;
      case 'warning':
        return <Warning />;
      case 'mood':
        return <Mood />;
      default:
        return <AccessTime />;
    }
  };

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Behavior Timeline
        </Typography>
        <Timeline>
          {events.map((event, index) => (
            <TimelineItem key={index}>
              <TimelineSeparator>
                <TimelineDot color={event.type === 'warning' ? 'error' : 'primary'}>
                  {getEventIcon(event.type)}
                </TimelineDot>
                {index < events.length - 1 && <TimelineConnector />}
              </TimelineSeparator>
              <TimelineContent>
                <Typography variant="subtitle2">{event.title}</Typography>
                <Typography variant="body2" color="text.secondary">
                  {event.description}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {event.timestamp}
                </Typography>
              </TimelineContent>
            </TimelineItem>
          ))}
        </Timeline>
      </CardContent>
    </Card>
  );
}

export default BehaviorTimeline; 