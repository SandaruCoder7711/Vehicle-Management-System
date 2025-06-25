import React, { useEffect, useState, useRef } from 'react';
import Sidebar from '../../Components/owner_sidebar';
import Header from '../../Components/owner_navbar';
import axios from 'axios';
import html2canvas from 'html2canvas';
import {
  Box,
  Typography,
  Button
} from '@material-ui/core';
import jsPDF from 'jspdf';
import letterheadImage from '../../Images/owner_letterhead.png';
import { FaMale, FaFemale, FaIdCard } from 'react-icons/fa';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, PieChart, Pie, Cell } from 'recharts';

const OwnerReportPage = () => {
  const [owners, setOwners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [genderCounts, setGenderCounts] = useState([]);
  const [ageGroupCounts, setAgeGroupCounts] = useState([]);
  const [totalOwners, setTotalOwners] = useState(0);
  const reportRef = useRef(null);

  useEffect(() => {
    const fetchOwnerData = async () => {
      try {
        // Fetch all owners
        const ownersResponse = await axios.get('http://localhost:3001/owner/get-owners');
        const ownersData = ownersResponse.data;
        setOwners(ownersData);
        setTotalOwners(ownersData.length);

        // Calculate gender distribution
        const genderData = calculateGenderDistribution(ownersData);
        setGenderCounts(genderData);

        // Calculate age group distribution
        const ageData = calculateAgeGroupDistribution(ownersData);
        setAgeGroupCounts(ageData);

        setLoading(false);
      } catch (error) {
        console.error('Error fetching owner data:', error);
        setError('Failed to load owner data.');
        setLoading(false);
      }
    };

    fetchOwnerData();
  }, []);

  // Calculate gender distribution
  const calculateGenderDistribution = (ownersData) => {
    const genderMap = ownersData.reduce((acc, owner) => {
      acc[owner.gender] = (acc[owner.gender] || 0) + 1;
      return acc;
    }, {});

    return Object.keys(genderMap).map(gender => ({
      gender,
      count: genderMap[gender]
    }));
  };

  // Calculate age group distribution
  const calculateAgeGroupDistribution = (ownersData) => {
    const ageGroups = {
      'Under 25': 0,
      '25-35': 0,
      '36-45': 0,
      '46-60': 0,
      'Over 60': 0
    };

    ownersData.forEach(owner => {
      const birthDate = new Date(owner.date_of_birth);
      const today = new Date();
      const age = today.getFullYear() - birthDate.getFullYear();
      
      if (age < 25) ageGroups['Under 25']++;
      else if (age >= 25 && age <= 35) ageGroups['25-35']++;
      else if (age >= 36 && age <= 45) ageGroups['36-45']++;
      else if (age >= 46 && age <= 60) ageGroups['46-60']++;
      else ageGroups['Over 60']++;
    });

    return Object.keys(ageGroups).map(ageGroup => ({
      ageGroup,
      count: ageGroups[ageGroup]
    }));
  };

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
        scale: 2,
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
      
      doc.save('owner_report.pdf');
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Failed to generate PDF. Please try again.');
      
      // Restore the download button in case of error
      if (downloadButton) {
        downloadButton.style.display = 'inline-flex';
      }
    }
  };

  // Helper function to get gender icon
  const getGenderIcon = (gender) => {
    switch(gender.toLowerCase()) {
      case 'male':
        return <FaMale size={40} />;
      case 'female':
        return <FaFemale size={40} />;
      default:
        return <FaIdCard size={40} />;
    }
  };

  // Define colors for charts
  const GENDER_COLORS = ['#2196F3', '#E91E63', '#9C27B0'];
  const AGE_COLORS = ['#FF5722', '#FFC107', '#4CAF50', '#2196F3', '#9C27B0'];

  // Prepare data for the age group bar chart
  const ageChartData = ageGroupCounts.map(item => ({
    ageGroup: item.ageGroup,
    count: item.count
  }));

  // Prepare data for the gender pie chart
  const genderData = genderCounts.map(item => ({
    name: item.gender,
    value: item.count
  }));

  if (error) {
    return (
      <Box>
        <Header />
        <Box display="flex">
          <Sidebar />
          <Box flex={1} p={3} display="flex" justifyContent="center" alignItems="center">
            <Typography color="error">{error}</Typography>
          </Box>
        </Box>
      </Box>
    );
  }

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
          {/* Letterhead */}
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

          {/* Summary Section */}
          <Typography variant="h6" gutterBottom style={{ marginBottom: '20px', fontWeight: 'bold', color: '#333', textAlign: 'center' }}>
            Owner Summary
          </Typography>
          <Box display="flex" justifyContent="space-between" mt={2} mb={4}>
            <Box style={{ backgroundColor: '#6200EA', padding: '20px', borderRadius: '10px', color: '#fff', flex: 1, marginRight: '10px', textAlign: 'center' }}>
              <Typography variant="h6">Total Owners</Typography>
              <Typography variant="h4">{totalOwners}</Typography>
            </Box>
            <Box style={{ backgroundColor: '#2196F3', padding: '20px', borderRadius: '10px', color: '#fff', flex: 1, marginRight: '10px', textAlign: 'center' }}>
              <Typography variant="h6">Male Owners</Typography>
              <Typography variant="h4">
                {genderCounts.find(item => item.gender.toLowerCase() === 'male')?.count || 0}
              </Typography>
            </Box>
            <Box style={{ backgroundColor: '#E91E63', padding: '20px', borderRadius: '10px', color: '#fff', flex: 1, textAlign: 'center' }}>
              <Typography variant="h6">Female Owners</Typography>
              <Typography variant="h4">
                {genderCounts.find(item => item.gender.toLowerCase() === 'female')?.count || 0}
              </Typography>
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
            {/* Bar Chart Section - Age Groups */}
            <Box 
              style={{ 
                flex: 1, 
                marginRight: '15px',
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
                Age Distribution
              </Typography>
              <Box style={{ width: '100%', overflowX: 'auto' }}>
                <BarChart width={500} height={300} data={ageChartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="ageGroup" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="count">
                    {ageChartData.map((entry, index) => (
                      <Cell key={entry.ageGroup} fill={AGE_COLORS[index % AGE_COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </Box>
            </Box>

            {/* Pie Chart Section - Gender Distribution */}
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
                Gender Distribution
              </Typography>
              <Box style={{ width: '100%', overflowX: 'auto', display: 'flex', justifyContent: 'center' }}>
                <PieChart width={400} height={300}>
                  <Pie
                    data={genderData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    fill="#8884d8"
                    label
                  >
                    {genderData.map((entry, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={GENDER_COLORS[index % GENDER_COLORS.length]} 
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

export default OwnerReportPage;