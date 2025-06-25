import React, { useEffect, useState, useRef } from 'react';
import Sidebar from '../../Components/owner_sidebar';
import Header from '../../Components/owner_navbar';
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
import letterheadImage from '../../Images/owner_letterhead.png'; // Import your letterhead image

const OwnerReportPage = () => {
  const [owners, setOwners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const reportRef = useRef(null);

  useEffect(() => {
    const fetchOwners = async () => {
      try {
        const response = await axios.get('http://localhost:3001/owner/get-owners');
        setOwners(response.data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching owners:', error);
        setError('Failed to load owners.');
        setLoading(false);
      }
    };

    fetchOwners();
  }, []);

  const formatDateOfBirth = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString();
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
      
      doc.save('owner_report.pdf');
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
      const excelData = owners.map(owner => ({
        'Owner ID': owner.owner_id,
        'Name': owner.name,
        'Contact': owner.contact,
        'Address': owner.address,
        'License Number': owner.license_number,
        'Date of Birth': formatDateOfBirth(owner.date_of_birth),
        'Gender': owner.gender
      }));
      
      // Create a new workbook
      const workbook = XLSX.utils.book_new();
      
      // Convert the data to a worksheet
      const worksheet = XLSX.utils.json_to_sheet(excelData);
      
      // Add the worksheet to the workbook
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Owners');
      
      // Generate Excel file
      const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
      
      // Save the file
      const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      saveAs(blob, 'owner_report.xlsx');
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
          {/* Letterhead image */}
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
                  <TableCell style={{ borderRight: '1px solid #ddd', backgroundColor: '#f0f0f0' }}><strong>Owner ID</strong></TableCell>
                  <TableCell style={{ borderRight: '1px solid #ddd', backgroundColor: '#f0f0f0' }}><strong>Name</strong></TableCell>
                  <TableCell style={{ borderRight: '1px solid #ddd', backgroundColor: '#f0f0f0' }}><strong>Contact</strong></TableCell>
                  <TableCell style={{ borderRight: '1px solid #ddd', backgroundColor: '#f0f0f0' }}><strong>Address</strong></TableCell>
                  <TableCell style={{ borderRight: '1px solid #ddd', backgroundColor: '#f0f0f0' }}><strong>License Number</strong></TableCell>
                  <TableCell style={{ borderRight: '1px solid #ddd', backgroundColor: '#f0f0f0' }}><strong>Date of Birth</strong></TableCell>
                  <TableCell style={{ backgroundColor: '#f0f0f0' }}><strong>Gender</strong></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {owners.map((owner) => (
                  <TableRow key={owner._id}>
                    <TableCell style={{ borderRight: '1px solid #ddd' }}>{owner.owner_id}</TableCell>
                    <TableCell style={{ borderRight: '1px solid #ddd' }}>{owner.name}</TableCell>
                    <TableCell style={{ borderRight: '1px solid #ddd' }}>{owner.contact}</TableCell>
                    <TableCell style={{ borderRight: '1px solid #ddd' }}>{owner.address}</TableCell>
                    <TableCell style={{ borderRight: '1px solid #ddd' }}>{owner.license_number}</TableCell>
                    <TableCell style={{ borderRight: '1px solid #ddd' }}>{formatDateOfBirth(owner.date_of_birth)}</TableCell>
                    <TableCell>{owner.gender}</TableCell>
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

export default OwnerReportPage;