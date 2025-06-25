// controllers/ownerController.js
const Owner = require("../models/ownerModel");
const Vehicle = require("../models/vehicleModel");
const mongoose = require('mongoose'); // Import mongoose for ObjectId validation

// Add a new owner with email notification
exports.addNewOwner = async (req, res) => {
    try {
        const { owner_id, name, contact, email, address, license_number, date_of_birth, gender, vehicles } = req.body;

        // Log the received data for debugging
        console.log(req.body);

        // Create an array to hold error messages for missing fields
        const missingFields = [];

        // Check each required field and push to missingFields array if not provided
        if (!owner_id) missingFields.push("owner_id");
        if (!name) missingFields.push("name");
        if (!contact) missingFields.push("contact");
        if (!email) missingFields.push("email");
        if (!address) missingFields.push("address");
        if (!license_number) missingFields.push("license_number");
        if (!date_of_birth) missingFields.push("date_of_birth");
        if (!gender) missingFields.push("gender");

        // If there are any missing fields, return a detailed message
        if (missingFields.length > 0) {
            return res.status(400).json({ 
                message: "The following fields are required", 
                missingFields 
            });
        }

        // Check if an owner with the same owner_id already exists
        const existingOwnerById = await Owner.findOne({ owner_id });
        if (existingOwnerById) {
            return res.status(409).json({ 
                message: "An owner with this ID already exists",
                owner_id
            });
        }

        // Check if an owner with the same contact already exists
        const existingOwnerByContact = await Owner.findOne({ contact });
        if (existingOwnerByContact) {
            return res.status(409).json({ 
                message: "An owner with this contact number already exists",
                contact
            });
        }

        // Check if an owner with the same email already exists
        const existingOwnerByEmail = await Owner.findOne({ email });
        if (existingOwnerByEmail) {
            return res.status(409).json({ 
                message: "An owner with this email already exists",
                email
            });
        }

        // Check if an owner with the same license number already exists
        const existingOwnerByLicense = await Owner.findOne({ license_number });
        if (existingOwnerByLicense) {
            return res.status(409).json({ 
                message: "An owner with this license number already exists",
                license_number
            });
        }

        // Create a new owner
        const newOwner = new Owner({
            owner_id,
            name,
            contact,
            email,
            address,
            license_number,
            date_of_birth,
            gender,
            vehicles // Include vehicles array
        });

        // Save the new owner
        await newOwner.save();
        
        // Send welcome email notification to the new owner
        const welcomeMessage = `
            Welcome to our Vehicle Management System, ${name}!
            
            Your account has been successfully created with the following details:
            - Owner ID: ${owner_id}
            - License Number: ${license_number}
            
            You can now log in to our system to manage your vehicles and view service records.
            
            If you have any questions or need assistance, please don't hesitate to contact our support team.
        `;
        
        // If you've moved sendEmailNotification to a utility file, use it directly
        // Otherwise, you can define it here or import it from vehicleController
        sendEmailNotification(email, welcomeMessage);
        
        res.status(201).json({ message: "New owner added successfully!" });
    } catch (err) {
        console.error(err); // Log error for debugging
        res.status(500).json({ message: err.message });
    }
};

