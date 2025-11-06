import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  List,
  ListItem,
  Paper,
  Box,
  IconButton,
  Typography,
  Avatar,
  Chip,
  Card,
  CardContent,
  CardActions,
  Grid,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { getAssetFiles, getFileUrl } from '../services/api';

const AssetList = ({ assets, onEdit, onDelete }) => {
  const navigate = useNavigate();
  const [assetThumbnails, setAssetThumbnails] = useState({});

  useEffect(() => {
    const loadThumbnails = async () => {
      const thumbnails = {};
      for (const asset of assets) {
        try {
          const files = await getAssetFiles(asset.id);
          const primaryImage = files.find(f => f.is_primary && f.file_type === 'image') || 
                              files.find(f => f.file_type === 'image');
          if (primaryImage) {
            thumbnails[asset.id] = getFileUrl(primaryImage.file_path);
          }
        } catch (error) {
          console.error(`Failed to load thumbnail for asset ${asset.id}:`, error);
        }
      }
      setAssetThumbnails(thumbnails);
    };
    
    if (assets.length > 0) {
      loadThumbnails();
    }
  }, [assets]);

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

  const handleAssetClick = (assetId) => {
    navigate(`/asset/${assetId}`);
  };

  if (assets.length === 0) {
    return (
      <Box
        sx={{
          textAlign: 'center',
          py: 6,
          backgroundColor: 'rgba(30, 30, 50, 0.8)',
          backdropFilter: 'blur(10px)',
          borderRadius: 3,
          border: '1px solid rgba(255, 255, 255, 0.1)',
          boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
        }}
      >
        <Typography variant="h6" sx={{ color: 'rgba(255,255,255,0.9)' }} gutterBottom>
          No assets in this locker
        </Typography>
        <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)' }}>
          Click the "Add Asset" button to add your first asset
        </Typography>
      </Box>
    );
  }

  return (
    <Grid container spacing={3}>
      {assets.map((asset) => (
        <Grid item xs={12} sm={6} md={4} key={asset.id}>
          <Card
            sx={{
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              cursor: 'pointer',
              backgroundColor: 'rgba(30, 30, 50, 0.8)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              transition: 'transform 0.3s, box-shadow 0.3s',
              boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
              '&:hover': {
                transform: 'translateY(-8px)',
                backgroundColor: 'rgba(40, 40, 60, 0.9)',
                boxShadow: '0 12px 40px rgba(0,0,0,0.6)',
              },
            }}
            onClick={() => handleAssetClick(asset.id)}
          >
            <CardContent sx={{ flexGrow: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, gap: 2 }}>
                <Avatar
                  src={assetThumbnails[asset.id]}
                  alt={asset.name}
                  sx={{
                    width: 60,
                    height: 60,
                    bgcolor: 'primary.main',
                  }}
                >
                  {asset.name.charAt(0).toUpperCase()}
                </Avatar>
                <Box sx={{ flex: 1 }}>
                  <Typography variant="h6" component="div" sx={{ color: '#ffffff', fontWeight: 'bold' }}>
                    {asset.name}
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 1, mt: 0.5 }}>
                    <Chip
                      label={asset.asset_type.charAt(0).toUpperCase() + asset.asset_type.slice(1)}
                      size="small"
                      sx={{ textTransform: 'capitalize', fontSize: '0.7rem' }}
                    />
                    {asset.status && (
                      <Chip
                        label={asset.status.charAt(0).toUpperCase() + asset.status.slice(1)}
                        size="small"
                        color={getStatusColor(asset.status)}
                        sx={{ fontSize: '0.7rem' }}
                      />
                    )}
                  </Box>
                </Box>
              </Box>
            </CardContent>
            <CardActions className="action-buttons" sx={{ justifyContent: 'flex-end', px: 2, pb: 2 }}>
              <IconButton
                aria-label="edit"
                color="primary"
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit(asset);
                }}
              >
                <EditIcon />
              </IconButton>
              <IconButton
                aria-label="delete"
                color="error"
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(asset.id);
                }}
              >
                <DeleteIcon />
              </IconButton>
            </CardActions>
          </Card>
        </Grid>
      ))}
    </Grid>
  );
};

export default AssetList;

