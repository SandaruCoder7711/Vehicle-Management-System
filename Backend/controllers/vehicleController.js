const Vehicle = require("../models/vehicleModel");
const Owner = require("../models/ownerModel");
const mongoose = require('mongoose'); // Import mongoose for ObjectId validation
const { exec } = require('child_process');
const path = require('path');

// Helper method to predict next service mileage
const predictNextServiceMileage = async (vehicle) => {
  return new Promise((resolve, reject) => {
    // Use the trained model file
    const modelPath = path.resolve(__dirname, '../ai_model/next_service_mileage_model.pkl');
    const scriptPath = path.resolve(__dirname, '../ai_model/predict.py');

    // Make sure to escape any spaces in the values
    const command = `python "${scriptPath}" "${modelPath}" ${vehicle.mileage} ${vehicle.lastServiceMileage} "${vehicle.make}" "${vehicle.model}" ${vehicle.year} "${vehicle.fuelType}" "${vehicle.vehicleType}" "${vehicle.color}"`;

    console.log("Executing command:", command); // Add this for debugging

    exec(command, (error, stdout, stderr) => {
      if (error) {
        console.error("Error executing Python script:", error);
        if (stderr) console.error("stderr:", stderr);
        
        // Even if there's an error, try to extract a prediction value from stdout
        // The new predict.py script includes a fallback calculation
        try {
          const lines = stdout.trim().split('\n');
          const lastLine = lines[lines.length - 1];
          const prediction = parseFloat(lastLine);
          
          if (!isNaN(prediction)) {
            console.log("Using fallback prediction from script:", prediction);
            return resolve(prediction);
          }
        } catch (parseError) {
          console.error("Failed to parse fallback prediction:", parseError);
        }
        
        // If all else fails, use a simple formula
        const fallbackPrediction = Math.max(
          vehicle.lastServiceMileage + 5000, 
          vehicle.mileage * 1.4
        );
        console.log("Using controller fallback prediction:", fallbackPrediction);
        resolve(fallbackPrediction);
      } else {
        // Try to parse the last line of stdout as the prediction
        const lines = stdout.trim().split('\n');
        const lastLine = lines[lines.length - 1];
        const prediction = parseFloat(lastLine);
        
        if (!isNaN(prediction)) {
          console.log("Prediction successful:", prediction);
          resolve(prediction);
        } else {
          console.error("Failed to parse prediction from stdout:", stdout);
          const fallbackPrediction = Math.max(
            vehicle.lastServiceMileage + 5000, 
            vehicle.mileage * 1.4
          );
          console.log("Using controller fallback prediction:", fallbackPrediction);
          resolve(fallbackPrediction);
        }
      }
    });
  });
};

// Helper method to send email notifications
const sendEmailNotification = (email, message) => {
  const nodemailer = require('nodemailer');
  
  // Create a transporter object using a service (Gmail in this example)
  const transporter = nodemailer.createTransport({
    service: 'gmail', // Uses predefined settings for Gmail
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_APP_PASSWORD
    }
  });
  
  // Define email options
  const mailOptions = {
    from: process.env.EMAIL_FROM || 'Vehicle Management System <noreply@example.com>',
    to: email,
    subject: 'Vehicle Service Notification',
    text: message,
    html: `<div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #ddd; border-radius: 5px;">
      <h2 style="color: #333;">Vehicle Service Notification</h2>
      <p style="font-size: 16px;">${message}</p>
      <p style="font-size: 14px; color: #666; margin-top: 20px;">
        This is an automated message from the Vehicle Management System.
      </p>
    </div>`
  };
  
  // Send the email
  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.error('Error sending email:', error);
    } else {
      console.log('Email sent successfully:', info.response);
    }
  });
};

