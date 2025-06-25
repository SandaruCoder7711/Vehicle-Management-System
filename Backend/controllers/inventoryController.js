const Inventory = require("../models/inventoryModel");
const mongoose = require('mongoose');

// Add a new inventory item
exports.addNewInventoryItem = async (req, res) => {
    try {
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
            supplier 
        } = req.body;

        // Create an array to hold error messages for missing fields
        const missingFields = [];

        // Check each required field and push to missingFields array if not provided
        if (!productCode) missingFields.push("productCode");
        if (!name) missingFields.push("name");
        if (!category) missingFields.push("category");
        if (stockQuantity === undefined) missingFields.push("stockQuantity");
        if (minimumStockLevel === undefined) missingFields.push("minimumStockLevel");
        if (purchasePrice === undefined) missingFields.push("purchasePrice");
        if (sellingPrice === undefined) missingFields.push("sellingPrice");
        if (!brand) missingFields.push("brand");

        // If there are any missing fields, return a detailed message
        if (missingFields.length > 0) {
            return res.status(400).json({ 
                message: "The following fields are required", 
                missingFields 
            });
        }

        // Check if an inventory item with the same product code already exists
        const existingItem = await Inventory.findOne({ productCode });
        if (existingItem) {
            return res.status(409).json({ 
                message: "An inventory item with this product code already exists",
                productCode
            });
        }

        // Create a new inventory item
        const newInventoryItem = new Inventory({
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
            supplier,
        });

        // Save the new inventory item
        await newInventoryItem.save();
        
        res.status(201).json({ 
            message: "New inventory item added successfully!",
            item: newInventoryItem 
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: err.message });
    }
};

// Delete an inventory item
exports.deleteInventoryItem = async (req, res) => {
    const itemId = req.params.id;

    try {
        // Check if the itemId is a valid ObjectId
        if (!mongoose.Types.ObjectId.isValid(itemId)) {
            return res.status(400).json({ message: "Invalid inventory item ID" });
        }

        const result = await Inventory.deleteOne({ _id: itemId });

        if (result.deletedCount === 0) {
            return res.status(404).json({ message: "Inventory item not found" });
        }

        res.status(200).json({ message: "Inventory item deleted successfully" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: err.message });
    }
};

// Get all inventory items
exports.getAllInventoryItems = async (req, res) => {
    try {
        const inventoryItems = await Inventory.find();
        res.json(inventoryItems);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Get a single inventory item by ID
exports.getInventoryItemById = async (req, res) => {
    const { id } = req.params;

    try {
        // Check if the id is a valid ObjectId
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ message: "Invalid inventory item ID" });
        }

        const inventoryItem = await Inventory.findById(id);
        if (!inventoryItem) return res.status(404).json({ message: "Inventory item not found!" });
        
        res.json(inventoryItem);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Get inventory item by product code
exports.getInventoryItemByProductCode = async (req, res) => {
    const { productCode } = req.params;

    try {
        const inventoryItem = await Inventory.findOne({ productCode });
        if (!inventoryItem) return res.status(404).json({ message: "Inventory item not found!" });
        
        res.json(inventoryItem);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Update an inventory item
exports.updateInventoryItem = async (req, res) => {
    const itemId = req.params.id;
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
        supplier 
    } = req.body;

    // Validate inputs
    if (!(productCode && name && category && stockQuantity !== undefined && 
           minimumStockLevel !== undefined && purchasePrice !== undefined && 
           sellingPrice !== undefined && brand)) {
        return res.status(400).send({ message: "All required inputs are missing" });
    }

    // Check if itemId is a valid ObjectId
    if (!mongoose.Types.ObjectId.isValid(itemId)) {
        return res.status(400).send({ message: "Invalid inventory item ID" });
    }

    try {
        // Check if the inventory item exists in the database
        const isInventoryItem = await Inventory.findById(itemId);

        if (!isInventoryItem) {
            return res.status(404).json({ message: "Inventory item not found!" });
        }

        // Check if another item with the same product code already exists (excluding current item)
        const existingItemByCode = await Inventory.findOne({ 
            productCode, 
            _id: { $ne: itemId } 
        });
        
        if (existingItemByCode) {
            return res.status(409).json({ 
                message: "Another inventory item with this product code already exists",
                productCode
            });
        }

        // Determine status based on stock quantity and minimum stock level
        let status;
        if (stockQuantity === 0) {
            status = 'Out of Stock';
        } else if (stockQuantity <= minimumStockLevel) {
            status = 'Low Stock';
        } else {
            status = 'In Stock';
        }

        // Update the inventory item
        const result = await Inventory.findByIdAndUpdate(
            itemId,
            {
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
                supplier,
                status  // Include status in the update
            },
            { new: true }  // Return the updated document
        );

        if (!result) {
            return res.status(400).json({ message: "No changes were made" });
        }

        return res.status(200).json({ 
            message: "Inventory item updated successfully!",
            item: result
        });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: err.message });
    }
};

// Get inventory items by category
exports.getInventoryItemsByCategory = async (req, res) => {
    const { category } = req.params;

    try {
        const inventoryItems = await Inventory.find({ category });

        if (inventoryItems.length === 0) {
            return res.json({ message: "No inventory items found in this category" });
        }

        res.json(inventoryItems);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Search inventory items by name
exports.searchInventoryItemsByName = async (req, res) => {
    const { query } = req.query;

    if (!query) {
        return res.status(400).json({ message: "Search query is required" });
    }

    try {
        // Case-insensitive search for inventory items by name
        const inventoryItems = await Inventory.find({
            name: { $regex: query, $options: 'i' }
        });

        if (inventoryItems.length === 0) {
            return res.json({ message: "No inventory items found matching the search criteria" });
        }

        res.json(inventoryItems);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Get low stock inventory items
exports.getLowStockItems = async (req, res) => {
    try {
        const lowStockItems = await Inventory.find({
            $expr: { $lte: ["$stockQuantity", "$minimumStockLevel"] }
        });

        res.json({
            lowStockItems,
            count: lowStockItems.length
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Get category counts
exports.getCategoryCounts = async (req, res) => {
    try {
        const categoryCounts = await Inventory.aggregate([
            { $group: {
                _id: "$category",
                count: { $sum: 1 }
            }},
            { $project: {
                _id: 0,
                category: "$_id",
                count: 1
            }}
        ]);

        res.json(categoryCounts);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Get stock status summary
exports.getStockStatus = async (req, res) => {
    try {
        const stockStatus = await Inventory.aggregate([
            { $group: {
                _id: {
                    status: {
                        $cond: [
                            { $eq: ["$stockQuantity", 0] },
                            "Out of Stock",
                            {
                                $cond: [
                                    { $lte: ["$stockQuantity", "$minimumStockLevel"] },
                                    "Low Stock",
                                    "In Stock"
                                ]
                            }
                        ]
                    }
                },
                count: { $sum: 1 }
            }},
            { $project: {
                _id: 0,
                status: "$_id.status",
                count: 1
            }}
        ]);

        res.json(stockStatus);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};