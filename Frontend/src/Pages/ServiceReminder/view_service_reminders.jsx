import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { 
  Box, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, 
  Paper, TextField, MenuItem, FormControl, Select, InputLabel, Avatar, Chip, 
  IconButton, Collapse, Grid, Card, CardContent, CardHeader, Divider, TablePagination
} from '@material-ui/core';
import Swal from 'sweetalert2';
import Sidebar from '../../Components/service_reminder_sidebar';
import Header from '../../Components/reminder_navbar';
import { makeStyles } from '@material-ui/core/styles';
import { useNavigate } from 'react-router-dom';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import DeleteIcon from '@material-ui/icons/Delete';
import EditIcon from '@material-ui/icons/Edit';
import InfoIcon from '@material-ui/icons/Info';
import EventIcon from '@material-ui/icons/Event';
import DirectionsCarIcon from '@material-ui/icons/DirectionsCar';
import BuildIcon from '@material-ui/icons/Build';
import PriorityHighIcon from '@material-ui/icons/PriorityHigh';
import AttachMoneyIcon from '@material-ui/icons/AttachMoney';
import ReplayIcon from '@material-ui/icons/Replay';
import CheckCircleIcon from '@material-ui/icons/CheckCircle';

// Custom Pagination Component
const CustomPagination = ({ count, page, rowsPerPage, onPageChange }) => {
  return (
    <TablePagination
      component="div"
      count={count}
      page={page}
      rowsPerPage={rowsPerPage}
      onPageChange={onPageChange}
      rowsPerPageOptions={[]}
      labelRowsPerPage=""
    />
  );
};

const useStyles = makeStyles((theme) => ({
  searchField: {
    marginBottom: '20px',
    width: '300px',
    borderRadius: '25px',
    '& .MuiOutlinedInput-root': {
      borderRadius: '25px',
      padding: '5px 10px',
    },
    '& .MuiOutlinedInput-input': {
      padding: '8px 14px',
      fontSize: '14px',
    },
  },
  criteriaSelect: {
    marginRight: '45px',
    minWidth: '150px',
    marginBottom: '30px',
  },
  contentContainer: {
    backgroundColor: 'white',
    borderRadius: 8,
    boxShadow: '0px 0px 10px rgba(0,0,0,0.1)',
    flex: 1,
    margin: '15px',
    padding: '20px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'flex-start',
    minHeight: '80vh',
    maxWidth: '100%',
    overflowX: 'auto',
  },
  tableContainer: {
    width: '100%',
    overflowX: 'auto',
    marginBottom: theme.spacing(3),
    borderRadius: 8,
    '& .MuiTable-root': {
      borderCollapse: 'separate',
      borderSpacing: '0 8px'
    },
  },
  tableRow: {
    backgroundColor: '#f9f9f9',
    '&:hover': {
      backgroundColor: '#f1f1f1',
    },
    boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
    borderRadius: 8,
  },
  tableHeadRow: {
    backgroundColor: '#d4ac0d',
  },
  tableHeadCell: {
    color: 'white',
    fontWeight: 'bold',
  },
  cardHeader: {
    backgroundColor: theme.palette.primary.main,
    color: 'white',
    padding: theme.spacing(1.5),
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
  },
  cardIcon: {
    marginRight: theme.spacing(1),
    color: 'white',
  },
  infoRow: {
    display: 'flex',
    alignItems: 'center',
    margin: theme.spacing(1.5, 0),
    '& svg': {
      marginRight: theme.spacing(1),
      color: theme.palette.primary.main,
    },
  },
  infoLabel: {
    fontWeight: 'bold',
    color: theme.palette.text.secondary,
    minWidth: 120,
  },
  infoValue: {
    color: theme.palette.text.primary,
  },
  actionButton: {
    margin: theme.spacing(0.5),
  },
  deleteButton: {
    backgroundColor: '#f44336',
    color: 'white',
    '&:hover': {
      backgroundColor: '#d32f2f',
    },
  },
  editButton: {
    backgroundColor: '#4CAF50',
    color: 'white',
    '&:hover': {
      backgroundColor: '#2E7D32',
    },
  },
  completedButton: {
    backgroundColor: '#2196f3',
    color: 'white',
    '&:hover': {
      backgroundColor: '#1565c0',
    },
  },
  statusChip: {
    margin: theme.spacing(0.5),
    fontWeight: 'bold',
  },
  statusPending: {
    backgroundColor: '#ff9800',
    color: 'white',
  },
  statusCompleted: {
    backgroundColor: '#4caf50',
    color: 'white',
  },
  statusOverdue: {
    backgroundColor: '#f44336',
    color: 'white',
  },
}));