// Add a new vehicle
exports.addNewVehicle = async (req, res) => {
  try {
    const { registrationNumber, make, model, year, fuelType, vehicleType, color, mileage, lastServiceMileage, status } = req.body;

    // Log the received data for debugging
    console.log(req.body);

    // Create an array to hold error messages for missing fields
    const missingFields = [];

    // Check each required field and push to missingFields array if not provided
    if (!registrationNumber) missingFields.push("registrationNumber");
    if (!make) missingFields.push("make");
    if (!model) missingFields.push("model");
    if (!year) missingFields.push("year");
    if (!fuelType) missingFields.push("fuelType");
    if (!vehicleType) missingFields.push("vehicleType");
    if (!status) missingFields.push("status");

    // If there are any missing fields, return a detailed message
    if (missingFields.length > 0) {
      return res.status(400).json({ 
        message: "The following fields are required", 
        missingFields 
      });
    }

    // Check if a vehicle with the same registration number already exists
    const existingVehicle = await Vehicle.findOne({ registrationNumber });
    if (existingVehicle) {
      return res.status(409).json({ 
        message: "A vehicle with this registration number already exists",
        registrationNumber
      });
    }

    // Create a new vehicle
    const newVehicle = new Vehicle({
      registrationNumber,
      make,
      model,
      year,
      fuelType,
      vehicleType,
      color, // Optional field
      mileage: mileage || 0, // Optional field with default
      lastServiceMileage: lastServiceMileage || 0, // Optional field with default
      status,
    });

    await newVehicle.save();
    res.status(201).json({ message: "New vehicle added successfully!" });
  } catch (err) {
    console.error(err); // Log error for debugging
    res.status(500).json({ message: err.message });
  }
};

// Delete a vehicle
exports.deleteVehicle = (req, res) => {
  const vehicleId = req.params.id;

  Vehicle.deleteOne({ _id: vehicleId })
    .then(() => {
      res.status(200).send({ status: "Vehicle deleted" });
    })
    .catch((err) => {
      console.log(err.message);
      res.status(500).send({ status: "Error with delete vehicle", error: err.message });
    });
};

