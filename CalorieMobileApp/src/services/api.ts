import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from '../config/constants';

console.log('API Configuration:', {
  baseURL: API_URL,
  timestamp: new Date().toISOString(),
});

const api = axios.create({
  baseURL: API_URL,
  timeout: 30000,
  headers: { 
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

api.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  console.log('API Request:', {
    method: config.method,
    url: config.url,
    baseURL: config.baseURL,
    fullURL: `${config.baseURL}${config.url}`,
  });
  return config;
});

api.interceptors.response.use(
  (response) => {
    console.log('API Response Success:', {
      url: response.config.url,
      status: response.status,
    });
    return response;
  },
  async (error) => {
    console.log('API Response Error:', {
      url: error.config?.url,
      message: error.message,
      code: error.code,
      status: error.response?.status,
      data: error.response?.data,
    });

    if (error.response?.status === 401) {
      await AsyncStorage.removeItem('token');
    }

    // Extract user-friendly error message
    const message =
      error.response?.data?.error ||
      error.response?.data?.message ||
      error.response?.data?.errors ||
      (error.code === 'ECONNABORTED' ? 'Request timed out. Please try again.' : null) ||
      (error.message === 'Network Error' ? 'Cannot connect to server. Check your network.' : null) ||
      'Something went wrong. Please try again.';

    // Attach parsed message for easy access
    error.userMessage = message;

    return Promise.reject(error);
  }
);

export default api;
