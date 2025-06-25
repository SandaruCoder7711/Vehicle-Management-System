import React, { useState, useEffect } from 'react';
import { TextField, Button, MenuItem, FormControl, Select, InputLabel, Box, Typography, FormHelperText, Tooltip, Popover } from '@material-ui/core';
import Sidebar from '../../Components/sidebar';
import Header from '../../Components/navbar'; 
import axios from 'axios';
import swal from 'sweetalert';

const AddVehicle = () => {
  const [registrationNumber, setRegistrationNumber] = useState('');
  const [make, setMake] = useState('');
  const [model, setModel] = useState('');
  const [year, setYear] = useState('');
  const [fuelType, setFuelType] = useState('');
  const [vehicleType, setVehicleType] = useState('');
  const [color, setColor] = useState('');
  const [mileage, setMileage] = useState('0');
  const [lastServiceMileage, setLastServiceMileage] = useState('0');
  const [status, setStatus] = useState('Active');
  const [errors, setErrors] = useState({});
  const [anchorEl, setAnchorEl] = useState(null);
  const [isFormValid, setIsFormValid] = useState(false);

  const vehicleMakes = [
    'Toyota',
    'Honda',
    'Ford',
    'Chevrolet',
    'Nissan',
    'Hyundai',
    'Kia',
    'Volkswagen',
    'BMW',
    'Mercedes-Benz',
    'Audi',
    'Lexus',
    'Subaru',
    'Mazda',
    'Jeep',
    'Tesla',
    'Volvo',
    'Porsche',
    'Other'
  ];

  // Generate year options from 1950 to current year
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: currentYear - 1949 }, (_, i) => currentYear - i);

  // Enhanced color palette with name and hex values - significantly expanded
  const colorPalette = [
    // Standard colors
    { name: 'Black', value: '#000000' },
    { name: 'White', value: '#FFFFFF' },
    { name: 'Silver', value: '#C0C0C0' },
    { name: 'Gray', value: '#808080' },
    { name: 'Dark Gray', value: '#404040' },
    { name: 'Light Gray', value: '#D3D3D3' },
    
    // Reds
    { name: 'Red', value: '#FF0000' },
    { name: 'Dark Red', value: '#8B0000' },
    { name: 'Crimson', value: '#DC143C' },
    { name: 'Maroon', value: '#800000' },
    { name: 'Burgundy', value: '#800020' },
    { name: 'Ruby Red', value: '#9B111E' },
    { name: 'Cherry Red', value: '#C40233' },
    { name: 'Rose Red', value: '#C21E56' },
    
    // Blues
    { name: 'Blue', value: '#0000FF' },
    { name: 'Navy', value: '#000080' },
    { name: 'Royal Blue', value: '#4169E1' },
    { name: 'Sky Blue', value: '#87CEEB' },
    { name: 'Turquoise', value: '#40E0D0' },
    { name: 'Teal', value: '#008080' },
    { name: 'Aqua', value: '#00FFFF' },
    { name: 'Cobalt Blue', value: '#0047AB' },
    { name: 'Steel Blue', value: '#4682B4' },
    { name: 'Midnight Blue', value: '#191970' },
    
    // Greens
    { name: 'Green', value: '#008000' },
    { name: 'Lime', value: '#00FF00' },
    { name: 'Forest Green', value: '#228B22' },
    { name: 'Olive', value: '#808000' },
    { name: 'Dark Green', value: '#006400' },
    { name: 'Emerald Green', value: '#50C878' },
    { name: 'Mint Green', value: '#98FB98' },
    { name: 'British Racing Green', value: '#004225' },
    
    // Yellows/Golds
    { name: 'Yellow', value: '#FFFF00' },
    { name: 'Gold', value: '#FFD700' },
    { name: 'Amber', value: '#FFBF00' },
    { name: 'Khaki', value: '#F0E68C' },
    { name: 'Mustard', value: '#FFDB58' },
    { name: 'Lemon Yellow', value: '#FFF44F' },
    
    // Oranges/Browns
    { name: 'Orange', value: '#FFA500' },
    { name: 'Burnt Orange', value: '#CC5500' },
    { name: 'Coral', value: '#FF7F50' },
    { name: 'Peach', value: '#FFDAB9' },
    { name: 'Brown', value: '#A52A2A' },
    { name: 'Bronze', value: '#CD7F32' },
    { name: 'Copper', value: '#B87333' },
    { name: 'Mahogany', value: '#C04000' },
    { name: 'Tan', value: '#D2B48C' },
    { name: 'Beige', value: '#F5F5DC' },
    
    // Purples/Pinks
    { name: 'Purple', value: '#800080' },
    { name: 'Lavender', value: '#E6E6FA' },
    { name: 'Violet', value: '#8F00FF' },
    { name: 'Indigo', value: '#4B0082' },
    { name: 'Lilac', value: '#C8A2C8' },
    { name: 'Magenta', value: '#FF00FF' },
    { name: 'Fuchsia', value: '#FF77FF' },
    { name: 'Pink', value: '#FFC0CB' },
    { name: 'Hot Pink', value: '#FF69B4' },
    { name: 'Rose Pink', value: '#FF66CC' },
    
    // Specialty automotive colors
    { name: 'Pearl White', value: '#FAFAFA' },
    { name: 'Metallic Silver', value: '#A8A9AD' },
    { name: 'Titanium', value: '#878681' },
    { name: 'Gunmetal', value: '#2C3539' },
    { name: 'Charcoal', value: '#36454F' },
    { name: 'Champagne', value: '#F7E7CE' },
    { name: 'Racing Red', value: '#FF2800' },
    { name: 'Electric Blue', value: '#7DF9FF' },
    { name: 'Matte Black', value: '#1C1C1C' },
    { name: 'Carbon Black', value: '#333333' },
    { name: 'Ice Blue', value: '#99FFFF' },
    { name: 'Sapphire Blue', value: '#0F52BA' },
    { name: 'Oxford Blue', value: '#002147' }
  ];

  // Effect to check if all required fields are filled
  useEffect(() => {
    const requiredFields = {
      registrationNumber,
      make,
      model,
      year,
      fuelType,
      vehicleType,
      status
    };
    
    // Check if all required fields have values
    const valid = Object.values(requiredFields).every(field => field !== '');
    setIsFormValid(valid);
  }, [registrationNumber, make, model, year, fuelType, vehicleType, status]);

  const handleFuelTypeChange = (event) => {
    setFuelType(event.target.value);
    setErrors(prevErrors => ({ ...prevErrors, fuelType: '' }));
  };

  const handleVehicleTypeChange = (event) => {
    setVehicleType(event.target.value);
    setErrors(prevErrors => ({ ...prevErrors, vehicleType: '' }));
  };

  const handleStatusChange = (event) => {
    setStatus(event.target.value);
    setErrors(prevErrors => ({ ...prevErrors, status: '' }));
  };

  const handleYearChange = (event) => {
    setYear(event.target.value);
    setErrors(prevErrors => ({ ...prevErrors, year: '' }));
  };

  const handleMileageChange = (event) => {
    const value = event.target.value;
    if (value === '' || (!isNaN(value) && parseInt(value) >= 0)) {
      setMileage(value);
      setErrors(prevErrors => ({ ...prevErrors, mileage: '' }));
    }
  };

  const handleLastServiceMileageChange = (event) => {
    const value = event.target.value;
    if (value === '' || (!isNaN(value) && parseInt(value) >= 0)) {
      setLastServiceMileage(value);
      setErrors(prevErrors => ({ ...prevErrors, lastServiceMileage: '' }));
    }
  };

  const handleColorClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleColorClose = () => {
    setAnchorEl(null);
  };

  const handleColorSelect = (colorName) => {
    setColor(colorName);
    setErrors(prevErrors => ({ ...prevErrors, color: '' }));
    handleColorClose();
  };

  const open = Boolean(anchorEl);
  const id = open ? 'color-popover' : undefined;

  const validateForm = () => {
    const newErrors = {};
    if (!registrationNumber) newErrors.registrationNumber = "Registration Number is required.";
    if (!make) newErrors.make = "Make is required.";
    if (!model) newErrors.model = "Model is required.";
    if (!year) newErrors.year = "Year is required.";
    if (!fuelType) newErrors.fuelType = "Fuel Type is required.";
    if (!vehicleType) newErrors.vehicleType = "Vehicle Type is required.";
    if (!status) newErrors.status = "Status is required.";
    
    // Validate mileage is a non-negative number
    if (mileage !== '' && (isNaN(mileage) || parseInt(mileage) < 0)) {
      newErrors.mileage = "Mileage must be a non-negative number.";
    }
    
    // Validate last service mileage is a non-negative number
    if (lastServiceMileage !== '' && (isNaN(lastServiceMileage) || parseInt(lastServiceMileage) < 0)) {
      newErrors.lastServiceMileage = "Last service mileage must be a non-negative number.";
    }
    
    // Validate last service mileage doesn't exceed current mileage
    if (parseInt(lastServiceMileage) > parseInt(mileage)) {
      newErrors.lastServiceMileage = "Last service mileage cannot exceed current mileage.";
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

    const newVehicle = {
      registrationNumber,
      make,
      model,
      year: parseInt(year),
      fuelType,
      vehicleType,
      color,
      mileage: parseInt(mileage),
      lastServiceMileage: parseInt(lastServiceMileage),
      status,
    };

    try {
      await axios.post('http://localhost:3001/vehicle/add-vehicle', newVehicle);
      swal("Success", "New vehicle added successfully!", "success");
      setRegistrationNumber('');
      setMake('');
      setModel('');
      setYear('');
      setFuelType('');
      setVehicleType('');
      setColor('');
      setMileage('0');
      setLastServiceMileage('0');
      setStatus('Active');
      setErrors({});
    } catch (error) {
      console.error(error);
      
      // Check if it's a duplicate registration number error (HTTP 409 Conflict)
      if (error.response && error.response.status === 409) {
        // Show the specific error message from the server
        swal("Error", error.response.data.message, "error");
        // Highlight the registration number field with an error
        setErrors(prevErrors => ({ 
          ...prevErrors, 
          registrationNumber: "A vehicle with this registration number already exists" 
        }));
      } else {
        // Generic error message for other errors
        swal("Error", "Something went wrong. Please try again.", "error");
      }
    }
  };

  // Find the selected color's hex value
  const selectedColorHex = colorPalette.find(c => c.name === color)?.value || '';

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
          style={{ backgroundColor: 'white', borderRadius: 8, boxShadow: '0px 0px 10px rgba(0,0,0,0.1)', flex: 1, margin: '15px' }}
        >
          {/* Title Section */}
          <Box
            alignItems="center"
            justifyContent="center"
          >
            <Typography variant="h4" gutterBottom style={{ fontFamily: 'cursive', fontWeight: 'bold', color: 'purple', textAlign: 'center', marginTop:'30px' }}>
              Add New Vehicle
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
                <TextField
                  fullWidth
                  margin="normal"
                  label="Registration Number"
                  variant="outlined"
                  value={registrationNumber}
                  onChange={(e) => {
                    setRegistrationNumber(e.target.value);
                    // Clear the error when user starts typing again
                    if (errors.registrationNumber) {
                      setErrors(prevErrors => ({ ...prevErrors, registrationNumber: '' }));
                    }
                  }}
                  helperText={errors.registrationNumber}
                  error={!!errors.registrationNumber}
                  required
                />
                <TextField
                  select
                  fullWidth
                  margin="normal"
                  label="Make"
                  variant="outlined"
                  value={make}
                  onChange={(e) => setMake(e.target.value)}
                  helperText={errors.make}
                  error={!!errors.make}
                  required
                >
                  {vehicleMakes.map((makeOption) => (
                    <MenuItem key={makeOption} value={makeOption}>
                      {makeOption}
                    </MenuItem>
                  ))}
                </TextField>
                <TextField
                  fullWidth
                  margin="normal"
                  label="Model"
                  variant="outlined"
                  value={model}
                  onChange={(e) => setModel(e.target.value)}
                  helperText={errors.model}
                  error={!!errors.model}
                  required
                />
                {/* Year Picker instead of text field */}
                <FormControl fullWidth margin="normal" variant="outlined" error={!!errors.year} required>
                  <InputLabel>Year</InputLabel>
                  <Select
                    value={year}
                    onChange={handleYearChange}
                    label="Year"
                  >
                    {years.map((year) => (
                      <MenuItem key={year} value={year.toString()}>
                        {year}
                      </MenuItem>
                    ))}
                  </Select>
                  <FormHelperText>{errors.year}</FormHelperText>
                </FormControl>
                <FormControl fullWidth margin="normal" variant="outlined" error={!!errors.fuelType} required>
                  <InputLabel>Fuel Type</InputLabel>
                  <Select
                    value={fuelType}
                    onChange={handleFuelTypeChange}
                    label="Fuel Type"
                  >
                    <MenuItem value="Petrol">Petrol</MenuItem>
                    <MenuItem value="Diesel">Diesel</MenuItem>
                    <MenuItem value="Electric">Electric</MenuItem>
                    <MenuItem value="Hybrid">Hybrid</MenuItem>
                  </Select>
                  <FormHelperText>{errors.fuelType}</FormHelperText>
                </FormControl>
                <FormControl fullWidth margin="normal" variant="outlined" error={!!errors.vehicleType} required>
                <InputLabel>Vehicle Type</InputLabel>
                <Select
                    value={vehicleType}
                    onChange={handleVehicleTypeChange}
                    label="Vehicle Type"
                >
                    <MenuItem value="Sedan">Sedan</MenuItem>
                    <MenuItem value="SUV">SUV</MenuItem>
                    <MenuItem value="Truck">Truck</MenuItem>
                    <MenuItem value="Hatchback">Hatchback</MenuItem>
                    <MenuItem value="Coupe">Coupe</MenuItem>
                    <MenuItem value="Van">Van</MenuItem>
                    <MenuItem value="Motorcycle">Motorcycle</MenuItem>
                    <MenuItem value="Convertible">Convertible</MenuItem>
                    <MenuItem value="Crossover">Crossover</MenuItem>
                    <MenuItem value="Minivan">Minivan</MenuItem>
                    <MenuItem value="Pickup Truck">Pickup Truck</MenuItem>
                    <MenuItem value="Sports Car">Sports Car</MenuItem>
                    <MenuItem value="Electric Vehicle">Electric Vehicle</MenuItem>
                    <MenuItem value="Hybrid Vehicle">Hybrid Vehicle</MenuItem>
                    <MenuItem value="Luxury Vehicle">Luxury Vehicle</MenuItem>
                    <MenuItem value="Commercial Vehicle">Commercial Vehicle</MenuItem>
                    <MenuItem value="Off-Road Vehicle">Off-Road Vehicle</MenuItem>
                    <MenuItem value="Bus">Bus</MenuItem>
                    <MenuItem value="RV (Recreational Vehicle)">RV (Recreational Vehicle)</MenuItem>
                    <MenuItem value="Tractor">Tractor</MenuItem>
                    <MenuItem value="Trailer">Trailer</MenuItem>
                    <MenuItem value="Other">Other</MenuItem>
                </Select>
                <FormHelperText>{errors.vehicleType}</FormHelperText>
                </FormControl>
                
                {/* Mileage Field */}
                <TextField
                  fullWidth
                  margin="normal"
                  label="Current Mileage"
                  variant="outlined"
                  value={mileage}
                  onChange={handleMileageChange}
                  helperText={errors.mileage || "The vehicle's current mileage (in kilometers/miles)"}
                  error={!!errors.mileage}
                  type="number"
                  InputProps={{ inputProps: { min: 0 } }}
                />
                
                {/* Last Service Mileage Field */}
                <TextField
                  fullWidth
                  margin="normal"
                  label="Last Service Mileage"
                  variant="outlined"
                  value={lastServiceMileage}
                  onChange={handleLastServiceMileageChange}
                  helperText={errors.lastServiceMileage || "The vehicle's mileage at last service (in kilometers/miles)"}
                  error={!!errors.lastServiceMileage}
                  type="number"
                  InputProps={{ inputProps: { min: 0 } }}
                />
                
                {/* Color Field with Enhanced Palette */}
                <TextField
                  fullWidth
                  margin="normal"
                  label="Color"
                  variant="outlined"
                  value={color}
                  onClick={handleColorClick}
                  InputProps={{
                    readOnly: true,
                    endAdornment: (
                      <Box 
                        width={24} 
                        height={24} 
                        style={{ 
                          backgroundColor: selectedColorHex,
                          border: '1px solid #ccc',
                          cursor: 'pointer'
                        }} 
                      />
                    ),
                  }}
                  helperText={errors.color}
                  error={!!errors.color}
                />
                
                <Popover
                  id={id}
                  open={open}
                  anchorEl={anchorEl}
                  onClose={handleColorClose}
                  anchorOrigin={{
                    vertical: 'bottom',
                    horizontal: 'center',
                  }}
                  transformOrigin={{
                    vertical: 'top',
                    horizontal: 'center',
                  }}
                >
                  <Box p={2} display="flex" flexWrap="wrap" maxWidth="500px" maxHeight="400px" style={{ overflowY: 'auto' }}>
                    {colorPalette.map((colorOption) => (
                      <Tooltip key={colorOption.name} title={colorOption.name} arrow>
                        <Box
                          width={36}
                          height={36}
                          m={0.5}
                          style={{
                            backgroundColor: colorOption.value,
                            cursor: 'pointer',
                            border: `1px solid ${colorOption.value === '#FFFFFF' ? '#ccc' : 'transparent'}`,
                            borderRadius: '4px'
                          }}
                          onClick={() => handleColorSelect(colorOption.name)}
                        />
                      </Tooltip>
                    ))}
                  </Box>
                </Popover>
                
                <FormControl fullWidth margin="normal" variant="outlined" error={!!errors.status} required>
                  <InputLabel>Status</InputLabel>
                  <Select
                    value={status}
                    onChange={handleStatusChange}
                    label="Status"
                  >
                    <MenuItem value="Active">Active</MenuItem>
                    <MenuItem value="Inactive">Inactive</MenuItem>
                  </Select>
                  <FormHelperText>{errors.status}</FormHelperText>
                </FormControl>
                <Button
                  fullWidth
                  variant="contained"
                  color="primary"
                  size="large"
                  type="submit"
                  style={{ marginTop: 16 }}
                  disabled={!isFormValid}
                >
                  Add Vehicle
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
                src="https://images.unsplash.com/photo-1579778979547-f218ef8f28e8?fm=jpg&q=60&w=3000&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8OHx8Ym13JTIwaTh8ZW58MHx8MHx8fDA%3D"
                alt="Vehicle"
                style={{
                  width: '100%',
                  height: 'auto',
                  borderRadius: '10px',
                }}
              />
            </Box>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default AddVehicle;