const ServiceReminder = require("../models/reminderModel");
const Vehicle = require("../models/vehicleModel");
const Owner = require("../models/ownerModel");
const mongoose = require('mongoose');
const { exec } = require('child_process');
const path = require('path');
const nodemailer = require('nodemailer');

// Helper method to predict optimal service date
const predictOptimalServiceDate = async (vehicle, serviceType) => {

  const modelPath = path.resolve(__dirname, '../controllers/ai_model/service_date_model.pkl');
  const scriptPath = path.resolve(__dirname, '../controllers/ai_model/predict_service_date.py');

  return new Promise((resolve, reject) => {
    const command = `python "${scriptPath}" "${modelPath}" ${vehicle.mileage} ${vehicle.lastServiceMileage} "${serviceType}" "${vehicle.make}" ${vehicle.year}`;

    exec(command, (error, stdout, stderr) => {
      if (error) {
        console.error("Error:", stderr);
        const fallback = new Date();
        fallback.setMonth(fallback.getMonth() + 6);
        resolve(fallback);
        return;
      }

      // stdout should now be JUST the number (e.g. "186.80")
      const days = parseFloat(stdout.trim());
      
      if (isNaN(days)) {
        console.error("Invalid days value:", stdout);
        const fallback = new Date();
        fallback.setMonth(fallback.getMonth() + 6);
        resolve(fallback);
        return;
      }

      // Apply reasonable bounds (1-12 months)
      const boundedDays = Math.max(30, Math.min(days, 365));
      
      const prediction = new Date();
      prediction.setDate(prediction.getDate() + boundedDays);
      
      resolve(prediction);
    });
  });
};

// Helper method to send email notifications
const sendServiceNotification = (email, vehicle, reminder) => {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_APP_PASSWORD
    }
  });

  const mailOptions = {
    from: process.env.EMAIL_FROM || 'Vehicle Management System <noreply@example.com>',
    to: email,
    subject: `Service Reminder: ${reminder.serviceType} for ${vehicle.make} ${vehicle.model}`,
    html: `
      <div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #ddd; border-radius: 5px;">
        <h2 style="color: #333;">Service Reminder</h2>
        <p><strong>Vehicle:</strong> ${vehicle.make} ${vehicle.model} (${vehicle.registrationNumber})</p>
        <p><strong>Service Type:</strong> ${reminder.serviceType}</p>
        <p><strong>Due Date:</strong> ${reminder.dueDate.toLocaleDateString()}</p>
        <p><strong>Priority:</strong> ${reminder.priority}</p>
        ${reminder.notes ? `<p><strong>Notes:</strong> ${reminder.notes}</p>` : ''}
        <p style="margin-top: 20px; color: #666;">
          This is an automated reminder from the Vehicle Management System.
        </p>
      </div>
    `
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.error('Error sending service reminder email:', error);
    } else {
      console.log('Service reminder email sent:', info.response);
    }
  });
};

