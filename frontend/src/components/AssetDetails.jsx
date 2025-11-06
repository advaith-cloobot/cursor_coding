import React from 'react';
import {
  Box,
  Typography,
  Chip,
  Divider,
} from '@mui/material';
import DiamondIcon from '@mui/icons-material/Diamond';
import DescriptionIcon from '@mui/icons-material/Description';
import CategoryIcon from '@mui/icons-material/Category';

const AssetDetails = ({ asset }) => {
  const getAssetIcon = () => {
    switch (asset.asset_type) {
      case 'jewellery':
        return <DiamondIcon sx={{ mr: 1 }} />;
      case 'document':
        return <DescriptionIcon sx={{ mr: 1 }} />;
      default:
        return <CategoryIcon sx={{ mr: 1 }} />;
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        {getAssetIcon()}
        <Typography variant="h6" component="h3" fontWeight="bold">
          {asset.name}
        </Typography>
        <Chip
          label={asset.asset_type}
          size="small"
          sx={{ ml: 2, textTransform: 'capitalize' }}
          color={
            asset.asset_type === 'jewellery'
              ? 'primary'
              : asset.asset_type === 'document'
              ? 'secondary'
              : 'default'
          }
        />
      </Box>

      {/* Jewellery-specific details */}
      {asset.asset_type === 'jewellery' && (
        <Box sx={{ mb: 2 }}>
          {asset.material_type && (
            <Box sx={{ mb: 1 }}>
              <Typography variant="body2" color="text.secondary" component="span">
                Material Type:{' '}
              </Typography>
              <Typography variant="body2" component="span" fontWeight="500">
                {asset.material_type}
              </Typography>
            </Box>
          )}
          {asset.material_grade && (
            <Box sx={{ mb: 1 }}>
              <Typography variant="body2" color="text.secondary" component="span">
                Material Grade:{' '}
              </Typography>
              <Typography variant="body2" component="span" fontWeight="500">
                {asset.material_grade}
              </Typography>
            </Box>
          )}
          {asset.worth && (
            <Box sx={{ mb: 1 }}>
              <Typography variant="body2" color="text.secondary" component="span">
                Worth:{' '}
              </Typography>
              <Typography variant="body2" component="span" fontWeight="500" color="success.main">
                ${parseFloat(asset.worth).toLocaleString()}
              </Typography>
            </Box>
          )}
        </Box>
      )}

      {/* Document-specific details */}
      {asset.asset_type === 'document' && asset.document_type && (
        <Box sx={{ mb: 2 }}>
          <Typography variant="body2" color="text.secondary" component="span">
            Document Type:{' '}
          </Typography>
          <Typography variant="body2" component="span" fontWeight="500">
            {asset.document_type}
          </Typography>
        </Box>
      )}

      {/* Details section */}
      {asset.details && (
        <>
          <Divider sx={{ my: 2 }} />
          <Box>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Details:
            </Typography>
            <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
              {asset.details}
            </Typography>
          </Box>
        </>
      )}

      {/* Created date */}
      <Divider sx={{ my: 2 }} />
      <Typography variant="caption" color="text.secondary">
        Added on: {formatDate(asset.created_at)}
      </Typography>
    </Box>
  );
};

export default AssetDetails;

