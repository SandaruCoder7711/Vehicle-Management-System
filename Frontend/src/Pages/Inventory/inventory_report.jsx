import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
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
import Sidebar from '../../Components/inventory_sidebar';
import Header from '../../Components/inventory_navbar'; 
import letterheadImage from '../../Images/inventory_letterhead.png'; // Import your letterhead image

const InventoryReportPage = () => {
  const [inventoryItems, setInventoryItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const reportRef = useRef(null);

  useEffect(() => {
    const fetchInventoryItems = async () => {
      try {
        const response = await axios.get('http://localhost:3001/inventory/get-items');
        
        // Handle different possible response formats
        if (Array.isArray(response.data)) {
          setInventoryItems(response.data);
        } else if (response.data && Array.isArray(response.data.items)) {
          setInventoryItems(response.data.items);
        } else if (response.data && Array.isArray(response.data.data)) {
          setInventoryItems(response.data.data);
        } else {
          console.error("Unexpected API response format:", response.data);
          setInventoryItems([]);
        }
        
        setLoading(false);
      } catch (error) {
        console.error('Error fetching inventory items:', error);
        setError('Failed to load inventory items.');
        setLoading(false);
      }
    };

    fetchInventoryItems();
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
      
      doc.save('inventory_report.pdf');
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
      const excelData = inventoryItems.map(item => ({
        'Product Code': item.productCode,
        'Name': item.name,
        'Category': item.category,
        'Brand': item.brand,
        'Stock Quantity': item.stockQuantity,
        'Status': item.status,
        'Purchase Price': item.purchasePrice,
        'Selling Price': item.sellingPrice,
        'Minimum Stock Level': item.minimumStockLevel,
        'Manufacturer': item.manufacturer || 'N/A',
        'Condition': item.condition,
        'Description': item.description || 'No description'
      }));
      
      // Create a new workbook
      const workbook = XLSX.utils.book_new();
      
      // Convert the data to a worksheet
      const worksheet = XLSX.utils.json_to_sheet(excelData);
      
      // Add the worksheet to the workbook
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Inventory');
      
      // Generate Excel file
      const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
      
      // Save the file
      const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      saveAs(blob, 'inventory_report.xlsx');
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
          {/* Letterhead Image */}
          <img 
            src={letterheadImage} 
            alt="Letterhead" 
            style={{ 
              width: '100%', 
              marginBottom: '10px', 
              borderBottom: '2px solid purple', 
              boxSizing: 'border-box',
            }} 
          />

          <TableContainer component={Paper}>
            <Table>
              <TableHead  style={{ backgroundColor: '#2196F3' }}>
                <TableRow>
                  <TableCell style={{ borderRight: '1px solid #ddd', backgroundColor: '#f0f0f0' }}><strong>Product Code</strong></TableCell>
                  <TableCell style={{ borderRight: '1px solid #ddd', backgroundColor: '#f0f0f0' }}><strong>Name</strong></TableCell>
                  <TableCell style={{ borderRight: '1px solid #ddd', backgroundColor: '#f0f0f0' }}><strong>Category</strong></TableCell>
                  <TableCell style={{ borderRight: '1px solid #ddd', backgroundColor: '#f0f0f0' }}><strong>Brand</strong></TableCell>
                  <TableCell style={{ borderRight: '1px solid #ddd', backgroundColor: '#f0f0f0' }}><strong>Stock Quantity</strong></TableCell>
                  <TableCell style={{ borderRight: '1px solid #ddd', backgroundColor: '#f0f0f0' }}><strong>Status</strong></TableCell>
                  <TableCell style={{ borderRight: '1px solid #ddd', backgroundColor: '#f0f0f0' }}><strong>Purchase Price</strong></TableCell>
                  <TableCell style={{ backgroundColor: '#f0f0f0' }}><strong>Selling Price</strong></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {inventoryItems.map((item) => (
                  <TableRow key={item._id}>
                    <TableCell style={{ borderRight: '1px solid #ddd' }}>{item.productCode}</TableCell>
                    <TableCell style={{ borderRight: '1px solid #ddd' }}>{item.name}</TableCell>
                    <TableCell style={{ borderRight: '1px solid #ddd' }}>{item.category}</TableCell>
                    <TableCell style={{ borderRight: '1px solid #ddd' }}>{item.brand}</TableCell>
                    <TableCell style={{ borderRight: '1px solid #ddd' }}>{item.stockQuantity}</TableCell>
                    <TableCell style={{ borderRight: '1px solid #ddd' }}>{item.status}</TableCell>
                    <TableCell style={{ borderRight: '1px solid #ddd' }}>${item.purchasePrice.toFixed(2)}</TableCell>
                    <TableCell>${item.sellingPrice.toFixed(2)}</TableCell>
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

export default InventoryReportPage;