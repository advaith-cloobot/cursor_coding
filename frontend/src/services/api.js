import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// ============= LOCKER API =============

export const getAllLockers = async () => {
  const response = await api.get('/lockers');
  return response.data;
};

export const getLocker = async (lockerId) => {
  const response = await api.get(`/lockers/${lockerId}`);
  return response.data;
};

export const createLocker = async (lockerData) => {
  const response = await api.post('/lockers', lockerData);
  return response.data;
};

export const updateLocker = async (lockerId, lockerData) => {
  const response = await api.put(`/lockers/${lockerId}`, lockerData);
  return response.data;
};

export const deleteLocker = async (lockerId) => {
  const response = await api.delete(`/lockers/${lockerId}`);
  return response.data;
};

// ============= ASSET API =============

export const getLockerAssets = async (lockerId) => {
  const response = await api.get(`/lockers/${lockerId}/assets`);
  return response.data;
};

export const getAsset = async (assetId) => {
  const response = await api.get(`/assets/${assetId}`);
  return response.data;
};

export const createAsset = async (lockerId, assetData) => {
  const response = await api.post(`/lockers/${lockerId}/assets`, assetData);
  return response.data;
};

export const updateAsset = async (assetId, assetData) => {
  const response = await api.put(`/assets/${assetId}`, assetData);
  return response.data;
};

export const deleteAsset = async (assetId) => {
  const response = await api.delete(`/assets/${assetId}`);
  return response.data;
};

// ============= FILE UPLOAD API =============

export const uploadAssetFiles = async (assetId, files) => {
  const formData = new FormData();
  files.forEach((file) => {
    formData.append('files', file);
  });
  const response = await api.post(`/assets/${assetId}/files`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

export const getAssetFiles = async (assetId) => {
  const response = await api.get(`/assets/${assetId}/files`);
  return response.data;
};

export const deleteFile = async (fileId) => {
  const response = await api.delete(`/files/${fileId}`);
  return response.data;
};

export const setPrimaryImage = async (fileId) => {
  const response = await api.put(`/files/${fileId}/set-primary`);
  return response.data;
};

export const getFileUrl = (filePath) => {
  // Extract the relative path from the full file path
  const relativePath = filePath.replace(/.*uploads[\\/]/, '').replace(/\\/g, '/');
  return `${API_BASE_URL}/uploads/${relativePath}`;
};

// ============= TRANSACTION API =============

export const getTransactions = async (filters = {}) => {
  const params = new URLSearchParams();
  if (filters.asset_id) params.append('asset_id', filters.asset_id);
  if (filters.asset_type) params.append('asset_type', filters.asset_type);
  const response = await api.get(`/transactions?${params.toString()}`);
  return response.data;
};

export const getTransaction = async (transactionId) => {
  const response = await api.get(`/transactions/${transactionId}`);
  return response.data;
};

export const createTransaction = async (transactionData) => {
  const response = await api.post('/transactions', transactionData);
  return response.data;
};

export const updateTransaction = async (transactionId, transactionData) => {
  const response = await api.put(`/transactions/${transactionId}`, transactionData);
  return response.data;
};

export const deleteTransaction = async (transactionId) => {
  const response = await api.delete(`/transactions/${transactionId}`);
  return response.data;
};

export const getAssetTransactions = async (assetId) => {
  const response = await api.get(`/assets/${assetId}/transactions`);
  return response.data;
};

// ============= EDIT LOG API =============

export const getAssetEditLog = async (assetId) => {
  const response = await api.get(`/assets/${assetId}/edit-log`);
  return response.data;
};

// ============= DASHBOARD API =============

export const getLockerDashboard = async (lockerId) => {
  const response = await api.get(`/lockers/${lockerId}/dashboard`);
  return response.data;
};

export default api;

