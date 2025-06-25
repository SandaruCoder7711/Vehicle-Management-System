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
  FormHelperText 
} from '@material-ui/core';
import Sidebar from '../../Components/inventory_sidebar';
import Header from '../../Components/inventory_navbar'; 
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import swal from 'sweetalert';

const UpdateInventory = () => {
  const { id } = useParams(); // Extract ID from URL params
  const navigate = useNavigate();

  // State variables for form fields
  const [productCode, setProductCode] = useState('');
  const [name, setName] = useState('');
  const [category, setCategory] = useState('');
  const [stockQuantity, setStockQuantity] = useState('0');
  const [minimumStockLevel, setMinimumStockLevel] = useState('5');
  const [purchasePrice, setPurchasePrice] = useState('');
  const [sellingPrice, setSellingPrice] = useState('');
  const [brand, setBrand] = useState('');
  const [description, setDescription] = useState('');
  const [manufacturer, setManufacturer] = useState('');
  const [location, setLocation] = useState('');
  const [condition, setCondition] = useState('New');
  const [status, setStatus] = useState('In Stock');
  const [errors, setErrors] = useState({});
  const [isFormValid, setIsFormValid] = useState(false);

  // Categories for inventory items
  const categories = [
    'Engine Parts', 
    'Transmission', 
    'Electrical', 
    'Brakes', 
    'Suspension', 
    'Body Parts', 
    'Accessories', 
    'Fluids', 
    'Tires', 
    'Other'
  ];

  // Conditions for inventory items
  const conditions = ['New', 'Refurbished', 'Used'];

  // Fetch existing inventory item data when component mounts
  useEffect(() => {
    const fetchInventoryItem = async () => {
      try {
        const response = await axios.get(`http://localhost:3001/inventory/get-item/${id}`);
        const { 
          productCode, 
          name, 
          category, 
          stockQuantity, 
          minimumStockLevel, 
          purchasePrice, 
          sellingPrice, 
          brand,
          description,
          manufacturer,
          location,
          condition,
          status 
        } = response.data;

        // Set all the state variables with fetched data
        setProductCode(productCode);
        setName(name);
        setCategory(category);
        setStockQuantity(stockQuantity.toString());
        setMinimumStockLevel(minimumStockLevel.toString());
        setPurchasePrice(purchasePrice.toString());
        setSellingPrice(sellingPrice.toString());
        setBrand(brand);
        setDescription(description || '');
        setManufacturer(manufacturer || '');
        setLocation(location || '');
        setCondition(condition);
        setStatus(status);
      } catch (error) {
        console.error(error);
        swal("Error", "Failed to fetch inventory item data.", "error");
      }
    };

    fetchInventoryItem();
  }, [id]);

  // Effect to check if all required fields are filled
  useEffect(() => {
    const requiredFields = {
      name,
      category,
      stockQuantity,
      minimumStockLevel,
      purchasePrice,
      sellingPrice,
      brand
    };
    
    // Check if all required fields have values
    const valid = Object.values(requiredFields).every(field => field !== '');
    setIsFormValid(valid);
  }, [name, category, stockQuantity, minimumStockLevel, purchasePrice, sellingPrice, brand]);

  // Validation functions for various fields
  const handleNumberChange = (setter, errorField) => (event) => {
    const value = event.target.value;
    if (value === '' || (!isNaN(value) && parseFloat(value) >= 0)) {
      setter(value);
      setErrors(prevErrors => ({ ...prevErrors, [errorField]: '' }));
    }
  };

  const handleCategoryChange = (event) => {
    setCategory(event.target.value);
    setErrors(prevErrors => ({ ...prevErrors, category: '' }));
  };

  const handleConditionChange = (event) => {
    setCondition(event.target.value);
  };

  const handleStatusChange = (event) => {
    setStatus(event.target.value);
  };

  // Form validation
  const validateForm = () => {
    const newErrors = {};
    const MAX_PRICE = 1000000;
    
    // Required field validations
    if (!name) newErrors.name = "Name is required.";
    if (!category) newErrors.category = "Category is required.";
    if (!brand) newErrors.brand = "Brand is required.";
    
    // Numeric field validations
    if (stockQuantity === '' || isNaN(stockQuantity) || parseInt(stockQuantity) < 0) {
      newErrors.stockQuantity = "Stock Quantity must be a non-negative number.";
    }
    
    if (minimumStockLevel === '' || isNaN(minimumStockLevel) || parseInt(minimumStockLevel) < 0) {
      newErrors.minimumStockLevel = "Minimum Stock Level must be a non-negative number.";
    }
    
    if (purchasePrice === '' || isNaN(purchasePrice) || parseFloat(purchasePrice) < 0) {
      newErrors.purchasePrice = "Purchase Price must be a non-negative number.";
    }
    
    if (sellingPrice === '' || isNaN(sellingPrice) || parseFloat(sellingPrice) < 0) {
      newErrors.sellingPrice = "Selling Price must be a non-negative number.";
    }
    
    if (purchasePrice === '' || isNaN(purchasePrice) || parseFloat(purchasePrice) < 0 || parseFloat(purchasePrice) > MAX_PRICE) {
      newErrors.purchasePrice = `Purchase Price must be a non-negative number not exceeding ${MAX_PRICE.toLocaleString()}.`;
    }
    
    if (sellingPrice === '' || isNaN(sellingPrice) || parseFloat(sellingPrice) < 0 || parseFloat(sellingPrice) > MAX_PRICE) {
      newErrors.sellingPrice = `Selling Price must be a non-negative number not exceeding ${MAX_PRICE.toLocaleString()}.`;
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
  
    // Automatically calculate status based on stock quantity
    let calculatedStatus = 'In Stock';
    const stockQty = parseInt(stockQuantity);
    const minStockLevel = parseInt(minimumStockLevel);
  
    if (stockQty === 0) {
      calculatedStatus = 'Out of Stock';
    } else if (stockQty <= minStockLevel) {
      calculatedStatus = 'Low Stock';
    }
  
    const updatedInventoryItem = {
      productCode,
      name,
      category,
      stockQuantity: stockQty,
      minimumStockLevel: minStockLevel,
      purchasePrice: parseFloat(purchasePrice),
      sellingPrice: parseFloat(sellingPrice),
      brand,
      description,
      manufacturer,
      location,
      condition,
      status: calculatedStatus  // Use the calculated status
    };
  
    try {
      await axios.put(`http://localhost:3001/inventory/update-item/${id}`, updatedInventoryItem);
      swal("Success", "Inventory item updated successfully!", "success");
      navigate('/view-inventory');
    } catch (error) {
      console.error(error);
      
      // Handle specific error scenarios
      if (error.response && error.response.status === 409) {
        swal("Error", error.response.data.message, "error");
      } else {
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
          p={5}
          style={{ 
            backgroundColor: 'white', 
            borderRadius: 8, 
            boxShadow: '0px 0px 10px rgba(0,0,0,0.1)', 
            flex: 1, 
            margin: '15px' 
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
              marginTop: '30px', 
              marginBottom: '30px'
            }}
          >
            Update Inventory Item
          </Typography>

          <Box 
            display="flex" 
            width="100%" 
            justifyContent="space-between"
          >
            {/* Left Column */}
            <Box 
              width="48%" 
              display="flex" 
              flexDirection="column" 
              alignItems="stretch"
            >
              <TextField
                fullWidth
                margin="normal"
                label="Product Code"
                variant="outlined"
                value={productCode}
                disabled
                InputProps={{ readOnly: true }}
              />
              
              <TextField
                fullWidth
                margin="normal"
                label="Name"
                variant="outlined"
                value={name}
                onChange={(e) => setName(e.target.value)}
                helperText={errors.name}
                error={!!errors.name}
                required
              />
              
              <FormControl 
                fullWidth 
                margin="normal" 
                variant="outlined" 
                error={!!errors.category} 
                required
              >
                <InputLabel>Category</InputLabel>
                <Select
                  value={category}
                  onChange={handleCategoryChange}
                  label="Category"
                >
                  {categories.map((cat) => (
                    <MenuItem key={cat} value={cat}>
                      {cat}
                    </MenuItem>
                  ))}
                </Select>
                <FormHelperText>{errors.category}</FormHelperText>
              </FormControl>
              
              <TextField
                fullWidth
                margin="normal"
                label="Stock Quantity"
                variant="outlined"
                value={stockQuantity}
                onChange={handleNumberChange(setStockQuantity, 'stockQuantity')}
                helperText={errors.stockQuantity || "Current quantity in stock"}
                error={!!errors.stockQuantity}
                type="number"
                InputProps={{ inputProps: { min: 0 } }}
              />
              
              <TextField
                fullWidth
                margin="normal"
                label="Minimum Stock Level"
                variant="outlined"
                value={minimumStockLevel}
                onChange={handleNumberChange(setMinimumStockLevel, 'minimumStockLevel')}
                helperText={errors.minimumStockLevel || "Threshold for restocking"}
                error={!!errors.minimumStockLevel}
                type="number"
                InputProps={{ inputProps: { min: 0 } }}
              />
             <TextField
                fullWidth
                margin="normal"
                label="Brand"
                variant="outlined"
                value={brand}
                onChange={(e) => setBrand(e.target.value)}
                helperText={errors.brand}
                error={!!errors.brand}
                required
              />
            </Box>

            {/* Right Column */}
            <Box 
              width="48%" 
              display="flex" 
              flexDirection="column" 
              alignItems="stretch"
            >
              <TextField
                fullWidth
                margin="normal"
                label="Purchase Price (Rs)"
                variant="outlined"
                value={purchasePrice}
                onChange={handleNumberChange(setPurchasePrice, 'purchasePrice')}
                helperText={errors.purchasePrice}
                error={!!errors.purchasePrice}
                type="number"
                InputProps={{ inputProps: { min: 0, step: 0.01 } }}
              />
              
              <TextField
                fullWidth
                margin="normal"
                label="Selling Price (Rs)"
                variant="outlined"
                value={sellingPrice}
                onChange={handleNumberChange(setSellingPrice, 'sellingPrice')}
                helperText={errors.sellingPrice}
                error={!!errors.sellingPrice}
                type="number"
                InputProps={{ inputProps: { min: 0, step: 0.01 } }}
              />
              
              <TextField
                fullWidth
                margin="normal"
                label="Description"
                variant="outlined"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                multiline
                rows={8}
              />
              
              <FormControl 
                fullWidth 
                margin="normal" 
                variant="outlined"
              >
                <InputLabel>Condition</InputLabel>
                <Select
                  value={condition}
                  onChange={handleConditionChange}
                  label="Condition"
                >
                  {conditions.map((cond) => (
                    <MenuItem key={cond} value={cond}>
                      {cond}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              
              <FormControl 
                fullWidth 
                margin="normal" 
                variant="outlined"
              >
                <InputLabel>Status</InputLabel>
                <Select
                  value={status}
                  onChange={handleStatusChange}
                  label="Status"
                >
                  <MenuItem value="In Stock">In Stock</MenuItem>
                  <MenuItem value="Low Stock">Low Stock</MenuItem>
                  <MenuItem value="Out of Stock">Out of Stock</MenuItem>
                  <MenuItem value="Discontinued">Discontinued</MenuItem>
                </Select>
              </FormControl>
            </Box>
          </Box>

          {/* Submit Button */}
          <Box 
            width="100%" 
            display="flex" 
            justifyContent="center" 
            mt={2}
          >
            <Button
              variant="contained"
              color="primary"
              size="large"
              type="submit"
              style={{ width: '100%' }}
              disabled={!isFormValid}
              onClick={handleSubmit}
            >
              Update Inventory Item
            </Button>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default UpdateInventory;