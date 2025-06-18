import axios from 'axios';

const adminInstance = axios.create({
  baseURL: 'http://localhost:8000/api/admin',
  withCredentials: true,
  headers: {
    'Accept': 'application/json',
    'Content-Type': 'application/json',
  },
});

adminInstance.interceptors.request.use(
  (config) => {
    // You can add additional headers here if needed
    return config;
  },
  (error) => Promise.reject(error)
);

// Token refresh logic
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve();
    }
  });
  failedQueue = [];
};

adminInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !originalRequest.url.includes('refresh') &&
      !originalRequest.url.includes('login')
    ) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then(() => adminInstance(originalRequest));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        // This will use the admin_refresh_token cookie automatically
        await adminInstance.post('/token/refresh/', {});
        processQueue(null);
        isRefreshing = false;
        return adminInstance(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError);
        isRefreshing = false;
        // Optionally, redirect to login or dispatch logout
        window.location.href = '/admin/login';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default adminInstance;