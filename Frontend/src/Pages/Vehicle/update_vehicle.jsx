import React, { useState, useEffect } from 'react';
import { TextField, Button, MenuItem, FormControl, Select, InputLabel, Box, Typography, FormHelperText, Tooltip, Popover } from '@material-ui/core';
import Sidebar from '../../Components/sidebar';
import Header from '../../Components/navbar';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import swal from 'sweetalert';

const UpdateVehicle = () => {
  const { id } = useParams(); // Extract ID from URL params
  const navigate = useNavigate();

  const [registrationNumber, setRegistrationNumber] = useState('');
  const [make, setMake] = useState('');
  const [model, setModel] = useState('');
  const [year, setYear] = useState('');
  const [fuelType, setFuelType] = useState('');
  const [vehicleType, setVehicleType] = useState('');
  const [color, setColor] = useState('');
  const [mileage, setMileage] = useState(0);
  const [lastServiceMileage, setLastServiceMileage] = useState(0);
  const [status, setStatus] = useState('Active');
  const [errors, setErrors] = useState({});
  const [anchorEl, setAnchorEl] = useState(null);
  const [isFormValid, setIsFormValid] = useState(false);

  // Generate year options from 1950 to current year
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: currentYear - 1949 }, (_, i) => currentYear - i);

  // Enhanced color palette with name and hex values
  const colorPalette = [
    { name: 'Black', value: '#000000' },
    { name: 'White', value: '#FFFFFF' },
    { name: 'Silver', value: '#C0C0C0' },
    { name: 'Gray', value: '#808080' },
    { name: 'Red', value: '#FF0000' },
    { name: 'Blue', value: '#0000FF' },
    { name: 'Green', value: '#008000' },
    { name: 'Yellow', value: '#FFFF00' },
    { name: 'Orange', value: '#FFA500' },
    { name: 'Purple', value: '#800080' },
    { name: 'Pink', value: '#FFC0CB' },
    { name: 'Brown', value: '#A52A2A' },
    { name: 'Gold', value: '#FFD700' },
    { name: 'Teal', value: '#008080' },
    { name: 'Navy', value: '#000080' },
  ];

  useEffect(() => {
    const fetchVehicle = async () => {
      try {
        const response = await axios.get(`http://localhost:3001/vehicle/get-vehicle/${id}`);
        const { registrationNumber, make, model, year, fuelType, vehicleType, color, mileage, lastServiceMileage, status } = response.data;
        setRegistrationNumber(registrationNumber);
        setMake(make);
        setModel(model);
        setYear(year);
        setFuelType(fuelType);
        setVehicleType(vehicleType);
        setColor(color);
        setMileage(mileage);
        setLastServiceMileage(lastServiceMileage);
        setStatus(status);
      } catch (error) {
        console.error(error);
        swal("Error", "Failed to fetch vehicle data.", "error");
      }
    };

    fetchVehicle();
  }, [id]);

  // Effect to check if all required fields are filled
  useEffect(() => {
    const requiredFields = {
      registrationNumber,
      make,
      model,
      year,
      fuelType,
      vehicleType,
      status,
      mileage,
      lastServiceMileage,
    };
    
    // Check if all required fields have values
    const valid = Object.values(requiredFields).every(field => field !== '');
    setIsFormValid(valid);
  }, [registrationNumber, make, model, year, fuelType, vehicleType, status, mileage, lastServiceMileage]);

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
  const id_popover = open ? 'color-popover' : undefined;

  const validateForm = () => {
    const newErrors = {};
    if (!registrationNumber) newErrors.registrationNumber = "Registration Number is required.";
    if (!make) newErrors.make = "Make is required.";
    if (!model) newErrors.model = "Model is required.";
    if (!year) newErrors.year = "Year is required.";
    if (!fuelType) newErrors.fuelType = "Fuel Type is required.";
    if (!vehicleType) newErrors.vehicleType = "Vehicle Type is required.";
    if (!status) newErrors.status = "Status is required.";
    if (!mileage) newErrors.mileage = "Mileage is required.";
    if (!lastServiceMileage) newErrors.lastServiceMileage = "Last Service Mileage is required.";

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

    const updatedVehicle = {
      registrationNumber,
      make,
      model,
      year,
      fuelType,
      vehicleType,
      color,
      mileage,
      lastServiceMileage,
      status,
    };

    try {
      // Update the vehicle
      await axios.put(`http://localhost:3001/vehicle/update-vehicle/${id}`, updatedVehicle);

      // Send notification about next service mileage
      await axios.put(`http://localhost:3001/vehicle/update-vehicle-mileage/${id}`, {
        mileage,
        lastServiceMileage,
      });

      swal("Success", "Vehicle updated successfully!", "success");
      navigate('/view-vehicle');
    } catch (error) {
      console.error(error);
      swal("Error", "Something went wrong. Please try again.", "error");
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
          <Box alignItems="center" justifyContent="center">
            <Typography variant="h4" gutterBottom style={{ fontFamily: 'cursive', fontWeight: 'bold', color: 'purple', textAlign: 'center', marginTop:'30px' }}>
              Update Vehicle
            </Typography>
          </Box>

          <Box display="flex" width="100%">
            {/* Form Section */}
            <Box
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
                  onChange={(e) => setRegistrationNumber(e.target.value)}
                  helperText={errors.registrationNumber}
                  error={!!errors.registrationNumber}
                  disabled
                  required
                />
                <TextField
                  fullWidth
                  margin="normal"
                  label="Make"
                  variant="outlined"
                  value={make}
                  onChange={(e) => setMake(e.target.value)}
                  helperText={errors.make}
                  error={!!errors.make}
                  required
                />
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
                  </Select>
                  <FormHelperText>{errors.vehicleType}</FormHelperText>
                </FormControl>
                <TextField
                  fullWidth
                  margin="normal"
                  label="Mileage"
                  variant="outlined"
                  type="number"
                  value={mileage}
                  onChange={(e) => setMileage(e.target.value)}
                  helperText={errors.mileage}
                  error={!!errors.mileage}
                  InputProps={{ inputProps: { min: 0 } }}
                  required
                />
                <TextField
                  fullWidth
                  margin="normal"
                  label="Last Service Mileage"
                  variant="outlined"
                  type="number"
                  value={lastServiceMileage}
                  onChange={(e) => setLastServiceMileage(e.target.value)}
                  helperText={errors.lastServiceMileage}
                  error={!!errors.lastServiceMileage}
                  InputProps={{ inputProps: { min: 0 } }}
                  required
                />
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
                  id={id_popover}
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
                  Update Vehicle
                </Button>
              </Box>
            </Box>

            {/* Image Section */}
            <Box
              style={{
                flex: 1,
                textAlign: 'center',
                padding: '20px',
                margin: '15px',
                marginTop:'25px'
              }}
            >
              <img
                src="https://img.freepik.com/free-photo/black-mini-coupe-road_114579-5056.jpg?t=st=1740677490~exp=1740681090~hmac=689c8bf9d23e2fd73852e864c7b1438ed2136319300357ae913be24a3bc0cbb5&w=740"
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

export default UpdateVehicle;