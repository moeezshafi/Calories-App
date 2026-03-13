import axios from 'axios';
import { API_URL } from '../config/constants';

export const checkServerHealth = async (): Promise<boolean> => {
  try {
    console.log('Checking server health at:', `${API_URL}/api/health`);
    const response = await axios.get(`${API_URL}/api/health`, {
      timeout: 5000,
    });
    console.log('Server health check response:', response.data);
    return response.data?.status === 'healthy';
  } catch (error: any) {
    console.log('Server health check failed:', {
      message: error.message,
      code: error.code,
      response: error.response?.data,
    });
    return false;
  }
};