// Get all vehicles
exports.getAllVehicles = async (req, res) => {
  try {
    const vehicles = await Vehicle.find();
    res.json(vehicles);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get a single vehicle by ID
exports.getVehicleById = async (req, res) => {
  const { id } = req.params;

  try {
    const vehicle = await Vehicle.findById(id);
    if (!vehicle) return res.status(404).json({ message: "Vehicle not found!" });
    res.json(vehicle);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Update a vehicle
exports.updateVehicle = async (req, res) => {
  const vehicleId = req.params.id;
  const { registrationNumber, make, model, year, fuelType, vehicleType, color, mileage, lastServiceMileage, status } = req.body;

  // Validate inputs
  if (!(registrationNumber && make && model && year && fuelType && vehicleType && status)) {
    return res.status(400).send({ message: "All required inputs are missing" });
  }

  // Check if vehicleId is a valid ObjectId
  if (!mongoose.Types.ObjectId.isValid(vehicleId)) {
    return res.status(400).send({ message: "Invalid vehicle ID" });
  }

  try {
    // Check if the vehicle exists in the database
    const isVehicle = await Vehicle.findById(vehicleId);

    if (!isVehicle) {
      return res.status(404).json({ message: "Vehicle not found!" });
    }

    // Check if another vehicle with the same registration number already exists (excluding current vehicle)
    const existingVehicle = await Vehicle.findOne({ 
      registrationNumber, 
      _id: { $ne: vehicleId } 
    });
    
    if (existingVehicle) {
      return res.status(409).json({ 
        message: "Another vehicle with this registration number already exists",
        registrationNumber
      });
    }

    // Update the vehicle
    const result = await Vehicle.updateOne(
      { _id: vehicleId },
      {
        registrationNumber,
        make,
        model,
        year,
        fuelType,
        vehicleType,
        color, // Optional field
        mileage: mileage !== undefined ? mileage : isVehicle.mileage, // Keep existing value if not provided
        lastServiceMileage: lastServiceMileage !== undefined ? lastServiceMileage : isVehicle.lastServiceMileage, // Keep existing value if not provided
        status,
      }
    );

    if (result.modifiedCount === 0) {
      return res.status(400).json({ message: "No changes were made" });
    }

    return res.status(200).json({ message: "Vehicle updated successfully!" });
  } catch (err) {
    console.error(err); // Log the error for debugging
    return res.status(500).json({ message: err.message });
  }
};

// Get vehicle counts by status
exports.getVehicleCountsByStatus = async (req, res) => {
  try {
    // Aggregate the count of vehicles by status
    const statusCounts = await Vehicle.aggregate([
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

    // If there are no counts, return an empty object
    if (!statusCounts.length) {
      return res.json({ message: "No vehicles found" });
    }

    res.json(statusCounts);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get vehicle counts by vehicle type
exports.getVehicleCountsByType = async (req, res) => {
  try {
    // Aggregate the count of vehicles by vehicle type
    const typeCounts = await Vehicle.aggregate([
      {
        $group: {
          _id: "$vehicleType",
          count: { $sum: 1 }
        }
      },
      {
        $project: {
          _id: 0,
          vehicleType: "$_id",
          count: 1
        }
      }
    ]);

    // If there are no counts, return an empty object
    if (!typeCounts.length) {
      return res.json({ message: "No vehicles found" });
    }

    res.json(typeCounts);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Update vehicle owner association
exports.updateVehicleOwner = async (req, res) => {
  const vehicleId = req.params.id;
  const { ownerId } = req.body; // This is your custom format (e.g., "OWN61849195")

  try {
    // First find the owner document by owner_id to get its _id
    const owner = await Owner.findOne({ owner_id: ownerId });
    
    if (!owner) {
      return res.status(404).json({ message: "Owner not found" });
    }

    // Now use the owner's _id (which is a proper ObjectId) to update the vehicle
    const result = await Vehicle.updateOne(
      { _id: vehicleId },
      { owner: owner._id } // Use _id instead of owner_id
    );

    if (result.modifiedCount === 0) {
      return res.status(400).json({ message: "No changes were made" });
    }

    // Predict next service mileage and notify the owner
    const vehicle = await Vehicle.findById(vehicleId);
    const nextServiceMileage = await predictNextServiceMileage(vehicle);
    const message = `Your vehicle ${vehicle.registrationNumber} is due for service at ${nextServiceMileage} miles.`;
    sendEmailNotification(owner.email, message);

    return res.status(200).json({ message: "Vehicle owner updated successfully!" });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: err.message });
  }
};

// Get vehicles by owner ID
exports.getVehiclesByOwner = async (req, res) => {
  const { ownerId } = req.params;

  try {
    const vehicles = await Vehicle.find({ owner: ownerId });
    
    if (vehicles.length === 0) {
      return res.json({ message: "No vehicles found for this owner" });
    }
    
    res.json(vehicles);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Remove owner from vehicle (when deleting an owner)
exports.removeVehicleOwner = async (req, res) => {
  const { ownerId } = req.params;

  try {
    // Update all vehicles owned by this owner
    const result = await Vehicle.updateMany(
      { owner: ownerId },
      { $unset: { owner: "" } }
    );

    res.json({ 
      message: "Owner removed from vehicles", 
      vehiclesUpdated: result.modifiedCount 
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Update vehicle mileage and notify owner
exports.updateVehicleMileage = async (req, res) => {
  const vehicleId = req.params.id;
  const { mileage, lastServiceMileage } = req.body;


  try {
    const vehicle = await Vehicle.findById(vehicleId);

    if (!vehicle) {
      return res.status(404).json({ message: "Vehicle not found" });
    }

    // Update mileage and last service mileage
    vehicle.mileage = mileage !== undefined ? mileage : vehicle.mileage;
    vehicle.lastServiceMileage = lastServiceMileage !== undefined ? lastServiceMileage : vehicle.lastServiceMileage;
    await vehicle.save();

    res.status(200).json({ message: "Vehicle mileage updated successfully!" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
};