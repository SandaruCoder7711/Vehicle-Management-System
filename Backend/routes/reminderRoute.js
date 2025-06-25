// routes/serviceReminder.js
const express = require('express');
const router = express.Router();
const serviceReminderController = require('../controllers/serviceReminderController');
const authMiddleware = require('../middleware/authMiddleware'); // Optional for protected routes

// Create a new service reminder
router.post('/add-reminder/', serviceReminderController.createServiceReminder);

// Get all service reminders
router.get('/get-reminders/', serviceReminderController.getAllServiceReminders);

// Get reminders for a specific vehicle
router.get('/get-vehicle-reminders/:vehicleId', serviceReminderController.getRemindersByVehicle);

// Get a single reminder by ID
router.get('/get-reminder/:id', serviceReminderController.getServiceReminder);

// Update a service reminder
router.put('/update-reminder/:id', serviceReminderController.updateServiceReminder);

// Delete a service reminder
router.delete('/delete-reminder/:id', serviceReminderController.deleteServiceReminder);

// Mark reminder as completed (with optional recurrence)
router.put('/complete-reminder/:id', serviceReminderController.markAsCompleted);

// Get overdue reminders
router.get('/overdue-reminders', serviceReminderController.getOverdueReminders);

// Get reminders by status (Pending/Completed/Overdue)
router.get('/reminders-by-status/:status', serviceReminderController.getRemindersByStatus);

// Generate automatic reminders (admin functionality)
router.post('/generate-auto-reminders', serviceReminderController.generateAutoReminders);

// Get service type counts
router.get('/service-type-counts', serviceReminderController.getServiceTypeCounts);

// Get service reminder status counts
router.get('/service-status-counts', serviceReminderController.getStatusCounts);

// Get detailed overdue reminders
router.get('/overdue-details', serviceReminderController.getOverdueReminderDetails);

module.exports = router;