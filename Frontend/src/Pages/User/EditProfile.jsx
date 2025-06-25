import React, { useState, useEffect } from 'react';
import {
  TextField, Button, MenuItem, FormControl, Select, InputLabel, Box,
  Typography, FormHelperText, Grid, RadioGroup, FormControlLabel, Radio,
  IconButton, Chip, List, ListItem, Paper, Divider, Link, Avatar
} from '@material-ui/core';
import CloudUploadIcon from '@material-ui/icons/CloudUpload';
import DeleteIcon from '@material-ui/icons/Delete';
import axios from 'axios';
import swal from 'sweetalert';
import { useNavigate } from 'react-router-dom';
import Header from '../../Components/navbar';
import dayjs from 'dayjs';

const EditProfile = () => {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [contact, setContact] = useState('');
  const [address, setAddress] = useState('');
  const [dob, setDob] = useState('');
  const [gender, setGender] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [profilePicture, setProfilePicture] = useState('');
  const [profilePicturePreview, setProfilePicturePreview] = useState('');
  const [errors, setErrors] = useState({});
  const [isFormValid, setIsFormValid] = useState(false);
  const navigate = useNavigate();
  const todayMinus18 = dayjs().subtract(18, 'year').format('YYYY-MM-DD');

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get('http://localhost:3001/user/profile', {
          headers: { Authorization: `Bearer ${token}` },
        });
  
        // Access the nested `user` object in the response
        const userData = response.data.user;
  
        // Set the form fields with the user data
        setFullName(userData.full_name);
        setEmail(userData.email);
        setContact(userData.contact);
        setAddress(userData.address);
        setDob(userData.dob.split('T')[0]); // Format date to YYYY-MM-DD
        setGender(userData.gender);
        
        // Set profile picture if it exists
        if (userData.profile_picture) {
          setProfilePicture(userData.profile_picture);
          setProfilePicturePreview(userData.profile_picture);
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
        swal('Error', 'Failed to fetch user data. Please try again.', 'error');
      }
    };
  
    fetchUserData();
  }, []);

  // Validate contact number (10 digits)
  const validateContact = (value) => {
    const contactRegex = /^\d{10}$/;
    return contactRegex.test(value);
  };

  // Validate email format
  const validateEmail = (value) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(value);
  };

  const handleContactChange = (e) => {
    const value = e.target.value;
    setContact(value);

    // Real-time validation for contact
    if (value && !validateContact(value)) {
      setErrors(prevErrors => ({
        ...prevErrors,
        contact: "Contact number must be 10 digits"
      }));
    } else {
      setErrors(prevErrors => ({ ...prevErrors, contact: '' }));
    }
  };

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

  const handleGenderChange = (event) => {
    setGender(event.target.value);
    setErrors(prevErrors => ({ ...prevErrors, gender: '' }));
  };

  const handleDobChange = (e) => {
    setDob(e.target.value);
    setErrors(prevErrors => ({ ...prevErrors, dob: '' }));
  };

  // Handle profile picture upload
  const handleProfilePictureChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    const validTypes = ['image/jpeg', 'image/png', 'image/jpg'];
    if (!validTypes.includes(file.type)) {
      setErrors(prevErrors => ({
        ...prevErrors,
        profilePicture: "Only JPG, JPEG, and PNG files are allowed"
      }));
      return;
    }

    // Validate file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      setErrors(prevErrors => ({
        ...prevErrors,
        profilePicture: "File size must be less than 2MB"
      }));
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setProfilePicturePreview(reader.result);
      setProfilePicture(reader.result); // Store base64 string
    };
    reader.readAsDataURL(file);
    setErrors(prevErrors => ({ ...prevErrors, profilePicture: '' }));
  };

  // Remove profile picture
  const handleRemoveProfilePicture = () => {
    setProfilePicture('');
    setProfilePicturePreview('');
  };

  // Validate form fields
  const validateForm = () => {
    const newErrors = {};
    if (!fullName) newErrors.fullName = "Full name is required.";
    if (!email) newErrors.email = "Email is required.";
    else if (!validateEmail(email)) newErrors.email = "Invalid email format.";
    if (!contact) newErrors.contact = "Contact number is required.";
    else if (!validateContact(contact)) newErrors.contact = "Contact number must be 10 digits.";
    if (!address) newErrors.address = "Address is required.";
    if (!dob) newErrors.dob = "Date of birth is required.";
    if (!gender) newErrors.gender = "Gender is required.";
    if (password && password !== confirmPassword) newErrors.confirmPassword = "Passwords do not match.";

    return newErrors;
  };

  // Handle form submission
  const handleSubmit = async (event) => {
    event.preventDefault();
    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    const updatedUser = {
      full_name: fullName,
      email,
      contact,
      address,
      dob,
      gender,
      password: password || undefined, // Only include password if it's provided
      profile_picture: profilePicture // Include the profile picture
    };

    try {
      const token = localStorage.getItem('token');
      await axios.put('http://localhost:3001/user/profile', updatedUser, {
        headers: { Authorization: `Bearer ${token}` },
      });

      swal('Success', 'Profile updated successfully!', 'success');
    } catch (error) {
      console.error('Error updating profile:', error);
      swal('Error', 'Failed to update profile. Please try again.', 'error');
    }
  };

  return (
    <Box
      style={{
        backgroundImage: 'url(https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80)',
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
          maxWidth: '550px',
          padding: '30px',
          margin: '40px 0'
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
          Edit Profile
        </Typography>

        {/* Form Section */}
        <Box component="form" noValidate autoComplete="off" onSubmit={handleSubmit}>
          <TextField
            fullWidth
            margin="normal"
            label="Full Name"
            variant="outlined"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            helperText={errors.fullName}
            error={!!errors.fullName}
            required
          />

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
            label="Contact Number"
            variant="outlined"
            value={contact}
            onChange={handleContactChange}
            helperText={errors.contact}
            error={!!errors.contact}
            required
            inputProps={{
              maxLength: 10,
              inputMode: 'numeric',
              pattern: '[0-9]*',
            }}
          />

          <TextField
            fullWidth
            margin="normal"
            label="Address"
            variant="outlined"
            multiline
            rows={3}
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            helperText={errors.address}
            error={!!errors.address}
            required
          />

          <TextField
            fullWidth
            margin="normal"
            label="Date of Birth"
            type="date"
            variant="outlined"
            InputLabelProps={{ shrink: true }}
            value={dob}
            onChange={handleDobChange}
            helperText={errors.dob}
            error={!!errors.dob}
            required
            inputProps={{
              max: todayMinus18,
            }}
          />

          <FormControl component="fieldset" margin="normal" error={!!errors.gender} required fullWidth>
            <Typography variant="subtitle1">Gender</Typography>
            <RadioGroup
              aria-label="gender"
              name="gender"
              value={gender}
              onChange={handleGenderChange}
              row
            >
              <FormControlLabel value="Male" control={<Radio />} label="Male" />
              <FormControlLabel value="Female" control={<Radio />} label="Female" />
            </RadioGroup>
            <FormHelperText>{errors.gender}</FormHelperText>
          </FormControl>

          <Button
            fullWidth
            variant="contained"
            color="primary"
            size="large"
            type="submit"
            style={{ marginTop: 25 }}
          >
            Update Profile
          </Button>
        </Box>
      </Box>
    </Box>
  );
};

export default EditProfile;