import React, { useState } from 'react';
import styled from 'styled-components';
import { Typography, TextField, Button, CircularProgress } from '@material-ui/core';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios'; // Make sure axios is installed

const LoginContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100vh;
  background-image: url('https://www.isharearena.com/wp-content/uploads/2012/11/wallpaper-2422728.jpg');
  background-size: cover;
  background-position: center;
`;

const LoginForm = styled.div`
  background-color: rgba(255, 255, 255, 0.8);
  padding: 40px;
  border-radius: 10px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  text-align: center;
  width: 100%;
  max-width: 400px;
`;

const LoginButton = styled(Button)`
  margin-top: 20px;
`;

const LoginPage = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    
    // Clear previous error messages
    setError('');
    
    // Validate input fields
    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }
    
    try {
      setIsLoading(true);
      
      // Make API call to login endpoint
      const response = await axios.post('http://localhost:3001/admin/login', {
        email,
        password
      });
      
      // Store token in localStorage or cookies for later use
      localStorage.setItem('token', response.data.token);
      
      // Store the full user object
      localStorage.setItem('user', JSON.stringify(response.data.user));
      
      // Also store the username specifically
      if (response.data.user && response.data.user.username) {
        localStorage.setItem('username', response.data.user.username);
      } else if (response.data.user && response.data.user.name) {
        // Fallback if username doesn't exist but name does
        localStorage.setItem('username', response.data.user.name);
      } else if (response.data.user && response.data.user.email) {
        // Fallback to email if both username and name are missing
        localStorage.setItem('username', response.data.user.email);
      }
      
      // Redirect to dashboard on successful login
      navigate('/main-dashboard');
    } catch (error) {
      // Handle error response from server
      if (error.response && error.response.data) {
        setError(error.response.data.message || 'Login failed');
      } else {
        setError('Network error. Please try again later.');
      }
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <LoginContainer>
      <LoginForm>
        <Typography variant="h4" gutterBottom style={{ marginBottom: '20px', fontFamily: 'cursive', fontWeight: 'bold', color: 'purple' }}>
          Login
        </Typography>
        <form onSubmit={handleLogin}>
          <TextField
            label="Email"
            variant="outlined"
            fullWidth
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={{ marginBottom: '20px' }}
            type="email"
            required
          />
          <TextField
            label="Password"
            type="password"
            variant="outlined"
            fullWidth
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={{ marginBottom: '20px' }}
            required
          />
          {error && <Typography color="error" style={{ marginBottom: '10px' }}>{error}</Typography>}
          <LoginButton
            variant="contained"
            color="primary"
            type="submit"
            disabled={isLoading}
            fullWidth
          >
            {isLoading ? <CircularProgress size={24} color="inherit" /> : 'Login'}
          </LoginButton>
        </form>
        <Typography variant="body2" style={{ marginTop: '20px' }}>
          Don't have an account?{' '}
          <Link to="/register" style={{ textDecoration: 'none', color: 'blue' }}>
            Register here
          </Link>
        </Typography>
      </LoginForm>
    </LoginContainer>
  );
};

export default LoginPage;