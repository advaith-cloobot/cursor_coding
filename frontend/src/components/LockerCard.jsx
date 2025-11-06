import React from 'react';
import {
  Card,
  CardContent,
  CardActions,
  Typography,
  IconButton,
  Box,
  Chip,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import LockIcon from '@mui/icons-material/Lock';

const LockerCard = ({ locker, onEdit, onDelete, onClick }) => {
  const handleCardClick = (e) => {
    // Only trigger onClick if not clicking on action buttons
    if (e.target.closest('.action-buttons')) {
      return;
    }
    onClick(locker.id);
  };

  return (
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
      onClick={handleCardClick}
    >
      <CardContent sx={{ flexGrow: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <LockIcon sx={{ mr: 1, color: '#64b5f6', fontSize: 30 }} />
          <Typography variant="h5" component="h2" fontWeight="bold" sx={{ color: '#ffffff' }}>
            {locker.name}
          </Typography>
        </Box>
        
        <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 1 }}>
          <LocationOnIcon sx={{ mr: 1, color: '#90caf9', fontSize: 20, mt: 0.5 }} />
          <Box>
            <Typography variant="body1" sx={{ color: '#ffffff', fontWeight: '500' }}>
              {locker.location_name}
            </Typography>
            <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)' }}>
              {locker.address}
            </Typography>
          </Box>
        </Box>

        {/* Asset Count Badge */}
        <Box sx={{ mt: 2 }}>
          <Chip
            label={`Withdrawn: ${locker.withdrawn_assets || 0} / Total: ${locker.total_assets || 0}`}
            size="small"
            sx={{
              backgroundColor: (locker.withdrawn_assets || 0) > 0 
                ? 'rgba(244, 67, 54, 0.2)' 
                : 'rgba(76, 175, 80, 0.2)',
              color: (locker.withdrawn_assets || 0) > 0 
                ? '#f44336' 
                : '#4caf50',
              border: (locker.withdrawn_assets || 0) > 0 
                ? '1px solid rgba(244, 67, 54, 0.5)' 
                : '1px solid rgba(76, 175, 80, 0.5)',
              fontWeight: 'bold',
            }}
          />
        </Box>
      </CardContent>
      
      <CardActions className="action-buttons" sx={{ justifyContent: 'flex-end', px: 2, pb: 2 }}>
        <IconButton
          aria-label="edit"
          color="primary"
          onClick={(e) => {
            e.stopPropagation();
            onEdit(locker);
          }}
        >
          <EditIcon />
        </IconButton>
        <IconButton
          aria-label="delete"
          color="error"
          onClick={(e) => {
            e.stopPropagation();
            onDelete(locker.id);
          }}
        >
          <DeleteIcon />
        </IconButton>
      </CardActions>
    </Card>
  );
};

export default LockerCard;

