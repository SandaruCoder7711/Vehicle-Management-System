import React, { useState } from 'react';
import { TextField, Button, Box, Typography, FormHelperText } from '@material-ui/core';
import axios from 'axios';
import swal from 'sweetalert';
import { useParams } from 'react-router-dom';

const ResetPassword = () => {
  const { token } = useParams(); // Get the reset token from the URL
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState({});

  // Handle form submission
  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!password || !confirmPassword) {
      setErrors({ password: "Please fill in all fields" });
      return;
    }
    if (password !== confirmPassword) {
      setErrors({ confirmPassword: "Passwords do not match" });
      return;
    }

    try {
      // Send request to the backend to reset the password
      await axios.post(`http://localhost:3001/user/reset-password/${token}`, { password });
      swal("Success", "Password reset successfully!", "success");
    } catch (error) {
      console.error(error);
      swal("Error", "Failed to reset password. Please try again.", "error");
    }
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom style={{ textAlign: 'center', marginTop: '30px' }}>
        Reset Password
      </Typography>
      <Box component="form" width="100%" noValidate autoComplete="off" onSubmit={handleSubmit}>
        <TextField
          fullWidth
          margin="normal"
          label="New Password"
          type="password"
          variant="outlined"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          helperText={errors.password}
          error={!!errors.password}
          required
        />
        <TextField
          fullWidth
          margin="normal"
          label="Confirm New Password"
          type="password"
          variant="outlined"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          helperText={errors.confirmPassword}
          error={!!errors.confirmPassword}
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
          Reset Password
        </Button>
      </Box>
    </Box>
  );
};

export default ResetPassword;