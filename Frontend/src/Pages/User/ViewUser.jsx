import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { 
  Box, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, 
  Paper, TextField, MenuItem, FormControl, Select, InputLabel, TablePagination, 
  Avatar, Chip, IconButton, Collapse, Grid, Card, CardContent, CardHeader, Divider
} from '@material-ui/core';
import Swal from 'sweetalert2';
import Sidebar from '../../Components/user_sidebar';
import { makeStyles } from '@material-ui/core/styles';
import { useNavigate } from 'react-router-dom';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import ExpandLessIcon from '@material-ui/icons/ExpandLess';
import EditIcon from '@material-ui/icons/Edit';
import DeleteIcon from '@material-ui/icons/Delete';
import EventIcon from '@material-ui/icons/Event';
import PersonIcon from '@material-ui/icons/Person';
import EmailIcon from '@material-ui/icons/Email';
import PhoneIcon from '@material-ui/icons/Phone';
import HomeIcon from '@material-ui/icons/Home';
import AccessTimeIcon from '@material-ui/icons/AccessTime';
import UpdateIcon from '@material-ui/icons/Update';
import AccountCircleIcon from '@material-ui/icons/AccountCircle';

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
  userAvatar: {
    width: 60,
    height: 60,
    backgroundColor: theme.palette.primary.main,
    boxShadow: '0 3px 5px rgba(0,0,0,0.2)',
    border: '2px solid white',
  },
  genderChip: {
    marginLeft: theme.spacing(1),
    backgroundColor: theme.palette.grey[200],
    fontWeight: 'bold',
  },
  chipMale: {
    backgroundColor: '#bbdefb',
    color: '#1565c0',
  },
  chipFemale: {
    backgroundColor: '#f8bbd0',
    color: '#c2185b',
  },
  chipOther: {
    backgroundColor: '#e6ee9c',
    color: '#827717',
  },
  detailsContainer: {
    padding: theme.spacing(3),
    backgroundColor: '#ffffff',
    borderRadius: 8,
    margin: theme.spacing(2, 0),
    boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
  },
  userInfoFlex: {
    display: 'flex',
    padding: theme.spacing(2),
    borderRadius: 8,
    backgroundColor: '#f8f9fa',
    marginBottom: theme.spacing(3),
  },
  userAvatarLarge: {
    width: 100,
    height: 100,
    marginRight: theme.spacing(4),
    boxShadow: '0 4px 8px rgba(0,0,0,0.2)',
    border: '3px solid white',
  },
  userDetailsSection: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
  },
  userName: {
    fontWeight: 'bold',
    fontSize: '1.2rem',
    marginBottom: theme.spacing(1),
    color: theme.palette.primary.dark,
  },
  userInfoCard: {
    height: '100%',
    boxShadow: '0 3px 10px rgba(0,0,0,0.08)',
    borderRadius: 8,
    transition: 'all 0.3s ease',
    '&:hover': {
      transform: 'translateY(-5px)',
      boxShadow: '0 6px 15px rgba(0,0,0,0.1)',
    },
  },
  cardHeader: {
    backgroundColor: theme.palette.primary.main,
    color: 'white',
    padding: theme.spacing(1.5),
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
  },
  cardHeaderPersonal: {
    backgroundColor: '#1976d2',
  },
  cardHeaderContact: {
    backgroundColor: '#43a047',
  },
  cardHeaderAccount: {
    backgroundColor: '#7b1fa2',
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
  editButton: {
    backgroundColor: '#2196f3',
    color: 'white',
    '&:hover': {
      backgroundColor: '#1976d2',
    },
  },
  deleteButton: {
    backgroundColor: '#f44336',
    color: 'white',
    '&:hover': {
      backgroundColor: '#d32f2f',
    },
  },
  expandButton: {
    transition: 'all 0.3s ease',
  },
}));

