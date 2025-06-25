import React, { useEffect, useState, useRef } from 'react';
import Sidebar from '../../Components/user_sidebar';
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
  Chip,
  Avatar
} from '@material-ui/core';
import jsPDF from 'jspdf';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import letterheadImage from '../../Images/letterhead.png';

const UserReportPage = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const reportRef = useRef(null);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await axios.get('http://localhost:3001/user/users');
        
        if (Array.isArray(response.data)) {
          setUsers(response.data);
        } else if (response.data && Array.isArray(response.data.users)) {
          setUsers(response.data.users);
        } else if (response.data && Array.isArray(response.data.data)) {
          setUsers(response.data.data);
        } else {
          console.error("Unexpected API response format:", response.data);
          setUsers([]);
        }
        setLoading(false);
      } catch (error) {
        console.error('Error fetching users:', error);
        setError('Failed to load users.');
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  const getGenderChipStyle = (gender) => {
    if (!gender) return { backgroundColor: '#e0e0e0', color: '#616161' };
    
    const lowerGender = gender.toLowerCase();
    if (lowerGender === 'male') return { backgroundColor: '#bbdefb', color: '#1565c0' };
    if (lowerGender === 'female') return { backgroundColor: '#f8bbd0', color: '#c2185b' };
    return { backgroundColor: '#e6ee9c', color: '#827717' };
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
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
      
      doc.save('user_report.pdf');
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
      const excelData = users.map(user => ({
        'User ID': user.user_id,
        'Full Name': user.full_name,
        'Email': user.email,
        'Contact': user.contact,
        'Gender': user.gender,
        'Address': user.address,
        'Date of Birth': user.dob ? formatDate(user.dob) : 'N/A',
        'Created On': user.createdAt ? formatDate(user.createdAt) : 'N/A'
      }));
      
      // Create a new workbook
      const workbook = XLSX.utils.book_new();
      
      // Convert the data to a worksheet
      const worksheet = XLSX.utils.json_to_sheet(excelData);
      
      // Add the worksheet to the workbook
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Users');
      
      // Generate Excel file
      const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
      
      // Save the file
      const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      saveAs(blob, 'user_report.xlsx');
    } catch (error) {
      console.error('Error generating Excel:', error);
      alert('Failed to generate Excel file. Please try again.');
    }
  };
  
  return (
    <Box>
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
              borderBottom: '2px solid #d4ac0d', 
              boxSizing: 'border-box',
            }} 
          />
          
          {/* Page Title */}
          <Typography variant="h4" gutterBottom style={{ 
            marginBottom: '20px', 
            fontFamily: 'cursive', 
            fontWeight: 'bold', 
            color: 'purple', 
            textAlign: 'center' 
          }}>
            Users Report
          </Typography>
          
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow style={{ backgroundColor: '#d4ac0d', color: 'white' }}>
                  <TableCell style={{ borderRight: '1px solid #ddd', color: 'white' }}><strong>Avatar</strong></TableCell>
                  <TableCell style={{ borderRight: '1px solid #ddd', color: 'white' }}><strong>User ID</strong></TableCell>
                  <TableCell style={{ borderRight: '1px solid #ddd', color: 'white' }}><strong>Full Name</strong></TableCell>
                  <TableCell style={{ borderRight: '1px solid #ddd', color: 'white' }}><strong>Email</strong></TableCell>
                  <TableCell style={{ borderRight: '1px solid #ddd', color: 'white' }}><strong>Contact</strong></TableCell>
                  <TableCell style={{ borderRight: '1px solid #ddd', color: 'white' }}><strong>Gender</strong></TableCell>
                  <TableCell style={{ color: 'white' }}><strong>Address</strong></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user._id}>
                    <TableCell style={{ borderRight: '1px solid #ddd' }}>
                      {user.profile_picture ? (
                        <Avatar 
                          src={user.profile_picture}
                          alt={user.full_name}
                          style={{ 
                            width: 40, 
                            height: 40, 
                            border: '2px solid #d4ac0d' 
                          }}
                          onError={(e) => {
                            console.error("Error loading image");
                            e.target.onerror = null; 
                            e.target.src = ""; 
                          }}
                        />
                      ) : (
                        <Avatar style={{ 
                          width: 40, 
                          height: 40, 
                          border: '2px solid #d4ac0d',
                          backgroundColor: '#d4ac0d',
                          color: 'white'
                        }}>
                          {user.full_name ? user.full_name.charAt(0).toUpperCase() : 'U'}
                        </Avatar>
                      )}
                    </TableCell>
                    <TableCell style={{ borderRight: '1px solid #ddd' }}>{user.user_id}</TableCell>
                    <TableCell style={{ borderRight: '1px solid #ddd' }}><strong>{user.full_name}</strong></TableCell>
                    <TableCell style={{ borderRight: '1px solid #ddd' }}>{user.email}</TableCell>
                    <TableCell style={{ borderRight: '1px solid #ddd' }}>{user.contact}</TableCell>
                    <TableCell style={{ borderRight: '1px solid #ddd' }}>
                      <Chip 
                        label={user.gender || 'N/A'} 
                        size="small" 
                        style={getGenderChipStyle(user.gender)}
                      />
                    </TableCell>
                    <TableCell>{user.address}</TableCell>
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
              style={{ backgroundColor: '#d4ac0d', color: 'white', marginLeft: '15px' }}
              onClick={handleDownloadExcel}
            >
              Download Excel
            </Button>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default UserReportPage;