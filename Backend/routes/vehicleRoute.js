// routes/vehicle.js
const express = require('express');
const router = express.Router();
const vehicleController = require('../controllers/vehicleController');
const ownerController = require('../controllers/ownerController');

// Add a new vehicle
router.post('/add-vehicle/', vehicleController.addNewVehicle);

// Delete a vehicle
router.delete('/delete-vehicle/:id', vehicleController.deleteVehicle);

// Get all vehicles
router.get('/get-vehicles/', vehicleController.getAllVehicles);

// Get a single vehicle by ID
router.get('/get-vehicle/:id', vehicleController.getVehicleById);

// Update a vehicle
router.put('/update-vehicle/:id', vehicleController.updateVehicle);

// Get vehicle counts by status
router.get('/status-counts', vehicleController.getVehicleCountsByStatus);

// Get vehicle counts by type
router.get('/type-counts', vehicleController.getVehicleCountsByType);

// Vehicle-owner relationship routes
router.put('/update-vehicle-owner/:id', vehicleController.updateVehicleOwner);
router.get('/get-vehicles-by-owner/:ownerId', vehicleController.getVehiclesByOwner);
router.put('/remove-vehicle-owner/:ownerId', vehicleController.removeVehicleOwner);

// Update vehicle mileage and notify owner
router.put('/update-vehicle-mileage/:id', vehicleController.updateVehicleMileage);

router.get('/check-vehicles/:id', ownerController.checkOwnerVehicles);

module.exports = router;