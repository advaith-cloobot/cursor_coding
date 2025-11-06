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

export default api;

