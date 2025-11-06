import React, { useState, useEffect } from 'react';
import {
  List,
  ListItem,
  Paper,
  Box,
  IconButton,
  Collapse,
  Typography,
  Avatar,
  Chip,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import ImageIcon from '@mui/icons-material/Image';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import AssetDetails from './AssetDetails';
import { getAssetFiles, getFileUrl } from '../services/api';

const AssetList = ({ assets, onEdit, onDelete, onAssetClick }) => {
  const [expandedAsset, setExpandedAsset] = useState(null);
  const [assetThumbnails, setAssetThumbnails] = useState({});

  useEffect(() => {
    // Load thumbnails for all assets
    const loadThumbnails = async () => {
      const thumbnails = {};
      for (const asset of assets) {
        try {
          const files = await getAssetFiles(asset.id);
          const primaryImage = files.find((f) => f.is_primary && f.file_type === 'image');
          if (primaryImage) {
            thumbnails[asset.id] = getFileUrl(primaryImage.file_path);
          }
        } catch (error) {
          console.error(`Failed to load files for asset ${asset.id}:`, error);
        }
      }
      setAssetThumbnails(thumbnails);
    };

    if (assets.length > 0) {
      loadThumbnails();
    }
  }, [assets]);

  const handleToggleExpand = (assetId) => {
    setExpandedAsset(expandedAsset === assetId ? null : assetId);
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
    <List sx={{ width: '100%' }}>
      {assets.map((asset) => (
        <Paper 
          key={asset.id} 
          sx={{ 
            mb: 2,
            backgroundColor: 'rgba(30, 30, 50, 0.8)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            boxShadow: '0 4px 16px rgba(0,0,0,0.4)',
            transition: 'transform 0.2s, box-shadow 0.2s',
            '&:hover': {
              boxShadow: '0 6px 24px rgba(0,0,0,0.15)',
            },
          }}
        >
          <ListItem
            sx={{
              display: 'flex',
              alignItems: 'center',
              cursor: 'pointer',
              '&:hover': {
                backgroundColor: 'action.hover',
              },
            }}
            onClick={(e) => {
              if (e.target.closest('button')) {
                return; // Don't expand if clicking buttons
              }
              if (onAssetClick) {
                onAssetClick(asset.id);
              } else {
                handleToggleExpand(asset.id);
              }
            }}
          >
            {/* Thumbnail */}
            <Avatar
              src={assetThumbnails[asset.id]}
              variant="rounded"
              sx={{
                width: 80,
                height: 80,
                mr: 2,
                backgroundColor: 'rgba(255,255,255,0.1)',
              }}
            >
              {asset.asset_type === 'document' ? (
                <PictureAsPdfIcon sx={{ fontSize: 40 }} />
              ) : (
                <ImageIcon sx={{ fontSize: 40 }} />
              )}
            </Avatar>

            <Box sx={{ flexGrow: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                <Typography variant="h6" component="div" sx={{ color: '#ffffff', fontWeight: 'bold' }}>
                  {asset.name}
                </Typography>
                {asset.status && (
                  <Chip
                    label={asset.status.charAt(0).toUpperCase() + asset.status.slice(1)}
                    size="small"
                    color={getStatusColor(asset.status)}
                  />
                )}
              </Box>
              <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)', textTransform: 'capitalize' }}>
                {asset.asset_type}
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', gap: 1 }}>
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
              <IconButton>
                {expandedAsset === asset.id ? <ExpandLessIcon /> : <ExpandMoreIcon />}
              </IconButton>
            </Box>
          </ListItem>
          <Collapse in={expandedAsset === asset.id} timeout="auto" unmountOnExit>
            <Box sx={{ px: 3, pb: 3 }}>
              <AssetDetails asset={asset} />
            </Box>
          </Collapse>
        </Paper>
      ))}
    </List>
  );
};

export default AssetList;

