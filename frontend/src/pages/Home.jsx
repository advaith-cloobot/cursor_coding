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
  const [lockers, setLockers] = useState([]);
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
              color: 'white',
              textShadow: '2px 2px 4px rgba(0,0,0,0.3)'
            }}
          >
            Locker Organizer
          </Typography>
          <Typography 
            variant="subtitle1" 
            sx={{ 
              color: 'rgba(255,255,255,0.9)',
              textShadow: '1px 1px 2px rgba(0,0,0,0.2)'
            }}
          >
            Manage your family's valuable assets across multiple lockers
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleCreateLocker}
          sx={{
            backgroundColor: 'rgba(255, 255, 255, 0.95)',
            color: 'primary.main',
            fontWeight: 'bold',
            px: 3,
            py: 1.5,
            boxShadow: '0 4px 14px rgba(0,0,0,0.3)',
            '&:hover': {
              backgroundColor: 'white',
              transform: 'translateY(-2px)',
              boxShadow: '0 6px 20px rgba(0,0,0,0.4)',
            },
            transition: 'all 0.3s ease',
          }}
        >
          Add Locker
        </Button>
      </Box>

      {loading ? (
        <Typography sx={{ color: 'white' }}>Loading...</Typography>
      ) : lockers.length === 0 ? (
        <Box
          sx={{
            textAlign: 'center',
            py: 8,
            backgroundColor: 'rgba(255, 255, 255, 0.95)',
            borderRadius: 3,
            boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
          }}
        >
          <Typography variant="h6" color="text.secondary" gutterBottom>
            No lockers yet
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Click the "Add Locker" button to create your first locker
          </Typography>
        </Box>
      ) : (
        <Grid container spacing={3}>
          {lockers.map((locker) => (
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

