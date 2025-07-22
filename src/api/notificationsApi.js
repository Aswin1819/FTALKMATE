import axiosInstance from '../features/auth/axiosInstance';
import adminInstance from '../features/auth/adminInstance';

export const fetchNotifications = async () => {
  const response = await axiosInstance.get('/notifications/');
  return response.data;
};

export const fetchAdminNotifications = async () => {
  const response = await adminInstance.get('/notifications/');
  return response.data;
}
