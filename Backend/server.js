const express = require("express");
const path = require("path");
const bodyParser = require("body-parser");
const db_connection = require("./database/index");
require('dotenv').config();
var cors = require('cors');

const PORT = process.env.PORT || 3000;

// Import the vehicle route
const VehicleRoutes = require("./routes/vehicleRoute");
const UserRoutes = require("./routes/userRoute");
const OwnerRoutes = require("./routes/ownerRoute");
const InventoryRoutes = require("./routes/inventoryRoute");
const ServiceReminderRoutes = require("./routes/reminderRoute");

const app = express();

app.use(cors()); // Use this after the variable declaration
app.use(express.static(path.join(__dirname, 'public')));
// Serve static files from the 'public' directory
app.use('/uploads', express.static(path.join(__dirname, 'public/uploads')));

// Increase payload size limit (e.g., 50MB)
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ 
  limit: '50mb',
  extended: true,
  parameterLimit: 50000
}));

db_connection();

// Use the vehicle route
app.use("/vehicle", VehicleRoutes);   
app.use("/owner", OwnerRoutes);  
app.use("/user", UserRoutes);  
app.use("/admin", UserRoutes);  
app.use("/inventory", InventoryRoutes);  
app.use("/service-reminder", ServiceReminderRoutes);  

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});