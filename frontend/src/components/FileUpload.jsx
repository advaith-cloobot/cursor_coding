import React, { useState, useRef } from 'react';
import {
  Box,
  Button,
  Typography,
  Paper,
  IconButton,
  Grid,
  LinearProgress,
} from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import DeleteIcon from '@mui/icons-material/Delete';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import StarIcon from '@mui/icons-material/Star';
import StarBorderIcon from '@mui/icons-material/StarBorder';
import { uploadAssetFiles, deleteFile, setPrimaryImage, getFileUrl } from '../services/api';

const FileUpload = ({ assetId, onFilesUploaded, existingFiles = [] }) => {
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef(null);
  const [files, setFiles] = useState(existingFiles);

  React.useEffect(() => {
    setFiles(existingFiles);
  }, [existingFiles]);

  const handleFileSelect = (event) => {
    const newFiles = Array.from(event.target.files);
    processFiles(newFiles);
  };

  const processFiles = (newFiles) => {
    const filePreviews = [];
    newFiles.forEach((file) => {
      const fileType = file.type.startsWith('image/') ? 'image' : 'pdf';
      if (fileType === 'image') {
        const reader = new FileReader();
        reader.onload = (e) => {
          filePreviews.push({
            file,
            preview: e.target.result,
            type: 'image',
            name: file.name,
          });
          if (filePreviews.length === newFiles.length) {
            setPreviews((prev) => [...prev, ...filePreviews]);
            setSelectedFiles((prev) => [...prev, ...newFiles]);
          }
        };
        reader.readAsDataURL(file);
      } else {
        filePreviews.push({
          file,
          preview: null,
          type: 'pdf',
          name: file.name,
        });
        if (filePreviews.length === newFiles.length) {
          setPreviews((prev) => [...prev, ...filePreviews]);
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
    setPreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const handleUpload = async () => {
    if (selectedFiles.length === 0) return;

    setUploading(true);
    setUploadProgress(0);

    try {
      const response = await uploadAssetFiles(assetId, selectedFiles);
      
      setFiles((prev) => [...prev, ...response.files]);
      setSelectedFiles([]);
      setPreviews([]);
      setUploadProgress(100);
      
      if (onFilesUploaded) {
        onFilesUploaded(response.files);
      }
    } catch (error) {
      console.error('Upload error:', error);
      alert('Failed to upload files: ' + (error.response?.data?.error || error.message));
    } finally {
      setUploading(false);
      setTimeout(() => setUploadProgress(0), 1000);
    }
  };

  const handleSetPrimary = async (fileId) => {
    try {
      await setPrimaryImage(fileId);
      setFiles((prev) =>
        prev.map((f) => ({
          ...f,
          is_primary: f.id === fileId ? 1 : 0,
        }))
      );
      if (onFilesUploaded) {
        onFilesUploaded();
      }
    } catch (error) {
      console.error('Set primary error:', error);
      alert('Failed to set primary image');
    }
  };

  const handleDeleteFile = async (fileId) => {
    if (!window.confirm('Are you sure you want to delete this file?')) return;

    try {
      await deleteFile(fileId);
      setFiles((prev) => prev.filter((f) => f.id !== fileId));
      if (onFilesUploaded) {
        onFilesUploaded();
      }
    } catch (error) {
      console.error('Delete error:', error);
      alert('Failed to delete file');
    }
  };

  return (
    <Box>
      {/* Upload Area */}
      <Paper
        sx={{
          p: 3,
          border: '2px dashed',
          borderColor: 'primary.main',
          textAlign: 'center',
          cursor: 'pointer',
          backgroundColor: 'rgba(30, 30, 50, 0.8)',
          '&:hover': {
            backgroundColor: 'rgba(40, 40, 60, 0.9)',
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
        <CloudUploadIcon sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
        <Typography variant="h6" gutterBottom sx={{ color: '#ffffff' }}>
          Drag & Drop files here
        </Typography>
        <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)', mb: 2 }}>
          or click to select files
        </Typography>
        <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.5)' }}>
          Supports: Images (JPEG, PNG, GIF) and PDF files
        </Typography>
      </Paper>

      {/* Selected Files Preview */}
      {previews.length > 0 && (
        <Box sx={{ mt: 2 }}>
          <Typography variant="h6" gutterBottom sx={{ color: '#ffffff', mb: 2 }}>
            Selected Files ({previews.length})
          </Typography>
          <Grid container spacing={2}>
            {previews.map((preview, index) => (
              <Grid item xs={6} sm={4} md={3} key={index}>
                <Paper
                  sx={{
                    p: 1,
                    position: 'relative',
                    backgroundColor: 'rgba(30, 30, 50, 0.8)',
                  }}
                >
                  {preview.type === 'image' ? (
                    <Box
                      component="img"
                      src={preview.preview}
                      alt={preview.name}
                      sx={{
                        width: '100%',
                        height: 150,
                        objectFit: 'cover',
                        borderRadius: 1,
                      }}
                    />
                  ) : (
                    <Box
                      sx={{
                        width: '100%',
                        height: 150,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        backgroundColor: 'rgba(255,255,255,0.1)',
                        borderRadius: 1,
                      }}
                    >
                      <PictureAsPdfIcon sx={{ fontSize: 48, color: 'error.main' }} />
                    </Box>
                  )}
                  <Typography
                    variant="caption"
                    sx={{
                      display: 'block',
                      mt: 1,
                      color: 'rgba(255,255,255,0.7)',
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
          <Button
            variant="contained"
            onClick={handleUpload}
            disabled={uploading}
            sx={{ mt: 2 }}
          >
            {uploading ? 'Uploading...' : `Upload ${previews.length} File(s)`}
          </Button>
          {uploading && (
            <LinearProgress
              variant="determinate"
              value={uploadProgress}
              sx={{ mt: 1 }}
            />
          )}
        </Box>
      )}

      {/* Existing Files */}
      {files.length > 0 && (
        <Box sx={{ mt: 4 }}>
          <Typography variant="h6" gutterBottom sx={{ color: '#ffffff', mb: 2 }}>
            Uploaded Files ({files.length})
          </Typography>
          <Grid container spacing={2}>
            {files.map((file) => (
              <Grid item xs={6} sm={4} md={3} key={file.id}>
                <Paper
                  sx={{
                    p: 1,
                    position: 'relative',
                    backgroundColor: 'rgba(30, 30, 50, 0.8)',
                  }}
                >
                  {file.file_type === 'image' ? (
                    <Box
                      component="img"
                      src={getFileUrl(file.file_path)}
                      alt={file.file_name}
                      sx={{
                        width: '100%',
                        height: 150,
                        objectFit: 'cover',
                        borderRadius: 1,
                      }}
                    />
                  ) : (
                    <Box
                      sx={{
                        width: '100%',
                        height: 150,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        backgroundColor: 'rgba(255,255,255,0.1)',
                        borderRadius: 1,
                      }}
                    >
                      <PictureAsPdfIcon sx={{ fontSize: 48, color: 'error.main' }} />
                    </Box>
                  )}
                  <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                    <Typography
                      variant="caption"
                      sx={{
                        flex: 1,
                        color: 'rgba(255,255,255,0.7)',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {file.file_name}
                    </Typography>
                    {file.file_type === 'image' && (
                      <IconButton
                        size="small"
                        onClick={() => handleSetPrimary(file.id)}
                        sx={{ color: file.is_primary ? 'warning.main' : 'inherit' }}
                      >
                        {file.is_primary ? (
                          <StarIcon fontSize="small" />
                        ) : (
                          <StarBorderIcon fontSize="small" />
                        )}
                      </IconButton>
                    )}
                    <IconButton
                      size="small"
                      color="error"
                      onClick={() => handleDeleteFile(file.id)}
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Box>
                </Paper>
              </Grid>
            ))}
          </Grid>
        </Box>
      )}
    </Box>
  );
};

export default FileUpload;

