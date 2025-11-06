import React from 'react';
import {
  Card,
  CardContent,
  CardActions,
  Typography,
  IconButton,
  Box,
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
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(10px)',
        transition: 'transform 0.3s, box-shadow 0.3s',
        boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
        '&:hover': {
          transform: 'translateY(-8px)',
          boxShadow: '0 12px 40px rgba(0,0,0,0.2)',
        },
      }}
      onClick={handleCardClick}
    >
      <CardContent sx={{ flexGrow: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <LockIcon sx={{ mr: 1, color: 'primary.main', fontSize: 30 }} />
          <Typography variant="h5" component="h2" fontWeight="bold">
            {locker.name}
          </Typography>
        </Box>
        
        <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 1 }}>
          <LocationOnIcon sx={{ mr: 1, color: 'text.secondary', fontSize: 20, mt: 0.5 }} />
          <Box>
            <Typography variant="body1" color="text.primary" fontWeight="500">
              {locker.location_name}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {locker.address}
            </Typography>
          </Box>
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

