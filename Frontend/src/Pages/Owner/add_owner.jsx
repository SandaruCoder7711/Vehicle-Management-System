import React, { useState, useEffect } from 'react';
import { 
  TextField, Button, MenuItem, FormControl, Select, InputLabel, Box, 
  Typography, FormHelperText, Grid, RadioGroup, FormControlLabel, Radio,
  IconButton, Chip, List, ListItem, Paper, Divider
} from '@material-ui/core';
import { Add as AddIcon, Remove as RemoveIcon } from '@material-ui/icons';
import Sidebar from '../../Components/owner_sidebar';
import Header from '../../Components/owner_navbar';
import axios from 'axios';
import swal from 'sweetalert';

const AddOwner = () => {
  // State variables for form fields
  const [name, setName] = useState('');
  const [contact, setContact] = useState('');
  const [email, setEmail] = useState(''); // Added state for email
  const [address, setAddress] = useState('');
  const [licenseNumber, setLicenseNumber] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [gender, setGender] = useState('');
  const [errors, setErrors] = useState({});
  const [isFormValid, setIsFormValid] = useState(false);
  const [ownerId, setOwnerId] = useState('');
  
  // Vehicle related states
  const [allVehicles, setAllVehicles] = useState([]);
  const [selectedVehicles, setSelectedVehicles] = useState([]);
  const [vehicleSelections, setVehicleSelections] = useState([{ selectedVehicle: '' }]);
  
  // Function to generate owner ID
  const generateOwnerId = () => {
    // Generate a random 8-digit number
    const randomNum = Math.floor(10000000 + Math.random() * 90000000);
    // Create owner ID with OWN prefix followed by 8 digits
    return `OWN${randomNum}`;
  };
  
  // Generate owner ID on component mount and fetch vehicles
  useEffect(() => {
    const newOwnerId = generateOwnerId();
    setOwnerId(newOwnerId);
    fetchVehicles();
  }, []);

  // Fetch available vehicles from the API
  const fetchVehicles = async () => {
    try {
      const response = await axios.get('http://localhost:3001/vehicle/get-vehicles');
      // Filter only active vehicles
      const activeVehicles = response.data.filter(vehicle => vehicle.status === 'Active');
      setAllVehicles(activeVehicles);
    } catch (error) {
      console.error('Error fetching vehicles:', error);
      swal("Error", "Failed to load vehicles. Please refresh the page.", "error");
    }
  };

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
      name,
      contact,
      email, // Added email to required fields
      address,
      licenseNumber,
      dateOfBirth,
      gender
    };
    
    // Check if all required fields have values
    const valid = Object.values(requiredFields).every(field => field !== '' && field !== null);
    
    // Check if at least one vehicle is selected
    const hasVehicle = vehicleSelections.some(v => v.selectedVehicle !== '');
    
    setIsFormValid(valid && hasVehicle);
  }, [name, contact, email, address, licenseNumber, dateOfBirth, gender, vehicleSelections]);

  // Validate contact number (10 digits)
  const validateContact = (value) => {
    const contactRegex = /^\d{10}$/;
    return contactRegex.test(value);
  };

  // Validate email
  const validateEmail = (value) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(value);
  };

  // Validate Sri Lankan license number
  // Format: B1234567 or NEW1234567 or old format XX0000000000000
  const validateLicense = (value) => {
    // Sri Lankan license formats:
    // B followed by 7 digits
    // NEW followed by 7 digits
    // Old format: XX followed by 13 digits
    const sriLankanLicenseRegex = /^(B\d{7}|NEW\d{7})$/;
    const oldLicenseRegex = /^[A-Z]{2}\d{13}$/;
    
    return sriLankanLicenseRegex.test(value) || oldLicenseRegex.test(value);
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
        email: "Please enter a valid email address" 
      }));
    } else {
      setErrors(prevErrors => ({ ...prevErrors, email: '' }));
    }
  };

  const handleLicenseChange = (e) => {
    const value = e.target.value;
    setLicenseNumber(value);
    
    // Real-time validation for license
    if (value && !validateLicense(value)) {
      setErrors(prevErrors => ({ 
        ...prevErrors, 
        licenseNumber: "Invalid license format. Use B1234567, NEW1234567, or XX followed by 13 digits" 
      }));
    } else {
      setErrors(prevErrors => ({ ...prevErrors, licenseNumber: '' }));
    }
  };

  const handleGenderChange = (event) => {
    setGender(event.target.value);
    setErrors(prevErrors => ({ ...prevErrors, gender: '' }));
  };

  const handleDateChange = (e) => {
    setDateOfBirth(e.target.value);
    setErrors(prevErrors => ({ ...prevErrors, dateOfBirth: '' }));
  };

  // Handle adding a new vehicle selection field
  const handleAddVehicleField = () => {
    setVehicleSelections([...vehicleSelections, { selectedVehicle: '' }]);
  };

  // Handle removing a vehicle selection field
  const handleRemoveVehicleField = (index) => {
    const newSelections = [...vehicleSelections];
    newSelections.splice(index, 1);
    setVehicleSelections(newSelections);
    
    // Also remove from selectedVehicles if already chosen
    const removedVehicle = vehicleSelections[index].selectedVehicle;
    if (removedVehicle) {
      setSelectedVehicles(selectedVehicles.filter(id => id !== removedVehicle));
    }
  };

  // Handle vehicle selection change
  const handleVehicleChange = (e, index) => {
    const value = e.target.value;
    const newSelections = [...vehicleSelections];
    
    // If there was a previous selection, remove it from the selectedVehicles
    const previousSelection = newSelections[index].selectedVehicle;
    if (previousSelection) {
      setSelectedVehicles(selectedVehicles.filter(id => id !== previousSelection));
    }
    
    // Update the selection
    newSelections[index].selectedVehicle = value;
    setVehicleSelections(newSelections);
    
    // Add the new selection to selectedVehicles if it's not empty
    if (value) {
      setSelectedVehicles([...selectedVehicles.filter(id => id !== previousSelection), value]);
    }
    
    // Clear any vehicle-related errors
    setErrors(prevErrors => ({ ...prevErrors, vehicles: '' }));
  };

  // Get available vehicles (exclude already selected ones)
  const getAvailableVehicles = () => {
    return allVehicles.filter(vehicle => !selectedVehicles.includes(vehicle._id));
  };

  // Find vehicle details by ID
  const getVehicleById = (id) => {
    return allVehicles.find(vehicle => vehicle._id === id);
  };

  const validateForm = () => {
    const newErrors = {};
    if (!name) newErrors.name = "Name is required.";
    
    if (!contact) newErrors.contact = "Contact number is required.";
    else if (!validateContact(contact)) newErrors.contact = "Contact number must be 10 digits.";
    
    if (!email) newErrors.email = "Email address is required.";
    else if (!validateEmail(email)) newErrors.email = "Please enter a valid email address.";
    
    if (!address) newErrors.address = "Address is required.";
    
    if (!licenseNumber) newErrors.licenseNumber = "License number is required.";
    else if (!validateLicense(licenseNumber)) 
      newErrors.licenseNumber = "Invalid license format. Use B1234567, NEW1234567, or XX followed by 13 digits";
    
    if (!dateOfBirth) newErrors.dateOfBirth = "Date of birth is required.";
    else {
      const birthDate = new Date(dateOfBirth);
      const ageDate = new Date(today - birthDate);
      const age = Math.abs(ageDate.getUTCFullYear() - 1970);
      
      if (age < 18) {
        newErrors.dateOfBirth = "Owner must be at least 18 years old.";
      }
    }
    
    if (!gender) newErrors.gender = "Gender is required.";
    
    // Validate that at least one vehicle is selected
    const hasSelectedVehicle = vehicleSelections.some(v => v.selectedVehicle !== '');
    if (!hasSelectedVehicle) {
      newErrors.vehicles = "At least one vehicle must be selected.";
    }
    
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
    const formattedDOB = new Date(dateOfBirth).toISOString();

    // Filter out empty vehicle selections
    const validVehicleIds = vehicleSelections
      .map(v => v.selectedVehicle)
      .filter(id => id !== '');

    const newOwner = {
      owner_id: ownerId,
      name,
      contact,
      email, // Added email to the payload
      address,
      license_number: licenseNumber,
      date_of_birth: formattedDOB,
      gender,
      vehicles: validVehicleIds // Array of vehicle IDs
    };

    try {
      // First create the owner
      await axios.post('http://localhost:3001/owner/add-owner', newOwner);
      
      // Then associate each vehicle with this owner
      const vehicleUpdatePromises = validVehicleIds.map(vehicleId => 
        axios.put(`http://localhost:3001/vehicle/update-vehicle-owner/${vehicleId}`, { 
          ownerId: ownerId 
        })
      );
      
      await Promise.all(vehicleUpdatePromises);
      
      swal("Success", "New owner and vehicle assignments added successfully!", "success");
      
      // Reset form fields but keep the owner ID
      setName('');
      setContact('');
      setEmail(''); // Reset email field
      setAddress('');
      setLicenseNumber('');
      setDateOfBirth('');
      setGender('');
      setVehicleSelections([{ selectedVehicle: '' }]);
      setSelectedVehicles([]);
      setErrors({});
      
      // Generate a new owner ID for the next entry with the new format
      const newOwnerId = generateOwnerId();
      setOwnerId(newOwnerId);
      
      // Refresh the vehicle list
      fetchVehicles();
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
        } else if (error.response.data.message.includes("license")) {
          setErrors(prevErrors => ({ 
            ...prevErrors, 
            licenseNumber: "This license number is already registered" 
          }));
        } else if (error.response.data.message.includes("email")) {
          setErrors(prevErrors => ({ 
            ...prevErrors, 
            email: "This email address is already registered" 
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
      <Header /> 
      <Box display="flex">
        <Sidebar />
        <Box
          flexDirection="column"
          alignItems="center"
          justifyContent="center"
          p={2}
          style={{ 
            backgroundColor: 'white', 
            borderRadius: 8, 
            boxShadow: '0px 0px 10px rgba(0,0,0,0.1)', 
            flex: 1, 
            margin: '15px' 
          }}
        >
          {/* Title Section */}
          <Box
            alignItems="center"
            justifyContent="center"
          >
            <Typography variant="h4" gutterBottom style={{ 
              fontFamily: 'cursive', 
              fontWeight: 'bold', 
              color: 'purple', 
              textAlign: 'center', 
              marginTop:'30px' 
            }}>
              Register New Owner with Vehicles
            </Typography>
          </Box>

          <Box display="flex" width="100%">
            {/* Form Section */}
            <Box
              display="flex"
              flexDirection="column"
              alignItems="center"
              justifyContent="center"
              style={{ flex: 1, padding: '20px', margin: '15px' }}
            >
              <Box component="form" width="100%" noValidate autoComplete="off" onSubmit={handleSubmit}>
                {/* Owner ID field (read-only) with gray styling */}
                <TextField
                  fullWidth
                  margin="normal"
                  label="Owner ID"
                  variant="outlined"
                  value={ownerId}
                  InputProps={{
                    readOnly: true,
                    style: {
                      backgroundColor: '#f0f0f0', // Light gray background
                      color: '#757575',           // Darker gray text
                      cursor: 'not-allowed',      // Change cursor to indicate it's not editable
                    },
                  }}
                  helperText="System generated ID (cannot be modified)"
                />
                
                <TextField
                  fullWidth
                  margin="normal"
                  label="Full Name"
                  variant="outlined"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  helperText={errors.name}
                  error={!!errors.name}
                  required
                />
                
                <TextField
                  fullWidth
                  margin="normal"
                  label="Contact Number"
                  variant="outlined"
                  value={contact}
                  onChange={handleContactChange}
                  onKeyPress={(e) => {
                    // Only allow numbers (0-9) to be entered
                    if (!/[0-9]/.test(e.key)) {
                      e.preventDefault();
                    }
                  }}
                  inputProps={{
                    maxLength: 10, // Restrict to 10 characters
                    inputMode: 'numeric' // Show numeric keyboard on mobile devices
                  }}
                  helperText={errors.contact}
                  error={!!errors.contact}
                  required
                />
                
                {/* Added Email Field */}
                <TextField
                  fullWidth
                  margin="normal"
                  label="Email Address"
                  variant="outlined"
                  type="email"
                  value={email}
                  onChange={handleEmailChange}
                  helperText={errors.email}
                  error={!!errors.email}
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
                  label="License Number"
                  variant="outlined"
                  value={licenseNumber}
                  onChange={handleLicenseChange}
                  helperText={errors.licenseNumber || "Use format B1234567, NEW1234567, or XX followed by 13 digits"}
                  error={!!errors.licenseNumber}
                  required
                />
                
                {/* Native HTML date input instead of Material-UI DatePicker */}
                <TextField
                  fullWidth
                  margin="normal"
                  label="Date of Birth"
                  type="date"
                  variant="outlined"
                  InputLabelProps={{ shrink: true }}
                  value={dateOfBirth}
                  onChange={handleDateChange}
                  inputProps={{ max: minDate }}
                  helperText={errors.dateOfBirth || "Must be at least 18 years old"}
                  error={!!errors.dateOfBirth}
                  required
                />
                
                <FormControl component="fieldset" margin="normal" error={!!errors.gender} required>
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
                
                {/* Vehicle Selection Section */}
                <Typography variant="h6" style={{ marginTop: 20 }}>
                  Vehicle Assignment
                </Typography>
                <Typography variant="body2" color="textSecondary" gutterBottom>
                  Assign one or more vehicles to this owner
                </Typography>
                
                {vehicleSelections.map((selection, index) => (
                  <Box key={index} display="flex" alignItems="center" mt={2}>
                    <FormControl 
                      variant="outlined" 
                      fullWidth 
                      error={!!errors.vehicles}
                    >
                      <InputLabel id={`vehicle-select-label-${index}`}>Select Vehicle</InputLabel>
                      <Select
                        labelId={`vehicle-select-label-${index}`}
                        value={selection.selectedVehicle}
                        onChange={(e) => handleVehicleChange(e, index)}
                        label="Select Vehicle"
                      >
                        <MenuItem value="">
                          <em>Select a vehicle</em>
                        </MenuItem>
                        {getAvailableVehicles().map((vehicle) => (
                          <MenuItem key={vehicle._id} value={vehicle._id}>
                            {vehicle.make} {vehicle.model} ({vehicle.registrationNumber})
                          </MenuItem>
                        ))}
                      </Select>
                      {index === 0 && errors.vehicles && (
                        <FormHelperText>{errors.vehicles}</FormHelperText>
                      )}
                    </FormControl>
                    
                    <Box ml={1} display="flex">
                      {/* Add button */}
                      <IconButton 
                        color="primary" 
                        onClick={handleAddVehicleField}
                        disabled={getAvailableVehicles().length === 0 || 
                                  vehicleSelections.some(v => v.selectedVehicle === '')}
                      >
                        <AddIcon />
                      </IconButton>
                      
                      {/* Remove button (disabled for the first item if it's the only one) */}
                      {(vehicleSelections.length > 1 || index > 0) && (
                        <IconButton 
                          color="secondary" 
                          onClick={() => handleRemoveVehicleField(index)}
                        >
                          <RemoveIcon />
                        </IconButton>
                      )}
                    </Box>
                  </Box>
                ))}
                
                {/* Selected Vehicles Summary */}
                {selectedVehicles.length > 0 && (
                  <Paper style={{ padding: '15px', marginTop: '20px' }}>
                    <Typography variant="subtitle1" gutterBottom>
                      Selected Vehicles ({selectedVehicles.length}):
                    </Typography>
                    <Box display="flex" flexWrap="wrap">
                      {selectedVehicles.map(vehicleId => {
                        const vehicle = getVehicleById(vehicleId);
                        return vehicle ? (
                          <Chip
                            key={vehicle._id}
                            label={`${vehicle.make} ${vehicle.model} (${vehicle.registrationNumber})`}
                            color="primary"
                            style={{ margin: '4px' }}
                          />
                        ) : null;
                      })}
                    </Box>
                  </Paper>
                )}
                
                <Button
                  fullWidth
                  variant="contained"
                  color="primary"
                  size="large"
                  type="submit"
                  style={{ marginTop: 25 }}
                  disabled={!isFormValid}
                >
                  Register Owner with Vehicles
                </Button>
              </Box>
            </Box>

            {/* Image Section */}
            <Box
              style={{
                flex: 1,
                textAlign: 'center',
                padding: '20px',
                margin: '25px',
              }}
            >
              <img
                src="https://images.unsplash.com/photo-1620899011820-e22f724e8084?fm=jpg&q=60&w=3000&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8c3ViYXJ1JTIwYnJ6fGVufDB8fDB8fHww"
                alt="Vehicle Owner"
                style={{
                  width: '100%',
                  height: 'auto',
                  borderRadius: '10px',
                  marginBottom: '20px'
                }}
              />
              
              {/* Vehicle info section */}
              <Paper style={{ padding: '15px', textAlign: 'left' }}>
                <Typography variant="h6" gutterBottom>
                  Vehicle Assignment Guide
                </Typography>
                <List>
                  <ListItem>
                    • Select vehicles from the dropdown menu
                  </ListItem>
                  <ListItem>
                    • Click the + button to add more vehicles
                  </ListItem>
                  <ListItem>
                    • Click the - button to remove a vehicle
                  </ListItem>
                  <ListItem>
                    • Vehicles already assigned to other owners will not appear
                  </ListItem>
                </List>
              </Paper>
            </Box>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default AddOwner;