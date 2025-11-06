import React from 'react';
import {
  Box,
  Typography,
  Paper,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material';
import HistoryIcon from '@mui/icons-material/History';
import AddCircleIcon from '@mui/icons-material/AddCircle';

const EditLogView = ({ editLogs }) => {
  if (!editLogs || editLogs.length === 0) {
    return (
      <Box sx={{ textAlign: 'center', py: 4 }}>
        <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)' }}>
          No edit history available
        </Typography>
      </Box>
    );
  }

  const formatFieldName = (field) => {
    return field.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase());
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <HistoryIcon sx={{ mr: 1, color: '#64b5f6' }} />
        <Typography variant="h6" sx={{ color: '#ffffff', fontWeight: 'bold' }}>
          Edit History Log
        </Typography>
      </Box>

      <TableContainer component={Paper} sx={{ backgroundColor: 'rgba(30, 30, 50, 0.8)' }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell sx={{ color: '#ffffff', fontWeight: 'bold' }}>Date & Time</TableCell>
              <TableCell sx={{ color: '#ffffff', fontWeight: 'bold' }}>Type</TableCell>
              <TableCell sx={{ color: '#ffffff', fontWeight: 'bold' }}>Edited By</TableCell>
              <TableCell sx={{ color: '#ffffff', fontWeight: 'bold' }}>Fields Changed</TableCell>
              <TableCell sx={{ color: '#ffffff', fontWeight: 'bold' }}>Changes</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {editLogs.map((log, index) => {
              const isCreation = log.is_creation || (Object.keys(log.old_values || {}).length === 0 && log.edited_fields && log.edited_fields.length > 0);
              
              return (
                <TableRow 
                  key={log.id || `log-${index}`}
                  sx={{
                    '&:hover': {
                      backgroundColor: 'rgba(255, 255, 255, 0.05)',
                    },
                    borderLeft: isCreation ? '4px solid #4caf50' : '4px solid #64b5f6',
                  }}
                >
                  <TableCell sx={{ color: 'rgba(255,255,255,0.9)' }}>
                    {new Date(log.edited_at).toLocaleString()}
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      {isCreation ? (
                        <AddCircleIcon sx={{ color: '#4caf50', fontSize: 18 }} />
                      ) : (
                        <HistoryIcon sx={{ color: '#64b5f6', fontSize: 18 }} />
                      )}
                      <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.9)' }}>
                        {isCreation ? 'Created' : 'Edited'}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell sx={{ color: 'rgba(255,255,255,0.9)' }}>
                    {log.edited_by || 'System'}
                  </TableCell>
                  <TableCell>
                    {log.edited_fields && log.edited_fields.length > 0 ? (
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                        {log.edited_fields.map((field) => (
                          <Chip
                            key={field}
                            label={formatFieldName(field)}
                            size="small"
                            sx={{
                              backgroundColor: isCreation 
                                ? 'rgba(76, 175, 80, 0.2)' 
                                : 'rgba(25, 118, 210, 0.2)',
                              color: isCreation ? '#81c784' : '#64b5f6',
                              border: `1px solid ${isCreation ? 'rgba(76, 175, 80, 0.5)' : 'rgba(25, 118, 210, 0.5)'}`,
                              fontSize: '0.7rem',
                              height: '24px',
                            }}
                          />
                        ))}
                      </Box>
                    ) : (
                      <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.5)' }}>
                        -
                      </Typography>
                    )}
                  </TableCell>
                  <TableCell>
                    {log.edited_fields && log.edited_fields.length > 0 ? (
                      <Box>
                        {log.edited_fields.map((field, fieldIndex) => (
                          <Box key={field} sx={{ mb: fieldIndex < log.edited_fields.length - 1 ? 1 : 0 }}>
                            <Typography variant="caption" sx={{ color: isCreation ? '#81c784' : '#64b5f6', fontWeight: 'bold', display: 'block' }}>
                              {formatFieldName(field)}:
                            </Typography>
                            <Box sx={{ pl: 1 }}>
                              {!isCreation && log.old_values && log.old_values[field] !== undefined && (
                                <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.6)', display: 'block' }}>
                                  Old: {log.old_values[field] || '(empty)'}
                                </Typography>
                              )}
                              <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.9)', display: 'block' }}>
                                {isCreation ? 'Value' : 'New'}: {log.new_values[field] || '(empty)'}
                              </Typography>
                            </Box>
                          </Box>
                        ))}
                      </Box>
                    ) : (
                      <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.5)' }}>
                        -
                      </Typography>
                    )}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default EditLogView;

