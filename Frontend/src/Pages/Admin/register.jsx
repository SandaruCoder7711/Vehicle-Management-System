import React, { useState } from 'react';
import styled from 'styled-components';
import { 
  Typography, 
  TextField, 
  Button
} from '@material-ui/core';
import { useNavigate } from 'react-router-dom';
import { Email, Lock, Person } from '@material-ui/icons';
import axios from 'axios';
import Swal from 'sweetalert2';

const RegistrationContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100vh;
  background-image: url('https://m.media-amazon.com/images/I/61lKwIqTL0S.jpg');
  background-size: cover;
  background-position: center;
`;

const RegistrationForm = styled.div`
  background-color: rgba(255, 255, 255, 0.9);
  padding: 30px;
  border-radius: 15px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
  text-align: center;
  width: 100%;
  max-width: 500px;
`;

const RegistrationButton = styled(Button)`
  margin-top: 20px;
  width: 100%;
  background-color: #3f51b5;
  color: white;
  &:hover {
    background-color: #303f9f;
  }
`;

const IconWrapper = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 20px;
`;

const LoginText = styled(Typography)`
  margin-top: 15px;
  color: black;
  
  span {
    color: #3f51b5;
    cursor: pointer;

    &:hover {
      text-decoration: underline;
    }
  }
`;

const RegistrationPage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [fieldErrors, setFieldErrors] = useState({
    username: false,
    email: false,
    password: false,
    confirmPassword: false
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Email validation regex
  const validateEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(String(email).toLowerCase());
  };

  // Password validation (at least 6 characters)
  const validatePassword = (password) => {
    return password.length >= 6;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const showErrorAlert = (message) => {
    Swal.fire({
      icon: 'error',
      title: 'Registration Error',
      text: message,
      confirmButtonColor: '#3f51b5'
    });
  };

  const showSuccessAlert = () => {
    Swal.fire({
      title: 'Success!',
      text: 'Registration successful! Redirecting to login...',
      icon: 'success',
      showConfirmButton: false,
      timer: 2000,
      timerProgressBar: true,
      didOpen: () => {
        Swal.showLoading();
      },
      willClose: () => {
        navigate('/login');
      }
    });
  };

  const validateForm = () => {
    const errors = [];
    const newFieldErrors = {
      username: false,
      email: false,
      password: false,
      confirmPassword: false
    };

    // Check empty fields first
    if (!formData.username) {
      errors.push('Username is required');
      newFieldErrors.username = true;
    }
    if (!formData.email) {
      errors.push('Email is required');
      newFieldErrors.email = true;
    }
    if (!formData.password) {
      errors.push('Password is required');
      newFieldErrors.password = true;
    }
    if (!formData.confirmPassword) {
      errors.push('Please confirm your password');
      newFieldErrors.confirmPassword = true;
    }

    // Only validate further if fields are not empty
    if (formData.username && formData.username.length < 3) {
      errors.push('Username must be at least 3 characters');
      newFieldErrors.username = true;
    }

    if (formData.email && !validateEmail(formData.email)) {
      errors.push('Please enter a valid email address');
      newFieldErrors.email = true;
    }

    if (formData.password && !validatePassword(formData.password)) {
      errors.push('Password must be at least 6 characters');
      newFieldErrors.password = true;
    }

    if (formData.password && formData.confirmPassword && formData.password !== formData.confirmPassword) {
      errors.push('Passwords do not match');
      newFieldErrors.confirmPassword = true;
    }

    setFieldErrors(newFieldErrors);
    return errors;
  };

  const handleRegistration = async () => {
    if (isSubmitting) return;
    
    const validationErrors = validateForm();
    
    if (validationErrors.length > 0) {
      showErrorAlert(validationErrors.join('\n'));
      return;
    }

    setIsSubmitting(true);
    
    const userData = {
      username: formData.username,
      email: formData.email,
      password: formData.password,
    };

    try {
      const response = await axios.post('http://localhost:3001/admin/register', userData, {
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.data && response.data.success) {
        showSuccessAlert();
      } else {
        showErrorAlert(response.data?.message || 'Registration failed');
      }
    } catch (err) {
      showErrorAlert(err.response?.data?.message || 'An error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <RegistrationContainer>
      <RegistrationForm>
        <Typography variant="h4" gutterBottom style={{ marginBottom: '20px', fontFamily: 'Roboto', fontWeight: 'bold', color: '#3f51b5' }}>
          Admin Registration
        </Typography>
        
        <IconWrapper>
          <Person style={{ marginRight: '10px', color: '#3f51b5' }} />
          <TextField
            label="Username"
            name="username"
            variant="outlined"
            fullWidth
            value={formData.username}
            onChange={handleChange}
            error={fieldErrors.username}
            helperText={fieldErrors.username ? ' ' : ''}
          />
        </IconWrapper>
        
        <IconWrapper>
          <Email style={{ marginRight: '10px', color: '#3f51b5' }} />
          <TextField
            label="Email"
            name="email"
            variant="outlined"
            fullWidth
            value={formData.email}
            onChange={handleChange}
            error={fieldErrors.email}
            helperText={fieldErrors.email ? ' ' : ''}
          />
        </IconWrapper>
        
        <IconWrapper>
          <Lock style={{ marginRight: '10px', color: '#3f51b5' }} />
          <TextField
            label="Password"
            name="password"
            type="password"
            variant="outlined"
            fullWidth
            value={formData.password}
            onChange={handleChange}
            error={fieldErrors.password}
            helperText={fieldErrors.password ? ' ' : ''}
          />
        </IconWrapper>
        
        <IconWrapper>
          <Lock style={{ marginRight: '10px', color: '#3f51b5' }} />
          <TextField
            label="Confirm Password"
            name="confirmPassword"
            type="password"
            variant="outlined"
            fullWidth
            value={formData.confirmPassword}
            onChange={handleChange}
            error={fieldErrors.confirmPassword}
            helperText={fieldErrors.confirmPassword ? ' ' : ''}
          />
        </IconWrapper>
        
        <RegistrationButton
          variant="contained"
          onClick={handleRegistration}
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Registering...' : 'Register'}
        </RegistrationButton>
        
        <LoginText variant="body2">
          Already have an account? <span onClick={() => navigate('/login')}>Login</span>
        </LoginText>
      </RegistrationForm>
    </RegistrationContainer>
  );
};

export default RegistrationPage;