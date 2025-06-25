import React, { useState, useEffect } from 'react';
import {
  TextField, Button, MenuItem, FormControl, Select, InputLabel, Box,
  Typography, FormHelperText, Grid, RadioGroup, FormControlLabel, Radio,
  IconButton, Chip, List, ListItem, Paper, Divider, Link, Avatar
} from '@material-ui/core';
import CloudUploadIcon from '@material-ui/icons/CloudUpload';
import DeleteIcon from '@material-ui/icons/Delete';
import Header from '../../Components/navbar';
import axios from 'axios';
import swal from 'sweetalert';
import { makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles((theme) => ({
  root: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: theme.spacing(3),
    backgroundImage: 'url(https://images.unsplash.com/photo-1501785888041-af3ef285b470?ixlib=rb-1.2.1&auto=format&fit=crop&w=1950&q=80)',
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    backgroundAttachment: 'fixed', // Creates parallax effect
    position: 'relative',
    '&::before': {
      content: '""',
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.4)', // Dark overlay for better text contrast
    }
  },
  formContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: theme.shape.borderRadius * 2,
    boxShadow: theme.shadows[10],
    width: '100%',
    maxWidth: '600px',
    padding: theme.spacing(4),
    position: 'relative',
    zIndex: 1,
    [theme.breakpoints.down('sm')]: {
      padding: theme.spacing(3),
    }
  },
  title: {
    fontFamily: '"Montserrat", sans-serif',
    fontWeight: 700,
    color: theme.palette.primary.main,
    textAlign: 'center',
    marginBottom: theme.spacing(4),
    textShadow: '1px 1px 2px rgba(0,0,0,0.1)'
  },
  avatarContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    marginBottom: theme.spacing(3)
  },
  avatar: {
    width: 120,
    height: 120,
    border: '3px solid #e0e0e0',
    boxShadow: theme.shadows[3],
    marginBottom: theme.spacing(2)
  },
  submitButton: {
    marginTop: theme.spacing(3),
    padding: theme.spacing(1.5),
    fontSize: '1rem',
    fontWeight: 600,
    letterSpacing: 1.1,
    borderRadius: 50,
    boxShadow: theme.shadows[2],
    '&:hover': {
      boxShadow: theme.shadows[4],
      transform: 'translateY(-2px)'
    }
  },
  loginLink: {
    fontWeight: 600,
    color: theme.palette.primary.dark,
    '&:hover': {
      textDecoration: 'none',
      color: theme.palette.primary.main
    }
  }
}));

const UserRegistration = () => {
  const classes = useStyles();
  // State variables for form fields
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
  const [userId, setUserId] = useState('');

  // Function to generate user ID
  const generateUserId = () => {
    const randomNum = Math.floor(10000000 + Math.random() * 90000000);
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
  ).toISOString().split('T')[0];

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

    const valid = Object.values(requiredFields).every(field => field !== '' && field !== null);
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

    const validTypes = ['image/jpeg', 'image/png', 'image/jpg'];
    if (!validTypes.includes(file.type)) {
      setErrors(prevErrors => ({
        ...prevErrors,
        profilePicture: "Only JPG, JPEG, and PNG files are allowed"
      }));
      return;
    }

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
      setProfilePicture(reader.result);
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
      profile_picture: profilePicture
    };

    try {
      await axios.post('http://localhost:3001/user/register', newUser);
      swal("Success", "User registered successfully!", "success");

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
      if (error.response && error.response.status === 409) {
        swal("Error", error.response.data.message, "error");
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
        swal("Error", "Something went wrong. Please try again.", "error");
      }
    }
  };

  return (
    <Box className={classes.root}>
      <Box className={classes.formContainer}>
        <Typography variant="h4" className={classes.title}>
          Join AutoDrive
        </Typography>

        <Box component="form" noValidate autoComplete="off" onSubmit={handleSubmit}>
          {/* User ID field */}
          <TextField
            fullWidth
            margin="normal"
            label="User ID"
            variant="outlined"
            value={userId}
            InputProps={{
              readOnly: true,
              style: {
                backgroundColor: '#f5f5f5',
                color: '#616161',
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
            inputProps={{ maxLength: 10, pattern: "[0-9]{10}" }}
            required
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
            helperText={errors.password || "At least 8 characters"}
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

          <Button
            fullWidth
            variant="contained"
            color="primary"
            size="large"
            type="submit"
            className={classes.submitButton}
            disabled={!isFormValid}
          >
            Create Account
          </Button>
          
          <Box mt={4} textAlign="center">
            <Typography variant="body1">
              Already have an account?{' '}
              <Link href="/login" className={classes.loginLink}>
                Sign in here
              </Link>
            </Typography>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default UserRegistration;