const ViewServiceReminder = () => {
  const classes = useStyles();
  const [reminders, setReminders] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchCriteria, setSearchCriteria] = useState("serviceType");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [expandedRow, setExpandedRow] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch service reminders
        const remindersResponse = await axios.get('http://localhost:3001/service-reminder/get-reminders');
        setReminders(remindersResponse.data);
        
        // Fetch vehicles for lookup
        const vehiclesResponse = await axios.get('http://localhost:3001/vehicle/get-vehicles');
        setVehicles(vehiclesResponse.data);
      } catch (error) {
        console.error("Error fetching data:", error);
        Swal.fire({
          title: 'Error!',
          text: 'Failed to load service reminders',
          icon: 'error',
          confirmButtonColor: '#d33',
        });
      }
    };
  
    fetchData();
  }, []);

  const handleDelete = async (id) => {
    const confirmResult = await Swal.fire({
      title: 'Are you sure?',
      text: "You won't be able to revert this!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, delete it!'
    });
    
    if (confirmResult.isConfirmed) {
      try {
        await axios.delete(`http://localhost:3001/service-reminder/delete-reminder/${id}`);
        setReminders(reminders.filter(reminder => reminder._id !== id));
        
        Swal.fire({
          title: 'Deleted!',
          text: 'Service reminder has been deleted successfully.',
          icon: 'success',
          confirmButtonColor: '#3085d6',
        });
      } catch (error) {
        console.error("Error deleting service reminder:", error);
        Swal.fire({
          title: 'Error!',
          text: 'Error deleting service reminder: ' + (error.response?.data?.message || error.message),
          icon: 'error',
          confirmButtonColor: '#d33',
        });
      }
    }
  };

  const handleComplete = async (id) => {
    const { value: formValues } = await Swal.fire({
      title: 'Mark Service as Completed',
      html:
        '<div style="text-align: left;">' +
        '<label>Actual Service Date</label>' +
        '<input id="actualServiceDate" type="date" class="swal2-input" required>' +
        '<label>Actual Service Mileage</label>' +
        '<input id="actualServiceMileage" type="number" class="swal2-input" placeholder="Mileage">' +
        '<label>Notes</label>' +
        '<textarea id="notes" class="swal2-textarea" placeholder="Additional notes"></textarea>' +
        '</div>',
      focusConfirm: false,
      showCancelButton: true,
      confirmButtonText: 'Mark Completed',
      cancelButtonText: 'Cancel',
      preConfirm: () => {
        return {
          actualServiceDate: document.getElementById('actualServiceDate').value,
          actualServiceMileage: document.getElementById('actualServiceMileage').value,
          notes: document.getElementById('notes').value
        }
      }
    });

    if (formValues) {
      try {
        const response = await axios.put(
          `http://localhost:3001/service-reminder/complete-reminder/${id}`,
          {
            actualServiceDate: formValues.actualServiceDate || new Date(),
            actualServiceMileage: formValues.actualServiceMileage,
            notes: formValues.notes
          }
        );

        // Update the local state
        setReminders(reminders.map(reminder => 
          reminder._id === id ? response.data : reminder
        ));

        Swal.fire({
          title: 'Success!',
          text: 'Service marked as completed',
          icon: 'success',
          confirmButtonColor: '#3085d6',
        });
      } catch (error) {
        console.error("Error completing service:", error);
        Swal.fire({
          title: 'Error!',
          text: 'Failed to mark service as completed',
          icon: 'error',
          confirmButtonColor: '#d33',
        });
      }
    }
  };

  const handleUpdate = (reminderId) => {
    navigate(`/update-service-reminder/${reminderId}`);
  };

  const handleSearchQueryChange = (event) => {
    setSearchQuery(event.target.value);
  };

  const handleCriteriaChange = (event) => {
    setSearchCriteria(event.target.value);
    setSearchQuery("");
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleExpandRow = (id) => {
    setExpandedRow(expandedRow === id ? null : id);
  };

  // Get vehicle details by ID
  const getVehicleDetails = (vehicleId) => {
    return vehicles.find(v => v._id === vehicleId) || {};
  };

  // Filter reminders based on search criteria
  const filteredReminders = reminders.filter(reminder => {
    if (!searchQuery) return true;
    
    // Handle vehicle search separately 
    if (searchCriteria === 'vehicle') {
      // If reminder doesn't have a vehicle, return false
      if (!reminder.vehicle) return false;
      
      // Convert search to lowercase for case-insensitive comparison
      const searchLowerCase = searchQuery.toLowerCase();
      
      // Check against vehicle make, model, and registration number
      return (
        reminder.vehicle.make?.toLowerCase().includes(searchLowerCase) ||
        reminder.vehicle.model?.toLowerCase().includes(searchLowerCase) ||
        reminder.vehicle.registrationNumber?.toLowerCase().includes(searchLowerCase)
      );
    }
    
    // For other search criteria
    const field = reminder[searchCriteria]?.toString().toLowerCase();
    return field?.includes(searchQuery.toLowerCase());
  });

  // Sort by due date (ascending)
  const sortedReminders = [...filteredReminders].sort((a, b) => {
    return new Date(a.dueDate) - new Date(b.dueDate);
  });

  const paginatedReminders = sortedReminders.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  const getStatusClassName = (status) => {
    switch(status) {
      case 'Pending': return classes.statusPending;
      case 'Completed': return classes.statusCompleted;
      case 'Overdue': return classes.statusOverdue;
      default: return '';
    }
  };

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  // Check if reminder is overdue
  const isOverdue = (dueDate, status) => {
    if (status === 'Completed') return false;
    return new Date(dueDate) < new Date();
  };

  return (
    <Box>
      <Header></Header>
      <Box display="flex">
        <Sidebar />
        <Box className={classes.contentContainer}>
          <Box
            alignItems="center"
            justifyContent="space-between"
            marginTop={"60px"}
            width="100%"
            display="flex"
            flexDirection="row"
            marginBottom={3}
          >
            <Typography variant="h4" gutterBottom style={{ marginBottom: '20px', fontFamily: 'cursive', fontWeight: 'bold', color: 'purple', textAlign: 'center' }}>
              Service Reminders
            </Typography>
            <Box display="flex" alignItems="center">
              <FormControl className={classes.criteriaSelect}>
                <InputLabel>Search By</InputLabel>
                <Select
                  value={searchCriteria}
                  onChange={handleCriteriaChange}
                  label="Search By"
                >
                  <MenuItem value="serviceType">Service Type</MenuItem>
                  <MenuItem value="vehicle">Vehicle</MenuItem>
                  <MenuItem value="status">Status</MenuItem>
                  <MenuItem value="priority">Priority</MenuItem>
                </Select>
              </FormControl>
              <TextField
                variant="outlined"
                placeholder={`Search by ${searchCriteria}`}
                value={searchQuery}
                onChange={handleSearchQueryChange}
                className={classes.searchField}
              />
            </Box>
          </Box>
          <TableContainer component={Paper} className={classes.tableContainer}>
            <Table>
              <TableHead>
                <TableRow className={classes.tableHeadRow}>
                  <TableCell className={classes.tableHeadCell}></TableCell>
                  <TableCell className={classes.tableHeadCell}>Vehicle</TableCell>
                  <TableCell className={classes.tableHeadCell}>Service Type</TableCell>
                  <TableCell className={classes.tableHeadCell}>Due Date</TableCell>
                  <TableCell className={classes.tableHeadCell}>Due Mileage</TableCell>
                  <TableCell className={classes.tableHeadCell}>Priority</TableCell>
                  <TableCell className={classes.tableHeadCell}>Status</TableCell>
                  <TableCell className={classes.tableHeadCell}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {paginatedReminders.map((reminder) => {
                  const vehicle = getVehicleDetails(reminder.vehicle);
                  const status = isOverdue(reminder.dueDate, reminder.status) ? 'Overdue' : reminder.status;
                  
                  return (
                    <React.Fragment key={reminder._id}>
                      <TableRow className={classes.tableRow}>
                        <TableCell>
                          <IconButton 
                            size="small" 
                            onClick={() => handleExpandRow(reminder._id)}
                            style={{ transform: expandedRow === reminder._id ? 'rotate(180deg)' : 'rotate(0deg)' }}
                          >
                            <ExpandMoreIcon />
                          </IconButton>
                        </TableCell>
                        <TableCell>
                          {reminder.vehicle ? (
                            `${reminder.vehicle.make} ${reminder.vehicle.model} (${reminder.vehicle.registrationNumber})`
                          ) : 'Vehicle not found'}
                        </TableCell>
                        <TableCell>{reminder.serviceType}</TableCell>
                        <TableCell>
                          {formatDate(reminder.dueDate)}
                          {isOverdue(reminder.dueDate, reminder.status) && (
                            <PriorityHighIcon style={{ color: 'red', marginLeft: 5 }} />
                          )}
                        </TableCell>
                        <TableCell>{reminder.dueMileage || 'N/A'}</TableCell>
                        <TableCell>
                          <Chip 
                            label={reminder.priority} 
                            style={{ 
                              backgroundColor: 
                                reminder.priority === 'High' ? '#f44336' : 
                                reminder.priority === 'Medium' ? '#ff9800' : '#4caf50',
                              color: 'white'
                            }}
                          />
                        </TableCell>
                        <TableCell>
                          <Chip 
                            label={status} 
                            className={`${classes.statusChip} ${getStatusClassName(status)}`}
                          />
                        </TableCell>
                        <TableCell>
                          <Box display="flex" flexDirection="row" alignItems="center">
                            {status !== 'Completed' && (
                              <>
                                <IconButton
                                  className={`${classes.actionButton} ${classes.editButton}`}
                                  size="small"
                                  onClick={() => handleUpdate(reminder._id)}
                                >
                                  <EditIcon fontSize="small" />
                                </IconButton>
                                <IconButton
                                  className={`${classes.actionButton} ${classes.completedButton}`}
                                  size="small"
                                  onClick={() => handleComplete(reminder._id)}
                                >
                                  <CheckCircleIcon fontSize="small" />
                                </IconButton>
                              </>
                            )}
                            <IconButton
                              className={`${classes.actionButton} ${classes.deleteButton}`}
                              size="small"
                              onClick={() => handleDelete(reminder._id)}
                            >
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </Box>
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={8}>
                          <Collapse in={expandedRow === reminder._id} timeout="auto" unmountOnExit>
                            <Box className={classes.detailsContainer}>
                              <Grid container spacing={3}>
                                {/* Vehicle and Service Details */}
                                <Grid item xs={12} md={4}>
                                  <Card>
                                    <CardHeader
                                      className={`${classes.cardHeader}`}
                                      style={{ backgroundColor: '#2196f3' }}
                                      avatar={<DirectionsCarIcon className={classes.cardIcon} />}
                                      title="Vehicle Details"
                                      titleTypographyProps={{ variant: 'subtitle1' }}
                                      disableTypography={false}
                                    />
                                    <CardContent>
                                      <Box className={classes.infoRow}>
                                        <Typography className={classes.infoLabel}>Make:</Typography>
                                        <Typography className={classes.infoValue}>
                                        {reminder.vehicle ? (
                                          `${reminder.vehicle.make}`
                                        ) : 'Vehicle not found'}
                                        </Typography>
                                      </Box>
                                      <Divider light />
                                      <Box className={classes.infoRow}>
                                        <Typography className={classes.infoLabel}>Model:</Typography>
                                        <Typography className={classes.infoValue}>
                                        {reminder.vehicle ? (
                                          `${reminder.vehicle.model})`
                                        ) : 'Vehicle not found'}
                                        </Typography>
                                      </Box>
                                      <Divider light />
                                      <Box className={classes.infoRow}>
                                        <Typography className={classes.infoLabel}>Registration:</Typography>
                                        <Typography className={classes.infoValue}>
                                          {reminder.vehicle?.registrationNumber || 'N/A'}
                                        </Typography>
                                      </Box>
                                      <Divider light />
                                    </CardContent>
                                  </Card>
                                </Grid>

                                {/* Service Information */}
                                <Grid item xs={12} md={4}>
                                  <Card>
                                    <CardHeader
                                      className={`${classes.cardHeader}`}
                                      style={{ backgroundColor: '#4caf50' }}
                                      avatar={<BuildIcon className={classes.cardIcon} />}
                                      title="Service Information"
                                      titleTypographyProps={{ variant: 'subtitle1' }}
                                      disableTypography={false}
                                    />
                                    <CardContent>
                                      <Box className={classes.infoRow}>
                                        <Typography className={classes.infoLabel}>Service Type:</Typography>
                                        <Typography className={classes.infoValue}>{reminder.serviceType}</Typography>
                                      </Box>
                                      <Divider light />
                                      <Box className={classes.infoRow}>
                                        <Typography className={classes.infoLabel}>Due Date:</Typography>
                                        <Typography className={classes.infoValue}>
                                          {isOverdue(reminder.dueDate, reminder.status) && (
                                            <Chip 
                                              label="OVERDUE" 
                                              size="small"
                                              style={{ 
                                                backgroundColor: '#f44336',
                                                color: 'white',
                                              }}
                                            />
                                          )}
                                        </Typography>
                                      </Box>
                                      <Divider light />
                                      <Box className={classes.infoRow}>
                                        <Typography className={classes.infoLabel}>Due Mileage:</Typography>
                                        <Typography className={classes.infoValue}>
                                          {reminder.dueMileage || 'N/A'}
                                        </Typography>
                                      </Box>
                                    </CardContent>
                                  </Card>
                                </Grid>

                                {/* Reminder Details */}
                                <Grid item xs={12} md={4}>
                                  <Card>
                                    <CardHeader
                                      className={`${classes.cardHeader}`}
                                      style={{ backgroundColor: '#9c27b0' }}
                                      avatar={<InfoIcon className={classes.cardIcon} />}
                                      title="Reminder Details"
                                      titleTypographyProps={{ variant: 'subtitle1' }}
                                      disableTypography={false}
                                    />
                                    <CardContent>
                                      <Box className={classes.infoRow}>
                                        <Typography className={classes.infoLabel}>Priority:</Typography>
                                        <Chip 
                                          label={reminder.priority} 
                                          style={{ 
                                            backgroundColor: 
                                              reminder.priority === 'High' ? '#f44336' : 
                                              reminder.priority === 'Medium' ? '#ff9800' : '#4caf50',
                                            color: 'white'
                                          }}
                                        />
                                      </Box>
                                      <Divider light />
                                      <Box className={classes.infoRow}>
                                        <Typography className={classes.infoLabel}>Status:</Typography>
                                        <Chip 
                                          label={status} 
                                          className={`${classes.statusChip} ${getStatusClassName(status)}`}
                                        />
                                      </Box>
                                      <Divider light />
                                      <Box className={classes.infoRow}>
                                        <Typography className={classes.infoLabel}>Recurring:</Typography>
                                        <Typography className={classes.infoValue}>
                                          {reminder.recurringInterval ? (
                                            <>
                                              <ReplayIcon style={{ verticalAlign: 'middle', marginRight: 4 }} />
                                              {reminder.recurringInterval}
                                            </>
                                          ) : 'No'}
                                        </Typography>
                                      </Box>
                                    </CardContent>
                                  </Card>
                                </Grid>

                                {/* Additional Details */}
                                <Grid item xs={12}>
                                  <Card>
                                    <CardHeader
                                      className={`${classes.cardHeader}`}
                                      style={{ backgroundColor: '#ff9800' }}
                                      avatar={<AttachMoneyIcon className={classes.cardIcon} />}
                                      title="Additional Information"
                                      titleTypographyProps={{ variant: 'subtitle1' }}
                                      disableTypography={false}
                                    />
                                    <CardContent>
                                      <Box className={classes.infoRow}>
                                        <Typography className={classes.infoLabel}>Service Provider:</Typography>
                                        <Typography className={classes.infoValue}>
                                          {reminder.serviceProvider || 'Not specified'}
                                        </Typography>
                                      </Box>
                                      <Divider light />
                                      <Box className={classes.infoRow}>
                                        <Typography className={classes.infoLabel}>Estimated Cost:</Typography>
                                        <Typography className={classes.infoValue}>
                                          {reminder.estimatedCost ? `$${reminder.estimatedCost}` : 'Not specified'}
                                        </Typography>
                                      </Box>
                                      <Divider light />
                                      <Box className={classes.infoRow}>
                                        <Typography className={classes.infoLabel}>Notes:</Typography>
                                        <Typography className={classes.infoValue}>
                                          {reminder.notes || 'No additional notes'}
                                        </Typography>
                                      </Box>
                                    </CardContent>
                                  </Card>
                                </Grid>
                              </Grid>
                            </Box>
                          </Collapse>
                        </TableCell>
                      </TableRow>
                    </React.Fragment>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
          <CustomPagination
            count={filteredReminders.length}
            page={page}
            rowsPerPage={rowsPerPage}
            onPageChange={handleChangePage}
          />
        </Box>
      </Box>
    </Box>
  );
};

export default ViewServiceReminder;