import React, { useState, useEffect } from 'react';
import { Card, CardContent, Typography, TextField, Button, Avatar, Box } from '@mui/material';
import { PhotoCamera } from '@mui/icons-material';
import api from '../../services/api/axiosConfig';

function ProfileSettings() {
  const [profile, setProfile] = useState({
    username: '',
    email: '',
    bio: '',
    avatar: ''
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await api.get('/user/profile');
      setProfile(response.data);
    } catch (error) {
      console.error('Error fetching profile:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.put('/user/profile', profile);
      // Show success message
    } catch (error) {
      console.error('Error updating profile:', error);
    }
  };

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Profile Settings
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <Avatar
            src={profile.avatar}
            sx={{ width: 80, height: 80, mr: 2 }}
          />
          <Button
            variant="outlined"
            startIcon={<PhotoCamera />}
            component="label"
          >
            Upload Photo
            <input type="file" hidden accept="image/*" />
          </Button>
        </Box>
        <form onSubmit={handleSubmit}>
          <TextField
            fullWidth
            label="Username"
            value={profile.username}
            onChange={(e) => setProfile({ ...profile, username: e.target.value })}
            margin="normal"
          />
          <TextField
            fullWidth
            label="Email"
            type="email"
            value={profile.email}
            onChange={(e) => setProfile({ ...profile, email: e.target.value })}
            margin="normal"
          />
          <TextField
            fullWidth
            label="Bio"
            multiline
            rows={4}
            value={profile.bio}
            onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
            margin="normal"
          />
          <Button
            type="submit"
            variant="contained"
            color="primary"
            sx={{ mt: 2 }}
          >
            Save Changes
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

export default ProfileSettings; 