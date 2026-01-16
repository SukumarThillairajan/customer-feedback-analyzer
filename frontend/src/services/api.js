/**
 * API service layer for backend communication.
 */
import axios from 'axios';

// Determine API base URL
const getApiBaseUrl = () => {
  // Check if we're using Vite proxy (development)
  if (import.meta.env.DEV) {
    // In development, use proxy or direct URL
    return import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api';
  }
  // In production, use environment variable or default
  return import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api';
};

const API_BASE_URL = getApiBaseUrl();

console.log('API Base URL:', API_BASE_URL);

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10 second timeout
});

// Add admin token to requests (for protected endpoints)
const getAdminToken = () => {
  return import.meta.env.VITE_ADMIN_TOKEN || 'dev-token-change-in-production';
};

// Request interceptor for adding auth token
api.interceptors.request.use(
  (config) => {
    // Add token for aggregated endpoints
    if (config.url.includes('aggregated') || config.url.includes('all') || config.url.includes('product/')) {
      config.headers.Authorization = `Token ${getAdminToken()}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      // Server responded with error status
      const { status, data } = error.response;
      if (status === 401) {
        console.error('Unauthorized: Check admin token');
      } else if (status === 400) {
        console.error('Validation error:', data);
      } else if (status >= 500) {
        console.error('Server error:', data);
      }
    } else if (error.request) {
      // Request made but no response received
      console.error('Network error: No response from server');
      console.error('Request URL:', error.config?.url);
      console.error('Full error:', error);
      
      // Provide more helpful error message
      if (error.code === 'ECONNREFUSED' || error.message.includes('Network Error')) {
        error.userMessage = 'Cannot connect to backend server. Please ensure the Django server is running on http://localhost:8000';
      } else if (error.code === 'ETIMEDOUT') {
        error.userMessage = 'Request timed out. The server may be slow or unresponsive.';
      } else {
        error.userMessage = 'Network error. Please check your connection and ensure the backend server is running.';
      }
    } else {
      // Something else happened
      console.error('Error:', error.message);
      error.userMessage = error.message || 'An unexpected error occurred.';
    }
    return Promise.reject(error);
  }
);

/**
 * Submit feedback
 */
export const submitFeedback = async (feedbackData) => {
  const response = await api.post('/feedback/', feedbackData);
  return response.data;
};

/**
 * Get all feedback
 */
export const getAllFeedback = async () => {
  const response = await api.get('/feedback/all/');
  return response.data;
};

/**
 * Get feedback for a specific product
 */
export const getProductFeedback = async (productId) => {
  const response = await api.get(`/feedback/product/${productId}/`);
  return response.data;
};

/**
 * Get aggregated sentiment data
 */
export const getAggregatedSentiment = async () => {
  const response = await api.get('/feedback/aggregated_sentiment/');
  return response.data;
};

/**
 * Get aggregated theme data
 */
export const getAggregatedThemes = async () => {
  const response = await api.get('/feedback/aggregated_themes/');
  return response.data;
};

/**
 * Get aggregated theme data for a specific product
 */
export const getProductThemes = async (productId) => {
  const response = await api.get(`/feedback/aggregated/themes/${productId}/`);
  return response.data;
};

/**
 * Get theme counts grouped by product
 */
export const getThemesByProduct = async () => {
  const response = await api.get('/feedback/themes_by_product/');
  return response.data;
};

export default api;
