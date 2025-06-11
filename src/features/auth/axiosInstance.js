import axios from 'axios';

const axiosInstance = axios.create({
  baseURL: 'http://127.0.0.1:8000/api/users',
  withCredentials: true,  // Required to send cookies
});

axiosInstance.interceptors.request.use(
  (config) => {
    // You can add additional headers here if needed
    return config;
  },
  (error) => Promise.reject(error)
);

// Global flag to prevent multiple simultaneous refresh attempts
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  
  failedQueue = [];
};

// Response interceptor to auto-refresh access token on 401
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // If token expired and we haven't retried yet
    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !originalRequest.url.includes('refresh') &&
      !originalRequest.url.includes('login') &&
      !originalRequest.url.includes('register')
    ) {
      
      if (isRefreshing) {
        // If refresh is already in progress, queue this request
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then(() => {
          return axiosInstance(originalRequest);
        }).catch((err) => {
          return Promise.reject(err);
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        // Create a separate axios instance for token refresh to avoid base URL issues
        const refreshResponse = await axios.post(
          'http://127.0.0.1:8000/api/users/token/refresh/', // Full URL
          {}, // Empty body since token comes from cookie
          {
            withCredentials: true,
            headers: {
              'Content-Type': 'application/json',
            }
          }
        );
        
        console.log('Token refresh successful:', refreshResponse.data);
        
        // Process queued requests
        processQueue(null, refreshResponse.data.access);
        isRefreshing = false;
        
        // Retry the original request
        return axiosInstance(originalRequest);
        
      } catch (refreshError) {
        console.error('Token refresh failed:', refreshError);
        console.error('Refresh error details:', refreshError.response?.data);
        
        // Process queued requests with error
        processQueue(refreshError, null);
        isRefreshing = false;
        
        // Clear cookies and redirect to login
        // You can dispatch a logout action here instead
        localStorage.clear(); // Clear any local storage
        window.location.href = '/auth';
        
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;