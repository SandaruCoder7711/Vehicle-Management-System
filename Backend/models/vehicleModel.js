const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const vehicleSchema = new Schema({
  registrationNumber: {
    type: String,
    required: true,
    unique: true, 
  },
  make: {
    type: String,
    required: true,
  },
  model: {
    type: String,
    required: true,
  },
  year: {
    type: Number,
    required: true,
    min: 1900, 
    max: new Date().getFullYear(), 
  },
  fuelType: {
    type: String,
    required: true,
    enum: ['Petrol', 'Diesel', 'Electric', 'Hybrid'], 
  },
  vehicleType: {
    type: String,
    required: true,
    enum: ['Sedan', 'SUV', 'Truck', 'Hatchback', 'Coupe', 'Van', 'Motorcycle', 'Convertible', 'Crossover', 'Minivan', 'Pickup Truck', 'Sports Car', 'Electric Vehicle', 'Hybrid Vehicle']
  },
  color: {
    type: String,
    required: false, 
  },
  mileage: {
    type: Number,
    required: false,
    min: 0,
    default: 0
  },
  lastServiceMileage: {
    type: Number,
    required: false,
    min: 0,
    default: 0
  },
  status: {
    type: String,
    required: true,
    enum: ['Active', 'Inactive'], 
    default: 'Active', 
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Owner',
    required: false
  }
}, { timestamps: true }); 

module.exports = mongoose.model('Vehicle', vehicleSchema);