// Define the sendEmailNotification function here if not moving to a utility file
// This is a copy of the function from the vehicleController
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
        subject: 'Welcome to Vehicle Management System',
        text: message,
        html: `<div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #ddd; border-radius: 5px;">
            <h2 style="color: #333;">Welcome to Vehicle Management System</h2>
            <p style="font-size: 16px;">${message.replace(/\n/g, '<br>')}</p>
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

// Delete an owner
exports.deleteOwner = (req, res) => {
    const ownerId = req.params.id;

    Owner.deleteOne({ _id: ownerId })
        .then(() => {
            res.status(200).send({ status: "Owner deleted" });
        })
        .catch((err) => {
            console.log(err.message);
            res.status(500).send({ status: "Error with delete owner", error: err.message });
        });
};

// Get all owners
exports.getAllOwners = async (req, res) => {
    try {
        const owners = await Owner.find();
        res.json(owners);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Get a single owner by ID
exports.getOwnerById = async (req, res) => {
    const { id } = req.params;

    try {
        const owner = await Owner.findById(id);
        if (!owner) return res.status(404).json({ message: "Owner not found!" });
        res.json(owner);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Get owner by owner_id
exports.getOwnerByOwnerId = async (req, res) => {
    const { owner_id } = req.params;

    try {
        const owner = await Owner.findOne({ owner_id });
        if (!owner) return res.status(404).json({ message: "Owner not found!" });
        res.json(owner);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.updateOwner = async (req, res) => {
    const ownerId = req.params.id;
    const { owner_id, name, contact, email, address, license_number, date_of_birth, gender, vehicles } = req.body;

    // Validate inputs
    if (!(owner_id && name && contact && email && address && license_number && date_of_birth && gender)) {
        return res.status(400).send({ message: "All required inputs are missing" });
    }

    // Check if ownerId is a valid ObjectId
    if (!mongoose.Types.ObjectId.isValid(ownerId)) {
        return res.status(400).send({ message: "Invalid owner ID" });
    }

    try {
        // Check if the owner exists in the database
        const isOwner = await Owner.findById(ownerId);

        if (!isOwner) {
            return res.status(404).json({ message: "Owner not found!" });
        }

        // Check if another owner with the same owner_id already exists (excluding current owner)
        const existingOwnerById = await Owner.findOne({ 
            owner_id, 
            _id: { $ne: ownerId } 
        });
        
        if (existingOwnerById) {
            return res.status(409).json({ 
                message: "Another owner with this ID already exists",
                owner_id
            });
        }

        // Check if another owner with the same contact already exists (excluding current owner)
        const existingOwnerByContact = await Owner.findOne({ 
            contact, 
            _id: { $ne: ownerId } 
        });
        
        if (existingOwnerByContact) {
            return res.status(409).json({ 
                message: "Another owner with this contact number already exists",
                contact
            });
        }

        // Check if another owner with the same email already exists (excluding current owner)
        const existingOwnerByEmail = await Owner.findOne({ 
            email, 
            _id: { $ne: ownerId } 
        });
        
        if (existingOwnerByEmail) {
            return res.status(409).json({ 
                message: "Another owner with this email already exists",
                email
            });
        }

        // Check if another owner with the same license number already exists (excluding current owner)
        const existingOwnerByLicense = await Owner.findOne({ 
            license_number, 
            _id: { $ne: ownerId } 
        });
        
        if (existingOwnerByLicense) {
            return res.status(409).json({ 
                message: "Another owner with this license number already exists",
                license_number
            });
        }

        // Update the owner, now including vehicles array
        const result = await Owner.updateOne(
            { _id: ownerId },
            {
                owner_id,
                name,
                contact,
                email,
                address,
                license_number,
                date_of_birth,
                gender,
                vehicles // Include vehicles array in the update
            }
        );

        if (result.modifiedCount === 0) {
            return res.status(400).json({ message: "No changes were made" });
        }

        return res.status(200).json({ message: "Owner updated successfully!" });
    } catch (err) {
        console.error(err); // Log the error for debugging
        return res.status(500).json({ message: err.message });
    }
};

// Get owner count by gender
exports.getOwnerCountsByGender = async (req, res) => {
    try {
        // Aggregate the count of owners by gender
        const genderCounts = await Owner.aggregate([
            {
                $group: {
                    _id: "$gender",
                    count: { $sum: 1 }
                }
            },
            {
                $project: {
                    _id: 0,
                    gender: "$_id",
                    count: 1
                }
            }
        ]);

        // If there are no counts, return an appropriate message
        if (!genderCounts.length) {
            return res.json({ message: "No owners found" });
        }

        res.json(genderCounts);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Search owners by name
exports.searchOwnersByName = async (req, res) => {
    const { query } = req.query;

    if (!query) {
        return res.status(400).json({ message: "Search query is required" });
    }

    try {
        // Case-insensitive search for owners by name
        const owners = await Owner.find({
            name: { $regex: query, $options: 'i' }
        });

        if (owners.length === 0) {
            return res.json({ message: "No owners found matching the search criteria" });
        }

        res.json(owners);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Check if owner has associated vehicles
exports.checkOwnerVehicles = async (req, res) => {
    const ownerId = req.params.id;
    
    try {
        // Check if the ownerId is a valid ObjectId
        if (!mongoose.Types.ObjectId.isValid(ownerId)) {
            return res.status(400).json({ message: "Invalid owner ID format" });
        }
        
        // Convert ownerId to a valid ObjectId using the 'new' keyword
        const ownerObjectId = new mongoose.Types.ObjectId(ownerId);
        
        // Find vehicles where this owner is assigned
        const vehicleCount = await Vehicle.countDocuments({ owner: ownerObjectId });
        console.log('Vehicle count for owner', ownerId, ':', vehicleCount);
        
        res.json({
            hasVehicles: vehicleCount > 0,
            count: vehicleCount
        });
    } catch (err) {
        console.error('Error checking owner vehicles:', err);
        res.status(500).json({ message: 'Server error checking owner vehicles' });
    }
};

exports.getLoggedInOwnerVehicles = async (req, res) => {
    try {
        // Get the email from request
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({ 
                message: "Email is required",
                hint: "Make sure to send the logged-in user's email in the request body"
            });
        }

        // 1. Find the owner by email
        const owner = await Owner.findOne({ email });
        
        if (!owner) {
            return res.status(404).json({ 
                message: "Owner not found with this email",
                email
            });
        }

        // 2. Find vehicles using the IDs from owner's vehicles array
        const vehicles = await Vehicle.find({ 
            _id: { $in: owner.vehicles } 
        })
        .lean();

        console.log('Found vehicles:', vehicles);

        // 3. Return the response
        res.status(200).json({
            message: "Owner vehicles retrieved successfully",
            owner: {
                id: owner._id,
                owner_id: owner.owner_id,
                name: owner.name,
                email: owner.email,
                contact: owner.contact,
                license_number: owner.license_number,
                date_of_birth: owner.date_of_birth,
                gender: owner.gender
            },
            vehicles: vehicles.map(vehicle => ({
                id: vehicle._id,
                vehicle_id: vehicle.vehicle_id,
                make: vehicle.make,
                model: vehicle.model,
                year: vehicle.year,
                registration_number: vehicle.registrationNumber,
                color: vehicle.color,
                fuelType: vehicle.fuelType,
                vehicleType: vehicle.vehicleType,
                lastServiceMileage: vehicle.lastServiceMileage,
                service_reminders: vehicle.service_reminders || []
            }))
        });

    } catch (err) {
        console.error('Error fetching owner vehicles:', err);
        res.status(500).json({ 
            message: "Server error while fetching owner vehicles",
            error: err.message 
        });
    }
};