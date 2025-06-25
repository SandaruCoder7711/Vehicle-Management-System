const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const serviceReminderSchema = new Schema({
  vehicle: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Vehicle',
    required: true
  },
  serviceType: {
    type: String,
    required: true,
    enum: [
      'Oil Change', 
      'Tire Rotation',
      'Brake Inspection',
      'Engine Tune-up',
      'Transmission Service',
      'Battery Check',
      'Coolant Flush',
      'Air Filter Replacement',
      'Wheel Alignment',
      'Other'
    ]
  },
  dueDate: {
    type: Date,
    required: false // Either dueDate or dueMileage must be provided
  },
  dueMileage: {
    type: Number,
    required: false, // Either dueDate or dueMileage must be provided
    min: 0
  },
  status: {
    type: String,
    required: true,
    enum: ['Pending', 'Completed', 'Overdue'],
    default: 'Pending'
  },
  priority: {
    type: String,
    required: true,
    enum: ['Low', 'Medium', 'High'],
    default: 'Medium'
  },
  notes: {
    type: String,
    required: false
  },
  estimatedCost: {
    type: Number,
    required: false,
    min: 0
  },
  serviceProvider: {
    type: String,
    required: false
  },
  recurringInterval: {
    type: String,
    required: false,
    enum: [
      '3 months',
      '6 months',
      '1 year',
      '5000 miles',
      '10000 miles',
      '15000 miles',
      null
    ],
    default: null
  }
}, { timestamps: true });

// Validation to ensure either dueDate or dueMileage is provided
serviceReminderSchema.pre('validate', function(next) {
  if (!this.dueDate && !this.dueMileage) {
    this.invalidate('due', 'Either due date or due mileage must be provided');
  }
  next();
});

module.exports = mongoose.model('ServiceReminder', serviceReminderSchema);