// Create a new service reminder
exports.createServiceReminder = async (req, res) => {
  try {
    const { vehicle, serviceType, dueDate, dueMileage, priority, notes, estimatedCost, serviceProvider, recurringInterval } = req.body;

    // Validate required fields
    const missingFields = [];
    if (!vehicle) missingFields.push("vehicle");
    if (!serviceType) missingFields.push("serviceType");
    if (!dueDate && !dueMileage) missingFields.push("dueDate or dueMileage");

    if (missingFields.length > 0) {
      return res.status(400).json({ 
        message: "Missing required fields",
        missingFields 
      });
    }

    // Check if vehicle exists
    const vehicleExists = await Vehicle.findById(vehicle);

    if (!vehicleExists) {
      return res.status(404).json({ message: "Vehicle not found" });
    }

    // Create new reminder
    const newReminder = new ServiceReminder({
      vehicle,
      serviceType,
      dueDate,
      dueMileage,
      priority: priority || 'Medium',
      notes,
      estimatedCost,
      serviceProvider,
      recurringInterval
    });

    await newReminder.save();

    // Send notification to owner if exists
    if (vehicleExists.owner) {
      const owner = await Owner.findById(vehicleExists.owner);
      if (owner && owner.email) {
        sendServiceNotification(owner.email, vehicleExists, newReminder);
      }
    }

    res.status(201).json(newReminder);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
};

// Get all service reminders
exports.getAllServiceReminders = async (req, res) => {
  try {
    const reminders = await ServiceReminder.find().populate('vehicle', 'make model registrationNumber');
    res.json(reminders);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get service reminders by vehicle ID
exports.getRemindersByVehicle = async (req, res) => {
  try {
    const reminders = await ServiceReminder.find({ vehicle: req.params.vehicleId })
      .populate('vehicle', 'make model registrationNumber')
      .sort({ dueDate: 1 });

    if (!reminders.length) {
      return res.status(404).json({ message: "No reminders found for this vehicle" });
    }

    res.json(reminders);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get a single service reminder by ID
exports.getServiceReminder = async (req, res) => {
  try {
    const reminder = await ServiceReminder.findById(req.params.id).populate('vehicle');
    
    if (!reminder) {
      return res.status(404).json({ message: "Service reminder not found" });
    }

    res.json(reminder);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Update a service reminder
exports.updateServiceReminder = async (req, res) => {
  try {
    const { id } = req.params;
    
    const updateData = req.body;

    // Validate at least one due field exists if updating
    if (updateData.dueDate === null && updateData.dueMileage === null) {
      return res.status(400).json({ 
        message: "Either dueDate or dueMileage must be provided" 
      });
    }

    const updatedReminder = await ServiceReminder.findByIdAndUpdate(
      id, 
      updateData, 
      { new: true, runValidators: true }
    ).populate('vehicle');

    if (!updatedReminder) {
      return res.status(404).json({ message: "Service reminder not found" });
    }

    // Send notification if status changed to pending and vehicle has owner
    if (updateData.status === 'Pending' && updatedReminder.vehicle.owner) {
      const owner = await Owner.findById(updatedReminder.vehicle.owner);
      if (owner && owner.email) {
        sendServiceNotification(owner.email, updatedReminder.vehicle, updatedReminder);
      }
    }

    res.json(updatedReminder);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
};

// Delete a service reminder
exports.deleteServiceReminder = async (req, res) => {
  try {
    const deletedReminder = await ServiceReminder.findByIdAndDelete(req.params.id);
    
    if (!deletedReminder) {
      return res.status(404).json({ message: "Service reminder not found" });
    }

    res.json({ message: "Service reminder deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Mark service reminder as completed
exports.markAsCompleted = async (req, res) => {
  try {
    const { id } = req.params;
    const { actualServiceDate, actualServiceMileage, notes } = req.body;

    const reminder = await ServiceReminder.findById(id).populate('vehicle');
    if (!reminder) {
      return res.status(404).json({ message: "Service reminder not found" });
    }

    // Update reminder
    reminder.status = 'Completed';
    reminder.completedAt = new Date();
    if (actualServiceDate) reminder.actualServiceDate = actualServiceDate;
    if (actualServiceMileage) reminder.actualServiceMileage = actualServiceMileage;
    if (notes) reminder.notes = notes;

    await reminder.save();

    let newDueDate = null;
    let newReminder = null;

    // If recurring, create new reminder
    if (reminder.recurringInterval) {
      newDueDate = await predictOptimalServiceDate(
        reminder.vehicle, 
        reminder.serviceType
      );

      newReminder = new ServiceReminder({
        vehicle: reminder.vehicle._id,
        serviceType: reminder.serviceType,
        dueDate: newDueDate,
        priority: reminder.priority,
        recurringInterval: reminder.recurringInterval,
        isSystemGenerated: true
      });

      await newReminder.save();
    }

    // Send completion notification to owner if exists
    if (reminder.vehicle.owner) {
      const owner = await Owner.findById(reminder.vehicle.owner);
      if (owner && owner.email) {
        const transporter = nodemailer.createTransport({
          service: 'gmail',
          auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_APP_PASSWORD
          }
        });

        const mailOptions = {
          from: process.env.EMAIL_FROM || 'Vehicle Management System <noreply@example.com>',
          to: owner.email,
          subject: `Service Completed: ${reminder.serviceType} for ${reminder.vehicle.make} ${reminder.vehicle.model}`,
          html: `
            <div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #ddd; border-radius: 5px;">
              <h2 style="color: #333;">Service Completion Confirmation</h2>
              <p><strong>Vehicle:</strong> ${reminder.vehicle.make} ${reminder.vehicle.model} (${reminder.vehicle.registrationNumber})</p>
              <p><strong>Service Type:</strong> ${reminder.serviceType}</p>
              <p><strong>Completed On:</strong> ${reminder.completedAt.toLocaleDateString()}</p>
              ${actualServiceMileage ? `<p><strong>Service Mileage:</strong> ${actualServiceMileage}</p>` : ''}
              ${notes ? `<p><strong>Notes:</strong> ${notes}</p>` : ''}
              
              ${newDueDate ? `
                <div style="margin-top: 20px; background-color: #f8f9fa; padding: 15px; border-radius: 5px;">
                  <h3 style="color: #2c3e50;">Next Service Reminder</h3>
                  <p><strong>Next Service Type:</strong> ${reminder.serviceType}</p>
                  <p><strong>Scheduled Date:</strong> ${newDueDate.toLocaleDateString()}</p>
                  ${reminder.recurringInterval ? `<p><strong>Recurring Interval:</strong> ${reminder.recurringInterval}</p>` : ''}
                </div>
              ` : ''}
              
              <p style="margin-top: 20px; color: #666;">
                Thank you for maintaining your vehicle with us.
              </p>
            </div>
          `
        };

        transporter.sendMail(mailOptions, (error, info) => {
          if (error) {
            console.error('Error sending completion email:', error);
          } else {
            console.log('Completion email sent:', info.response);
          }
        });
      }
    }

    res.json({
      reminder,
      newReminder: newReminder || null
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
};

// Get overdue service reminders
exports.getOverdueReminders = async (req, res) => {
  try {
    const today = new Date();
    const reminders = await ServiceReminder.find({
      status: 'Pending',
      $or: [
        { dueDate: { $lte: today } },
        { 
          $expr: { 
            $and: [
              { $ne: ['$dueMileage', null] },
              { $lte: ['$dueMileage', '$vehicle.mileage'] }
            ]
          } 
        }
      ]
    }).populate('vehicle');

    res.json(reminders);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get service reminders by status
exports.getRemindersByStatus = async (req, res) => {
  try {
    const { status } = req.params;
    const validStatuses = ['Pending', 'Completed', 'Overdue'];
    
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ 
        message: "Invalid status", 
        validStatuses 
      });
    }

    let query = { status };
    
    // Special handling for Overdue status
    if (status === 'Overdue') {
      const today = new Date();
      query = {
        status: 'Pending',
        $or: [
          { dueDate: { $lte: today } },
          { 
            $expr: { 
              $and: [
                { $ne: ['$dueMileage', null] },
                { $lte: ['$dueMileage', '$vehicle.mileage'] }
              ]
            } 
          }
        ]
      };
    }

    const reminders = await ServiceReminder.find(query).populate('vehicle');
    res.json(reminders);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Generate service reminders automatically based on vehicle data
exports.generateAutoReminders = async (req, res) => {
  try {
    const vehicles = await Vehicle.find().populate('owner');
    let remindersCreated = 0;

    for (const vehicle of vehicles) {
      // Predict next service date based on vehicle data
      const nextServiceDate = await predictOptimalServiceDate(vehicle, 'Oil Change');
      
      // Check if similar reminder already exists
      const existingReminder = await ServiceReminder.findOne({
        vehicle: vehicle._id,
        serviceType: 'Oil Change',
        status: 'Pending'
      });

      if (!existingReminder) {
        const newReminder = new ServiceReminder({
          vehicle: vehicle._id,
          serviceType: 'Oil Change',
          dueDate: nextServiceDate,
          priority: 'Medium',
          isSystemGenerated: true,
          recurringInterval: '6 months'
        });

        await newReminder.save();
        remindersCreated++;

        // Notify owner
        if (vehicle.owner && vehicle.owner.email) {
          sendServiceNotification(vehicle.owner.email, vehicle, newReminder);
        }
      }
    }

    res.json({ 
      message: `Auto-generated ${remindersCreated} service reminders`,
      remindersCreated
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
};

// Get service type counts
exports.getServiceTypeCounts = async (req, res) => {
  try {
    const typeCounts = await ServiceReminder.aggregate([
      { 
        $group: { 
          _id: "$serviceType", 
          count: { $sum: 1 } 
        } 
      },
      { 
        $project: { 
          _id: 0, 
          serviceType: "$_id", 
          count: 1 
        } 
      }
    ]);

    // Convert array to object for easier frontend consumption
    const result = typeCounts.reduce((acc, item) => {
      acc[item.serviceType] = item.count;
      return acc;
    }, {});

    res.json(result);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get service reminder status counts
exports.getStatusCounts = async (req, res) => {
  try {
    // Custom status calculation to include Overdue status
    const today = new Date();
    
    // Base status counts
    const statusCounts = await ServiceReminder.aggregate([
      { 
        $group: { 
          _id: "$status", 
          count: { $sum: 1 } 
        } 
      },
      { 
        $project: { 
          _id: 0, 
          status: "$_id", 
          count: 1 
        } 
      }
    ]);

    // Calculate overdue reminders
    const overdueReminders = await ServiceReminder.aggregate([
      { 
        $match: { 
          status: 'Pending',
          $or: [
            { dueDate: { $lte: today } },
            { 
              $expr: { 
                $and: [
                  { $ne: ['$dueMileage', null] },
                  { $lte: ['$dueMileage', '$vehicle.mileage'] }
                ]
              } 
            }
          ]
        } 
      },
      { $count: "overdueCount" }
    ]);

    // Convert array to object for easier frontend consumption
    const result = statusCounts.reduce((acc, item) => {
      acc[item.status] = item.count;
      return acc;
    }, {});

    // Add overdue count
    result.Overdue = overdueReminders[0]?.overdueCount || 0;

    res.json(result);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get detailed overdue reminders with vehicle information
exports.getOverdueReminderDetails = async (req, res) => {
  try {
    const today = new Date();
    const overdueReminders = await ServiceReminder.aggregate([
      { 
        $lookup: {
          from: 'vehicles', // Ensure this matches your vehicle collection name
          localField: 'vehicle',
          foreignField: '_id',
          as: 'vehicleDetails'
        }
      },
      { $unwind: '$vehicleDetails' },
      { 
        $match: { 
          status: 'Pending',
          $or: [
            { dueDate: { $lte: today } },
            { 
              $expr: { 
                $and: [
                  { $ne: ['$dueMileage', null] },
                  { $lte: ['$dueMileage', '$vehicleDetails.mileage'] }
                ]
              } 
            }
          ]
        } 
      },
      {
        $project: {
          serviceType: 1,
          dueDate: 1,
          dueMileage: 1,
          priority: 1,
          vehicle: {
            make: '$vehicleDetails.make',
            model: '$vehicleDetails.model',
            registrationNumber: '$vehicleDetails.registrationNumber',
            mileage: '$vehicleDetails.mileage'
          }
        }
      }
    ]);

    res.json(overdueReminders);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};