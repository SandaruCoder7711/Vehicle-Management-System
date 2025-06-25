import React, { useEffect, useState, useRef } from 'react';
import Sidebar from '../../Components/service_reminder_sidebar';
import Header from '../../Components/reminder_navbar';
import axios from 'axios';
import html2canvas from 'html2canvas';
import {
  Box,
  Typography,
  Paper,
  Button
} from '@material-ui/core';
import jsPDF from 'jspdf';
import letterheadImage from '../../Images/service_letterhead.png';
import { 
  FaWrench, 
  FaClock, 
  FaCheckCircle, 
  FaExclamationTriangle 
} from 'react-icons/fa';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  PieChart, 
  Pie, 
  Cell 
} from 'recharts';

const ServiceReminderReportPage = () => {
  const [reminders, setReminders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [serviceTypeCounts, setServiceTypeCounts] = useState([]);
  const [statusCounts, setStatusCounts] = useState({});
  const [totalReminders, setTotalReminders] = useState(0);
  const [overdueReminders, setOverdueReminders] = useState(0);
  const reportRef = useRef(null);

  useEffect(() => {
    const fetchServiceReminderData = async () => {
      try {
        // Fetch all service reminders
        const remindersResponse = await axios.get('http://localhost:3001/service-reminder/get-reminders');
        setReminders(remindersResponse.data);
        setTotalReminders(remindersResponse.data.length);

        // Fetch service type counts
        const typeResponse = await axios.get('http://localhost:3001/service-reminder/service-type-counts');
        setServiceTypeCounts(typeResponse.data);

        // Fetch status counts
        const statusResponse = await axios.get('http://localhost:3001/service-reminder/service-status-counts');
        setStatusCounts(statusResponse.data);

        // Fetch overdue reminders
        const overdueResponse = await axios.get('http://localhost:3001/service-reminder/overdue-details');
        setOverdueReminders(overdueResponse.data.length);

        setLoading(false);
      } catch (error) {
        console.error('Error fetching service reminder data:', error);
        setError('Failed to load service reminder data.');
        setLoading(false);
      }
    };

    fetchServiceReminderData();
  }, []);

  // Helper function to safely get service type counts
  const getServiceTypeCounts = () => {
    return Object.entries(serviceTypeCounts).map(([serviceType, count]) => ({
      serviceType,
      count
    }));
  };

  // Helper function to safely get status counts
  const getStatusCounts = () => {
    return Object.entries(statusCounts).map(([name, value]) => ({
      name,
      value
    }));
  };

  const handleDownload = async () => {
    if (!reportRef.current) return;
    
    const downloadButton = document.getElementById('download-button');
    if (downloadButton) {
      downloadButton.style.display = 'none';
    }
    
    try {
      const element = reportRef.current;
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        logging: false,
        letterRendering: true
      });
      
      if (downloadButton) {
        downloadButton.style.display = 'inline-flex';
      }
      
      const imgData = canvas.toDataURL('image/png');
      
      const imgWidth = 210;
      const pageHeight = 297;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      
      const doc = new jsPDF('p', 'mm', 'a4');
      
      const margin = 2;
      doc.addImage(imgData, 'PNG', margin, margin, imgWidth - (margin * 2), imgHeight - (margin * 2));
      
      let heightLeft = imgHeight;
      let position = 0;
      
      while (heightLeft > pageHeight) {
        position = heightLeft - pageHeight;
        doc.addPage();
        doc.addImage(imgData, 'PNG', margin, -(position + margin), imgWidth - (margin * 2), imgHeight - (margin * 2));
        heightLeft -= pageHeight;
      }
      
      doc.save('service_reminder_report.pdf');
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Failed to generate PDF. Please try again.');
      
      if (downloadButton) {
        downloadButton.style.display = 'inline-flex';
      }
    }
  };

  // Helper function to get service type icon
  const getServiceIcon = (type) => {
    switch(type.toLowerCase()) {
      case 'oil change':
        return <FaWrench size={40} />;
      case 'tire rotation':
        return <FaClock size={40} />;
      case 'brake service':
        return <FaExclamationTriangle size={40} />;
      case 'general maintenance':
        return <FaCheckCircle size={40} />;
      default:
        return <FaWrench size={40} />;
    }
  };

  // Define colors for each service type
  const SERVICE_COLORS = ['#FF5722', '#2196F3', '#4CAF50', '#FFC107'];

  // Status colors
  const STATUS_COLORS = {
    'Pending': '#FFC107',
    'Completed': '#4CAF50',
    'Overdue': '#F44336'
  };

  const chartData = getServiceTypeCounts();
  const statusData = getStatusCounts();

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

          {/* Summary Statistics */}
          <Typography variant="h6" gutterBottom style={{ marginBottom: '20px', fontWeight: 'bold', color: '#333', textAlign: 'center' }}>
            Service Reminder Overview
          </Typography>
          <Box display="flex" justifyContent="space-between" mt={2} mb={4}>
            <Box style={{ backgroundColor: '#6200EA', padding: '20px', borderRadius: '10px', color: '#fff', flex: 1, marginRight: '10px', textAlign: 'center' }}>
              <Typography variant="h6">Total Reminders</Typography>
              <Typography variant="h4">{totalReminders}</Typography>
            </Box>
            <Box style={{ backgroundColor: '#FFC107', padding: '20px', borderRadius: '10px', color: '#fff', flex: 1, marginRight: '10px', textAlign: 'center' }}>
              <Typography variant="h6">Pending Reminders</Typography>
              <Typography variant="h4">{statusCounts['Pending'] || 0}</Typography>
            </Box>
            <Box style={{ backgroundColor: '#F44336', padding: '20px', borderRadius: '10px', color: '#fff', flex: 1, textAlign: 'center' }}>
              <Typography variant="h6">Overdue Reminders</Typography>
              <Typography variant="h4">{overdueReminders}</Typography>
            </Box>
          </Box>

          <Box mt={4} mb={4}>
            <Typography variant="h6" gutterBottom style={{ marginBottom: '20px', fontWeight: 'bold', color: '#333', textAlign: 'center' }}>
              Service Types
            </Typography>
            <Box 
              display="grid" 
              gridTemplateColumns="repeat(auto-fit, minmax(200px, 1fr))" 
              gap={2}
            >
              {chartData.map((type, index) => (
                <Box 
                  key={type.serviceType} 
                  style={{ 
                    backgroundColor: SERVICE_COLORS[index % SERVICE_COLORS.length], 
                    padding: '20px', 
                    borderRadius: '10px', 
                    color: '#fff',
                    textAlign: 'center', 
                    margin:'5px'
                  }}
                >
                  <Box>{getServiceIcon(type.serviceType)}</Box>
                  <Typography variant="h6">{type.serviceType}</Typography>
                  <Typography variant="h4">{type.count}</Typography>
                </Box>
              ))}
            </Box>
          </Box>

          {/* Charts Section */}
          <Box 
            display="flex" 
            flexDirection={{xs: 'column', md: 'row'}} 
            justifyContent="space-between" 
            mt={4} 
            mb={4}
          >
            {/* Bar Chart - Service Types */}
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
                Service Types Distribution
              </Typography>
              <Box style={{ width: '100%', overflowX: 'auto' }}>
                <BarChart width={500} height={300} data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="serviceType" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="count">
                    {chartData.map((entry, index) => (
                      <Cell key={entry.serviceType} fill={SERVICE_COLORS[index % SERVICE_COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </Box>
            </Box>

            {/* Pie Chart - Status Distribution */}
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
                Reminder Status Distribution
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
                        fill={STATUS_COLORS[entry.name] || '#8884d8'} 
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

export default ServiceReminderReportPage;