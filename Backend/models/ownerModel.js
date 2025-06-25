const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ownerSchema = new Schema({
  owner_id: {
    type: String,
    required: true,
    unique: true, // Ensure owner_id is unique
  },
  name: {
    type: String,
    required: true,
  },
  contact: {
    type: String,
    required: true,
    unique: true, // Assuming contact numbers are unique
  },
  email: {
    type: String,
    required: true,
    unique: true, // Ensure email is unique
    match: [/.+\@.+\..+/, 'Please enter a valid email address'], // Basic email validation
  },
  address: {
    type: String,
    required: true,
  },
  license_number: {
    type: String,
    required: true,
    unique: true, // Driver's license number is unique
  },
  date_of_birth: {
    type: Date,
    required: true,
  },
  gender: {
    type: String,
    required: true,
    enum: ['Male', 'Female', 'Other'], // Restricted to specific values
  },
  vehicles: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Vehicle' }]
}, { timestamps: true }); // Adds createdAt and updatedAt timestamps

module.exports = mongoose.model('Owner', ownerSchema);