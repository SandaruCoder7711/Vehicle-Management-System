import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  Avatar, 
  Chip,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Button,
  Grid,
  Card,
  CardContent,
  CardMedia,
  LinearProgress,
  Tooltip,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@material-ui/core';
import { 
  DirectionsCar as DirectionsCarIcon,
  CalendarToday as CalendarIcon,
  LocalGasStation as FuelIcon,
  ColorLens as ColorIcon,
  Speed as SpeedIcon,
  Build as BuildIcon,
  Edit as EditIcon,
  ArrowBack as BackIcon,
  Add as AddIcon,
  Error as ErrorIcon,
  Info as InfoIcon
} from '@material-ui/icons';
import { makeStyles } from '@material-ui/core/styles';
import { useNavigate } from 'react-router-dom';
import { format, isValid } from 'date-fns';

const useStyles = makeStyles((theme) => ({
  root: {
    padding: theme.spacing(4),
    backgroundColor: '#f5f7fa',
    minHeight: '100vh'
  },
  header: {
    marginBottom: theme.spacing(4),
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  title: {
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(2),
    color: theme.palette.primary.main
  },
  ownerCard: {
    padding: theme.spacing(3),
    marginBottom: theme.spacing(3),
    borderRadius: 12,
    boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
    background: 'linear-gradient(135deg, #f5f7fa 0%, #e4e8ed 100%)'
  },
  vehicleCard: {
    borderRadius: 12,
    boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
    transition: 'transform 0.3s, box-shadow 0.3s',
    '&:hover': {
      transform: 'translateY(-5px)',
      boxShadow: '0 8px 24px rgba(0,0,0,0.12)'
    }
  },
  vehicleImage: {
    height: 140,
    objectFit: 'cover',
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12
  },
  statusChip: {
    fontWeight: 'bold',
    marginLeft: theme.spacing(1)
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
    marginTop: theme.spacing(1)
  },
  detailDialog: {
    borderRadius: 16
  },
  loadingContainer: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '60vh'
  },
  errorContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '60vh',
    textAlign: 'center',
    padding: theme.spacing(4)
  },
  emptyState: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: theme.spacing(6),
    textAlign: 'center',
    borderRadius: 12,
    backgroundColor: theme.palette.background.paper,
    boxShadow: '0 4px 20px rgba(0,0,0,0.08)'
  },
  addButton: {
    borderRadius: 50,
    padding: theme.spacing(1.5, 3),
    boxShadow: theme.shadows[3],
    '&:hover': {
      boxShadow: theme.shadows[6]
    }
  }
}));

