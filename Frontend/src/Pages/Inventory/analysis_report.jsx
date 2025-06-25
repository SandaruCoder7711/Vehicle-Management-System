import React, { useEffect, useState, useRef } from 'react';
import Sidebar from '../../Components/inventory_sidebar';
import Header from '../../Components/inventory_navbar'; 
import axios from 'axios';
import html2canvas from 'html2canvas';
import {
  Box,
  Typography,
  Paper,
  Button
} from '@material-ui/core';
import jsPDF from 'jspdf';
import letterheadImage from '../../Images/inventory_letterhead.png'; // Replace with your letterhead
import { 
  FaBox, 
  FaWarehouse, 
  FaTags, 
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

const InventoryReportPage = () => {
  const [inventoryItems, setInventoryItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [categoryCounts, setCategoryCounts] = useState([]);
  const [stockStatus, setStockStatus] = useState([]);
  const [totalInventoryValue, setTotalInventoryValue] = useState(0);
  const reportRef = useRef(null);

  useEffect(() => {
    const fetchInventoryData = async () => {
      try {
        // Fetch all inventory items
        const itemsResponse = await axios.get('http://localhost:3001/inventory/get-items');
        setInventoryItems(itemsResponse.data);

        // Fetch category counts
        const categoryResponse = await axios.get('http://localhost:3001/inventory/category-counts');
        setCategoryCounts(categoryResponse.data);

        // Fetch stock status
        const stockStatusResponse = await axios.get('http://localhost:3001/inventory/stock-status');
        setStockStatus(stockStatusResponse.data);

        // Calculate total inventory value
        const totalValue = itemsResponse.data.reduce((total, item) => 
          total + (item.stockQuantity * item.sellingPrice), 0);
        setTotalInventoryValue(totalValue);

        setLoading(false);
      } catch (error) {
        console.error('Error fetching inventory data:', error);
        setError('Failed to load inventory data.');
        setLoading(false);
      }
    };

    fetchInventoryData();
  }, []);

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
      
      doc.save('inventory_report.pdf');
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Failed to generate PDF. Please try again.');
      
      if (downloadButton) {
        downloadButton.style.display = 'inline-flex';
      }
    }
  };

  // Status count helpers
  const getStatusCount = (status) => {
    const statusItem = stockStatus.find(item => item.status === status);
    return statusItem ? statusItem.count : 0;
  };

  const inStockCount = getStatusCount('In Stock');
  const lowStockCount = getStatusCount('Low Stock');
  const outOfStockCount = getStatusCount('Out of Stock');

  // Category and Stock Status Icons
  const getCategoryIcon = (category) => {
    switch(category.toLowerCase()) {
      case 'electronics':
        return <FaBox size={40} />;
      case 'clothing':
        return <FaTags size={40} />;
      case 'supplies':
        return <FaWarehouse size={40} />;
      default:
        return <FaBox size={40} />;
    }
  };

  // Color Definitions
  const CATEGORY_COLORS = ['#FF5722', '#2196F3', '#4CAF50', '#FFC107'];
  const STATUS_COLORS = {
    'In Stock': '#4CAF50',
    'Low Stock': '#FFC107',
    'Out of Stock': '#F44336'
  };

  // Chart Data Preparation
  const categoryChartData = categoryCounts.map(item => ({
    category: item.category,
    count: item.count
  }));

  const statusChartData = stockStatus.map(item => ({
    name: item.status,
    value: item.count
  }));

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

          {/* Inventory Overview */}
          <Typography variant="h6" gutterBottom style={{ marginBottom: '20px', fontWeight: 'bold', color: '#333', textAlign: 'center' }}>
            Inventory Overview
          </Typography>
          <Box display="flex" justifyContent="space-between" mt={2} mb={4}>
            <Box style={{ backgroundColor: '#6200EA', padding: '20px', borderRadius: '10px', color: '#fff', flex: 1, marginRight: '10px', textAlign: 'center' }}>
              <Typography variant="h6">Total Inventory Items</Typography>
              <Typography variant="h4">{inventoryItems.length}</Typography>
            </Box>
            <Box style={{ backgroundColor: '#4CAF50', padding: '20px', borderRadius: '10px', color: '#fff', flex: 1, marginRight: '10px', textAlign: 'center' }}>
              <Typography variant="h6">Total Inventory Value</Typography>
              <Typography variant="h4">Rs {totalInventoryValue.toLocaleString()}</Typography>
            </Box>
            <Box style={{ backgroundColor: '#FFC107', padding: '20px', borderRadius: '10px', color: '#fff', flex: 1, textAlign: 'center' }}>
              <Typography variant="h6">Average Item Value</Typography>
              <Typography variant="h4">Rs {(totalInventoryValue / inventoryItems.length || 0).toLocaleString()}</Typography>
            </Box>
          </Box>

          {/* Category Section */}
          <Box mt={4} mb={4}>
            <Typography variant="h6" gutterBottom style={{ marginBottom: '20px', fontWeight: 'bold', color: '#333', textAlign: 'center' }}>
              Inventory Categories
            </Typography>
            <Box 
              display="grid" 
              gridTemplateColumns="repeat(auto-fit, minmax(200px, 1fr))" 
              gap={2}
            >
              {categoryCounts.map((category, index) => (
                <Box 
                  key={category.category} 
                  style={{ 
                    backgroundColor: CATEGORY_COLORS[index % CATEGORY_COLORS.length], 
                    padding: '20px', 
                    borderRadius: '10px', 
                    color: '#fff',
                    textAlign: 'center', 
                    margin:'5px'
                  }}
                >
                  <Box>{getCategoryIcon(category.category)}</Box>
                  <Typography variant="h6">{category.category}</Typography>
                  <Typography variant="h4">{category.count}</Typography>
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
            {/* Category Bar Chart */}
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
                Category Distribution
              </Typography>
              <Box style={{ width: '100%', overflowX: 'auto' }}>
                <BarChart width={500} height={300} data={categoryChartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="category" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="count">
                    {categoryChartData.map((entry, index) => (
                      <Cell key={entry.category} fill={CATEGORY_COLORS[index % CATEGORY_COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </Box>
            </Box>

            {/* Stock Status Pie Chart */}
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
                Stock Status Distribution
              </Typography>
              <Box style={{ width: '100%', overflowX: 'auto', display: 'flex', justifyContent: 'center' }}>
                <PieChart width={400} height={300}>
                  <Pie
                    data={statusChartData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    fill="#8884d8"
                    label
                  >
                    {statusChartData.map((entry, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={STATUS_COLORS[entry.name]} 
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

export default InventoryReportPage;