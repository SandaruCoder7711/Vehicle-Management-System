import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { 
  FaWrench, 
  FaClock, 
  FaCheckCircle, 
  FaExclamationTriangle 
} from 'react-icons/fa';
import { Typography } from '@material-ui/core';
import Sidebar from '../../Components/service_reminder_sidebar';
import Header from '../../Components/reminder_navbar';
import axios from 'axios';
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

const ServiceReminderDashboard = () => {
  const [serviceTypes, setServiceTypes] = useState([]);
  const [statusCounts, setStatusCounts] = useState({});
  const [totalReminders, setTotalReminders] = useState(0);
  const [overdueReminders, setOverdueReminders] = useState(0);

  useEffect(() => {
    const fetchServiceReminderData = async () => {
      try {
        // Fetch service type counts
        const typeResponse = await axios.get('http://localhost:3001/service-reminder/service-type-counts');
        setServiceTypes(typeResponse.data);

        // Fetch status counts
        const statusResponse = await axios.get('http://localhost:3001/service-reminder/service-status-counts');
        setStatusCounts(statusResponse.data);

        // Fetch total reminders
        const remindersResponse = await axios.get('http://localhost:3001/service-reminder/get-reminders');
        setTotalReminders(remindersResponse.data.length);

        // Fetch overdue reminders
        const overdueResponse = await axios.get('http://localhost:3001/service-reminder/overdue-details');
        setOverdueReminders(overdueResponse.data.length);
      } catch (error) {
        console.error('Error fetching service reminder data:', error);
      }
    };

    fetchServiceReminderData();
  }, []);

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

  // Prepare data for the bar chart
  const chartData = Object.entries(serviceTypes).map(([serviceType, count]) => ({
    serviceType,
    count
  }));

  // Prepare data for the status pie chart
  const statusData = Object.entries(statusCounts).map(([name, value]) => ({
    name,
    value
  }));

  // Get status count helper
  const getStatusCount = (status) => {
    return statusCounts[status] || 0;
  };

  const pendingCount = getStatusCount('Pending');
  const completedCount = getStatusCount('Completed');

  return (
    <DashboardContainer>
      <Header /> 
      <MainSection>
        <Sidebar /> 
        <MainContent>
          <Typography 
            variant="h4" 
            gutterBottom 
            style={{ 
              marginBottom: '20px', 
              fontFamily: 'cursive', 
              fontWeight: 'bold', 
              color: 'purple', 
              textAlign: 'center' 
            }}
          >
            Service Reminder Dashboard
          </Typography>

          {/* Status Section with Total, Pending, and Overdue in one row */}
          <StatusSection>
            <StatusCard color="#6200EA">
              <StatusTitle>Total Reminders</StatusTitle>
              <StatusCount>{totalReminders}</StatusCount>
            </StatusCard>
            <StatusCard color="#FFC107">
              <StatusTitle>Pending Reminders</StatusTitle>
              <StatusCount>{pendingCount}</StatusCount>
            </StatusCard>
            <StatusCard color="#F44336">
              <StatusTitle>Overdue Reminders</StatusTitle>
              <StatusCount>{overdueReminders}</StatusCount>
            </StatusCard>
          </StatusSection>

          <BoxContainer>
            <Typography 
              variant="h6" 
              gutterBottom 
              style={{ 
                marginBottom: '20px', 
                fontWeight: 'bold', 
                color: '#333', 
                textAlign: 'center' 
              }}
            >
              Service Types
            </Typography>
            <CardContainer>
              {Object.entries(serviceTypes).map(([serviceType, count], index) => (
                <Card 
                  key={serviceType} 
                  color={SERVICE_COLORS[index % SERVICE_COLORS.length]}
                >
                  <IconContainer>
                    {getServiceIcon(serviceType)}
                  </IconContainer>
                  <div>{serviceType}</div>
                  <Count>{count}</Count>
                </Card>
              ))}
            </CardContainer>
          </BoxContainer>

          <ChartsRow>
            {/* Bar Chart Section - Service Types */}
            <ChartSection>
              <Typography 
                variant="h6" 
                gutterBottom 
                style={{ 
                  marginBottom: '20px', 
                  fontWeight: 'bold', 
                  color: '#333', 
                  textAlign: 'center' 
                }}
              >
                Service Types Distribution
              </Typography>
              <BarChart width={500} height={300} data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="serviceType" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="count">
                  {chartData.map((entry, index) => (
                    <Cell 
                      key={entry.serviceType} 
                      fill={SERVICE_COLORS[index % SERVICE_COLORS.length]} 
                    />
                  ))}
                </Bar>
              </BarChart>
            </ChartSection>

            {/* Pie Chart Section - Status Distribution */}
            <ChartSection>
              <Typography 
                variant="h6" 
                gutterBottom 
                style={{ 
                  marginBottom: '20px', 
                  fontWeight: 'bold', 
                  color: '#333', 
                  textAlign: 'center' 
                }}
              >
                Reminder Status Distribution
              </Typography>
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
            </ChartSection>
          </ChartsRow>
        </MainContent>
      </MainSection>
    </DashboardContainer>
  );
};

export default ServiceReminderDashboard;