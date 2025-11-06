import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  Paper,
  Button,
  Grid,
  IconButton,
  Dialog,
  DialogContent,
  Breadcrumbs,
  Link,
  Chip,
  Tabs,
  Tab,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import FullscreenIcon from '@mui/icons-material/Fullscreen';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import { getAsset, getAssetFiles, getAssetEditLog, getFileUrl } from '../services/api';
import FileUpload from '../components/FileUpload';
import EditLogView from '../components/EditLogView';

const AssetDetailPage = () => {
  const { assetId } = useParams();
  const navigate = useNavigate();
  const [asset, setAsset] = useState(null);
  const [files, setFiles] = useState([]);
  const [editLogs, setEditLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tabValue, setTabValue] = useState(0);
  const [imageViewerOpen, setImageViewerOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);

  useEffect(() => {
    loadAssetData();
  }, [assetId]);

  const loadAssetData = async () => {
    try {
      setLoading(true);
      const [assetData, filesData, logsData] = await Promise.all([
        getAsset(assetId),
        getAssetFiles(assetId),
        getAssetEditLog(assetId),
      ]);
      setAsset(assetData);
      setFiles(filesData);
      setEditLogs(logsData);
    } catch (error) {
      console.error('Failed to load asset data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleImageClick = (file) => {
    setSelectedImage(file);
    setImageViewerOpen(true);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'deposited':
        return 'success';
      case 'withdrawn':
        return 'warning';
      case 'removed':
        return 'error';
      default:
        return 'default';
    }
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Typography sx={{ color: 'rgba(255,255,255,0.8)' }}>Loading...</Typography>
      </Container>
    );
  }

  if (!asset) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Typography sx={{ color: 'rgba(255,255,255,0.8)' }}>Asset not found</Typography>
      </Container>
    );
  }

  const imageFiles = files.filter((f) => f.file_type === 'image');
  const pdfFiles = files.filter((f) => f.file_type === 'pdf');

  return (
    <Container maxWidth="lg" sx={{ py: 4, position: 'relative', zIndex: 1 }}>
      <Breadcrumbs sx={{ mb: 3 }}>
        <Link
          component="button"
          variant="body1"
          onClick={() => navigate('/')}
          sx={{
            cursor: 'pointer',
            textDecoration: 'none',
            color: 'rgba(255,255,255,0.8)',
            '&:hover': { textDecoration: 'underline', color: 'white' },
          }}
        >
          Home
        </Link>
        <Link
          component="button"
          variant="body1"
          onClick={() => navigate(`/locker/${asset.locker_id}`)}
          sx={{
            cursor: 'pointer',
            textDecoration: 'none',
            color: 'rgba(255,255,255,0.8)',
            '&:hover': { textDecoration: 'underline', color: 'white' },
          }}
        >
          Locker
        </Link>
        <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.9)', fontWeight: '500' }}>
          {asset.name}
        </Typography>
      </Breadcrumbs>

      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Box>
          <Typography variant="h3" component="h1" fontWeight="bold" sx={{ color: '#000000', mb: 1 }}>
            {asset.name}
          </Typography>
          <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
            <Chip
              label={asset.asset_type.charAt(0).toUpperCase() + asset.asset_type.slice(1)}
              size="small"
              sx={{ textTransform: 'capitalize' }}
            />
            {asset.status && (
              <Chip
                label={asset.status.charAt(0).toUpperCase() + asset.status.slice(1)}
                size="small"
                color={getStatusColor(asset.status)}
              />
            )}
          </Box>
        </Box>
        <Button
          variant="contained"
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate(`/locker/${asset.locker_id}`)}
          sx={{
            backgroundColor: 'rgba(255, 255, 255, 0.95)',
            color: 'primary.main',
          }}
        >
          Back to Locker
        </Button>
      </Box>

      {/* Asset Details */}
      <Paper sx={{ p: 3, mb: 3, backgroundColor: 'rgba(30, 30, 50, 0.8)' }}>
        <Typography variant="h6" sx={{ color: '#ffffff', mb: 2, fontWeight: 'bold' }}>
          Asset Information
        </Typography>
        <Grid container spacing={2}>
          {asset.material_type && (
            <Grid item xs={12} sm={6}>
              <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)' }}>Material Type</Typography>
              <Typography variant="body1" sx={{ color: '#ffffff' }}>{asset.material_type}</Typography>
            </Grid>
          )}
          {asset.material_grade && (
            <Grid item xs={12} sm={6}>
              <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)' }}>Material Grade</Typography>
              <Typography variant="body1" sx={{ color: '#ffffff' }}>{asset.material_grade}</Typography>
            </Grid>
          )}
          {asset.worth && (
            <Grid item xs={12} sm={6}>
              <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)' }}>Worth</Typography>
              <Typography variant="body1" sx={{ color: '#ffffff' }}>
                ${parseFloat(asset.worth).toLocaleString()}
              </Typography>
            </Grid>
          )}
          {asset.document_type && (
            <Grid item xs={12} sm={6}>
              <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)' }}>Document Type</Typography>
              <Typography variant="body1" sx={{ color: '#ffffff' }}>{asset.document_type}</Typography>
            </Grid>
          )}
          {asset.details && (
            <Grid item xs={12}>
              <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)', mb: 1 }}>Details</Typography>
              <Typography variant="body1" sx={{ color: '#ffffff', whiteSpace: 'pre-wrap' }}>
                {asset.details}
              </Typography>
            </Grid>
          )}
        </Grid>
      </Paper>

      {/* Tabs for Files and Edit Log */}
      <Paper sx={{ backgroundColor: 'rgba(30, 30, 50, 0.8)' }}>
        <Tabs
          value={tabValue}
          onChange={(e, newValue) => setTabValue(newValue)}
          sx={{
            borderBottom: '1px solid rgba(255,255,255,0.1)',
            '& .MuiTab-root': {
              color: 'rgba(255,255,255,0.7)',
              '&.Mui-selected': {
                color: '#ffffff',
              },
            },
          }}
        >
          <Tab label={`Files (${files.length})`} />
          <Tab label={`Edit History (${editLogs.length > 0 ? `Last ${Math.min(editLogs.length, 10)}` : '0'})`} />
        </Tabs>

        {/* Files Tab */}
        {tabValue === 0 && (
          <Box sx={{ p: 3 }}>
            <FileUpload
              assetId={assetId}
              onFilesUploaded={loadAssetData}
              existingFiles={files}
            />

            {/* Image Gallery */}
            {imageFiles.length > 0 && (
              <Box sx={{ mt: 4 }}>
                <Typography variant="h6" sx={{ color: '#ffffff', mb: 2, fontWeight: 'bold' }}>
                  Images ({imageFiles.length})
                </Typography>
                <Grid container spacing={2}>
                  {imageFiles.map((file) => (
                    <Grid item xs={6} sm={4} md={3} key={file.id}>
                      <Paper
                        sx={{
                          position: 'relative',
                          cursor: 'pointer',
                          backgroundColor: 'rgba(255,255,255,0.05)',
                          '&:hover': {
                            backgroundColor: 'rgba(255,255,255,0.1)',
                          },
                        }}
                        onClick={() => handleImageClick(file)}
                      >
                        <Box
                          component="img"
                          src={getFileUrl(file.file_path)}
                          alt={file.file_name}
                          sx={{
                            width: '100%',
                            height: 200,
                            objectFit: 'cover',
                          }}
                        />
                        <IconButton
                          size="small"
                          sx={{
                            position: 'absolute',
                            top: 4,
                            right: 4,
                            backgroundColor: 'rgba(0,0,0,0.5)',
                            color: 'white',
                            '&:hover': {
                              backgroundColor: 'rgba(0,0,0,0.7)',
                            },
                          }}
                        >
                          <FullscreenIcon fontSize="small" />
                        </IconButton>
                      </Paper>
                    </Grid>
                  ))}
                </Grid>
              </Box>
            )}

            {/* PDF Files */}
            {pdfFiles.length > 0 && (
              <Box sx={{ mt: 4 }}>
                <Typography variant="h6" sx={{ color: '#ffffff', mb: 2, fontWeight: 'bold' }}>
                  PDF Documents ({pdfFiles.length})
                </Typography>
                <Grid container spacing={2}>
                  {pdfFiles.map((file) => (
                    <Grid item xs={12} sm={6} md={4} key={file.id}>
                      <Paper
                        sx={{
                          p: 2,
                          display: 'flex',
                          alignItems: 'center',
                          gap: 2,
                          backgroundColor: 'rgba(255,255,255,0.05)',
                          cursor: 'pointer',
                          '&:hover': {
                            backgroundColor: 'rgba(255,255,255,0.1)',
                          },
                        }}
                        onClick={() => window.open(getFileUrl(file.file_path), '_blank')}
                      >
                        <PictureAsPdfIcon sx={{ fontSize: 40, color: 'error.main' }} />
                        <Box sx={{ flex: 1 }}>
                          <Typography variant="body1" sx={{ color: '#ffffff', fontWeight: 'bold' }}>
                            {file.file_name}
                          </Typography>
                          <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.6)' }}>
                            {(file.file_size / 1024).toFixed(2)} KB
                          </Typography>
                        </Box>
                      </Paper>
                    </Grid>
                  ))}
                </Grid>
              </Box>
            )}
          </Box>
        )}

        {/* Edit Log Tab */}
        {tabValue === 1 && (
          <Box sx={{ p: 3 }}>
            <EditLogView editLogs={editLogs} />
          </Box>
        )}
      </Paper>

      {/* Image Viewer Dialog */}
      <Dialog
        open={imageViewerOpen}
        onClose={() => setImageViewerOpen(false)}
        maxWidth="lg"
        fullWidth
      >
        <DialogContent sx={{ p: 0, backgroundColor: 'rgba(0,0,0,0.9)' }}>
          {selectedImage && (
            <Box
              component="img"
              src={getFileUrl(selectedImage.file_path)}
              alt={selectedImage.file_name}
              sx={{
                width: '100%',
                height: 'auto',
                display: 'block',
              }}
            />
          )}
        </DialogContent>
      </Dialog>
    </Container>
  );
};

export default AssetDetailPage;

