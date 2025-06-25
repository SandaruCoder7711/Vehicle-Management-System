import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { 
  Box, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, 
  Paper, TextField, MenuItem, FormControl, Select, InputLabel, Avatar, Chip, 
  IconButton, Collapse, Grid, Card, CardContent, CardHeader, Divider, TablePagination
} from '@material-ui/core';
import Swal from 'sweetalert2';
import Sidebar from '../../Components/inventory_sidebar';
import Header from '../../Components/inventory_navbar';
import { makeStyles } from '@material-ui/core/styles';
import { useNavigate } from 'react-router-dom';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import DeleteIcon from '@material-ui/icons/Delete';
import EditIcon from '@material-ui/icons/Edit';
import InfoIcon from '@material-ui/icons/Info';
import CategoryIcon from '@material-ui/icons/Category';
import StorageIcon from '@material-ui/icons/Storage';
import AttachMoneyIcon from '@material-ui/icons/AttachMoney';
import LocalShippingIcon from '@material-ui/icons/LocalShipping';

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
  statusChip: {
    margin: theme.spacing(0.5),
    fontWeight: 'bold',
  },
  statusInStock: {
    backgroundColor: '#4caf50',
    color: 'white',
  },
  statusLowStock: {
    backgroundColor: '#ff9800',
    color: 'white',
  },
  statusOutOfStock: {
    backgroundColor: '#f44336',
    color: 'white',
  },
}));

