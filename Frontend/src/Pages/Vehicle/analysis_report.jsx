import React, { useEffect, useState, useRef } from 'react';
import Sidebar from '../../Components/sidebar';
import Header from '../../Components/navbar';
import axios from 'axios';
import html2canvas from 'html2canvas';
import {
  Box,
  Typography,
  Paper,
  Button
} from '@material-ui/core';
import jsPDF from 'jspdf';
import letterheadImage from '../../Images/vehicle_letterhead.png'; // Import your letterhead image
import { FaCar, FaTruck, FaMotorcycle, FaBus } from 'react-icons/fa';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, PieChart, Pie, Cell } from 'recharts';

const VehicleReportPage = () => {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [vehicleTypes, setVehicleTypes] = useState([]);
  const [statusCounts, setStatusCounts] = useState([]);
  const [totalVehicles, setTotalVehicles] = useState(0);
  const reportRef = useRef(null);

  useEffect(() => {
    const fetchVehicleData = async () => {
      try {
        // Fetch all vehicles
        const vehiclesResponse = await axios.get('http://localhost:3001/vehicle/get-vehicles');
        setVehicles(vehiclesResponse.data);
        setTotalVehicles(vehiclesResponse.data.length);

        // Fetch vehicle type counts
        const typeResponse = await axios.get('http://localhost:3001/vehicle/type-counts');
        setVehicleTypes(typeResponse.data);

        // Fetch status counts
        const statusResponse = await axios.get('http://localhost:3001/vehicle/status-counts');
        setStatusCounts(statusResponse.data);

        setLoading(false);
      } catch (error) {
        console.error('Error fetching vehicle data:', error);
        setError('Failed to load vehicle data.');
        setLoading(false);
      }
    };

    fetchVehicleData();
  }, []);

  const handleDownload = async () => {
    if (!reportRef.current) return;
    
    // Hide the download button before capturing
    const downloadButton = document.getElementById('download-button');
    if (downloadButton) {
      downloadButton.style.display = 'none';
    }
    
    try {
      const element = reportRef.current;
      const canvas = await html2canvas(element, {
        scale: 2, // Higher scale for better quality
        useCORS: true,
        logging: false,
        letterRendering: true
      });
      
      // Restore the download button
      if (downloadButton) {
        downloadButton.style.display = 'inline-flex';
      }
      
      const imgData = canvas.toDataURL('image/png');
      
      // Calculate dimensions
      const imgWidth = 210; // A4 width in mm
      const pageHeight = 297; // A4 height in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      
      const doc = new jsPDF('p', 'mm', 'a4');
      
      // Add image to PDF (with padding)
      const margin = 2; // margin in mm
      doc.addImage(imgData, 'PNG', margin, margin, imgWidth - (margin * 2), imgHeight - (margin * 2));
      
      // If the image height is greater than page height, create multiple pages
      let heightLeft = imgHeight;
      let position = 0;
      
      while (heightLeft > pageHeight) {
        position = heightLeft - pageHeight;
        doc.addPage();
        doc.addImage(imgData, 'PNG', margin, -(position + margin), imgWidth - (margin * 2), imgHeight - (margin * 2));
        heightLeft -= pageHeight;
      }
      
      doc.save('vehicle_report.pdf');
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Failed to generate PDF. Please try again.');
      
      // Restore the download button in case of error
      if (downloadButton) {
        downloadButton.style.display = 'inline-flex';
      }
    }
  };

  // Get active and inactive counts
  const getStatusCount = (status) => {
    const statusItem = statusCounts.find(item => item.status === status);
    return statusItem ? statusItem.count : 0;
  };

  const activeCount = getStatusCount('Active');
  const inactiveCount = getStatusCount('Inactive');

  // Helper function to get vehicle type icon
  const getVehicleIcon = (type) => {
    switch(type.toLowerCase()) {
      case 'car':
        return <FaCar size={40} />;
      case 'truck':
        return <FaTruck size={40} />;
      case 'motorcycle':
        return <FaMotorcycle size={40} />;
      case 'bus':
        return <FaBus size={40} />;
      default:
        return <FaCar size={40} />;
    }
  };

  // Define colors for each vehicle type (up to 4)
  const VEHICLE_COLORS = ['#FF5722', '#2196F3', '#4CAF50', '#FFC107'];

  // Prepare data for the bar chart
  const chartData = vehicleTypes.map(item => ({
    vehicleType: item.vehicleType,
    count: item.count
  }));

  // Prepare data for the status pie chart
  const statusData = statusCounts.map(item => ({
    name: item.status,
    value: item.count
  }));

  // Status colors
  const STATUS_COLORS = {
    'Active': '#4CAF50',
    'Inactive': '#F44336',
    'Maintenance': '#FFC107',
    'Reserved': '#2196F3'
  };

  const PIE_COLORS = Object.values(STATUS_COLORS);

  return (
    <Box>
      <Header />
      <Box display="flex">
        <Sidebar />
        <Box 
          ref={reportRef}
          flexDirection="column" 
          alignItems="center" 
          justifyContent="center" 
          p={2} 
          style={{ 
            flex: 1, 
            minHeight: '100vh', 
            backgroundColor: 'white', 
            borderRadius: 8, 
            boxShadow: '0px 0px 10px rgba(0,0,0,0.1)', 
            margin: '5px', 
            position: 'relative',
            marginTop: '15px', 
            marginBottom: '15px',
          }} 
          id="printable-section"
        >
          {/* Replace the Box with the letterhead image */}
          <img 
            src={letterheadImage} 
            alt="Letterhead" 
            style={{ 
              width: '100%', 
              marginBottom: '20px', 
              borderBottom: '2px solid purple', 
              boxSizing: 'border-box',
            }} 
          />

          {/* Status Section with Total, Active, and Inactive in one row */}
          <Typography variant="h6" gutterBottom style={{ marginBottom: '20px', fontWeight: 'bold', color: '#333', textAlign: 'center' }}>
              Total Vehicles 
            </Typography>
          <Box display="flex" justifyContent="space-between" mt={2} mb={4}>
            <Box style={{ backgroundColor: '#6200EA', padding: '20px', borderRadius: '10px', color: '#fff', flex: 1, marginRight: '10px', textAlign: 'center' }}>
              <Typography variant="h6">Total Vehicles</Typography>
              <Typography variant="h4">{totalVehicles}</Typography>
            </Box>
            <Box style={{ backgroundColor: '#4CAF50', padding: '20px', borderRadius: '10px', color: '#fff', flex: 1, marginRight: '10px', textAlign: 'center' }}>
              <Typography variant="h6">Active Vehicles</Typography>
              <Typography variant="h4">{activeCount}</Typography>
            </Box>
            <Box style={{ backgroundColor: '#F44336', padding: '20px', borderRadius: '10px', color: '#fff', flex: 1, textAlign: 'center' }}>
              <Typography variant="h6">Inactive Vehicles</Typography>
              <Typography variant="h4">{inactiveCount}</Typography>
            </Box>
          </Box>

          {/* Vehicle Types Section - Fixed the layout */}
          <Box mt={4} mb={4}>
            <Typography variant="h6" gutterBottom style={{ marginBottom: '20px', fontWeight: 'bold', color: '#333', textAlign: 'center' }}>
              Vehicle Types
            </Typography>
            <Box 
              display="grid" 
              gridTemplateColumns="repeat(auto-fit, minmax(200px, 1fr))" 
              gap={2}
            >
              {vehicleTypes.map((type, index) => (
                <Box 
                  key={type.vehicleType} 
                  style={{ 
                    backgroundColor: VEHICLE_COLORS[index % VEHICLE_COLORS.length], 
                    padding: '20px', 
                    borderRadius: '10px', 
                    color: '#fff',
                    textAlign: 'center', 
                    margin:'5px'
                  }}
                >
                  <Box>{getVehicleIcon(type.vehicleType)}</Box>
                  <Typography variant="h6">{type.vehicleType}</Typography>
                  <Typography variant="h4">{type.count}</Typography>
                </Box>
              ))}
            </Box>
          </Box>

          {/* Charts Section - Made more responsive */}
          <Box 
            display="flex" 
            flexDirection={{xs: 'column', md: 'row'}} 
            justifyContent="space-between" 
            mt={4} 
            mb={4}
          >
            {/* Bar Chart Section - Vehicle Types */}
            <Box 
              style={{ 
                flex: 1, 
                marginRight: {xs: 0, md: '10px'}, 
                marginBottom: {xs: '20px', md: 0},
                backgroundColor: '#fff', 
                padding: '20px', 
                borderRadius: '10px', 
                boxShadow: '0px 0px 10px rgba(0,0,0,0.1)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                marginRight: '15px'
              }}
            >
              <Typography variant="h6" gutterBottom style={{ marginBottom: '20px', fontWeight: 'bold', color: '#333', textAlign: 'center' }}>
                Vehicle Types Distribution
              </Typography>
              <Box style={{ width: '100%', overflowX: 'auto' }}>
                <BarChart width={500} height={300} data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="vehicleType" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="count">
                    {chartData.map((entry, index) => (
                      <Cell key={entry.vehicleType} fill={VEHICLE_COLORS[index % VEHICLE_COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </Box>
            </Box>

            {/* Pie Chart Section - Status Distribution */}
            <Box 
              style={{ 
                flex: 1, 
                backgroundColor: '#fff', 
                padding: '20px', 
                borderRadius: '10px', 
                boxShadow: '0px 0px 10px rgba(0,0,0,0.1)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center'
              }}
            >
              <Typography variant="h6" gutterBottom style={{ marginBottom: '20px', fontWeight: 'bold', color: '#333', textAlign: 'center' }}>
                Vehicle Status Distribution
              </Typography>
              <Box style={{ width: '100%', overflowX: 'auto', display: 'flex', justifyContent: 'center' }}>
                <PieChart width={400} height={300}>
                  <Pie
                    data={statusData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    fill="#8884d8"
                    label
                  >
                    {statusData.map((entry, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={STATUS_COLORS[entry.name] || PIE_COLORS[index % PIE_COLORS.length]} 
                      />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </Box>
            </Box>
          </Box>

          {/* Download PDF Button */}
          <Box mt={4} textAlign="left">
            <Button 
              id="download-button"
              variant="contained" 
              color="secondary" 
              onClick={handleDownload}
            >
              Download PDF
            </Button>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default VehicleReportPage;