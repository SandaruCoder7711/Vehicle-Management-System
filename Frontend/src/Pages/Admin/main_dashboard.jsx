import React from 'react';
import styled from 'styled-components';
import { Typography } from '@material-ui/core';
import Header from '../../Components/main_navbar';
import { useNavigate } from 'react-router-dom';

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
`;

const CardContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
  justify-content: center;
  margin-top: 20px;
`;

const Card = styled.div`
  background-color: #fff;
  flex: 1;
  min-width: 250px;
  max-width: 350px;
  height: 500px;
  border-radius: 10px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: #333;
  box-shadow: 0 4px 8px rgba(0,0,0,0.1);
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
  overflow: hidden;

  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 8px 16px rgba(0,0,0,0.2);
  }
`;

const IllustrationContainer = styled.div`
  width: 100%;
  height: 450px;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
`;

const CardTitle = styled.div`
  font-size: 20px;
  font-weight: bold;
  text-align: center;
  padding: 15px;
`;

const MainDashboard = () => {
  const navigate = useNavigate();

  // Card data with full image URLs
  const cards = [
    {
      title: 'Vehicle Management',
      illustration: 'https://img.freepik.com/free-photo/back-view-grey-car-standing-bridge_114579-4084.jpg?uid=R129411847&ga=GA1.1.1390875937.1743015419&semt=ais_hybrid',
      path: '/vehicle-dashboard',
    },
    {
      title: 'Owner Management',
      illustration: 'https://img.freepik.com/free-photo/person-traveling-by-electric-car_23-2149362849.jpg?uid=R129411847&ga=GA1.1.1390875937.1743015419&semt=ais_hybrid',
      path: '/owner-dashboard',
    },
    {
      title: 'Inventory Management',
      illustration: 'https://img.freepik.com/free-photo/young-man-working-warehouse_23-2149128345.jpg?uid=R129411847&ga=GA1.1.1390875937.1743015419&semt=ais_hybrid',
      path: '/inventory-dashboard',
    },
    {
      title: 'Service Reminder & Modifier',
      illustration: 'https://img.freepik.com/free-photo/close-up-delivery-man-checking-trip-details-phone_23-2148944603.jpg?uid=R129411847&ga=GA1.1.1390875937.1743015419&semt=ais_hybrid',
      path: '/service-reminder-dashboard',
    },
  ];

  return (
    <DashboardContainer>
      <Header /> 
      <MainSection>
        <MainContent>
          {/* Card Views for Navigation */}
          <CardContainer>
            {cards.map((card, index) => (
              <Card key={index} onClick={() => navigate(card.path)}  style={{backgroundColor:'cyan'}}>
               <CardTitle>{card.title}</CardTitle>
                <IllustrationContainer>
                  <img src={card.illustration} alt={card.title} />
                </IllustrationContainer>
              </Card>
            ))}
          </CardContainer>
        </MainContent>
      </MainSection>
    </DashboardContainer>
  );
};

export default MainDashboard;