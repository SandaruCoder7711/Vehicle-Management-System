import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { FaMale, FaFemale, FaUserAlt } from 'react-icons/fa';
import { Typography } from '@material-ui/core';
import Sidebar from '../../Components/owner_sidebar';
import Header from '../../Components/owner_navbar';
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

const OwnerDashboard = () => {
  const [owners, setOwners] = useState([]);
  const [genderCounts, setGenderCounts] = useState([]);
  const [ageGroupCounts, setAgeGroupCounts] = useState([]);
  const [totalOwners, setTotalOwners] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOwnerData = async () => {
      try {
        // Fetch all owners
        const ownersResponse = await axios.get('http://localhost:3001/owner/get-owners');
        const ownersData = ownersResponse.data;
        setOwners(ownersData);
        setTotalOwners(ownersData.length);

        // Fetch gender counts
        const genderResponse = await axios.get('http://localhost:3001/owner/gender-counts');
        setGenderCounts(genderResponse.data);

        // Calculate age group distribution
        const ageData = calculateAgeGroupDistribution(ownersData);
        setAgeGroupCounts(ageData);

        setLoading(false);
      } catch (error) {
        console.error('Error fetching owner data:', error);
        setLoading(false);
      }
    };

    fetchOwnerData();
  }, []);

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

  // Process gender counts for visualization
  const maleCount = genderCounts.find(item => item.gender === 'Male')?.count || 0;
  const femaleCount = genderCounts.find(item => item.gender === 'Female')?.count || 0;
  
  // Helper function to get gender icon
  const getGenderIcon = (gender) => {
    switch(gender) {
      case 'Male':
        return <FaMale size={40} />;
      case 'Female':
        return <FaFemale size={40} />;
      default:
        return <FaUserAlt size={40} />;
    }
  };

  // Define colors for gender
  const GENDER_COLORS = {
    'Male': '#2196F3',
    'Female': '#E91E63'
  };

  // Define colors for age groups
  const AGE_COLORS = ['#FF5722', '#FFC107', '#4CAF50', '#2196F3', '#9C27B0'];

  // Prepare data for the charts
  const genderChartData = genderCounts.map(item => ({
    gender: item.gender,
    count: item.count
  }));

  const ageChartData = ageGroupCounts.map(item => ({
    ageGroup: item.ageGroup,
    count: item.count
  }));

  // Colors array for the pie chart
  const PIE_COLORS = Object.values(GENDER_COLORS);

  return (
    <DashboardContainer>
      <Header /> 
      <MainSection>
        <Sidebar /> 
        <MainContent>
          <Typography variant="h4" gutterBottom style={{ marginBottom: '20px', fontFamily: 'cursive', fontWeight: 'bold', color: 'purple', textAlign: 'center' }}>
            Owner Management Dashboard
          </Typography>

          {/* Total Owners Section */}
          <StatusSection>
            <StatusCard color="#6200EA">
              <StatusTitle>Total Owners</StatusTitle>
              <StatusCount>{totalOwners}</StatusCount>
            </StatusCard>
            <StatusCard color="#2196F3">
              <StatusTitle>Male Owners</StatusTitle>
              <StatusCount>{maleCount}</StatusCount>
            </StatusCard>
            <StatusCard color="#E91E63">
              <StatusTitle>Female Owners</StatusTitle>
              <StatusCount>{femaleCount}</StatusCount>
            </StatusCard>
          </StatusSection>

          <BoxContainer>
            <Typography variant="h6" gutterBottom style={{ marginBottom: '20px', fontWeight: 'bold', color: '#333', textAlign: 'center' }}>
              Owner Gender Distribution
            </Typography>
            <CardContainer>
              {genderCounts.map((item) => (
                <Card key={item.gender} color={GENDER_COLORS[item.gender]}>
                  <IconContainer>
                    {getGenderIcon(item.gender)}
                  </IconContainer>
                  <div>{item.gender}</div>
                  <Count>{item.count}</Count>
                </Card>
              ))}
            </CardContainer>
          </BoxContainer>

          <ChartsRow>
            {/* Bar Chart Section - Age Distribution */}
            <ChartSection>
              <Typography variant="h6" gutterBottom style={{ marginBottom: '20px', fontWeight: 'bold', color: '#333', textAlign: 'center' }}>
                Owner Age Distribution - Bar Chart
              </Typography>
              <BarChartContainer>
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
              </BarChartContainer>
            </ChartSection>

            {/* Pie Chart Section - Gender Distribution */}
            <ChartSection>
              <Typography variant="h6" gutterBottom style={{ marginBottom: '20px', fontWeight: 'bold', color: '#333', textAlign: 'center' }}>
                Owner Gender Distribution - Pie Chart
              </Typography>
              <PieChartContainer>
                <PieChart width={400} height={300}>
                  <Pie
                    data={genderChartData}
                    dataKey="count"
                    nameKey="gender"
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    fill="#8884d8"
                    label
                  >
                    {genderChartData.map((entry, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={GENDER_COLORS[entry.gender] || PIE_COLORS[index % PIE_COLORS.length]} 
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

export default OwnerDashboard;