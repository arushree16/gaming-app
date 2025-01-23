import React, { useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import WebSocketService from '../services/WebSocketService';

const YourComponent = () => {
  const authContext = useContext(AuthContext);
  console.log("AuthContext:", authContext); // Debugging line

  const { user, isAuthenticated } = authContext || {};

  useEffect(() => {
    const ws = new WebSocketService();
    ws.connect();

    return () => {
      ws.disconnect();
    };
  }, []); // Empty dependency array to run only on mount

  return (
    <div>
      {isAuthenticated ? <p>Welcome, {user.name}</p> : <p>Please log in.</p>}
    </div>
  );
};

export default YourComponent; 