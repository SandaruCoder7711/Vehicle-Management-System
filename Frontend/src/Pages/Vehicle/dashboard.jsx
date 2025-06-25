import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { FaCar, FaTruck, FaMotorcycle, FaBus } from 'react-icons/fa';
import { Typography } from '@material-ui/core';
import Sidebar from '../../Components/sidebar';
import Header from '../../Components/navbar'; 
import axios from 'axios';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, PieChart, Pie, Cell } from 'recharts';

const DashboardContainer = styled.div`
  display: flex;
  flex-direction: column;
`;

const MainSection = styled.div`
  display: flex;
  flex-grow: 1;
`;

const MainContent = styled.div`
  flex-grow: 1;
  padding: 20px;
  margin-top: 70px;
`;

const BoxContainer = styled.div`
  background-color: #fff;
  padding: 20px;
  border-radius: 10px;
  box-shadow: 0 4px 8px rgba(0,0,0,0.1);
  margin-top: 20px;
`;

const CardContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
`;

const Card = styled.div`
  background-color: ${(props) => props.color || '#fff'};
  flex: 1;
  min-width: 200px;
  height: 150px;
  border-radius: 10px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: #fff;
  box-shadow: 0 4px 8px rgba(0,0,0,0.1);
`;

const ChartsRow = styled.div`
  display: flex;
  justify-content: space-between;
  gap: 20px;
  margin-top: 20px;
`;

const ChartSection = styled.div`
  flex: 1;
  background-color: #fff;
  padding: 20px;
  border-radius: 10px;
  box-shadow: 0 4px 8px rgba(0,0,0,0.1);
`;

const IconContainer = styled.div`
  margin-bottom: 10px;
`;

const Count = styled.div`
  font-size: 24px;
  font-weight: bold;
  margin-top: 10px;
`;

const BarChartContainer = styled.div`
  padding: 10px;
`;

const PieChartContainer = styled.div`
  padding: 10px;
`;

const StatusSection = styled.div`
  display: flex;
  gap: 20px;
  margin-top: 20px;
`;

const StatusCard = styled.div`
  flex: 1;
  background-color: ${(props) => props.color || '#fff'};
  padding: 20px;
  border-radius: 10px;
  box-shadow: 0 4px 8px rgba(0,0,0,0.1);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: #fff;
`;

const StatusCount = styled.div`
  font-size: 36px;
  font-weight: bold;
  margin: 15px 0;
`;

const StatusTitle = styled.div`
  font-size: 20px;
  text-align: center;
`;

const VehicleDashboard = () => {
  const [vehicleTypes, setVehicleTypes] = useState([]);
  const [statusCounts, setStatusCounts] = useState([]);
  const [totalVehicles, setTotalVehicles] = useState(0);

  useEffect(() => {
    const fetchVehicleData = async () => {
      try {
        // Fetch vehicle type counts
        const typeResponse = await axios.get('http://localhost:3001/vehicle/type-counts');
        setVehicleTypes(typeResponse.data);

        // Fetch status counts
        const statusResponse = await axios.get('http://localhost:3001/vehicle/status-counts');
        setStatusCounts(statusResponse.data);

        // Fetch all vehicles to get total count
        const vehiclesResponse = await axios.get('http://localhost:3001/vehicle/get-vehicles');
        setTotalVehicles(vehiclesResponse.data.length);
      } catch (error) {
        console.error('Error fetching vehicle data:', error);
      }
    };

    fetchVehicleData();
  }, []);

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
    <DashboardContainer>
      <Header /> 
      <MainSection>
        <Sidebar /> 
        <MainContent>
            <Typography variant="h4" gutterBottom style={{ marginBottom: '20px', fontFamily: 'cursive', fontWeight: 'bold', color: 'purple', textAlign: 'center' }}>
              Vehicle Management Dashboard
            </Typography>

          {/* Status Section with Total, Active, and Inactive in one row */}
          <StatusSection>
            <StatusCard color="#6200EA">
              <StatusTitle>Total Vehicles</StatusTitle>
              <StatusCount>{totalVehicles}</StatusCount>
            </StatusCard>
            <StatusCard color="#4CAF50">
              <StatusTitle>Active Vehicles</StatusTitle>
              <StatusCount>{activeCount}</StatusCount>
            </StatusCard>
            <StatusCard color="#F44336">
              <StatusTitle>Inactive Vehicles</StatusTitle>
              <StatusCount>{inactiveCount}</StatusCount>
            </StatusCard>
          </StatusSection>

          <BoxContainer>
            <Typography variant="h6" gutterBottom style={{ marginBottom: '20px', fontWeight: 'bold', color: '#333', textAlign: 'center' }}>
              Vehicle Types
            </Typography>
            <CardContainer>
              {vehicleTypes.map((type, index) => (
                <Card key={type.vehicleType} color={VEHICLE_COLORS[index % VEHICLE_COLORS.length]}>
                  <IconContainer>
                    {getVehicleIcon(type.vehicleType)}
                  </IconContainer>
                  <div>{type.vehicleType}</div>
                  <Count>{type.count}</Count>
                </Card>
              ))}
            </CardContainer>
          </BoxContainer>

          <ChartsRow>
            {/* Bar Chart Section - Vehicle Types */}
            <ChartSection>
              <Typography variant="h6" gutterBottom style={{ marginBottom: '20px', fontWeight: 'bold', color: '#333', textAlign: 'center' }}>
                Vehicle Types Distribution
              </Typography>
              <BarChartContainer>
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
              </BarChartContainer>
            </ChartSection>

            {/* Pie Chart Section - Status Distribution */}
            <ChartSection>
              <Typography variant="h6" gutterBottom style={{ marginBottom: '20px', fontWeight: 'bold', color: '#333', textAlign: 'center' }}>
                Vehicle Status Distribution
              </Typography>
              <PieChartContainer>
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
              </PieChartContainer>
            </ChartSection>
          </ChartsRow>
        </MainContent>
      </MainSection>
    </DashboardContainer>
  );
};

export default VehicleDashboard;