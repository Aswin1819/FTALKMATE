import axiosInstance from '../features/auth/axiosInstance';

export const fetchNotifications = async () => {
  const response = await axiosInstance.get('/notifications/');
  return response.data;
};