const ViewInventory = () => {
  const classes = useStyles();
  const [inventoryData, setInventoryData] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchCriteria, setSearchCriteria] = useState("productCode");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [expandedRow, setExpandedRow] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchInventoryData = async () => {
      try {
        const response = await axios.get('http://localhost:3001/inventory/get-items');
        
        if (Array.isArray(response.data)) {
          setInventoryData(response.data);
        } else if (response.data && Array.isArray(response.data.items)) {
          setInventoryData(response.data.items);
        } else if (response.data && Array.isArray(response.data.data)) {
          setInventoryData(response.data.data);
        } else {
          console.error("Unexpected API response format:", response.data);
          setInventoryData([]);
        }
      } catch (error) {
        console.error("There was an error fetching the inventory data!", error);
        Swal.fire({
          title: 'Error!',
          text: 'Failed to load inventory data',
          icon: 'error',
          confirmButtonColor: '#d33',
        });
        setInventoryData([]);
      }
    };
  
    fetchInventoryData();
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
        await axios.delete(`http://localhost:3001/inventory/delete-item/${id}`);
        setInventoryData(inventoryData.filter(item => item._id !== id));
        
        Swal.fire({
          title: 'Deleted!',
          text: 'Inventory item has been deleted successfully.',
          icon: 'success',
          confirmButtonColor: '#3085d6',
        });
      } catch (error) {
        console.error("There was an error deleting the inventory item!", error);
        Swal.fire({
          title: 'Error!',
          text: 'Error deleting inventory item: ' + (error.response?.data?.message || error.message),
          icon: 'error',
          confirmButtonColor: '#d33',
        });
      }
    }
  };

  const handleUpdate = (itemId) => {
    navigate(`/update-inventory/${itemId}`);
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

  const filteredInventory = inventoryData.filter(item => {
    if (!searchQuery) return true;
    
    const field = item[searchCriteria]?.toString().toLowerCase();
    return field?.includes(searchQuery.toLowerCase());
  });

  const paginatedInventory = filteredInventory.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  const getStatusClassName = (status) => {
    switch(status) {
      case 'In Stock': return classes.statusInStock;
      case 'Low Stock': return classes.statusLowStock;
      case 'Out of Stock': return classes.statusOutOfStock;
      default: return '';
    }
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
              Inventory Management
            </Typography>
            <Box display="flex" alignItems="center">
              <FormControl className={classes.criteriaSelect}>
                <InputLabel>Search By</InputLabel>
                <Select
                  value={searchCriteria}
                  onChange={handleCriteriaChange}
                  label="Search By"
                >
                  <MenuItem value="productCode">Product Code</MenuItem>
                  <MenuItem value="name">Name</MenuItem>
                  <MenuItem value="category">Category</MenuItem>
                  <MenuItem value="brand">Brand</MenuItem>
                  <MenuItem value="status">Status</MenuItem>
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
                  <TableCell className={classes.tableHeadCell}>Product Code</TableCell>
                  <TableCell className={classes.tableHeadCell}>Name</TableCell>
                  <TableCell className={classes.tableHeadCell}>Category</TableCell>
                  <TableCell className={classes.tableHeadCell}>Brand</TableCell>
                  <TableCell className={classes.tableHeadCell}>Stock Quantity</TableCell>
                  <TableCell className={classes.tableHeadCell}>Status</TableCell>
                  <TableCell className={classes.tableHeadCell}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {paginatedInventory.map((item) => (
                  <React.Fragment key={item._id}>
                    <TableRow className={classes.tableRow}>
                      <TableCell>
                        <IconButton 
                          size="small" 
                          onClick={() => handleExpandRow(item._id)}
                          style={{ transform: expandedRow === item._id ? 'rotate(180deg)' : 'rotate(0deg)' }}
                        >
                          <ExpandMoreIcon />
                        </IconButton>
                      </TableCell>
                      <TableCell><strong>{item.productCode}</strong></TableCell>
                      <TableCell>{item.name}</TableCell>
                      <TableCell>{item.category}</TableCell>
                      <TableCell>{item.brand}</TableCell>
                      <TableCell>{item.stockQuantity}</TableCell>
                      <TableCell>
                        <Chip 
                          label={item.status} 
                          className={`${classes.statusChip} ${getStatusClassName(item.status)}`}
                        />
                      </TableCell>
                      <TableCell>
                        <Box display="flex" flexDirection="row" alignItems="center">
                          <IconButton
                            className={`${classes.actionButton} ${classes.editButton}`}
                            size="small"
                            onClick={() => handleUpdate(item._id)}
                          >
                            <EditIcon fontSize="small" />
                          </IconButton>

                          <IconButton
                            className={`${classes.actionButton} ${classes.deleteButton}`}
                            size="small"
                            onClick={() => handleDelete(item._id)}
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Box>
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={8}>
                        <Collapse in={expandedRow === item._id} timeout="auto" unmountOnExit>
                          <Box className={classes.detailsContainer}>
                            <Grid container spacing={3}>
                              {/* Category and Product Details */}
                              <Grid item xs={12} md={4}>
                                <Card>
                                  <CardHeader
                                    className={`${classes.cardHeader}`}
                                    style={{ backgroundColor: '#2196f3' }}
                                    avatar={<CategoryIcon className={classes.cardIcon} />}
                                    title="Product Details"
                                    titleTypographyProps={{ variant: 'subtitle1' }}
                                    disableTypography={false}
                                  />
                                  <CardContent>
                                    <Box className={classes.infoRow}>
                                      <Typography className={classes.infoLabel}>Product Code:</Typography>
                                      <Typography className={classes.infoValue}>{item.productCode}</Typography>
                                    </Box>
                                    <Divider light />
                                    <Box className={classes.infoRow}>
                                      <Typography className={classes.infoLabel}>Category:</Typography>
                                      <Typography className={classes.infoValue}>{item.category}</Typography>
                                    </Box>
                                    <Divider light />
                                    <Box className={classes.infoRow}>
                                      <Typography className={classes.infoLabel}>Brand:</Typography>
                                      <Typography className={classes.infoValue}>{item.brand}</Typography>
                                    </Box>
                                  </CardContent>
                                </Card>
                              </Grid>

                              {/* Stock and Inventory Details */}
                              <Grid item xs={12} md={4}>
                                <Card>
                                  <CardHeader
                                    className={`${classes.cardHeader}`}
                                    style={{ backgroundColor: '#4caf50' }}
                                    avatar={<StorageIcon className={classes.cardIcon} />}
                                    title="Stock Information"
                                    titleTypographyProps={{ variant: 'subtitle1' }}
                                    disableTypography={false}
                                  />
                                  <CardContent>
                                    <Box className={classes.infoRow}>
                                      <Typography className={classes.infoLabel}>Stock Quantity:</Typography>
                                      <Typography className={classes.infoValue}>{item.stockQuantity}</Typography>
                                    </Box>
                                    <Divider light />
                                    <Box className={classes.infoRow}>
                                      <Typography className={classes.infoLabel}>Min. Stock Level:</Typography>
                                      <Typography className={classes.infoValue}>{item.minimumStockLevel}</Typography>
                                    </Box>
                                    <Divider light />
                                    <Box className={classes.infoRow}>
                                      <Typography className={classes.infoLabel}>Status:</Typography>
                                      <Chip 
                                        label={item.status} 
                                        className={ `${getStatusClassName(item.status)}`}
                                      />
                                    </Box>
                                  </CardContent>
                                </Card>
                              </Grid>

                              {/* Pricing Details */}
                              <Grid item xs={12} md={4}>
                                <Card>
                                  <CardHeader
                                    className={`${classes.cardHeader}`}
                                    style={{ backgroundColor: '#9c27b0' }}
                                    avatar={<AttachMoneyIcon className={classes.cardIcon} />}
                                    title="Pricing Details"
                                    titleTypographyProps={{ variant: 'subtitle1' }}
                                    disableTypography={false}
                                  />
                                  <CardContent>
                                    <Box className={classes.infoRow}>
                                      <Typography className={classes.infoLabel}>Purchase Price:</Typography>
                                      <Typography className={classes.infoValue}>${item.purchasePrice.toFixed(2)}</Typography>
                                    </Box>
                                    <Divider light />
                                    <Box className={classes.infoRow}>
                                      <Typography className={classes.infoLabel}>Selling Price:</Typography>
                                      <Typography className={classes.infoValue}>${item.sellingPrice.toFixed(2)}</Typography>
                                    </Box>
                                    <Divider light />
                                    <Box className={classes.infoRow}>
                                      <Typography className={classes.infoLabel}>Profit Margin:</Typography>
                                      <Typography className={classes.infoValue}>
                                        ${(item.sellingPrice - item.purchasePrice).toFixed(2)} ({((item.sellingPrice - item.purchasePrice) / item.purchasePrice * 100).toFixed(2)}%)
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
                                    avatar={<InfoIcon className={classes.cardIcon} />}
                                    title="Additional Details"
                                    titleTypographyProps={{ variant: 'subtitle1' }}
                                    disableTypography={false}
                                  />
                                  <CardContent>
                                    <Box className={classes.infoRow}>
                                      <Typography className={classes.infoLabel}>Manufacturer:</Typography>
                                      <Typography className={classes.infoValue}>{item.manufacturer || 'N/A'}</Typography>
                                    </Box>
                                    <Divider light />
                                    <Box className={classes.infoRow}>
                                      <Typography className={classes.infoLabel}>Condition:</Typography>
                                      <Typography className={classes.infoValue}>{item.condition}</Typography>
                                    </Box>
                                    <Divider light />
                                    <Box className={classes.infoRow}>
                                      <Typography className={classes.infoLabel}>Description:</Typography>
                                      <Typography className={classes.infoValue}>{item.description || 'No description available'}</Typography>
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
                ))}
              </TableBody>
            </Table>
          </TableContainer>
          <CustomPagination
            count={filteredInventory.length}
            page={page}
            rowsPerPage={rowsPerPage}
            onPageChange={handleChangePage}
          />
        </Box>
      </Box>
    </Box>
  );
};

export default ViewInventory;