// src/services/api.js
import axios from 'axios';
import { createProxyUrl } from './proxy';

const API_BASE_URL = 'https://staging.odexglobal.com/RS/iVGMService/json';

// Use proxy for development
const getApiUrl = () => {
  if (import.meta.env.DEV) {
    return createProxyUrl(API_BASE_URL);
  }
  return API_BASE_URL;
};

const api = axios.create({
  baseURL: getApiUrl(),
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000, // 30 seconds timeout
});

export const authAPI = {
  login: (credentials) => api.post('/getVGMAccessInfo', credentials),
};

export const vgmAPI = {
  submit: (vgmData) => api.post('/saveVgmWb', vgmData),
  getStatus: (statusData) => api.post('/getVGMReqInfo', statusData),
};

// Enhanced error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error);
    
    if (error.code === 'ERR_NETWORK') {
      throw new Error('Network error: Unable to connect to ODeX server. Please check your internet connection.');
    }
    
    if (error.response) {
      // Server responded with error status
      const message = error.response.data?.message || `Server error: ${error.response.status}`;
      throw new Error(message);
    }
    
    throw error;
  }
);

export default api;