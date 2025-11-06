import React, { useState, useEffect, useRef } from 'react';
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
  Typography,
  Paper,
  IconButton,
  Grid,
  Divider,
} from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import DeleteIcon from '@mui/icons-material/Delete';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';

const AssetForm = ({ open, onClose, onSubmit, initialData }) => {
  const [formData, setFormData] = useState({
    name: '',
    asset_type: 'jewellery',
    material_type: '',
    material_grade: '',
    details: '',
    worth: '',
    document_type: '',
    responsible_person: '',
  });
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [filePreviews, setFilePreviews] = useState([]);
  const fileInputRef = useRef(null);

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
        responsible_person: initialData.responsible_person || '',
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
        responsible_person: '',
      });
    }
    // Reset files when dialog opens/closes
    setSelectedFiles([]);
    setFilePreviews([]);
  }, [initialData, open]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleFileSelect = (event) => {
    const newFiles = Array.from(event.target.files);
    processFiles(newFiles);
  };

  const processFiles = (newFiles) => {
    const previews = [];
    newFiles.forEach((file) => {
      const fileType = file.type.startsWith('image/') ? 'image' : 'pdf';
      if (fileType === 'image') {
        const reader = new FileReader();
        reader.onload = (e) => {
          previews.push({
            file,
            preview: e.target.result,
            type: 'image',
            name: file.name,
          });
          if (previews.length === newFiles.length) {
            setFilePreviews((prev) => [...prev, ...previews]);
            setSelectedFiles((prev) => [...prev, ...newFiles]);
          }
        };
        reader.readAsDataURL(file);
      } else {
        previews.push({
          file,
          preview: null,
          type: 'pdf',
          name: file.name,
        });
        if (previews.length === newFiles.length) {
          setFilePreviews((prev) => [...prev, ...previews]);
          setSelectedFiles((prev) => [...prev, ...newFiles]);
        }
      }
    });
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const droppedFiles = Array.from(e.dataTransfer.files);
    processFiles(droppedFiles);
  };

  const removeFile = (index) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
    setFilePreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
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
    
    // Pass files along with form data
    onSubmit(cleanedData, selectedFiles);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
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

            {/* Responsible person field (for initial transaction) */}
            {!initialData && (
              <TextField
                name="responsible_person"
                label="Responsible Person"
                placeholder="Who is creating this asset?"
                value={formData.responsible_person}
                onChange={handleChange}
                fullWidth
              />
            )}

            {/* File Upload Section - Only show when creating new asset */}
            {!initialData && (
              <>
                <Divider sx={{ my: 2 }} />
                <Typography variant="h6" sx={{ color: 'text.primary', mb: 1 }}>
                  Upload Files (Optional)
                </Typography>
                <Paper
                  sx={{
                    p: 2,
                    border: '2px dashed',
                    borderColor: 'primary.main',
                    textAlign: 'center',
                    cursor: 'pointer',
                    backgroundColor: 'rgba(0, 0, 0, 0.02)',
                    '&:hover': {
                      backgroundColor: 'rgba(0, 0, 0, 0.05)',
                    },
                  }}
                  onDragOver={handleDragOver}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    accept="image/*,.pdf"
                    style={{ display: 'none' }}
                    onChange={handleFileSelect}
                  />
                  <CloudUploadIcon sx={{ fontSize: 40, color: 'primary.main', mb: 1 }} />
                  <Typography variant="body2" gutterBottom>
                    Drag & Drop files here or click to select
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Supports: Images (JPEG, PNG, GIF) and PDF files
                  </Typography>
                </Paper>

                {/* Selected Files Preview */}
                {filePreviews.length > 0 && (
                  <Box sx={{ mt: 2 }}>
                    <Typography variant="subtitle2" gutterBottom sx={{ mb: 1 }}>
                      Selected Files ({filePreviews.length})
                    </Typography>
                    <Grid container spacing={1}>
                      {filePreviews.map((preview, index) => (
                        <Grid item xs={6} sm={4} md={3} key={index}>
                          <Paper
                            sx={{
                              p: 1,
                              position: 'relative',
                              backgroundColor: 'rgba(0, 0, 0, 0.02)',
                            }}
                          >
                            {preview.type === 'image' ? (
                              <Box
                                component="img"
                                src={preview.preview}
                                alt={preview.name}
                                sx={{
                                  width: '100%',
                                  height: 100,
                                  objectFit: 'cover',
                                  borderRadius: 1,
                                }}
                              />
                            ) : (
                              <Box
                                sx={{
                                  width: '100%',
                                  height: 100,
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  backgroundColor: 'rgba(0, 0, 0, 0.05)',
                                  borderRadius: 1,
                                }}
                              >
                                <PictureAsPdfIcon sx={{ fontSize: 32, color: 'error.main' }} />
                              </Box>
                            )}
                            <Typography
                              variant="caption"
                              sx={{
                                display: 'block',
                                mt: 0.5,
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap',
                              }}
                            >
                              {preview.name}
                            </Typography>
                            <IconButton
                              size="small"
                              color="error"
                              sx={{ position: 'absolute', top: 4, right: 4 }}
                              onClick={(e) => {
                                e.stopPropagation();
                                removeFile(index);
                              }}
                            >
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </Paper>
                        </Grid>
                      ))}
                    </Grid>
                  </Box>
                )}
              </>
            )}
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