const VehicleDetailsPage = () => {
  const classes = useStyles();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [owner, setOwner] = useState(null);
  const [vehicles, setVehicles] = useState([]);
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);

  useEffect(() => {
    const fetchOwnerVehicles = async () => {
      try {
        setLoading(true);
        const userEmail = localStorage.getItem('userEmail');
        const token = localStorage.getItem('token');

        if (!userEmail || !token) {
          navigate('/login');
          return;
        }

        const response = await fetch('http://localhost:3000/owner/vehicles', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ email: userEmail })
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || 'Failed to fetch vehicle details');
        }

        setOwner(data.owner);
        setVehicles(data.vehicles);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchOwnerVehicles();
  }, [navigate]);

  const calculateServiceProgress = (vehicle) => {
    if (!vehicle) return 0;
    const { mileage, lastServiceMileage } = vehicle;
    const serviceInterval = 5000;
    const milesSinceService = mileage - lastServiceMileage;
    return Math.min(100, (milesSinceService / serviceInterval) * 100);
  };

  const getServiceStatus = (progress) => {
    if (progress < 70) return 'Good';
    if (progress < 90) return 'Due Soon';
    return 'Urgent Service Needed';
  };

  const formatDateSafe = (dateString) => {
    try {
      const date = new Date(dateString);
      return isValid(date) ? format(date, 'MMM d, yyyy') : 'N/A';
    } catch {
      return 'N/A';
    }
  };

  const handleViewDetails = (vehicle) => {
    setSelectedVehicle(vehicle);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  const handleAddVehicle = () => {
    navigate('/vehicles/add');
  };

  if (loading) {
    return (
      <Box className={classes.loadingContainer}>
        <CircularProgress size={60} thickness={4} />
      </Box>
    );
  }

  if (error) {
    return (
      <Box className={classes.errorContainer}>
        <ErrorIcon color="error" style={{ fontSize: 60, marginBottom: 16 }} />
        <Typography variant="h5" gutterBottom>
          Error Loading Vehicle Details
        </Typography>
        <Typography color="textSecondary" paragraph>
          {error}
        </Typography>
        <Button 
          variant="contained" 
          color="primary"
          startIcon={<BackIcon />}
          onClick={() => window.location.reload()}
          style={{ marginTop: 16 }}
        >
          Try Again
        </Button>
      </Box>
    );
  }

  return (
    <Box className={classes.root}>
      <Box className={classes.header}>
        <Box className={classes.title}>
          <DirectionsCarIcon fontSize="large" />
          <Typography variant="h4">My Vehicles</Typography>
        </Box>
      </Box>

      {owner && (
        <Paper className={classes.ownerCard}>
          <Typography variant="h6" gutterBottom style={{ color: '#3f51b5' }}>
            Owner Information
          </Typography>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Typography><strong>Name:</strong> {owner.name}</Typography>
              <Typography><strong>Email:</strong> {owner.email}</Typography>
              <Typography><strong>Contact:</strong> {owner.contact}</Typography>
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography><strong>License Number:</strong> {owner.license_number}</Typography>
              <Typography><strong>Date of Birth:</strong> {formatDateSafe(owner.date_of_birth)}</Typography>
              <Typography><strong>Gender:</strong> {owner.gender}</Typography>
            </Grid>
          </Grid>
        </Paper>
      )}

      {vehicles.length > 0 ? (
        <Grid container spacing={3}>
          {vehicles.map((vehicle) => {
            const progress = calculateServiceProgress(vehicle);
            const status = getServiceStatus(progress);
            
            return (
              <Grid item xs={12} sm={6} md={4} key={vehicle.id}>
                <Card className={classes.vehicleCard}>
                  <CardContent>
                    <Box display="flex" alignItems="center" mb={1} mt={2}>
                      <Typography variant="h6">
                        {vehicle.make} {vehicle.model}
                      </Typography>
                      <Chip
                        label={vehicle.status}
                        size="small"
                        color={
                          vehicle.status === 'Active' ? 'primary' : 
                          vehicle.status === 'In Service' ? 'secondary' : 'default'
                        }
                        className={classes.statusChip}
                      />
                    </Box>
                    
                    <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                      {vehicle.registration_number} • {vehicle.year}
                    </Typography>
                    
                    <Box display="flex" alignItems="center" mb={1}>
                      <ColorIcon color="action" fontSize="small" style={{ marginRight: 8 }} />
                      <Typography variant="body2">{vehicle.color}</Typography>
                    </Box>
                    
                    <Box display="flex" alignItems="center" mb={1}>
                      <FuelIcon color="action" fontSize="small" style={{ marginRight: 8 }} />
                      <Typography variant="body2">{vehicle.fuelType} • {vehicle.vehicleType}</Typography>
                    </Box>
                    
                    <Box mt={2}>
                      <Box display="flex" justifyContent="space-between" mb={0.5}>
                        <Typography variant="caption">Service Status: <strong>{status}</strong></Typography>
                        <Typography variant="caption">{progress.toFixed(0)}%</Typography>
                      </Box>
                      <LinearProgress 
                        variant="determinate" 
                        value={progress} 
                        className={classes.progressBar}
                        color={
                          progress > 90 ? 'secondary' : 'primary'
                        } 
                      />
                      <Box display="flex" justifyContent="space-between" mt={0.5}>
                        <Typography variant="caption">{vehicle.lastServiceMileage} mi</Typography>
                        <Typography variant="caption">{vehicle.mileage} mi</Typography>
                      </Box>
                    </Box>
                    
                    <Box mt={2} display="flex" justifyContent="flex-end">
                      <Button
                        variant="outlined"
                        color="primary"
                        size="small"
                        startIcon={<InfoIcon />}
                        onClick={() => handleViewDetails(vehicle)}
                      >
                        Details
                      </Button>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            );
          })}
        </Grid>
      ) : (
        <Box className={classes.emptyState}>
          <DirectionsCarIcon style={{ fontSize: 60, color: '#9e9e9e', marginBottom: 16 }} />
          <Typography variant="h5" gutterBottom>
            No Vehicles Found
          </Typography>
          <Typography variant="body1" color="textSecondary" paragraph>
            You haven't added any vehicles yet. Get started by adding your first vehicle.
          </Typography>
        </Box>
      )}

      <Dialog 
        open={openDialog} 
        onClose={handleCloseDialog} 
        maxWidth="md" 
        fullWidth
        classes={{ paper: classes.detailDialog }}
      >
        {selectedVehicle && (
          <>
            <DialogTitle>
              <Box display="flex" alignItems="center">
                <DirectionsCarIcon color="primary" style={{ marginRight: 12 }} />
                <Typography variant="h6">
                  {selectedVehicle.make} {selectedVehicle.model} Details
                </Typography>
              </Box>
            </DialogTitle>
            <DialogContent dividers>
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>

                  <Typography variant="subtitle1" gutterBottom>
                    <strong>Make:</strong> {selectedVehicle.make}
                  </Typography>
                  
                  <Typography variant="subtitle1" gutterBottom>
                    <strong>Model:</strong> {selectedVehicle.model}
                  </Typography>
   
                  <Typography variant="subtitle1" gutterBottom>
                    <strong>Registration:</strong> {selectedVehicle.registration_number}
                  </Typography>
                  
                  <Typography variant="subtitle1" gutterBottom>
                    <strong>Year:</strong> {selectedVehicle.year}
                  </Typography>
                  
                  <Typography variant="subtitle1" gutterBottom>
                    <strong>Color:</strong> {selectedVehicle.color}
                  </Typography>
                  
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <Typography variant="h6" gutterBottom>
                    Technical Details
                  </Typography>
                  
                  <Typography variant="subtitle1" gutterBottom>
                    <strong>Fuel Type:</strong> {selectedVehicle.fuelType}
                  </Typography>
                  
                  <Typography variant="subtitle1" gutterBottom>
                    <strong>Vehicle Type:</strong> {selectedVehicle.vehicleType}
                  </Typography>
                  
                  <Typography variant="subtitle1" gutterBottom>
                    <strong>Last Service Mileage:</strong> {selectedVehicle.lastServiceMileage} mi
                  </Typography>
                  
                </Grid>
              </Grid>
            
            </DialogContent>
            <DialogActions>
              <Button onClick={handleCloseDialog} color="primary">
                Close
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </Box>
  );
};

export default VehicleDetailsPage;