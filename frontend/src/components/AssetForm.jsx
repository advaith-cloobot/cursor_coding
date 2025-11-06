import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  InputAdornment,
} from '@mui/material';

const AssetForm = ({ open, onClose, onSubmit, initialData }) => {
  const [formData, setFormData] = useState({
    name: '',
    asset_type: 'jewellery',
    material_type: '',
    material_grade: '',
    details: '',
    worth: '',
    document_type: '',
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name || '',
        asset_type: initialData.asset_type || 'jewellery',
        material_type: initialData.material_type || '',
        material_grade: initialData.material_grade || '',
        details: initialData.details || '',
        worth: initialData.worth || '',
        document_type: initialData.document_type || '',
      });
    } else {
      setFormData({
        name: '',
        asset_type: 'jewellery',
        material_type: '',
        material_grade: '',
        details: '',
        worth: '',
        document_type: '',
      });
    }
  }, [initialData, open]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Clean up data based on asset type
    const cleanedData = { ...formData };
    
    if (formData.asset_type !== 'jewellery') {
      cleanedData.material_type = null;
      cleanedData.material_grade = null;
      cleanedData.worth = null;
    }
    
    if (formData.asset_type !== 'document') {
      cleanedData.document_type = null;
    }
    
    onSubmit(cleanedData);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <form onSubmit={handleSubmit}>
        <DialogTitle>
          {initialData ? 'Edit Asset' : 'Add New Asset'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <TextField
              name="name"
              label="Asset Name"
              value={formData.name}
              onChange={handleChange}
              required
              fullWidth
              autoFocus
            />

            <FormControl fullWidth required>
              <InputLabel>Asset Type</InputLabel>
              <Select
                name="asset_type"
                value={formData.asset_type}
                onChange={handleChange}
                label="Asset Type"
              >
                <MenuItem value="jewellery">Jewellery</MenuItem>
                <MenuItem value="document">Document</MenuItem>
                <MenuItem value="misc">Miscellaneous</MenuItem>
              </Select>
            </FormControl>

            {/* Jewellery-specific fields */}
            {formData.asset_type === 'jewellery' && (
              <>
                <TextField
                  name="material_type"
                  label="Material Type"
                  placeholder="e.g., Gold, Silver, Diamond"
                  value={formData.material_type}
                  onChange={handleChange}
                  fullWidth
                />
                <TextField
                  name="material_grade"
                  label="Material Grade"
                  placeholder="e.g., 24K, 18K, 925"
                  value={formData.material_grade}
                  onChange={handleChange}
                  fullWidth
                />
                <TextField
                  name="worth"
                  label="Worth"
                  type="number"
                  value={formData.worth}
                  onChange={handleChange}
                  fullWidth
                  InputProps={{
                    startAdornment: <InputAdornment position="start">$</InputAdornment>,
                  }}
                />
              </>
            )}

            {/* Document-specific fields */}
            {formData.asset_type === 'document' && (
              <TextField
                name="document_type"
                label="Document Type"
                placeholder="e.g., Property Deed, Insurance, Certificate"
                value={formData.document_type}
                onChange={handleChange}
                fullWidth
              />
            )}

            {/* Common details field */}
            <TextField
              name="details"
              label="Details"
              placeholder={
                formData.asset_type === 'jewellery'
                  ? 'Who gifted, when given, why purchased, etc.'
                  : 'Additional information'
              }
              value={formData.details}
              onChange={handleChange}
              fullWidth
              multiline
              rows={4}
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={onClose} color="inherit">
            Cancel
          </Button>
          <Button type="submit" variant="contained" color="primary">
            {initialData ? 'Update' : 'Add'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default AssetForm;

