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
  Autocomplete,
} from '@mui/material';
import { getAllLockers, getLockerAssets } from '../services/api';

const TransactionForm = ({ open, onClose, onSubmit, initialData, allAssets = [] }) => {
  const [formData, setFormData] = useState({
    asset_id: '',
    transaction_type: 'depositing',
    reason: '',
    responsible_person: '',
    transaction_date: new Date().toISOString().split('T')[0],
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        asset_id: initialData.asset_id || '',
        transaction_type: initialData.transaction_type || 'depositing',
        reason: initialData.reason || '',
        responsible_person: initialData.responsible_person || '',
        transaction_date: initialData.transaction_date 
          ? initialData.transaction_date.split('T')[0] 
          : new Date().toISOString().split('T')[0],
      });
    } else {
      setFormData({
        asset_id: '',
        transaction_type: 'depositing',
        reason: '',
        responsible_person: '',
        transaction_date: new Date().toISOString().split('T')[0],
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

  const handleAssetChange = (event, value) => {
    setFormData((prev) => ({
      ...prev,
      asset_id: value ? value.id : '',
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <form onSubmit={handleSubmit}>
        <DialogTitle>
          {initialData ? 'Edit Transaction' : 'Add New Transaction'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <Autocomplete
              options={allAssets}
              getOptionLabel={(option) => `${option.name} (${option.asset_type})`}
              value={allAssets.find((a) => a.id === formData.asset_id) || null}
              onChange={handleAssetChange}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Linked Asset"
                  required
                  placeholder="Search for an asset..."
                />
              )}
            />

            <FormControl fullWidth required>
              <InputLabel>Transaction Type</InputLabel>
              <Select
                name="transaction_type"
                value={formData.transaction_type}
                onChange={handleChange}
                label="Transaction Type"
              >
                <MenuItem value="depositing">Depositing in locker</MenuItem>
                <MenuItem value="withdrawing">Withdrawing from locker</MenuItem>
                <MenuItem value="permanently_remove">Permanently remove</MenuItem>
              </Select>
            </FormControl>

            <TextField
              name="reason"
              label="Reason"
              value={formData.reason}
              onChange={handleChange}
              fullWidth
              multiline
              rows={3}
              placeholder="Explain the purpose of this transaction..."
            />

            <TextField
              name="responsible_person"
              label="Who is responsible"
              value={formData.responsible_person}
              onChange={handleChange}
              fullWidth
              placeholder="Name of the person responsible"
            />

            <TextField
              name="transaction_date"
              label="Transaction Date"
              type="date"
              value={formData.transaction_date}
              onChange={handleChange}
              fullWidth
              InputLabelProps={{
                shrink: true,
              }}
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={onClose} color="inherit">
            Cancel
          </Button>
          <Button type="submit" variant="contained" color="primary">
            {initialData ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default TransactionForm;

