const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userSchema = new Schema({
  user_id: {
    type: String,
    required: true,
    unique: true, // Ensure user_id is unique
  },
  full_name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true, // Ensure email is unique
  },
  contact: {
    type: String,
    required: true,
    unique: true, // Assuming contact numbers are unique
  },
  address: {
    type: String,
    required: true,
  },
  dob: {
    type: Date,
    required: true,
  },
  gender: {
    type: String,
    required: true,
    enum: ['Male', 'Female'], // Restricted to Male & Female only
  },
  password: {
    type: String,
    required: true,
  },
  reset_token: {
    type: String,
    default: null,
  },
  reset_token_expiry: {
    type: Date,
    default: null,
  },
  last_login: {
    type: Date,
    default: null,
  }
}, { timestamps: true }); // Adds createdAt and updatedAt timestamps

module.exports = mongoose.model('User', userSchema);