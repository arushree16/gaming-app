import React from 'react';
import { Grid, Typography, Box } from '@mui/material';
import ProfileSettings from '../../components/settings/ProfileSettings';
import NotificationSettings from '../../components/settings/NotificationSettings';
import PrivacySettings from '../../components/settings/PrivacySettings';
import GamePreferences from '../../components/settings/GamePreferences';

function Settings() {
  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Settings
      </Typography>
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <ProfileSettings />
        </Grid>
        <Grid item xs={12} md={6}>
          <NotificationSettings />
        </Grid>
        <Grid item xs={12} md={6}>
          <PrivacySettings />
        </Grid>
        <Grid item xs={12} md={6}>
          <GamePreferences />
        </Grid>
      </Grid>
    </Box>
  );
}

export default Settings; 