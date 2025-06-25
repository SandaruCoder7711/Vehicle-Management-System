import React, { useState, useEffect } from 'react';
import {
  TextField, Button, Box, Typography, FormControl, Grid, RadioGroup,
  FormControlLabel, Radio, FormHelperText, Avatar, IconButton
} from '@material-ui/core';
import CloudUploadIcon from '@material-ui/icons/CloudUpload';
import DeleteIcon from '@material-ui/icons/Delete';
import Sidebar from '../../Components/user_sidebar';
import axios from 'axios';
import swal from 'sweetalert';

const AddUser = () => {
  // State variables for form fields
  const [userId, setUserId] = useState('');
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
  const [error, setError] = useState("");
  

  // Function to generate user ID
  const generateUserId = () => {
    // Generate a random 8-digit number
    const randomNum = Math.floor(10000000 + Math.random() * 90000000);
    // Create user ID with USR prefix followed by 8 digits
    return `USR${randomNum}`;
  };

  // Generate user ID on component mount
  useEffect(() => {
    const newUserId = generateUserId();
    setUserId(newUserId);
  }, []);

  // Calculate minimum date (18 years ago from today)
  const today = new Date();
  const minDate = new Date(
    today.getFullYear() - 18,
    today.getMonth(),
    today.getDate()
  ).toISOString().split('T')[0]; // Format as YYYY-MM-DD

  // Effect to check if all required fields are filled
  useEffect(() => {
    const requiredFields = {
      fullName,
      email,
      contact,
      address,
      dob,
      gender,
      password,
      confirmPassword
    };

    // Check if all required fields have values
    const valid = Object.values(requiredFields).every(field => field !== '' && field !== null);

    // Check if passwords match
    const passwordsMatch = password === confirmPassword;

    setIsFormValid(valid && passwordsMatch);
  }, [fullName, email, contact, address, dob, gender, password, confirmPassword]);

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
    const inputValue = e.target.value;
    setEmail(inputValue);

    const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

    if (!emailPattern.test(inputValue)) {
      setError("Enter a valid email address");
    } else {
      setError("");
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

  const validateForm = () => {
    const newErrors = {};
    if (!fullName) newErrors.fullName = "Full name is required.";
    if (!email) newErrors.email = "Email is required.";
    else if (!validateEmail(email)) newErrors.email = "Invalid email format.";
    if (!contact) newErrors.contact = "Contact number is required.";
    else if (!validateContact(contact)) newErrors.contact = "Contact number must be 10 digits.";
    if (!address) newErrors.address = "Address is required.";
    if (!dob) newErrors.dob = "Date of birth is required.";
    else {
      const birthDate = new Date(dob);
      const ageDate = new Date(today - birthDate);
      const age = Math.abs(ageDate.getUTCFullYear() - 1970);

      if (age < 18) {
        newErrors.dob = "User must be at least 18 years old.";
      }
    }
    if (!gender) newErrors.gender = "Gender is required.";
    if (!password) newErrors.password = "Password is required.";
    if (!confirmPassword) newErrors.confirmPassword = "Confirm password is required.";
    else if (password !== confirmPassword) newErrors.confirmPassword = "Passwords do not match.";

    return newErrors;
  };

  

  const handleSubmit = async (event) => {
    event.preventDefault();
    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    // Format date of birth for backend
    const formattedDOB = new Date(dob).toISOString();

    const newUser = {
      user_id: userId,
      full_name: fullName,
      email,
      contact,
      address,
      dob: formattedDOB,
      gender,
      password,
      profile_picture: profilePicture // Include profile picture
    };

    try {
      // Create the user
      await axios.post('http://localhost:3001/user/register', newUser);

      swal("Success", "User added successfully!", "success");

      // Reset form fields but keep the user ID
      setFullName('');
      setEmail('');
      setContact('');
      setAddress('');
      setDob('');
      setGender('');
      setPassword('');
      setConfirmPassword('');
      setProfilePicture('');
      setProfilePicturePreview('');
      setErrors({});

      // Generate a new user ID for the next entry
      const newUserId = generateUserId();
      setUserId(newUserId);
    } catch (error) {
      console.error(error);

      // Check if it's a duplicate error (HTTP 409 Conflict)
      if (error.response && error.response.status === 409) {
        // Show the specific error message from the server
        swal("Error", error.response.data.message, "error");

        // Set appropriate field error based on the error message
        if (error.response.data.message.includes("contact")) {
          setErrors(prevErrors => ({
            ...prevErrors,
            contact: "This contact number is already registered"
          }));
        } else if (error.response.data.message.includes("email")) {
          setErrors(prevErrors => ({
            ...prevErrors,
            email: "This email is already registered"
          }));
        }
      } else {
        // Generic error message for other errors
        swal("Error", "Something went wrong. Please try again.", "error");
      }
    }
  };

  return (
    <Box>
      <Box display="flex">
        <Sidebar />
        <Box
          flexDirection="column"
          flex={1}
          p={3}
          style={{ 
            backgroundColor: '#f5f5f5',
            minHeight: '100vh'
          }}
        >
          <Box
            style={{
              backgroundColor: 'white',
              borderRadius: 8,
              boxShadow: '0px 0px 15px rgba(0,0,0,0.1)',
              padding: '30px',
              maxWidth: '1200px',
              margin: '20px auto'
            }}
          >
            {/* Title Section */}
            <Typography 
              variant="h4" 
              gutterBottom 
              style={{
                fontWeight: 'bold',
                color: 'purple',
                textAlign: 'center',
                marginBottom: '20px'
              }}
            >
              Add New User
            </Typography>

            {/* Profile Picture Section - Moved to top center */}
            <Box
              display="flex"
              flexDirection="column"
              alignItems="center"
              mb={4}
            >
              <Typography variant="subtitle1" gutterBottom>
                Profile Picture
              </Typography>
              
              {/* Profile Picture Preview */}
              <Box mb={2}>
                <Avatar
                  src={profilePicturePreview}
                  style={{
                    width: 150,
                    height: 150,
                    border: '2px solid #e0e0e0',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                  }}
                  alt={fullName || "Profile"}
                />
              </Box>
              
              {/* Upload and Remove Buttons */}
              <Box display="flex" alignItems="center">
                <input
                  accept="image/*"
                  style={{ display: 'none' }}
                  id="profile-picture-upload"
                  type="file"
                  onChange={handleProfilePictureChange}
                />
                <label htmlFor="profile-picture-upload">
                  <Button
                    variant="contained"
                    color="primary"
                    component="span"
                    startIcon={<CloudUploadIcon />}
                    size="small"
                    style={{ marginRight: 8 }}
                  >
                    Upload
                  </Button>
                </label>
                
                {profilePicturePreview && (
                  <IconButton
                    color="secondary"
                    onClick={handleRemoveProfilePicture}
                    size="small"
                  >
                    <DeleteIcon />
                  </IconButton>
                )}
              </Box>
              
              {/* Error Message */}
              {errors.profilePicture && (
                <Typography
                  variant="caption"
                  color="error"
                  style={{ marginTop: 8 }}
                >
                  {errors.profilePicture}
                </Typography>
              )}
              
              <Typography variant="caption" style={{ marginTop: 8, color: '#666' }}>
                Recommended: Square image, JPG or PNG, max 2MB
              </Typography>
            </Box>

            {/* Form Section */}
            <Box component="form" noValidate autoComplete="off" onSubmit={handleSubmit}>
              <Grid container spacing={4}>
                {/* Left Column */}
                <Grid item xs={12} md={6}>
                  <Typography variant="h6" gutterBottom style={{ color: '#555' }}>
                    User Information
                  </Typography>
                  
                  {/* User ID field (read-only) */}
                  <TextField
                    fullWidth
                    margin="normal"
                    label="User ID"
                    variant="outlined"
                    value={userId}
                    InputProps={{
                      readOnly: true,
                      style: {
                        backgroundColor: '#f0f0f0',
                        color: '#757575',
                        cursor: 'not-allowed',
                      },
                    }}
                    helperText="System generated ID (cannot be modified)"
                  />

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
                    type="email"
                    value={email}
                    onChange={handleEmailChange}
                    helperText={error}
                    error={!!error}
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
                    inputProps={{ maxLength: 10, pattern: "[0-9]{10}" }}
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
                </Grid>

                {/* Right Column */}
                <Grid item xs={12} md={6}>
                  <Typography variant="h6" gutterBottom style={{ color: '#555' }}>
                    Account Details
                  </Typography>

                  {/* Native HTML date input */}
                  <TextField
                    fullWidth
                    margin="normal"
                    label="Date of Birth"
                    type="date"
                    variant="outlined"
                    InputLabelProps={{ shrink: true }}
                    value={dob}
                    onChange={handleDobChange}
                    inputProps={{ max: minDate }}
                    helperText={errors.dob || "Must be at least 18 years old"}
                    error={!!errors.dob}
                    required
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

                  <TextField
                    fullWidth
                    margin="normal"
                    label="Password"
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
                    label="Confirm Password"
                    type="password"
                    variant="outlined"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    helperText={errors.confirmPassword}
                    error={!!errors.confirmPassword}
                    required
                  />
                </Grid>
              </Grid>

              <Button
                fullWidth
                variant="contained"
                color="primary"
                size="large"
                type="submit"
                style={{ marginTop: 32 }}
                disabled={!isFormValid}
              >
                Add User
              </Button>
            </Box>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default AddUser;