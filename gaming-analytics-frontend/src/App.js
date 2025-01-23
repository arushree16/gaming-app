import React, { useContext, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import Dashboard from './pages/Dashboard';
import GameAnalytics from './pages/GameAnalytics';
import BehaviorTracking from './pages/BehaviorTracking';
import Settings from './pages/Settings';
import Login from './pages/Login';
import Register from './pages/Register';
import Layout from './components/shared/Layout';
import { AuthContext } from './context/AuthContext'; // Import your AuthContext
import WebSocketService from './services/WebSocketService'; // Import your WebSocket service
import PrivateRoute from './components/shared/PrivateRoute';


const theme = createTheme();

function App() {
  const { user, setUser, isAuthenticated, setIsAuthenticated } = useContext(AuthContext);
  const ws = new WebSocketService(); // Initialize WebSocket connection

  useEffect(() => {
    // Attempt to authenticate on component mount (check for existing session)
    const checkAuth = async () => {
      try {
        const authData = await ws.checkAuthentication(); // Call your backend authentication check
        if (authData) {
          setUser(authData);
          setIsAuthenticated(true);
        }
      } catch (error) {
        console.error("Authentication check failed:", error);
      }
    };
    checkAuth();

    // Connect to WebSocket
    ws.connect();

    // Cleanup on unmount
    return () => ws.disconnect();
  }, [setUser, setIsAuthenticated, ws]);


  return (
    <ThemeProvider theme={theme}>
      <Router>
        <Layout>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
            <Route path="/analytics" element={<PrivateRoute><GameAnalytics /></PrivateRoute>} />
            <Route path="/behavior" element={<PrivateRoute><BehaviorTracking /></PrivateRoute>} />
            <Route path="/settings" element={<PrivateRoute><Settings /></PrivateRoute>} />
          </Routes>
        </Layout>
      </Router>
    </ThemeProvider>
  );
}

export default App;
