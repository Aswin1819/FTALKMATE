// src/utils/axiosInstance.js
import axios from 'axios';
import { refreshToken } from './tokenUtils';

const baseURL = 'http://localhost:8000'; // update if your backend is hosted elsewhere

const axiosInstance = axios.create({
  baseURL,
  withCredentials: true, // Send cookies with every request
});

// Response interceptor to handle token refresh
axiosInstance.interceptors.response.use(
  response => response,
  async error => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        await refreshToken();
        return axiosInstance(originalRequest);
      } catch (err) {
        return Promise.reject(err);
      }
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;
