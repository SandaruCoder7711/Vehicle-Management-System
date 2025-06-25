const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const inventorySchema = new Schema({
  // Product Identification
  productCode: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  category: {
    type: String,
    required: true,
    enum: [
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
    ]
  },
  
  // Stock Details
  stockQuantity: {
    type: Number,
    required: true,
    min: 0,
    default: 0
  },
  minimumStockLevel: {
    type: Number,
    required: true,
    min: 0,
    default: 5
  },
  
  // Pricing and Cost
  purchasePrice: {
    type: Number,
    required: true,
    min: 0
  },
  sellingPrice: {
    type: Number,
    required: true,
    min: 0
  },
  
  // Product Details
  brand: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  manufacturer: {
    type: String,
    trim: true
  },
  
  // Status and Tracking
  status: {
    type: String,
    required: true,
    enum: ['In Stock', 'Low Stock', 'Out of Stock', 'Discontinued'],
    default: 'In Stock'
  },
  
  // Additional Metadata
  location: {
    type: String,
    trim: true,
    description: 'Warehouse or shelf location'
  },
  
  // Quality and Condition
  condition: {
    type: String,
    enum: ['New', 'Refurbished', 'Used'],
    default: 'New'
  },
  
  // Supplier Information
  supplier: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Supplier',
    required: false
  }
}, { 
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for calculating stock status
inventorySchema.virtual('stockStatus').get(function() {
  if (this.stockQuantity === 0) return 'Out of Stock';
  if (this.stockQuantity <= this.minimumStockLevel) return 'Low Stock';
  return 'In Stock';
});

// Middleware to update status for both save and update operations
inventorySchema.pre(['save', 'findOneAndUpdate', 'updateOne'], function(next) {
  // For save operation
  if (this instanceof mongoose.Document) {
    if (this.stockQuantity === 0) {
      this.status = 'Out of Stock';
    } else if (this.stockQuantity <= this.minimumStockLevel) {
      this.status = 'Low Stock';
    } else {
      this.status = 'In Stock';
    }
  } 
  // For update operations
  else {
    const update = this.getUpdate();
    if (update.$set && (update.$set.stockQuantity !== undefined)) {
      const stockQuantity = update.$set.stockQuantity;
      if (stockQuantity === 0) {
        this.set('status', 'Out of Stock');
      } else if (stockQuantity <= this.get('minimumStockLevel')) {
        this.set('status', 'Low Stock');
      } else {
        this.set('status', 'In Stock');
      }
    }
  }
  next();
});

// Index for performance optimization
inventorySchema.index({ productCode: 1, category: 1 });

module.exports = mongoose.model('Inventory', inventorySchema);