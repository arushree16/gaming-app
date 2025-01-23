import React, { useState, useEffect } from 'react';
import { Card, CardContent, Typography, FormGroup, FormControlLabel, Switch, Button, Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material';
import api from '../../services/api/axiosConfig';

function PrivacySettings() {
  const [privacy, setPrivacy] = useState({
    profilePublic: true,
    showGameHistory: true,
    showBehaviorData: false,
    allowDataCollection: true
  });
  const [openDialog, setOpenDialog] = useState(false);

  useEffect(() => {
    fetchPrivacySettings();
  }, []);

  const fetchPrivacySettings = async () => {
    try {
      const response = await api.get('/user/privacy-settings');
      setPrivacy(response.data);
    } catch (error) {
      console.error('Error fetching privacy settings:', error);
    }
  };

  const handleToggle = async (setting) => {
    try {
      const newSettings = { ...privacy, [setting]: !privacy[setting] };
      await api.put('/user/privacy-settings', { [setting]: !privacy[setting] });
      setPrivacy(newSettings);
    } catch (error) {
      console.error('Error updating privacy settings:', error);
    }
  };

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Privacy Settings
        </Typography>
        <FormGroup>
          <FormControlLabel
            control={
              <Switch
                checked={privacy.profilePublic}
                onChange={() => handleToggle('profilePublic')}
              />
            }
            label="Public Profile"
          />
          <FormControlLabel
            control={
              <Switch
                checked={privacy.showGameHistory}
                onChange={() => handleToggle('showGameHistory')}
              />
            }
            label="Show Game History"
          />
          <FormControlLabel
            control={
              <Switch
                checked={privacy.showBehaviorData}
                onChange={() => handleToggle('showBehaviorData')}
              />
            }
            label="Share Behavior Data"
          />
          <FormControlLabel
            control={
              <Switch
                checked={privacy.allowDataCollection}
                onChange={() => handleToggle('allowDataCollection')}
              />
            }
            label="Allow Data Collection"
          />
        </FormGroup>
        <Button
          color="secondary"
          onClick={() => setOpenDialog(true)}
          sx={{ mt: 2 }}
        >
          Delete Account
        </Button>
        <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
          <DialogTitle>Delete Account</DialogTitle>
          <DialogContent>
            Are you sure you want to delete your account? This action cannot be undone.
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
            <Button color="error" onClick={() => setOpenDialog(false)}>
              Delete
            </Button>
          </DialogActions>
        </Dialog>
      </CardContent>
    </Card>
  );
}

export default PrivacySettings; 