import React, { useState } from 'react';
import {
  List,
  ListItem,
  Paper,
  Box,
  IconButton,
  Collapse,
  Typography,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import AssetDetails from './AssetDetails';

const AssetList = ({ assets, onEdit, onDelete }) => {
  const [expandedAsset, setExpandedAsset] = useState(null);

  const handleToggleExpand = (assetId) => {
    setExpandedAsset(expandedAsset === assetId ? null : assetId);
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
            onClick={() => handleToggleExpand(asset.id)}
          >
            <Box sx={{ flexGrow: 1 }}>
              <Typography variant="h6" component="div" sx={{ color: '#ffffff', fontWeight: 'bold' }}>
                {asset.name}
              </Typography>
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