const ViewUsers = () => {
  const classes = useStyles();
  const [userData, setUserData] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchCriteria, setSearchCriteria] = useState("user_id");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [expandedRow, setExpandedRow] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await axios.get('http://localhost:3001/user/users');
        
        if (Array.isArray(response.data)) {
          setUserData(response.data);
        } else if (response.data && Array.isArray(response.data.users)) {
          setUserData(response.data.users);
        } else if (response.data && Array.isArray(response.data.data)) {
          setUserData(response.data.data);
        } else {
          console.error("Unexpected API response format:", response.data);
          setUserData([]);
        }
      } catch (error) {
        console.error("There was an error fetching the user data!", error);
        Swal.fire({
          title: 'Error!',
          text: 'Failed to load user data',
          icon: 'error',
          confirmButtonColor: '#d33',
        });
        setUserData([]);
      }
    };
  
    fetchUserData();
  }, []);

  const handleUpdate = (userId) => {
    navigate(`/update-user/${userId}`);
  };

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
        await axios.delete(`http://localhost:3001/users/${id}`);
        setUserData(userData.filter(user => user._id !== id));
        
        Swal.fire({
          title: 'Deleted!',
          text: 'User has been deleted successfully.',
          icon: 'success',
          confirmButtonColor: '#3085d6',
        });
      } catch (error) {
        console.error("There was an error deleting the user!", error);
        Swal.fire({
          title: 'Error!',
          text: 'Error deleting user: ' + (error.response?.data?.message || error.message),
          icon: 'error',
          confirmButtonColor: '#d33',
        });
      }
    }
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

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  const formatLastLogin = (dateString) => {
    if (!dateString) return 'Never logged in';
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getGenderChipClass = (gender) => {
    if (!gender) return classes.genderChip;
    const lowerGender = gender.toLowerCase();
    if (lowerGender === 'male') return `${classes.genderChip} ${classes.chipMale}`;
    if (lowerGender === 'female') return `${classes.genderChip} ${classes.chipFemale}`;
    return `${classes.genderChip} ${classes.chipOther}`;
  };

  const filteredUsers = userData.filter(user => {
    if (!searchQuery) return true;
    
    const field = user[searchCriteria]?.toString().toLowerCase();
    return field?.includes(searchQuery.toLowerCase());
  });

  const paginatedUsers = filteredUsers.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  return (
    <Box>
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
              Users List
            </Typography>
            <Box display="flex" alignItems="center">
              <FormControl className={classes.criteriaSelect}>
                <InputLabel>Search By</InputLabel>
                <Select
                  value={searchCriteria}
                  onChange={handleCriteriaChange}
                  label="Search By"
                >
                  <MenuItem value="user_id">User ID</MenuItem>
                  <MenuItem value="full_name">Full Name</MenuItem>
                  <MenuItem value="email">Email</MenuItem>
                  <MenuItem value="contact">Contact</MenuItem>
                  <MenuItem value="address">Address</MenuItem>
                  <MenuItem value="gender">Gender</MenuItem>
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
                  <TableCell className={classes.tableHeadCell}>Avatar</TableCell>
                  <TableCell className={classes.tableHeadCell}>User ID</TableCell>
                  <TableCell className={classes.tableHeadCell}>Full Name</TableCell>
                  <TableCell className={classes.tableHeadCell}>Email</TableCell>
                  <TableCell className={classes.tableHeadCell}>Contact</TableCell>
                  <TableCell className={classes.tableHeadCell}>Gender</TableCell>
                  <TableCell className={classes.tableHeadCell}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {paginatedUsers.map((user) => (
                  <React.Fragment key={user._id}>
                    <TableRow className={classes.tableRow}>
                      <TableCell>
                        <IconButton 
                          size="small" 
                          onClick={() => handleExpandRow(user._id)}
                          className={classes.expandButton}
                          style={{ transform: expandedRow === user._id ? 'rotate(180deg)' : 'rotate(0deg)' }}
                        >
                          <ExpandMoreIcon />
                        </IconButton>
                      </TableCell>
                      <TableCell>
                        {user.profile_picture ? (
                          <Avatar 
                            className={classes.userAvatar} 
                            src={user.profile_picture}
                            alt={user.full_name}
                            onError={(e) => {
                              console.error("Error loading image");
                              e.target.onerror = null; 
                              e.target.src = ""; 
                            }}
                          />
                        ) : (
                          <Avatar className={classes.userAvatar}>
                            {user.full_name ? user.full_name.charAt(0).toUpperCase() : 'U'}
                          </Avatar>
                        )}
                      </TableCell>
                      <TableCell><strong>{user.user_id}</strong></TableCell>
                      <TableCell><strong>{user.full_name}</strong></TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>{user.contact}</TableCell>
                      <TableCell>
                        <Chip 
                          label={user.gender} 
                          size="small" 
                          className={getGenderChipClass(user.gender)}
                        />
                      </TableCell>
                      <TableCell>
                        <Box display="flex" flexDirection="row" alignItems="center">
                          <IconButton
                            className={`${classes.actionButton} ${classes.deleteButton}`}
                            size="small"
                            onClick={() => handleDelete(user._id)}
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Box>
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={8}>
                        <Collapse in={expandedRow === user._id} timeout="auto" unmountOnExit>
                          <Box className={classes.detailsContainer}>
                            <Box className={classes.userInfoFlex}>
                              {user.profile_picture ? (
                                <Avatar 
                                  className={classes.userAvatarLarge} 
                                  src={user.profile_picture}
                                  alt={user.full_name}
                                  onError={(e) => {
                                    console.error("Error loading image");
                                    e.target.onerror = null; 
                                    e.target.src = ""; 
                                  }}
                                />
                              ) : (
                                <Avatar className={classes.userAvatarLarge}>
                                  {user.full_name ? user.full_name.charAt(0).toUpperCase() : 'U'}
                                </Avatar>
                              )}
                              <Box className={classes.userDetailsSection}>
                                <Typography variant="h5" className={classes.userName}>
                                  {user.full_name}
                                </Typography>
                                <Typography variant="body1" color="textSecondary">
                                  {user.user_id}
                                </Typography>
                                <Typography variant="body2" color="textSecondary">
                                  {user.email}
                                </Typography>
                                <Box mt={1}>
                                  <Chip 
                                    label={user.gender} 
                                    size="small" 
                                    className={getGenderChipClass(user.gender)}
                                  />
                                </Box>
                              </Box>
                            </Box>
                            
                            <Grid container spacing={3}>
                              {/* Personal Information Card */}
                              <Grid item xs={12} md={4}>
                                <Card className={classes.userInfoCard}>
                                  <CardHeader
                                    className={`${classes.cardHeader} ${classes.cardHeaderPersonal}`}
                                    avatar={<PersonIcon className={classes.cardIcon} />}
                                    title="Personal Information"
                                    titleTypographyProps={{ variant: 'subtitle1' }}
                                    disableTypography={false}
                                  />
                                  <CardContent>
                                    <Box className={classes.infoRow}>
                                      <PersonIcon fontSize="small" />
                                      <Typography className={classes.infoLabel}>Full Name:</Typography>
                                      <Typography className={classes.infoValue}>{user.full_name}</Typography>
                                    </Box>
                                    <Divider light />
                                    <Box className={classes.infoRow}>
                                      <EventIcon fontSize="small" />
                                      <Typography className={classes.infoLabel}>Date of Birth:</Typography>
                                      <Typography className={classes.infoValue}>{formatDate(user.dob)}</Typography>
                                    </Box>
                                    <Divider light />
                                    <Box className={classes.infoRow}>
                                      <PersonIcon fontSize="small" />
                                      <Typography className={classes.infoLabel}>Gender:</Typography>
                                      <Typography className={classes.infoValue}>{user.gender}</Typography>
                                    </Box>
                                  </CardContent>
                                </Card>
                              </Grid>
                              
                              {/* Contact Information Card */}
                              <Grid item xs={12} md={4}>
                                <Card className={classes.userInfoCard}>
                                  <CardHeader
                                    className={`${classes.cardHeader} ${classes.cardHeaderContact}`}
                                    avatar={<PhoneIcon className={classes.cardIcon} />}
                                    title="Contact Information"
                                    titleTypographyProps={{ variant: 'subtitle1' }}
                                    disableTypography={false}
                                  />
                                  <CardContent>
                                    <Divider light />
                                    <Box className={classes.infoRow}>
                                      <PhoneIcon fontSize="small" />
                                      <Typography className={classes.infoLabel}>Contact:</Typography>
                                      <Typography className={classes.infoValue}>{user.contact}</Typography>
                                    </Box>
                                    <Divider light />
                                    <Box className={classes.infoRow}>
                                      <HomeIcon fontSize="small" />
                                      <Typography className={classes.infoLabel}>Address:</Typography>
                                      <Typography className={classes.infoValue}>{user.address}</Typography>
                                    </Box>
                                  </CardContent>
                                </Card>
                              </Grid>
                              
                              {/* Account Information Card */}
                              <Grid item xs={12} md={4}>
                                <Card className={classes.userInfoCard}>
                                  <CardHeader
                                    className={`${classes.cardHeader} ${classes.cardHeaderAccount}`}
                                    avatar={<AccountCircleIcon className={classes.cardIcon} />}
                                    title="Account Information"
                                    titleTypographyProps={{ variant: 'subtitle1' }}
                                    disableTypography={false}
                                  />
                                  <CardContent>
                                    <Box className={classes.infoRow}>
                                      <AccessTimeIcon fontSize="small" />
                                      <Typography className={classes.infoLabel}>Created On:</Typography>
                                      <Typography className={classes.infoValue}>{formatDate(user.createdAt)}</Typography>
                                    </Box>
                                    <Divider light />
                                    <Box className={classes.infoRow}>
                                      <UpdateIcon fontSize="small" />
                                      <Typography className={classes.infoLabel}>Last Updated:</Typography>
                                      <Typography className={classes.infoValue}>{formatDate(user.updatedAt)}</Typography>
                                    </Box>
                                    <Divider light />
                                  </CardContent>
                                </Card>
                              </Grid>
                            </Grid>
                          </Box>
                        </Collapse>
                      </TableCell>
                    </TableRow>
                  </React.Fragment>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
          <CustomPagination
            count={filteredUsers.length}
            page={page}
            rowsPerPage={rowsPerPage}
            onPageChange={handleChangePage}
          />
        </Box>
      </Box>
    </Box>
  );
};

export default ViewUsers;