// routes/owner.js
const express = require('express');
const router = express.Router();
const ownerController = require('../controllers/ownerController');

// Add a new owner
router.post('/add-owner/', ownerController.addNewOwner);

// Delete an owner
router.delete('/delete-owner/:id', ownerController.deleteOwner);

// Get all owners
router.get('/get-owners/', ownerController.getAllOwners);

// Get a single owner by ID
router.get('/get-owner/:id', ownerController.getOwnerById);

// Get owner by owner_id
router.get('/get-owner-by-id/:owner_id', ownerController.getOwnerByOwnerId);

// Update an owner
router.put('/update-owner/:id', ownerController.updateOwner);

// Get owner counts by gender
router.get('/gender-counts', ownerController.getOwnerCountsByGender);

// Search owners by name
router.get('/search', ownerController.searchOwnersByName);

// Get the owner Vehicles
router.post('/vehicles', ownerController.getLoggedInOwnerVehicles);

module.exports = router;