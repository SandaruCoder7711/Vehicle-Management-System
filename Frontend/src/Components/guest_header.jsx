import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  IconButton, 
  Menu, 
  MenuItem, 
  Avatar,
  Divider,
  ListItemIcon
} from '@material-ui/core';
import SearchIcon from '@material-ui/icons/Search';
import DashboardIcon from '@material-ui/icons/Dashboard';
import AccountCircleIcon from '@material-ui/icons/AccountCircle';
import DirectionsCarIcon from '@material-ui/icons/DirectionsCar';
import ExitToAppIcon from '@material-ui/icons/ExitToApp';
import { Link, useNavigate } from 'react-router-dom'; 
import './guest_header.css';

const Header = () => {
  const [anchorEl, setAnchorEl] = useState(null);
  const [firstName, setFirstName] = useState('Admin');
  const [isAdmin, setIsAdmin] = useState(false);
  const token = localStorage.getItem('token'); 
  const navigate = useNavigate(); 

  // In the Header component's useEffect
  useEffect(() => {
    const storedUsername = localStorage.getItem('username');
    const storedRole = localStorage.getItem('role');
    
    if (storedUsername) {
      setFirstName(storedUsername);
      setIsAdmin(storedRole === 'admin');
    } else if (token) {
      // Only make API call for regular users (not admin)
      if (token !== "admin-token") {
        const fetchUserData = async () => {
          try {
            const response = await fetch('http://localhost:3002/user-data', {
              headers: { Authorization: `Bearer ${token}` },
            });
            const data = await response.json();

            if (response.ok) {
              setFirstName(data.firstName);
              setIsAdmin(data.role === 'admin');
              localStorage.setItem('username', data.firstName);
              localStorage.setItem('role', data.role);
            }
          } catch (error) {
            console.error('Error fetching user data:', error);
          }
        };
        fetchUserData();
      } else {
        // Handle admin case
        setFirstName("Admin");
        setIsAdmin(true);
      }
    }
  }, [token]);

  const handleProfileClick = (event) => setAnchorEl(event.currentTarget);
  const handleClose = () => setAnchorEl(null);
  
  const handleLogout = () => {
    localStorage.removeItem('token'); 
    localStorage.removeItem('username');
    localStorage.removeItem('role');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('userId');
    setFirstName('Admin');
    setIsAdmin(false);
    handleClose();
    navigate('/login'); 
  };

  return (
    <Box className="header-container">
      <Box className="guest_header">
        <Box className="contact-section">
          <Typography variant="body1">
            Call Now: <br />
            0717901354 / 0703399599
          </Typography>
        </Box>

        <Box className="logo-section">
          <Link to="/">
            <img 
              src="https://media.istockphoto.com/id/1408605259/vector/auto-sports-vehicle-silhouette.jpg?s=612x612&w=0&k=20&c=--lwIV-ayDVrjistgR22-B9xFic1xsAusMxxzu6Mjhw=" 
              alt="Logo" 
              className="logo" 
            />
          </Link>
        </Box>

        <Box className="icon-section">
          <IconButton color="inherit">
            <SearchIcon />
          </IconButton>

          {/* User Profile Section */}
          <Box display="flex" alignItems="center">
            <Typography variant="body1" style={{ marginLeft: '8px', color: '#fff' }}>
              Hi, {firstName}
            </Typography>
            <IconButton 
              color="inherit" 
              onClick={handleProfileClick}
              style={{ marginLeft: '4px' }}
            >
              <Avatar 
                src="https://www.w3schools.com/howto/img_avatar.png" 
                alt="User Avatar" 
                style={{ width: 40, height: 40 }}
              />
            </IconButton>
          </Box>

          {/* Profile Dropdown Menu */}
          <Menu
            anchorEl={anchorEl}
            keepMounted
            open={Boolean(anchorEl)}
            onClose={handleClose}
            getContentAnchorEl={null}
            anchorOrigin={{
              vertical: 'bottom',
              horizontal: 'right',
            }}
            transformOrigin={{
              vertical: 'top',
              horizontal: 'right',
            }}
            PaperProps={{
              style: {
                width: 200,
                padding: '8px 0',
                marginTop: '8px',
                boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.15)',
                borderRadius: '8px',
              },
            }}
          >
            {token ? (
              <>
                {isAdmin && (
                  <MenuItem 
                    onClick={() => {
                      navigate('/main-dashboard');
                      handleClose();
                    }}
                    style={{ padding: '8px 16px' }}
                  >
                    <ListItemIcon>
                      <DashboardIcon fontSize="small" />
                    </ListItemIcon>
                    <Typography variant="body1">Dashboard</Typography>
                  </MenuItem>
                )}
                
                {!isAdmin && (
                  <>
                    <MenuItem 
                      onClick={() => {
                        navigate('/profile');
                        handleClose();
                      }}
                      style={{ padding: '8px 16px' }}
                    >
                      <ListItemIcon>
                        <AccountCircleIcon fontSize="small" />
                      </ListItemIcon>
                      <Typography variant="body1">Manage Profile</Typography>
                    </MenuItem>
                    
                    <MenuItem 
                      onClick={() => {
                        navigate('/my-vehicles');
                        handleClose();
                      }}
                      style={{ padding: '8px 16px' }}
                    >
                      <ListItemIcon>
                        <DirectionsCarIcon fontSize="small" />
                      </ListItemIcon>
                      <Typography variant="body1">My Vehicles</Typography>
                    </MenuItem>
                  </>
                )}
                
                <Divider style={{ margin: '4px 0' }} />
                
                <MenuItem 
                  onClick={handleLogout}
                  style={{ padding: '8px 16px' }}
                >
                  <ListItemIcon>
                    <ExitToAppIcon fontSize="small" />
                  </ListItemIcon>
                  <Typography variant="body1">Logout</Typography>
                </MenuItem>
              </>
            ) : (
              <MenuItem 
                onClick={() => {
                  navigate('/login');
                  handleClose();
                }}
                style={{ padding: '8px 16px' }}
              >
                <ListItemIcon>
                  <AccountCircleIcon fontSize="small" />
                </ListItemIcon>
                <Typography variant="body1">Login</Typography>
              </MenuItem>
            )}
          </Menu>
        </Box>
      </Box>
    </Box>
  );
};

export default Header;