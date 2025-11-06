import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  Fab,
  Breadcrumbs,
  Link,
  Paper,
  Alert,
  Snackbar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import AssetList from '../components/AssetList';
import AssetForm from '../components/AssetForm';
import {
  getLocker,
  getLockerAssets,
  createAsset,
  updateAsset,
  deleteAsset,
} from '../services/api';

const LockerDetail = () => {
  const { lockerId } = useParams();
  const navigate = useNavigate();
  const [locker, setLocker] = useState(null);
  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [editingAsset, setEditingAsset] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [assetToDelete, setAssetToDelete] = useState(null);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success',
  });

  useEffect(() => {
    loadLockerData();
  }, [lockerId]);

  const loadLockerData = async () => {
    try {
      setLoading(true);
      const [lockerData, assetsData] = await Promise.all([
        getLocker(lockerId),
        getLockerAssets(lockerId),
      ]);
      setLocker(lockerData);
      setAssets(assetsData);
    } catch (error) {
      showSnackbar('Failed to load locker data', 'error');
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

  const handleCreateAsset = () => {
    setEditingAsset(null);
    setFormOpen(true);
  };

  const handleEditAsset = (asset) => {
    setEditingAsset(asset);
    setFormOpen(true);
  };

  const handleFormSubmit = async (formData) => {
    try {
      if (editingAsset) {
        await updateAsset(editingAsset.id, formData);
        showSnackbar('Asset updated successfully');
      } else {
        await createAsset(lockerId, formData);
        showSnackbar('Asset added successfully');
      }
      setFormOpen(false);
      setEditingAsset(null);
      loadLockerData();
    } catch (error) {
      showSnackbar(
        error.response?.data?.error || 'Failed to save asset',
        'error'
      );
    }
  };

  const handleDeleteClick = (assetId) => {
    setAssetToDelete(assetId);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      await deleteAsset(assetToDelete);
      showSnackbar('Asset deleted successfully');
      setDeleteDialogOpen(false);
      setAssetToDelete(null);
      loadLockerData();
    } catch (error) {
      showSnackbar(
        error.response?.data?.error || 'Failed to delete asset',
        'error'
      );
    }
  };

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
    setAssetToDelete(null);
  };

  const handleBackClick = () => {
    navigate('/');
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Typography sx={{ color: 'rgba(255,255,255,0.8)' }}>Loading...</Typography>
      </Container>
    );
  }

  if (!locker) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Typography sx={{ color: 'rgba(255,255,255,0.8)' }}>Locker not found</Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4, position: 'relative', zIndex: 1 }}>
      <Breadcrumbs sx={{ mb: 3 }}>
        <Link
          component="button"
          variant="body1"
          onClick={handleBackClick}
          sx={{
            cursor: 'pointer',
            textDecoration: 'none',
            color: 'rgba(255,255,255,0.8)',
            fontWeight: '500',
            '&:hover': { textDecoration: 'underline', color: '#ffffff' },
          }}
        >
          Home
        </Link>
        <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.9)', fontWeight: '500' }}>
          {locker.name}
        </Typography>
      </Breadcrumbs>

      <Paper 
        sx={{ 
          p: 3, 
          mb: 4,
          backgroundColor: 'rgba(30, 30, 50, 0.8)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
        }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 2 }}>
          <Box sx={{ flex: 1 }}>
            <Typography variant="h4" component="h1" gutterBottom fontWeight="bold" sx={{ color: '#ffffff' }}>
              {locker.name}
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'flex-start', mt: 2 }}>
              <LocationOnIcon sx={{ mr: 1, color: '#90caf9', mt: 0.5 }} />
              <Box>
                <Typography variant="h6" sx={{ color: '#ffffff', fontWeight: '500' }}>
                  {locker.location_name}
                </Typography>
                <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.7)' }}>
                  {locker.address}
                </Typography>
              </Box>
            </Box>
          </Box>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleCreateAsset}
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
            Add Asset
          </Button>
        </Box>
      </Paper>

      <Box 
        sx={{ 
          mb: 2, 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 2
        }}
      >
        <Typography 
          variant="h5" 
          component="h2" 
          gutterBottom 
          fontWeight="bold"
          sx={{ 
            color: '#ffffff',
            textShadow: '2px 2px 4px rgba(0,0,0,0.5)'
          }}
        >
          Assets ({assets.length})
        </Typography>
      </Box>

      <AssetList
        assets={assets}
        onEdit={handleEditAsset}
        onDelete={handleDeleteClick}
      />

      <Button
        variant="contained"
        startIcon={<ArrowBackIcon />}
        onClick={handleBackClick}
        sx={{
          position: 'fixed',
          bottom: 32,
          right: 32,
          backgroundColor: 'rgba(30, 30, 50, 0.9)',
          color: '#ffffff',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          backdropFilter: 'blur(10px)',
          fontWeight: 'bold',
          px: 3,
          py: 1.5,
          boxShadow: '0 4px 14px rgba(0,0,0,0.4)',
          '&:hover': {
            backgroundColor: 'rgba(40, 40, 60, 0.95)',
            transform: 'translateY(-2px)',
            boxShadow: '0 6px 20px rgba(0,0,0,0.5)',
          },
          transition: 'all 0.3s ease',
        }}
      >
        Back to Home
      </Button>

      <AssetForm
        open={formOpen}
        onClose={() => {
          setFormOpen(false);
          setEditingAsset(null);
        }}
        onSubmit={handleFormSubmit}
        initialData={editingAsset}
      />

      <Dialog open={deleteDialogOpen} onClose={handleDeleteCancel}>
        <DialogTitle>Delete Asset?</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete this asset? This action cannot be undone.
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

export default LockerDetail;

