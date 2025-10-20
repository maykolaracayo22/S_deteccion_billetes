import axios from 'axios';
import { PredictionResponse, ApiError } from '../types';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
const APP_API_KEY = import.meta.env.VITE_APP_API_KEY;

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Authorization': `Bearer ${APP_API_KEY}`,
    'Content-Type': 'multipart/form-data',
  },
});

export const predictImage = async (imageFile: File): Promise<PredictionResponse> => {
  const formData = new FormData();
  formData.append('file', imageFile);
  formData.append('include_base64', 'true');

  try {
    const response = await api.post<PredictionResponse>('/api/v1/predict', formData);
    return response.data;
  } catch (error: any) {
    if (error.response?.data) {
      throw new Error(error.response.data.detail || error.response.data.message || 'Error del servidor');
    }
    throw new Error('Error de conexión con el servidor');
  }
};

export const checkHealth = async (): Promise<boolean> => {
  try {
    const response = await api.get('/api/v1/health');
    return response.status === 200;
  } catch {
    return false;
  }
};

export default api;