import React, { useState } from 'react';
import {
  TextField, Button, Box, Typography, FormHelperText, Link, Paper, List, ListItem
} from '@material-ui/core';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import swal from 'sweetalert';
import Header from '../../Components/navbar';

const UserLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();

  // Validate email format
  const validateEmail = (value) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(value);
  };

  // Handle email change
  const handleEmailChange = (e) => {
    const value = e.target.value;
    setEmail(value);

    // Real-time validation for email
    if (value && !validateEmail(value)) {
      setErrors(prevErrors => ({
        ...prevErrors,
        email: "Invalid email format"
      }));
    } else {
      setErrors(prevErrors => ({ ...prevErrors, email: '' }));
    }
  };

  // Handle password change
  const handlePasswordChange = (e) => {
    setPassword(e.target.value);
    setErrors(prevErrors => ({ ...prevErrors, password: '' }));
  };

  // Validate the login form
  const validateForm = () => {
    const newErrors = {};
    if (!email) newErrors.email = "Email is required.";
    else if (!validateEmail(email)) newErrors.email = "Invalid email format.";
    if (!password) newErrors.password = "Password is required.";
    return newErrors;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
  
    // Check if admin credentials are entered
    if (email === "admin@gmail.com" && password === "admin") {
      localStorage.setItem("username", "Admin");
      localStorage.setItem("userEmail", email);
      localStorage.setItem("token", "admin-token"); 
      localStorage.setItem("role", "admin"); 
      
      // Dispatch login event
      window.dispatchEvent(new CustomEvent('loginUpdate', {
        detail: { username: "Admin", email }
      }));
      
      swal("Success", "Logged in as Admin!", "success");
      navigate("/main-dashboard");
      return;
    }
  
    try {
      const response = await axios.post('http://localhost:3001/user/login', {
        email,
        password
      });
  
      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
        if (response.data.user) {
          console.log(response.data.user);
          const fullName = response.data.user.full_name || '';
          const firstName = fullName.split(' ')[0];
          localStorage.setItem('username', firstName);
          localStorage.setItem('userEmail', response.data.user.email || '');
          localStorage.setItem('userId', response.data.user.id || '');
          
          // Dispatch login event
          window.dispatchEvent(new CustomEvent('loginUpdate', {
            detail: { username: firstName, email: response.data.user.email }
          }));
        }
        
        swal("Success", "Logged in successfully!", "success");
        navigate('/');
  
        // Set timeout to clear local storage after 1 hour
        setTimeout(() => {
          localStorage.removeItem('token');
          localStorage.removeItem('username');
          localStorage.removeItem('userEmail');
          localStorage.removeItem('userId');
          window.dispatchEvent(new CustomEvent('loginUpdate', {
            detail: { username: 'User', email: '' }
          }));
          swal("Session Expired", "Please login again.", "warning");
          navigate('/login');
        }, 3600000);
      }
    } catch (error) {
      console.error(error);
      if (error.response && error.response.status === 401) {
        swal("Error", "Invalid email or password", "error");
      } else {
        swal("Error", "Something went wrong. Please try again.", "error");
      }
    }
  };
  
  

  return (
    <Box
      style={{
        backgroundImage: 'url(https://img.freepik.com/free-photo/landscape-morning-fog-mountains-with-hot-air-balloons-sunrise_335224-794.jpg?t=st=1743081705~exp=1743085305~hmac=da43631b8b0992811f94eed06c55d9281676305de45708cb132c48a116780e59&w=996)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px'
      }}
    >
      <Box
        style={{
          backgroundColor: 'rgba(255, 255, 255, 0.9)',
          borderRadius: 8,
          boxShadow: '0px 0px 15px rgba(0,0,0,0.2)',
          width: '100%',
          maxWidth: '450px',
          padding: '30px'
        }}
      >
        {/* Title Section */}
        <Typography 
          variant="h4" 
          gutterBottom 
          style={{
            fontFamily: 'cursive',
            fontWeight: 'bold',
            color: 'purple',
            textAlign: 'center',
            marginBottom: '30px'
          }}
        >
          Login to AutoDrive
        </Typography>

        {/* Form Section */}
        <Box component="form" noValidate autoComplete="off" onSubmit={handleSubmit}>
          <TextField
            fullWidth
            margin="normal"
            label="Email"
            variant="outlined"
            value={email}
            onChange={handleEmailChange}
            helperText={errors.email}
            error={!!errors.email}
            required
          />

          <TextField
            fullWidth
            margin="normal"
            label="Password"
            type="password"
            variant="outlined"
            value={password}
            onChange={handlePasswordChange}
            helperText={errors.password}
            error={!!errors.password}
            required
          />

          <Button
            fullWidth
            variant="contained"
            color="primary"
            size="large"
            type="submit"
            style={{ marginTop: 25 }}
          >
            Login
          </Button>

          {/* Forgot Password and Reset Password Links */}
          <Box mt={2} textAlign="center">
            <Link href="/forgot-password" style={{ marginRight: '10px' }}>
              Forgot Password?
            </Link>
          </Box>

          {/* Don't have an account? Register Section */}
          <Box mt={4} textAlign="center">
            <Typography variant="body1">
              Don't have an account?{' '}
              <Link href="/register" style={{ fontWeight: 'bold' }}>
                Register here
              </Link>
            </Typography>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default UserLogin;