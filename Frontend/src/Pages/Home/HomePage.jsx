import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Button, 
  IconButton, 
  Card, 
  CardContent, 
  Grid,
  Container,
  Avatar,
  TextField,
  Chip
} from '@material-ui/core';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowBackIos, 
  ArrowForwardIos, 
  DirectionsCar,
  LocalGasStation,
  Speed,
  Star,
  Email,
  Phone,
  Place,
  Security,
  Eco,
  Settings,
  VerifiedUser,
  CalendarToday,
  People,
} from '@material-ui/icons';
import Header from '../../Components/navbar';
import { makeStyles } from '@material-ui/core/styles';
import { Build } from '@material-ui/icons';

const useStyles = makeStyles((theme) => ({
  heroSection: {
    position: 'relative',
    minHeight: '100vh',
    overflow: 'hidden',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: 'white',
    textAlign: 'center',
    padding: theme.spacing(3),
    backgroundSize: 'cover',
    backgroundPosition: 'center',
  },
  heroContent: {
    position: 'relative',
    zIndex: 2,
    maxWidth: '800px',
    padding: theme.spacing(4),
    backgroundColor: 'rgba(0,0,0,0.7)',
    borderRadius: theme.shape.borderRadius,
    backdropFilter: 'blur(5px)',
  },
  slideIndicator: {
    width: 12,
    height: 12,
    borderRadius: '50%',
    backgroundColor: 'rgba(255,255,255,0.5)',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    '&.active': {
      backgroundColor: theme.palette.primary.main,
    }
  },
  featureCard: {
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    transition: 'transform 0.3s ease, box-shadow 0.3s ease',
    '&:hover': {
      transform: 'translateY(-10px)',
      boxShadow: theme.shadows[8],
    },
    padding: theme.spacing(3),
    borderRadius: '16px',
  },
  testimonialCard: {
    padding: theme.spacing(3),
    height: '100%',
    backgroundColor: theme.palette.background.paper,
    borderRadius: '16px',
    boxShadow: '0 8px 16px rgba(0,0,0,0.1)',
  },
  contactForm: {
    padding: theme.spacing(4),
    borderRadius: '16px',
    backgroundColor: theme.palette.background.paper,
    boxShadow: '0 8px 16px rgba(0,0,0,0.1)',
  },
  iconLarge: {
    fontSize: '3.5rem',
    marginBottom: theme.spacing(2),
    color: theme.palette.primary.main,
  },
  section: {
    padding: theme.spacing(10, 0),
  },
  sectionTitle: {
    position: 'relative',
    marginBottom: theme.spacing(6),
    fontWeight: 'bold',
    '&::after': {
      content: '""',
      display: 'block',
      width: '80px',
      height: '4px',
      backgroundColor: theme.palette.primary.main,
      margin: theme.spacing(2, 'auto', 0),
    }
  },
  vehicleCard: {
    height: '100%',
    borderRadius: '16px',
    overflow: 'hidden',
    transition: 'transform 0.3s ease',
    '&:hover': {
      transform: 'scale(1.03)',
    },
    boxShadow: '0 8px 16px rgba(0,0,0,0.1)',
  },
  vehicleImage: {
    height: '200px',
    width: '100%',
    objectFit: 'cover',
  },
  statsCard: {
    padding: theme.spacing(4),
    borderRadius: '16px',
    textAlign: 'center',
    height: '100%',
    transition: 'all 0.3s ease',
    '&:hover': {
      backgroundColor: theme.palette.primary.dark,
      transform: 'translateY(-5px)',
    },
  },
  gradientBg: {
    background: 'linear-gradient(135deg, #1a2a6c 0%, #b21f1f 50%, #fdbb2d 100%)',
  },
  glassEffect: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    backdropFilter: 'blur(10px)',
    border: '1px solid rgba(255, 255, 255, 0.2)',
  },
}));

