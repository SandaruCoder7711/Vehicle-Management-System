import React, { useEffect, useState, useRef } from 'react';
import Sidebar from '../../Components/service_reminder_sidebar';
import Header from '../../Components/reminder_navbar';
import axios from 'axios';
import html2canvas from 'html2canvas';
import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  Chip
} from '@material-ui/core';
import jsPDF from 'jspdf';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import letterheadImage from '../../Images/service_letterhead.png'; // Create a letterhead image for service reminders

const ServiceReminderReportPage = () => {
  const [reminders, setReminders] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const reportRef = useRef(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch service reminders
        const remindersResponse = await axios.get('http://localhost:3001/service-reminder/get-reminders');
        
        // Fetch vehicles for lookup
        const vehiclesResponse = await axios.get('http://localhost:3001/vehicle/get-vehicles');
        
        setReminders(remindersResponse.data);
        setVehicles(vehiclesResponse.data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching data:', error);
        setError('Failed to load service reminders.');
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Helper function to get vehicle details
  const getVehicleDetails = (vehicleId) => {
    return vehicles.find(v => v._id === vehicleId) || {};
  };

  // Helper function to format date
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  // Helper function to check if reminder is overdue
  const isOverdue = (dueDate, status) => {
    if (status === 'Completed') return false;
    return new Date(dueDate) < new Date();
  };

  const handleDownloadPDF = async () => {
    if (!reportRef.current) return;
    
    // Hide the buttons before capturing
    const downloadButtons = document.getElementById('download-buttons');
    if (downloadButtons) {
      downloadButtons.style.display = 'none';
    }
    
    try {
      const element = reportRef.current;
      const canvas = await html2canvas(element, {
        scale: 2, // Higher scale for better quality
        useCORS: true,
        logging: false,
        letterRendering: true
      });
      
      // Restore the buttons
      if (downloadButtons) {
        downloadButtons.style.display = 'flex';
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
      
      doc.save('service_reminders_report.pdf');
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Failed to generate PDF. Please try again.');
      
      // Restore the buttons in case of error
      if (downloadButtons) {
        downloadButtons.style.display = 'flex';
      }
    }
  };

  const handleDownloadExcel = () => {
    try {
      // Prepare the data for Excel
      const excelData = reminders.map(reminder => {
        const vehicle = getVehicleDetails(reminder.vehicle);
        const status = isOverdue(reminder.dueDate, reminder.status) ? 'Overdue' : reminder.status;
        
        return {
          'Vehicle Registration': vehicle.registrationNumber || 'N/A',
          'Vehicle Make': vehicle.make || 'N/A',
          'Vehicle Model': vehicle.model || 'N/A',
          'Service Type': reminder.serviceType,
          'Due Date': formatDate(reminder.dueDate),
          'Due Mileage': reminder.dueMileage || 'N/A',
          'Priority': reminder.priority,
          'Status': status,
          'Service Provider': reminder.serviceProvider || 'Not specified',
          'Estimated Cost': reminder.estimatedCost ? `$${reminder.estimatedCost}` : 'Not specified',
          'Recurring Interval': reminder.recurringInterval || 'No'
        };
      });
      
      // Create a new workbook
      const workbook = XLSX.utils.book_new();
      
      // Convert the data to a worksheet
      const worksheet = XLSX.utils.json_to_sheet(excelData);
      
      // Add the worksheet to the workbook
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Service Reminders');
      
      // Generate Excel file
      const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
      
      // Save the file
      const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      saveAs(blob, 'service_reminders_report.xlsx');
    } catch (error) {
      console.error('Error generating Excel:', error);
      alert('Failed to generate Excel file. Please try again.');
    }
  };

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
            margin: '15px', 
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
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell style={{ borderRight: '1px solid #ddd', backgroundColor: '#f0f0f0' }}><strong>Vehicle</strong></TableCell>
                  <TableCell style={{ borderRight: '1px solid #ddd', backgroundColor: '#f0f0f0' }}><strong>Service Type</strong></TableCell>
                  <TableCell style={{ borderRight: '1px solid #ddd', backgroundColor: '#f0f0f0' }}><strong>Due Date</strong></TableCell>
                  <TableCell style={{ borderRight: '1px solid #ddd', backgroundColor: '#f0f0f0' }}><strong>Due Mileage</strong></TableCell>
                  <TableCell style={{ borderRight: '1px solid #ddd', backgroundColor: '#f0f0f0' }}><strong>Priority</strong></TableCell>
                  <TableCell style={{ borderRight: '1px solid #ddd', backgroundColor: '#f0f0f0' }}><strong>Status</strong></TableCell>
                  <TableCell style={{ borderRight: '1px solid #ddd', backgroundColor: '#f0f0f0' }}><strong>Service Provider</strong></TableCell>
                  <TableCell style={{ backgroundColor: '#f0f0f0' }}><strong>Estimated Cost</strong></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {reminders.map((reminder) => {
              
                  const status = isOverdue(reminder.dueDate, reminder.status) ? 'Overdue' : reminder.status;
                  
                  return (
                    <TableRow key={reminder._id}>
                      <TableCell style={{ borderRight: '1px solid #ddd' }}>
                        {reminder.vehicle.make} {reminder.vehicle.model} {reminder.vehicle.registrationNumber}
                      </TableCell>
                      <TableCell style={{ borderRight: '1px solid #ddd' }}>{reminder.serviceType}</TableCell>
                      <TableCell style={{ borderRight: '1px solid #ddd' }}>
                        {formatDate(reminder.dueDate)}
                      </TableCell>
                      <TableCell style={{ borderRight: '1px solid #ddd' }}>{reminder.dueMileage || 'N/A'}</TableCell>
                      <TableCell style={{ borderRight: '1px solid #ddd' }}>
                        <Chip 
                          label={reminder.priority} 
                          style={{ 
                            backgroundColor: 
                              reminder.priority === 'High' ? '#f44336' : 
                              reminder.priority === 'Medium' ? '#ff9800' : '#4caf50',
                            color: 'white'
                          }}
                        />
                      </TableCell>
                      <TableCell style={{ borderRight: '1px solid #ddd' }}>
                        <Chip 
                          label={status} 
                          style={{ 
                            backgroundColor: 
                              status === 'Overdue' ? '#f44336' : 
                              status === 'Completed' ? '#4caf50' : '#ff9800',
                            color: 'white'
                          }}
                        />
                      </TableCell>
                      <TableCell style={{ borderRight: '1px solid #ddd' }}>
                        {reminder.serviceProvider || 'Not specified'}
                      </TableCell>
                      <TableCell>
                        {reminder.estimatedCost ? `$${reminder.estimatedCost}` : 'Not specified'}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
          <Box mt={4} display="flex" justifyContent="left" gap={2} id="download-buttons">
            <Button 
              variant="contained" 
              color="secondary" 
              onClick={handleDownloadPDF}
            >
              Download PDF
            </Button>
            <Button 
              variant="contained" 
              color="primary" 
              onClick={handleDownloadExcel}
              style={{marginLeft:'15px'}}
            >
              Download Excel
            </Button>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default ServiceReminderReportPage;