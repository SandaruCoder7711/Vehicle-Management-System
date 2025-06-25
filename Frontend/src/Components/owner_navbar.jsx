import React from 'react';
import { Box, Typography, IconButton } from '@material-ui/core';
import NotificationsIcon from '@material-ui/icons/Notifications'; 
import userAvatar from '../Images/profile.png'; 
import './header.css'; 

const Header = () => {
  return (
    <Box className="header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 20px' }}>
      <Box style={{ flex: 1, textAlign: 'center' }}>
        <Typography variant="h6">
          Owner Management Dashboard
        </Typography>
      </Box>
    </Box>
  );
};

export default Header;
