import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Box, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Button, TextField, MenuItem, FormControl, Select, InputLabel, TablePagination } from '@material-ui/core';
import Swal from 'sweetalert2'; // Import SweetAlert2
import Sidebar from '../../Components/owner_sidebar';
import Header from '../../Components/owner_navbar';
import { makeStyles } from '@material-ui/core/styles';
import { useNavigate } from 'react-router-dom';

// Custom Pagination Component
const CustomPagination = ({ count, page, rowsPerPage, onPageChange }) => {
  return (
    <TablePagination
      component="div"
      count={count}
      page={page}
      rowsPerPage={rowsPerPage}
      onPageChange={onPageChange}
      rowsPerPageOptions={[]} // Hide rows per page selector
      labelRowsPerPage="" // Hide rows per page label
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
    minHeight: '80vh', // Ensures the container doesn't shrink too much
  },
  tableContainer: {
    width: '100%',
    overflowX: 'auto',
  },
}));

const ViewOwner = () => {
  const classes = useStyles();
  const [ownerData, setOwnerData] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchCriteria, setSearchCriteria] = useState("owner_id");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchOwnerData = async () => {
      try {
        const response = await axios.get('http://localhost:3001/owner/get-owners');
        setOwnerData(response.data);
      } catch (error) {
        console.error("There was an error fetching the owner data!", error);
        // Show error message with SweetAlert
        Swal.fire({
          title: 'Error!',
          text: 'Failed to load owner data',
          icon: 'error',
          confirmButtonColor: '#d33',
        });
      }
    };

    fetchOwnerData();
  }, []);

  const handleUpdate = (ownerId) => {
    console.log(`Update owner with ID: ${ownerId}`);
    navigate(`/update-owner/${ownerId}`); // Navigate to the update page with the owner ID
  };

  const handleDelete = async (id) => {
    // First confirm deletion with SweetAlert
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
        // First check if owner has associated vehicles
        const vehicleCheckResponse = await axios.get(`http://localhost:3001/vehicle/check-vehicles/${id}`);
        
        if (vehicleCheckResponse.data.hasVehicles) {
          // Show error message if owner has vehicles
          Swal.fire({
            title: 'Cannot Delete!',
            text: 'Vehicles associated with this owner exist.',
            icon: 'error',
            confirmButtonColor: '#d33',
          });
          return;
        }
        
        // If no vehicles, proceed with deletion
        await axios.delete(`http://localhost:3001/owner/delete-owner/${id}`);
        setOwnerData(ownerData.filter(owner => owner._id !== id));
        
        // Show success message
        Swal.fire({
          title: 'Deleted!',
          text: 'Owner has been deleted successfully.',
          icon: 'success',
          confirmButtonColor: '#3085d6',
        });
      } catch (error) {
        console.error("There was an error deleting the owner!", error);
        Swal.fire({
          title: 'Error!',
          text: 'Error deleting owner: ' + (error.response?.data?.message || error.message),
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
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const filteredOwners = ownerData.filter(owner => {
    if (!searchQuery) return true;
    const field = owner[searchCriteria]?.toString().toLowerCase();
    return field?.startsWith(searchQuery.toLowerCase());
  });

  const paginatedOwners = filteredOwners.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  // Format date of birth to be more readable
  const formatDateOfBirth = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  return (
    <Box>
      <Header />
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
          >
            <Typography variant="h4" gutterBottom style={{ marginBottom: '20px', fontFamily: 'cursive', fontWeight: 'bold', color: 'purple', textAlign: 'center' }}>
              Vehicle Owners
            </Typography>
            <Box display="flex" alignItems="center">
              <FormControl className={classes.criteriaSelect}>
                <InputLabel>Search By</InputLabel>
                <Select
                  value={searchCriteria}
                  onChange={handleCriteriaChange}
                  label="Search By"
                >
                  <MenuItem value="owner_id">Owner ID</MenuItem>
                  <MenuItem value="name">Name</MenuItem>
                  <MenuItem value="contact">Contact</MenuItem>
                  <MenuItem value="license_number">License Number</MenuItem>
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
                <TableRow style={{ backgroundColor: '#d4ac0d', color: 'white' }}>
                  <TableCell style={{ color: 'white' }}>Owner ID</TableCell>
                  <TableCell style={{ color: 'white' }}>Name</TableCell>
                  <TableCell style={{ color: 'white' }}>Contact</TableCell>
                  <TableCell style={{ color: 'white' }}>Address</TableCell>
                  <TableCell style={{ color: 'white' }}>License</TableCell>
                  <TableCell style={{ color: 'white' }}>DoB</TableCell>
                  <TableCell style={{ color: 'white' }}>Gender</TableCell>
                  <TableCell style={{ color: 'white' }}>Update</TableCell>
                  <TableCell style={{ color: 'white' }}>Delete</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {paginatedOwners.map((owner) => (
                  <TableRow key={owner._id}>
                    <TableCell>{owner.owner_id}</TableCell>
                    <TableCell>{owner.name}</TableCell>
                    <TableCell>{owner.contact}</TableCell>
                    <TableCell>{owner.address}</TableCell>
                    <TableCell>{owner.license_number}</TableCell>
                    <TableCell>{formatDateOfBirth(owner.date_of_birth)}</TableCell>
                    <TableCell>{owner.gender}</TableCell>
                    <TableCell>
                      <Button
                        variant="contained"
                        color="primary"
                        size="small"
                        onClick={() => handleUpdate(owner._id)}
                      >
                        Update
                      </Button>
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="contained"
                        color="secondary"
                        size="small"
                        onClick={() => handleDelete(owner._id)}
                      >
                        Delete
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
          <CustomPagination
            count={filteredOwners.length}
            page={page}
            rowsPerPage={rowsPerPage}
            onPageChange={handleChangePage}
          />
        </Box>
      </Box>
    </Box>
  );
};

export default ViewOwner;