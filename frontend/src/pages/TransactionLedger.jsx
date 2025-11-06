import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  IconButton,
  Chip,
  Alert,
  Snackbar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import TransactionForm from '../components/TransactionForm';
import {
  getTransactions,
  createTransaction,
  updateTransaction,
  deleteTransaction,
  getAllLockers,
  getLockerAssets,
} from '../services/api';

const TransactionLedger = () => {
  const navigate = useNavigate();
  const [transactions, setTransactions] = useState([]);
  const [allAssets, setAllAssets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [transactionToDelete, setTransactionToDelete] = useState(null);
  const [filters, setFilters] = useState({
    asset_id: '',
    asset_type: '',
  });
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success',
  });

  useEffect(() => {
    loadData();
  }, [filters]);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Load all assets for the dropdown
      const lockersResponse = await getAllLockers();
      // Handle new structure: {withdrawn: [], intact: []}
      const allLockers = [
        ...(lockersResponse.withdrawn || []),
        ...(lockersResponse.intact || [])
      ];
      
      const assetsPromises = allLockers.map((locker) => getLockerAssets(locker.id));
      const assetsArrays = await Promise.all(assetsPromises);
      const flatAssets = assetsArrays.flat();
      setAllAssets(flatAssets);
      
      // Load transactions with filters
      const transactionFilters = {};
      if (filters.asset_id && filters.asset_id !== '') {
        transactionFilters.asset_id = parseInt(filters.asset_id);
      }
      if (filters.asset_type && filters.asset_type !== '') {
        transactionFilters.asset_type = filters.asset_type;
      }
      
      const data = await getTransactions(transactionFilters);
      setTransactions(data);
    } catch (error) {
      console.error('Error loading data:', error);
      showSnackbar('Failed to load data: ' + (error.response?.data?.error || error.message), 'error');
    } finally {
      setLoading(false);
    }
  };

  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const handleCreateTransaction = () => {
    setEditingTransaction(null);
    setFormOpen(true);
  };

  const handleEditTransaction = (transaction) => {
    setEditingTransaction(transaction);
    setFormOpen(true);
  };

  const handleFormSubmit = async (formData) => {
    try {
      if (editingTransaction) {
        await updateTransaction(editingTransaction.id, formData);
        showSnackbar('Transaction updated successfully');
      } else {
        await createTransaction(formData);
        showSnackbar('Transaction created successfully');
      }
      setFormOpen(false);
      setEditingTransaction(null);
      loadData();
    } catch (error) {
      showSnackbar(
        error.response?.data?.error || 'Failed to save transaction',
        'error'
      );
    }
  };

  const handleDeleteClick = (transactionId) => {
    setTransactionToDelete(transactionId);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      await deleteTransaction(transactionToDelete);
      showSnackbar('Transaction deleted successfully');
      setDeleteDialogOpen(false);
      setTransactionToDelete(null);
      loadData();
    } catch (error) {
      showSnackbar(
        error.response?.data?.error || 'Failed to delete transaction',
        'error'
      );
    }
  };

  const handleFilterChange = (name, value) => {
    setFilters((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const getTransactionTypeColor = (type) => {
    switch (type) {
      case 'depositing':
        return 'success';
      case 'withdrawing':
        return 'warning';
      case 'permanently_remove':
        return 'error';
      default:
        return 'default';
    }
  };

  const formatTransactionType = (type) => {
    return type
      .split('_')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4, position: 'relative', zIndex: 1 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h3" component="h1" fontWeight="bold" sx={{ color: '#000000' }}>
          Transaction Ledger
        </Typography>
        <Button
          variant="contained"
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/')}
          sx={{
            backgroundColor: 'rgba(255, 255, 255, 0.95)',
            color: 'primary.main',
            mr: 2,
          }}
        >
          Back to Home
        </Button>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleCreateTransaction}
          sx={{
            backgroundColor: '#1976d2',
            color: 'white',
          }}
        >
          Add Transaction
        </Button>
      </Box>

      {/* Filters */}
      <Paper sx={{ p: 2, mb: 3, backgroundColor: 'rgba(30, 30, 50, 0.8)' }}>
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          <FormControl sx={{ minWidth: 200 }}>
            <InputLabel sx={{ color: 'rgba(255,255,255,0.7)' }}>Filter by Asset</InputLabel>
            <Select
              value={filters.asset_id}
              onChange={(e) => handleFilterChange('asset_id', e.target.value)}
              label="Filter by Asset"
              sx={{ color: '#ffffff' }}
            >
              <MenuItem value="">All Assets</MenuItem>
              {allAssets.map((asset) => (
                <MenuItem key={asset.id} value={asset.id}>
                  {asset.name} ({asset.asset_type})
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl sx={{ minWidth: 200 }}>
            <InputLabel sx={{ color: 'rgba(255,255,255,0.7)' }}>Filter by Asset Type</InputLabel>
            <Select
              value={filters.asset_type}
              onChange={(e) => handleFilterChange('asset_type', e.target.value)}
              label="Filter by Asset Type"
              sx={{ color: '#ffffff' }}
            >
              <MenuItem value="">All Types</MenuItem>
              <MenuItem value="jewellery">Jewellery</MenuItem>
              <MenuItem value="document">Document</MenuItem>
              <MenuItem value="misc">Miscellaneous</MenuItem>
            </Select>
          </FormControl>
        </Box>
      </Paper>

      {/* Transactions Table */}
      {loading ? (
        <Typography sx={{ color: 'rgba(255,255,255,0.8)' }}>Loading...</Typography>
      ) : transactions.length === 0 ? (
        <Paper sx={{ p: 4, textAlign: 'center', backgroundColor: 'rgba(30, 30, 50, 0.8)' }}>
          <Typography variant="h6" sx={{ color: 'rgba(255,255,255,0.9)' }} gutterBottom>
            No transactions found
          </Typography>
          <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)' }}>
            Create your first transaction to get started
          </Typography>
        </Paper>
      ) : (
        <TableContainer component={Paper} sx={{ backgroundColor: 'rgba(30, 30, 50, 0.8)' }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell sx={{ color: '#ffffff', fontWeight: 'bold' }}>Date</TableCell>
                <TableCell sx={{ color: '#ffffff', fontWeight: 'bold' }}>Asset Name</TableCell>
                <TableCell sx={{ color: '#ffffff', fontWeight: 'bold' }}>Asset Type</TableCell>
                <TableCell sx={{ color: '#ffffff', fontWeight: 'bold' }}>Transaction Type</TableCell>
                <TableCell sx={{ color: '#ffffff', fontWeight: 'bold' }}>Reason</TableCell>
                <TableCell sx={{ color: '#ffffff', fontWeight: 'bold' }}>Responsible</TableCell>
                <TableCell sx={{ color: '#ffffff', fontWeight: 'bold' }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {transactions.map((transaction) => (
                <TableRow key={transaction.id} hover>
                  <TableCell sx={{ color: 'rgba(255,255,255,0.9)' }}>
                    {transaction.transaction_date 
                      ? new Date(transaction.transaction_date).toLocaleString()
                      : 'N/A'}
                  </TableCell>
                  <TableCell sx={{ color: 'rgba(255,255,255,0.9)' }}>
                    {transaction.asset_name || 'N/A'}
                  </TableCell>
                  <TableCell sx={{ color: 'rgba(255,255,255,0.9)' }}>
                    {transaction.asset_type ? transaction.asset_type.charAt(0).toUpperCase() + transaction.asset_type.slice(1) : 'N/A'}
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={formatTransactionType(transaction.transaction_type)}
                      color={getTransactionTypeColor(transaction.transaction_type)}
                      size="small"
                    />
                  </TableCell>
                  <TableCell sx={{ color: 'rgba(255,255,255,0.9)' }}>
                    {transaction.reason || '-'}
                  </TableCell>
                  <TableCell sx={{ color: 'rgba(255,255,255,0.9)' }}>
                    {transaction.responsible_person || '-'}
                  </TableCell>
                  <TableCell>
                    <IconButton
                      size="small"
                      color="primary"
                      onClick={() => handleEditTransaction(transaction)}
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton
                      size="small"
                      color="error"
                      onClick={() => handleDeleteClick(transaction.id)}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      <TransactionForm
        open={formOpen}
        onClose={() => {
          setFormOpen(false);
          setEditingTransaction(null);
        }}
        onSubmit={handleFormSubmit}
        initialData={editingTransaction}
        allAssets={allAssets}
      />

      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Delete Transaction?</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete this transaction? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)} color="inherit">
            Cancel
          </Button>
          <Button onClick={handleDeleteConfirm} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default TransactionLedger;

