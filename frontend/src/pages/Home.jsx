import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Grid,
  Fab,
  Box,
  Alert,
  Snackbar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import ReceiptIcon from '@mui/icons-material/Receipt';
import LockerCard from '../components/LockerCard';
import LockerForm from '../components/LockerForm';
import {
  getAllLockers,
  createLocker,
  updateLocker,
  deleteLocker,
} from '../services/api';

const Home = () => {
  const navigate = useNavigate();
  const [lockers, setLockers] = useState({ withdrawn: [], intact: [] });
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [editingLocker, setEditingLocker] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [lockerToDelete, setLockerToDelete] = useState(null);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success',
  });

  useEffect(() => {
    loadLockers();
  }, []);

  const loadLockers = async () => {
    try {
      setLoading(true);
      const data = await getAllLockers();
      setLockers(data);
    } catch (error) {
      showSnackbar('Failed to load lockers', 'error');
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

  const handleCreateLocker = () => {
    setEditingLocker(null);
    setFormOpen(true);
  };

  const handleEditLocker = (locker) => {
    setEditingLocker(locker);
    setFormOpen(true);
  };

  const handleFormSubmit = async (formData) => {
    try {
      if (editingLocker) {
        await updateLocker(editingLocker.id, formData);
        showSnackbar('Locker updated successfully');
      } else {
        await createLocker(formData);
        showSnackbar('Locker created successfully');
      }
      setFormOpen(false);
      setEditingLocker(null);
      loadLockers();
    } catch (error) {
      showSnackbar(
        error.response?.data?.error || 'Failed to save locker',
        'error'
      );
    }
  };

  const handleDeleteClick = (lockerId) => {
    setLockerToDelete(lockerId);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      await deleteLocker(lockerToDelete);
      showSnackbar('Locker deleted successfully');
      setDeleteDialogOpen(false);
      setLockerToDelete(null);
      loadLockers();
    } catch (error) {
      showSnackbar(
        error.response?.data?.error || 'Failed to delete locker',
        'error'
      );
    }
  };

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
    setLockerToDelete(null);
  };

  const handleLockerClick = (lockerId) => {
    navigate(`/locker/${lockerId}`);
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4, position: 'relative', zIndex: 1 }}>
      <Box 
        sx={{ 
          mb: 4, 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'flex-start',
          flexWrap: 'wrap',
          gap: 2
        }}
      >
        <Box>
          <Typography 
            variant="h3" 
            component="h1" 
            gutterBottom 
            fontWeight="bold"
            sx={{ 
              color: '#000000',
              textShadow: '2px 2px 4px rgba(255,255,255,0.5)'
            }}
          >
            Locker Organizer
          </Typography>
          <Typography 
            variant="subtitle1" 
            sx={{ 
              color: 'rgba(255,255,255,0.8)',
              textShadow: '1px 1px 2px rgba(0,0,0,0.3)'
            }}
          >
            Manage your family's valuable assets across multiple lockers
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          <Button
            variant="outlined"
            startIcon={<ReceiptIcon />}
            onClick={() => navigate('/transactions')}
            sx={{
              backgroundColor: 'rgba(255, 255, 255, 0.95)',
              color: 'primary.main',
              borderColor: 'primary.main',
              borderWidth: 2,
              fontWeight: 'bold',
              px: 3,
              py: 1.5,
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
              '&:hover': {
                backgroundColor: 'white',
                borderColor: 'primary.dark',
                borderWidth: 2,
                transform: 'translateY(-2px)',
                boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
              },
              transition: 'all 0.3s ease',
            }}
          >
            Transaction Ledger
          </Button>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleCreateLocker}
            sx={{
              backgroundColor: '#1976d2',
              color: 'white',
              fontWeight: 'bold',
              px: 3,
              py: 1.5,
              boxShadow: '0 4px 14px rgba(0,0,0,0.4)',
              '&:hover': {
                backgroundColor: '#1565c0',
                transform: 'translateY(-2px)',
                boxShadow: '0 6px 20px rgba(0,0,0,0.5)',
              },
              transition: 'all 0.3s ease',
            }}
          >
            Add Locker
          </Button>
        </Box>
      </Box>

      {loading ? (
        <Typography sx={{ color: 'rgba(255,255,255,0.8)' }}>Loading...</Typography>
      ) : lockers.withdrawn.length === 0 && lockers.intact.length === 0 ? (
        <Box
          sx={{
            textAlign: 'center',
            py: 8,
            backgroundColor: 'rgba(30, 30, 50, 0.8)',
            backdropFilter: 'blur(10px)',
            borderRadius: 3,
            border: '1px solid rgba(255, 255, 255, 0.1)',
            boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
          }}
        >
          <Typography variant="h6" sx={{ color: 'rgba(255,255,255,0.9)' }} gutterBottom>
            No lockers yet
          </Typography>
          <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)' }}>
            Click the "Add Locker" button to create your first locker
          </Typography>
        </Box>
      ) : (
        <>
          {/* Section 1: Lockers with withdrawn assets */}
          {lockers.withdrawn.length > 0 && (
            <Box sx={{ mb: 4 }}>
              <Typography 
                variant="h5" 
                component="h2" 
                gutterBottom 
                sx={{ color: '#000000', mb: 2, fontWeight: 'bold' }}
              >
                Lockers with Withdrawn Assets
              </Typography>
              <Grid container spacing={3}>
                {lockers.withdrawn.map((locker) => (
                  <Grid item xs={12} sm={6} md={4} key={locker.id}>
                    <LockerCard
                      locker={locker}
                      onEdit={handleEditLocker}
                      onDelete={handleDeleteClick}
                      onClick={handleLockerClick}
                    />
                  </Grid>
                ))}
              </Grid>
            </Box>
          )}

          {/* Section 2: Lockers with all assets intact */}
          {lockers.intact.length > 0 && (
            <Box>
              <Typography 
                variant="h5" 
                component="h2" 
                gutterBottom 
                sx={{ color: '#000000', mb: 2, fontWeight: 'bold' }}
              >
                Lockers with All Assets Intact
              </Typography>
              <Grid container spacing={3}>
                {lockers.intact.map((locker) => (
                  <Grid item xs={12} sm={6} md={4} key={locker.id}>
                    <LockerCard
                      locker={locker}
                      onEdit={handleEditLocker}
                      onDelete={handleDeleteClick}
                      onClick={handleLockerClick}
                    />
                  </Grid>
                ))}
              </Grid>
            </Box>
          )}
        </>
      )}


      <LockerForm
        open={formOpen}
        onClose={() => {
          setFormOpen(false);
          setEditingLocker(null);
        }}
        onSubmit={handleFormSubmit}
        initialData={editingLocker}
      />

      <Dialog open={deleteDialogOpen} onClose={handleDeleteCancel}>
        <DialogTitle>Delete Locker?</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete this locker? All assets inside will
            also be deleted. This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteCancel} color="inherit">
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

export default Home;

