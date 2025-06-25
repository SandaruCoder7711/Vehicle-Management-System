import React, { useEffect, useState, useRef } from 'react';
import Sidebar from '../../Components/sidebar';
import Header from '../../Components/navbar';
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
  Button
} from '@material-ui/core';
import jsPDF from 'jspdf';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import letterheadImage from '../../Images/vehicle_letterhead.png'; // Import your letterhead image

const VehicleReportPage = () => {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const reportRef = useRef(null);

  useEffect(() => {
    const fetchVehicles = async () => {
      try {
        const response = await axios.get('http://localhost:3001/vehicle/get-vehicles');
        setVehicles(response.data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching vehicles:', error);
        setError('Failed to load vehicles.');
        setLoading(false);
      }
    };

    fetchVehicles();
  }, []);

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
      
      doc.save('vehicle_report.pdf');
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
      const excelData = vehicles.map(vehicle => ({
        'Registration Number': vehicle.registrationNumber,
        'Make': vehicle.make,
        'Model': vehicle.model,
        'Year': vehicle.year,
        'Fuel Type': vehicle.fuelType,
        'Vehicle Type': vehicle.vehicleType,
        'Color': vehicle.color,
        'Status': vehicle.status
      }));
      
      // Create a new workbook
      const workbook = XLSX.utils.book_new();
      
      // Convert the data to a worksheet
      const worksheet = XLSX.utils.json_to_sheet(excelData);
      
      // Add the worksheet to the workbook
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Vehicles');
      
      // Generate Excel file
      const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
      
      // Save the file
      const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      saveAs(blob, 'vehicle_report.xlsx');
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
                  <TableCell style={{ borderRight: '1px solid #ddd', backgroundColor: '#f0f0f0' }}><strong>Registration No</strong></TableCell>
                  <TableCell style={{ borderRight: '1px solid #ddd', backgroundColor: '#f0f0f0' }}><strong>Make</strong></TableCell>
                  <TableCell style={{ borderRight: '1px solid #ddd', backgroundColor: '#f0f0f0' }}><strong>Model</strong></TableCell>
                  <TableCell style={{ borderRight: '1px solid #ddd', backgroundColor: '#f0f0f0' }}><strong>Year</strong></TableCell>
                  <TableCell style={{ borderRight: '1px solid #ddd', backgroundColor: '#f0f0f0' }}><strong>Fuel Type</strong></TableCell>
                  <TableCell style={{ borderRight: '1px solid #ddd', backgroundColor: '#f0f0f0' }}><strong>Vehicle Type</strong></TableCell>
                  <TableCell style={{ borderRight: '1px solid #ddd', backgroundColor: '#f0f0f0' }}><strong>Color</strong></TableCell>
                  <TableCell style={{ backgroundColor: '#f0f0f0' }}><strong>Status</strong></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {vehicles.map((vehicle) => (
                  <TableRow key={vehicle.registrationNumber}>
                    <TableCell style={{ borderRight: '1px solid #ddd' }}>{vehicle.registrationNumber}</TableCell>
                    <TableCell style={{ borderRight: '1px solid #ddd' }}>{vehicle.make}</TableCell>
                    <TableCell style={{ borderRight: '1px solid #ddd' }}>{vehicle.model}</TableCell>
                    <TableCell style={{ borderRight: '1px solid #ddd' }}>{vehicle.year}</TableCell>
                    <TableCell style={{ borderRight: '1px solid #ddd' }}>{vehicle.fuelType}</TableCell>
                    <TableCell style={{ borderRight: '1px solid #ddd' }}>{vehicle.vehicleType}</TableCell>
                    <TableCell style={{ borderRight: '1px solid #ddd' }}>{vehicle.color}</TableCell>
                    <TableCell>{vehicle.status}</TableCell>
                  </TableRow>
                ))}
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

export default VehicleReportPage;