import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { 
  FaBox, 
  FaWarehouse, 
  FaTags, 
  FaExclamationTriangle 
} from 'react-icons/fa';
import { Typography } from '@material-ui/core';
import Sidebar from '../../Components/inventory_sidebar';
import Header from '../../Components/inventory_navbar'; 
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

const InventoryDashboard = () => {
  const [inventoryItems, setInventoryItems] = useState([]);
  const [categoryCounts, setCategoryCounts] = useState([]);
  const [stockStatus, setStockStatus] = useState([]);
  const [totalInventoryValue, setTotalInventoryValue] = useState(0);

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
      } catch (error) {
        console.error('Error fetching inventory data:', error);
      }
    };

    fetchInventoryData();
  }, []);

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
    <DashboardContainer>
      <Header /> 
      <MainSection>
        <Sidebar /> 
        <MainContent>
          <Typography variant="h4" gutterBottom style={{ marginBottom: '20px', fontFamily: 'cursive', fontWeight: 'bold', color: 'purple', textAlign: 'center' }}>
            Inventory Management Dashboard
          </Typography>

          {/* Status Section with Total, Value, and Average Value */}
          <StatusSection>
            <StatusCard color="#6200EA">
              <StatusTitle>Total Inventory Items</StatusTitle>
              <StatusCount>{inventoryItems.length}</StatusCount>
            </StatusCard>
            <StatusCard color="#4CAF50">
              <StatusTitle>Total Inventory Value</StatusTitle>
              <StatusCount>Rs {totalInventoryValue.toLocaleString()}</StatusCount>
            </StatusCard>
            <StatusCard color="#2196F3">
              <StatusTitle>Avg Item Value</StatusTitle>
              <StatusCount>Rs {(totalInventoryValue / inventoryItems.length || 0).toLocaleString()}</StatusCount>
            </StatusCard>
          </StatusSection>

          {/* Stock Status Section */}
          <BoxContainer>
            <Typography variant="h6" gutterBottom style={{ marginBottom: '20px', fontWeight: 'bold', color: '#333', textAlign: 'center' }}>
              Stock Status Overview
            </Typography>
            <CardContainer>
              <Card color="#4CAF50">
                <IconContainer>
                  <FaBox size={40} />
                </IconContainer>
                <div>In Stock</div>
                <Count>{inStockCount}</Count>
              </Card>
              <Card color="#FFC107">
                <IconContainer>
                  <FaExclamationTriangle size={40} />
                </IconContainer>
                <div>Low Stock</div>
                <Count>{lowStockCount}</Count>
              </Card>
              <Card color="#F44336">
                <IconContainer>
                  <FaWarehouse size={40} />
                </IconContainer>
                <div>Out of Stock</div>
                <Count>{outOfStockCount}</Count>
              </Card>
            </CardContainer>
          </BoxContainer>

          {/* Category Distribution */}
          <BoxContainer>
            <Typography variant="h6" gutterBottom style={{ marginBottom: '20px', fontWeight: 'bold', color: '#333', textAlign: 'center' }}>
              Inventory Categories
            </Typography>
            <CardContainer>
              {categoryCounts.map((category, index) => (
                <Card key={category.category} color={CATEGORY_COLORS[index % CATEGORY_COLORS.length]}>
                  <IconContainer>
                    {getCategoryIcon(category.category)}
                  </IconContainer>
                  <div>{category.category}</div>
                  <Count>{category.count}</Count>
                </Card>
              ))}
            </CardContainer>
          </BoxContainer>

          {/* Charts Section */}
          <ChartsRow>
            {/* Bar Chart - Category Distribution */}
            <ChartSection>
              <Typography variant="h6" gutterBottom style={{ marginBottom: '20px', fontWeight: 'bold', color: '#333', textAlign: 'center' }}>
                Category Distribution
              </Typography>
              <BarChart width={500} height={300} data={categoryChartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="category" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="count">
                  {categoryChartData.map((entry, index) => (
                    <Cell 
                      key={entry.category} 
                      fill={CATEGORY_COLORS[index % CATEGORY_COLORS.length]} 
                    />
                  ))}
                </Bar>
              </BarChart>
            </ChartSection>

            {/* Pie Chart - Stock Status Distribution */}
            <ChartSection>
              <Typography variant="h6" gutterBottom style={{ marginBottom: '20px', fontWeight: 'bold', color: '#333', textAlign: 'center' }}>
                Stock Status Distribution
              </Typography>
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
            </ChartSection>
          </ChartsRow>
        </MainContent>
      </MainSection>
    </DashboardContainer>
  );
};

export default InventoryDashboard;