const Home = () => {
  const classes = useStyles();
  const navigate = useNavigate();
  const [currentSlide, setCurrentSlide] = useState(0);

  // Hero section slides
  const slides = [
    {
      image: 'https://images.unsplash.com/photo-1494976388531-d1058494cdd8?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80',
      title: 'Revolutionary Vehicle Management',
      subtitle: 'Take control of your fleet with our advanced management system'
    },
    {
      image: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80',
      title: 'Real-time Tracking & Analytics',
      subtitle: 'Monitor your vehicles with precision and make data-driven decisions'
    },
    {
      image: 'https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80',
      title: 'Maintenance Simplified',
      subtitle: 'Never miss a service with our intelligent maintenance scheduling'
    }
  ];

  // Features data
  const features = [
    {
      icon: <DirectionsCar className={classes.iconLarge} />,
      title: "Fleet Management",
      description: "Comprehensive tools to manage your entire vehicle fleet efficiently."
    },
    {
      icon: <Build className={classes.iconLarge} />,
      title: "Maintenance Tracking",
      description: "Schedule and track all vehicle maintenance in one place."
    },
    {
      icon: <LocalGasStation className={classes.iconLarge} />,
      title: "Fuel Monitoring",
      description: "Track fuel consumption and optimize your fleet's efficiency."
    },
    {
      icon: <Speed className={classes.iconLarge} />,
      title: "Performance Analytics",
      description: "Detailed reports on vehicle performance and driver behavior."
    }
  ];

  // Vehicles data
  const vehicles = [
    {
      image: 'https://images.unsplash.com/photo-1555215695-3004980ad54e?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80',
      make: 'Tesla',
      model: 'Model S',
      year: 2022,
      type: 'Sedan',
      status: 'Available',
      features: ['Autopilot', 'Electric', 'Premium']
    },
    {
      image: 'https://images.unsplash.com/photo-1542281286-9e0a16bb7366?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80',
      make: 'Ford',
      model: 'F-150',
      year: 2021,
      type: 'Truck',
      status: 'In Maintenance',
      features: ['4WD', 'Towing Package', 'Crew Cab']
    },
    {
      image: 'https://images.unsplash.com/photo-1511919884226-fd3cad34687c?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80',
      make: 'Toyota',
      model: 'Camry',
      year: 2023,
      type: 'Sedan',
      status: 'Available',
      features: ['Hybrid', 'Lane Assist', 'Premium Sound']
    },
    {
      image: 'https://images.unsplash.com/photo-1547036967-23d11aacaee0?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80',
      make: 'Mercedes',
      model: 'Sprinter',
      year: 2022,
      type: 'Van',
      status: 'On Route',
      features: ['Cargo', 'High Roof', 'Diesel']
    }
  ];

  // Testimonials data
  const testimonials = [
    {
      name: "Michael Rodriguez",
      avatar: "https://randomuser.me/api/portraits/men/32.jpg",
      position: "Fleet Manager, TransLogistics",
      rating: 5,
      comment: "AutoDrive has transformed how we manage our 150-vehicle fleet. The maintenance tracking alone has saved us thousands in repair costs."
    },
    {
      name: "Sarah Johnson",
      avatar: "https://randomuser.me/api/portraits/women/44.jpg",
      position: "Operations Director, City Delivery",
      rating: 5,
      comment: "The real-time tracking and analytics have given us visibility we never had before. Our efficiency has improved by 23% since implementation."
    },
    {
      name: "David Kim",
      avatar: "https://randomuser.me/api/portraits/men/75.jpg",
      position: "CEO, EcoTransit",
      rating: 4,
      comment: "Excellent platform with intuitive interface. The fuel monitoring features have helped us reduce our carbon footprint significantly."
    }
  ];

  // Stats data
  const stats = [
    {
      icon: <DirectionsCar fontSize="large" style={{ fontSize: '3rem', color: 'white' }} />,
      value: "10,000+",
      label: "Vehicles Managed"
    },
    {
      icon: <People fontSize="large" style={{ fontSize: '3rem', color: 'white' }} />,
      value: "2,500+",
      label: "Satisfied Clients"
    },
    {
      icon: <CalendarToday fontSize="large" style={{ fontSize: '3rem', color: 'white' }} />,
      value: "500K+",
      label: "Maintenance Events"
    },
    {
      icon: <DirectionsCar  fontSize="large" style={{ fontSize: '3rem', color: 'white' }} />,
      value: "98.7%",
      label: "Uptime Reliability"
    }
  ];

  // Benefits data
  const benefits = [
    {
      icon: <Security className={classes.iconLarge} />,
      title: "Enhanced Security",
      description: "Advanced tracking and anti-theft features to protect your assets."
    },
    {
      icon: <Eco className={classes.iconLarge} />,
      title: "Eco-Friendly",
      description: "Reduce emissions with our fuel efficiency monitoring and optimization."
    },
    {
      icon: <Settings className={classes.iconLarge} />,
      title: "Customizable",
      description: "Tailor the system to your specific business needs and workflows."
    },
    {
      icon: <VerifiedUser className={classes.iconLarge} />,
      title: "Compliance Ready",
      description: "Stay compliant with all regulations through automated reporting."
    }
  ];

  // Auto-advance slides every 5 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearTimeout(timer);
  }, [currentSlide, slides.length]);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  return (
    <Box>
      {/* Hero Section with Slideshow */}
      <Box 
        className={classes.heroSection}
        style={{
          backgroundImage: `linear-gradient(rgba(0,0,0,0.7), rgba(0,0,0,0.7)), url(${slides[currentSlide].image})`,
          transition: 'background-image 1s ease-in-out'
        }}
      >
        <Container>
          <Box className={classes.heroContent}>
            <Typography 
              variant="h2" 
              gutterBottom 
              style={{
                fontFamily: '"Montserrat", sans-serif',
                fontWeight: 'bold',
                marginBottom: '20px',
                textShadow: '2px 2px 4px rgba(0,0,0,0.5)'
              }}
            >
              {slides[currentSlide].title}
            </Typography>
            <Typography 
              variant="h5" 
              style={{
                fontFamily: '"Roboto", sans-serif',
                marginBottom: '40px',
                textShadow: '1px 1px 2px rgba(0,0,0,0.5)'
              }}
            >
              {slides[currentSlide].subtitle}
            </Typography>
            
            <Box display="flex" justifyContent="center" gap={2} mt={4}>
              <Button
                variant="contained"
                color="primary"
                size="large"
                onClick={() => navigate('/demo')}
                style={{
                  padding: '12px 30px',
                  fontWeight: 'bold',
                  borderRadius: '50px',
                  marginRight: '25px',
                  fontSize: '1rem'
                }}
              >
                Request Demo
              </Button>
              <Button
                variant="outlined"
                color="primary"
                size="large"
                onClick={() => navigate('/contact')}
                style={{
                  padding: '12px 30px',
                  fontWeight: 'bold',
                  borderRadius: '50px',
                  borderWidth: '2px',
                  color: 'white',
                  borderColor: 'white',
                  fontSize: '1rem'
                }}
              >
                Contact Sales
              </Button>
            </Box>
          </Box>
        </Container>

        {/* Navigation Arrows */}
        <IconButton 
          onClick={prevSlide}
          style={{
            position: 'absolute',
            left: '20px',
            top: '50%',
            zIndex: 2,
            color: 'white',
            backgroundColor: 'rgba(0,0,0,0.3)',
          }}
        >
          <ArrowBackIos />
        </IconButton>
        
        <IconButton 
          onClick={nextSlide}
          style={{
            position: 'absolute',
            right: '20px',
            top: '50%',
            zIndex: 2,
            color: 'white',
            backgroundColor: 'rgba(0,0,0,0.3)',
          }}
        >
          <ArrowForwardIos />
        </IconButton>
        
        {/* Slide Indicators */}
        <Box
          style={{
            position: 'absolute',
            bottom: '30px',
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 2,
            display: 'flex',
            gap: '10px'
          }}
        >
          {slides.map((_, index) => (
            <Box
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`${classes.slideIndicator} ${index === currentSlide ? 'active' : ''}`}
            />
          ))}
        </Box>
      </Box>

      {/* Features Section */}
      <Box className={classes.section} bgcolor="background.default">
        <Container>
          <Typography 
            variant="h3" 
            align="center" 
            className={classes.sectionTitle}
          >
            Powerful Features
          </Typography>
          <Typography 
            variant="h6" 
            align="center" 
            color="textSecondary" 
            paragraph
            style={{ maxWidth: '800px', margin: '0 auto 60px', fontSize: '1.1rem' }}
          >
            AutoDrive provides all the tools you need to efficiently manage your vehicle fleet
          </Typography>
          
          <Grid container spacing={4}>
            {features.map((feature, index) => (
              <Grid item xs={12} sm={6} md={3} key={index}>
                <Card className={classes.featureCard} elevation={3}>
                  {feature.icon}
                  <Typography variant="h5" gutterBottom style={{ fontWeight: 'bold' }}>
                    {feature.title}
                  </Typography>
                  <Typography variant="body1" color="textSecondary" align="center">
                    {feature.description}
                  </Typography>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* Vehicle Showcase Section */}
      <Box className={classes.section} style={{ backgroundColor: '#f9f9f9' }}>
        <Container>
          <Typography 
            variant="h3" 
            align="center" 
            className={classes.sectionTitle}
          >
            Vehicle Management
          </Typography>
          <Typography 
            variant="h6" 
            align="center" 
            color="textSecondary" 
            paragraph
            style={{ maxWidth: '800px', margin: '0 auto 60px', fontSize: '1.1rem' }}
          >
            Comprehensive management for all types of vehicles in your fleet
          </Typography>
          
          <Grid container spacing={4}>
            {vehicles.map((vehicle, index) => (
              <Grid item xs={12} sm={6} md={3} key={index}>
                <Card className={classes.vehicleCard} elevation={3}>
                  <img 
                    src={vehicle.image} 
                    alt={`${vehicle.make} ${vehicle.model}`} 
                    className={classes.vehicleImage}
                  />
                  <CardContent>
                    <Typography variant="h5" gutterBottom>
                      {vehicle.make} {vehicle.model}
                    </Typography>
                    <Typography color="textSecondary" gutterBottom>
                      {vehicle.year} • {vehicle.type}
                    </Typography>
                    <Box mb={2}>
                      <Chip 
                        label={vehicle.status} 
                        size="small" 
                        color={
                          vehicle.status === 'Available' ? 'primary' : 
                          vehicle.status === 'In Maintenance' ? 'secondary' : 'default'
                        }
                      />
                    </Box>
                    <Box display="flex" flexWrap="wrap" gap={1}>
                      {vehicle.features.map((feature, i) => (
                        <Chip key={i} label={feature} size="small" variant="outlined" />
                      ))}
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* Benefits Section */}
      <Box className={classes.section}>
        <Container>
          <Typography 
            variant="h3" 
            align="center" 
            className={classes.sectionTitle}
          >
            Key Benefits
          </Typography>
          <Typography 
            variant="h6" 
            align="center" 
            color="textSecondary" 
            paragraph
            style={{ maxWidth: '800px', margin: '0 auto 60px', fontSize: '1.1rem' }}
          >
            Why businesses choose AutoDrive for their fleet management needs
          </Typography>
          
          <Grid container spacing={4}>
            {benefits.map((benefit, index) => (
              <Grid item xs={12} sm={6} md={3} key={index}>
                <Card className={classes.featureCard} elevation={3}>
                  {benefit.icon}
                  <Typography variant="h5" gutterBottom style={{ fontWeight: 'bold' }}>
                    {benefit.title}
                  </Typography>
                  <Typography variant="body1" color="textSecondary" align="center">
                    {benefit.description}
                  </Typography>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* Stats Section */}
      <Box className={classes.section} style={{ backgroundColor: '#1a237e', color: 'white' }}>
        <Container>
          <Grid container spacing={4}>
            {stats.map((stat, index) => (
              <Grid item xs={12} sm={6} md={3} key={index}>
                <Card className={`${classes.statsCard} ${classes.glassEffect}`}>
                  {stat.icon}
                  <Typography variant="h2" style={{ fontWeight: 'bold', margin: '20px 0' }}>
                    {stat.value}
                  </Typography>
                  <Typography variant="h6">
                    {stat.label}
                  </Typography>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* Testimonials Section */}
      <Box className={classes.section} style={{ backgroundColor: '#f9f9f9' }}>
        <Container>
          <Typography 
            variant="h3" 
            align="center" 
            className={classes.sectionTitle}
          >
            What Our Clients Say
          </Typography>
          <Typography 
            variant="h6" 
            align="center" 
            color="textSecondary" 
            paragraph
            style={{ maxWidth: '800px', margin: '0 auto 60px', fontSize: '1.1rem' }}
          >
            Hear from businesses that have transformed their fleet operations with AutoDrive
          </Typography>
          
          <Grid container spacing={4}>
            {testimonials.map((testimonial, index) => (
              <Grid item xs={12} md={4} key={index}>
                <Card className={classes.testimonialCard} elevation={3}>
                  <Box display="flex" alignItems="center" mb={2}>
                    <Avatar 
                      src={testimonial.avatar} 
                      alt={testimonial.name} 
                      style={{ width: '60px', height: '60px', marginRight: '16px' }} 
                    />
                    <Box>
                      <Typography variant="h6" style={{ fontWeight: 'bold' }}>
                        {testimonial.name}
                      </Typography>
                      <Typography variant="body2" color="textSecondary">
                        {testimonial.position}
                      </Typography>
                    </Box>
                  </Box>
                  <Box display="flex" mb={2}>
                    {[...Array(5)].map((_, i) => (
                      <Star 
                        key={i} 
                        style={{ 
                          color: i < testimonial.rating ? '#FFD700' : '#E0E0E0',
                          fontSize: '1.2rem'
                        }} 
                      />
                    ))}
                  </Box>
                  <Typography variant="body1" style={{ fontStyle: 'italic' }}>
                    "{testimonial.comment}"
                  </Typography>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* Contact Section */}
      <Box className={classes.section} id="contact">
        <Container maxWidth="lg">
          <Typography 
            variant="h3" 
            align="center" 
            className={classes.sectionTitle}
          >
            Get In Touch
          </Typography>
          <Typography 
            variant="h6" 
            align="center" 
            color="textSecondary" 
            paragraph
            style={{ margin: '0 auto 60px', fontSize: '1.1rem' }}
          >
            Ready to transform your fleet management? Contact our team today.
          </Typography>
          
          <Grid container spacing={6}>
            <Grid item xs={12} md={6}>
              <Card className={classes.contactForm} elevation={3}>
                <form>
                  <Grid container spacing={3}>
                    <Grid item xs={12}>
                      <Typography variant="h5" gutterBottom style={{ fontWeight: 'bold' }}>
                        Send Us a Message
                      </Typography>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Your Name"
                        variant="outlined"
                        required
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Company Name"
                        variant="outlined"
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label="Email Address"
                        variant="outlined"
                        type="email"
                        required
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label="Phone Number"
                        variant="outlined"
                        type="tel"
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label="How can we help you?"
                        variant="outlined"
                        multiline
                        rows={4}
                        required
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <Button 
                        type="submit" 
                        variant="contained" 
                        color="primary" 
                        size="large"
                        fullWidth
                        style={{ padding: '12px', fontSize: '1rem' }}
                      >
                        Submit Inquiry
                      </Button>
                    </Grid>
                  </Grid>
                </form>
              </Card>
            </Grid>
            <Grid item xs={12} md={6}>
              <Box mb={4}>
                <Typography variant="h5" gutterBottom style={{ fontWeight: 'bold' }}>
                  Contact Information
                </Typography>
                <Typography variant="body1" paragraph>
                  Our team is ready to answer your questions and provide a personalized demo of our platform.
                </Typography>
              </Box>
              
              <Box display="flex" alignItems="center" mb={3}>
                <Place style={{ marginRight: '16px', color: '#1a237e', fontSize: '2rem' }} />
                <Box>
                  <Typography variant="body1" style={{ fontWeight: 'bold' }}>
                    Headquarters
                  </Typography>
                  <Typography variant="body1">
                    123 Auto Drive, Suite 500<br />
                    San Francisco, CA 94107
                  </Typography>
                </Box>
              </Box>
              
              <Box display="flex" alignItems="center" mb={3}>
                <Email style={{ marginRight: '16px', color: '#1a237e', fontSize: '2rem' }} />
                <Box>
                  <Typography variant="body1" style={{ fontWeight: 'bold' }}>
                    Email
                  </Typography>
                  <Typography variant="body1">
                    info@autodrive.com<br />
                    support@autodrive.com
                  </Typography>
                </Box>
              </Box>
              
              <Box display="flex" alignItems="center">
                <Phone style={{ marginRight: '16px', color: '#1a237e', fontSize: '2rem' }} />
                <Box>
                  <Typography variant="body1" style={{ fontWeight: 'bold' }}>
                    Phone
                  </Typography>
                  <Typography variant="body1">
                    +1 (800) 555-1234<br />
                    Sales: ext. 100<br />
                    Support: ext. 200
                  </Typography>
                </Box>
              </Box>

              <Box mt={4}>
                <Typography variant="h6" gutterBottom style={{ fontWeight: 'bold' }}>
                  Office Hours
                </Typography>
                <Typography variant="body1">
                  Monday - Friday: 8:00 AM - 6:00 PM PST<br />
                  Saturday: 9:00 AM - 2:00 PM PST<br />
                  Sunday: Closed
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </Container>
      </Box>
    </Box>
  );
};

export default Home;