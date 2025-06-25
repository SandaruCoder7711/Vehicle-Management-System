const express = require('express');
const router = express.Router();
const inventoryController = require('../controllers/inventoryController');

// Add a new inventory item
router.post('/add-item/', inventoryController.addNewInventoryItem);

// Delete an inventory item
router.delete('/delete-item/:id', inventoryController.deleteInventoryItem);

// Get all inventory items
router.get('/get-items/', inventoryController.getAllInventoryItems);

// Get a single inventory item by ID
router.get('/get-item/:id', inventoryController.getInventoryItemById);

// Get inventory item by product code
router.get('/get-item-by-code/:productCode', inventoryController.getInventoryItemByProductCode);

// Update an inventory item
router.put('/update-item/:id', inventoryController.updateInventoryItem);

// Get inventory items by category
router.get('/category/:category', inventoryController.getInventoryItemsByCategory);

// Search inventory items by name
router.get('/search', inventoryController.searchInventoryItemsByName);

// Get low stock items
router.get('/low-stock', inventoryController.getLowStockItems);

// Get category counts
router.get('/category-counts', inventoryController.getCategoryCounts);

// Get stock status
router.get('/stock-status', inventoryController.getStockStatus);

module.exports = router;