import React, { useState, useEffect } from 'react';
import { 
  TextField, 
  Button, 
  MenuItem, 
  FormControl, 
  Select, 
  InputLabel, 
  Box, 
  Typography, 
  FormHelperText,
  InputAdornment
} from '@material-ui/core';
import Sidebar from '../../Components/service_reminder_sidebar';
import Header from '../../Components/reminder_navbar';
import axios from 'axios';
import swal from 'sweetalert';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

const AddServiceReminder = () => {
  const [vehicles, setVehicles] = useState([]);
  const [selectedVehicle, setSelectedVehicle] = useState('');
  const [serviceType, setServiceType] = useState('');
  const [dueDate, setDueDate] = useState(null);
  const [dueMileage, setDueMileage] = useState('');
  const [priority, setPriority] = useState('Medium');
  const [notes, setNotes] = useState('');
  const [estimatedCost, setEstimatedCost] = useState('');
  const [serviceProvider, setServiceProvider] = useState('');
  const [recurringInterval, setRecurringInterval] = useState('');
  const [errors, setErrors] = useState({});
  const [isFormValid, setIsFormValid] = useState(false);

  // Service types with descriptions
  const serviceTypes = [
    { value: 'Oil Change', label: 'Oil Change', description: 'Regular engine oil and filter replacement' },
    { value: 'Tire Rotation', label: 'Tire Rotation', description: 'Rotating tires to ensure even wear' },
    { value: 'Brake Inspection', label: 'Brake Inspection', description: 'Checking brake pads, rotors, and fluid' },
    { value: 'Engine Tune-up', label: 'Engine Tune-up', description: 'Spark plugs, filters, and system checks' },
    { value: 'Transmission Service', label: 'Transmission Service', description: 'Fluid change and system inspection' },
    { value: 'Battery Check', label: 'Battery Check', description: 'Testing and cleaning battery connections' },
    { value: 'Coolant Flush', label: 'Coolant Flush', description: 'Replacing engine coolant' },
    { value: 'Air Filter Replacement', label: 'Air Filter Replacement', description: 'Replacing engine air filter' },
    { value: 'Wheel Alignment', label: 'Wheel Alignment', description: 'Adjusting wheel angles to specification' },
    { value: 'Other', label: 'Other Service', description: 'Custom service not listed' }
  ];

  // Recurring intervals
  const intervals = [
    { value: '3 months', label: 'Every 3 Months' },
    { value: '6 months', label: 'Every 6 Months' },
    { value: '1 year', label: 'Every Year' },
    { value: '5000 miles', label: 'Every 5,000 Miles' },
    { value: '10000 miles', label: 'Every 10,000 Miles' },
    { value: '15000 miles', label: 'Every 15,000 Miles' }
  ];

  // Fetch vehicles on component mount
  useEffect(() => {
    const fetchVehicles = async () => {
      try {
        const response = await axios.get('http://localhost:3001/vehicle/get-vehicles');
        setVehicles(response.data);
      } catch (error) {
        console.error('Error fetching vehicles:', error);
      }
    };
    fetchVehicles();
  }, []);

  // Validate form whenever inputs change
  useEffect(() => {
    const requiredFields = {
      selectedVehicle,
      serviceType
    };
    
    // At least one of dueDate or dueMileage must be provided
    const dueValid = dueDate || dueMileage;
    
    const valid = Object.values(requiredFields).every(field => field !== '') && dueValid;
    setIsFormValid(valid);
  }, [selectedVehicle, serviceType, dueDate, dueMileage]);

  const handleVehicleChange = (event) => {
    setSelectedVehicle(event.target.value);
    setErrors(prevErrors => ({ ...prevErrors, selectedVehicle: '' }));
  };

  const handleServiceTypeChange = (event) => {
    setServiceType(event.target.value);
    setErrors(prevErrors => ({ ...prevErrors, serviceType: '' }));
  };

  const handlePriorityChange = (event) => {
    setPriority(event.target.value);
  };

  const handleRecurringIntervalChange = (event) => {
    setRecurringInterval(event.target.value);
  };

  const handleDueMileageChange = (event) => {
    const value = event.target.value;
    if (value === '' || (!isNaN(value) && parseInt(value) >= 0)) {
      setDueMileage(value);
      setErrors(prevErrors => ({ ...prevErrors, dueMileage: '' }));
    }
  };

  const handleEstimatedCostChange = (event) => {
    const value = event.target.value;
    if (value === '' || (!isNaN(value) && parseFloat(value) >= 0)) {
      setEstimatedCost(value);
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!selectedVehicle) newErrors.selectedVehicle = "Vehicle selection is required.";
    if (!serviceType) newErrors.serviceType = "Service type is required.";
    if (!dueDate && !dueMileage) newErrors.due = "Either due date or due mileage must be provided.";
    
    // Validate due mileage is a non-negative number if provided
    if (dueMileage !== '' && (isNaN(dueMileage) || parseInt(dueMileage) < 0)) {
      newErrors.dueMileage = "Due mileage must be a non-negative number.";
    }
    
    // Validate estimated cost is a non-negative number if provided
    if (estimatedCost !== '' && (isNaN(estimatedCost) || parseFloat(estimatedCost) < 0)) {
      newErrors.estimatedCost = "Estimated cost must be a non-negative number.";
    }

    if (
      dueMileage !== '' && 
      (
        isNaN(dueMileage) || 
        parseInt(dueMileage) < 0 || 
        parseInt(dueMileage) > 1000000
      )
    ) {
      newErrors.dueMileage = "Due mileage must be a non-negative number not exceeding 1,000,000.";
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

    const newReminder = {
      vehicle: selectedVehicle,
      serviceType,
      dueDate,
      dueMileage: dueMileage || undefined,
      priority,
      notes,
      estimatedCost: estimatedCost || undefined,
      serviceProvider,
      recurringInterval: recurringInterval || undefined
    };

    try {
      await axios.post('http://localhost:3001/service-reminder/add-reminder', newReminder);
      swal("Success", "Service reminder created successfully!", "success");
      
      // Reset form
      setSelectedVehicle('');
      setServiceType('');
      setDueDate(null);
      setDueMileage('');
      setPriority('Medium');
      setNotes('');
      setEstimatedCost('');
      setServiceProvider('');
      setRecurringInterval('');
      setErrors({});
    } catch (error) {
      console.error(error);
      swal("Error", "Failed to create service reminder. Please try again.", "error");
    }
  };

  // Get the selected service type description
  const selectedService = serviceTypes.find(st => st.value === serviceType);
  const selectedVehicleData = vehicles.find(v => v._id === selectedVehicle);

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
              Add New Service Reminder
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
                {/* Vehicle Selection */}
                <FormControl fullWidth margin="normal" variant="outlined" error={!!errors.selectedVehicle} required>
                  <InputLabel>Select Vehicle</InputLabel>
                  <Select
                    value={selectedVehicle}
                    onChange={handleVehicleChange}
                    label="Select Vehicle"
                  >
                    {vehicles.map((vehicle) => (
                      <MenuItem key={vehicle._id} value={vehicle._id}>
                        {`${vehicle.make} ${vehicle.model} (${vehicle.registrationNumber})`}
                      </MenuItem>
                    ))}
                  </Select>
                  <FormHelperText>{errors.selectedVehicle}</FormHelperText>
                </FormControl>

                {/* Service Type Selection */}
                <FormControl fullWidth margin="normal" variant="outlined" error={!!errors.serviceType} required>
                  <InputLabel>Service Type</InputLabel>
                  <Select
                    value={serviceType}
                    onChange={handleServiceTypeChange}
                    label="Service Type"
                  >
                    {serviceTypes.map((type) => (
                      <MenuItem key={type.value} value={type.value}>
                        {type.label}
                      </MenuItem>
                    ))}
                  </Select>
                  <FormHelperText>
                    {errors.serviceType || (selectedService && selectedService.description)}
                  </FormHelperText>
                </FormControl>

                {/* Due Date Picker */}
                <TextField
                  fullWidth
                  margin="normal"
                  label="Due Date" // Label is inside the input field
                  type="date"
                  variant="outlined"
                  InputLabelProps={{ shrink: true }}
                  value={dueDate}
                  onChange={(event) => setDueDate(event.target.value)}
                  inputProps={{ min: new Date().toISOString().split("T")[0] }} // Restrict past dates
                  helperText={errors.dueDate || "Leave blank if using mileage-based reminder"}
                  error={!!errors.dueDate}
                  required
                />

                {/* Due Mileage */}
                <TextField
                  fullWidth
                  margin="normal"
                  label="Due Mileage"
                  variant="outlined"
                  value={dueMileage}
                  onChange={handleDueMileageChange}
                  helperText={errors.dueMileage || 
                    (selectedVehicleData ? `Current mileage: ${selectedVehicleData.mileage}` : 'Leave blank if using date-based reminder')}
                  error={!!errors.dueMileage}
                  type="number"
                  InputProps={{ 
                    inputProps: { min: 0 },
                    endAdornment: <InputAdornment position="end">miles</InputAdornment>
                  }}
                />

                {/* Priority Selection */}
                <FormControl fullWidth margin="normal" variant="outlined">
                  <InputLabel>Priority</InputLabel>
                  <Select
                    value={priority}
                    onChange={handlePriorityChange}
                    label="Priority"
                  >
                    <MenuItem value="Low">Low</MenuItem>
                    <MenuItem value="Medium">Medium</MenuItem>
                    <MenuItem value="High">High</MenuItem>
                  </Select>
                </FormControl>

                {/* Recurring Interval */}
                <FormControl fullWidth margin="normal" variant="outlined">
                  <InputLabel>Recurring Interval</InputLabel>
                  <Select
                    value={recurringInterval}
                    onChange={handleRecurringIntervalChange}
                    label="Recurring Interval"
                  >
                    <MenuItem value="">None</MenuItem>
                    {intervals.map((interval) => (
                      <MenuItem key={interval.value} value={interval.value}>
                        {interval.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                {/* Estimated Cost */}
                <TextField
                  fullWidth
                  margin="normal"
                  label="Estimated Cost"
                  variant="outlined"
                  value={estimatedCost}
                  onChange={handleEstimatedCostChange}
                  helperText={errors.estimatedCost}
                  error={!!errors.estimatedCost}
                  type="number"
                  InputProps={{ 
                    inputProps: { min: 0, step: 0.01 },
                    startAdornment: <InputAdornment position="start">Rs </InputAdornment>
                  }}
                />

                {/* Service Provider */}
                <TextField
                  fullWidth
                  margin="normal"
                  label="Service Provider"
                  variant="outlined"
                  value={serviceProvider}
                  onChange={(e) => setServiceProvider(e.target.value)}
                />

                {/* Notes */}
                <TextField
                  fullWidth
                  margin="normal"
                  label="Notes"
                  variant="outlined"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  multiline
                  rows={4}
                />

                <Button
                  fullWidth
                  variant="contained"
                  color="primary"
                  size="large"
                  type="submit"
                  style={{ marginTop: 16 }}
                  disabled={!isFormValid}
                >
                  Create Service Reminder
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
                src="https://img.freepik.com/free-photo/female-mechanic-servicing-car_1170-1255.jpg?uid=R129411847&ga=GA1.1.1390875937.1743015419"
                alt="Car Service"
                style={{
                  width: '100%',
                  height: 'auto',
                  borderRadius: '10px',
                }}
              />
              <Typography variant="h6" style={{ marginTop: 20, color: '#555' }}>
                Regular maintenance keeps your vehicle running smoothly
              </Typography>
              <Typography variant="body1" style={{ marginTop: 10, color: '#777' }}>
                {selectedService?.description || 'Select a service type to see details'}
              </Typography>
            </Box>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default AddServiceReminder;