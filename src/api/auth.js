
import axiosInstance from '../features/auth/axiosInstance';

export const googleSignin = async (idToken) => {
  try {
    const response = await axiosInstance.post('/google-login/', { id_token: idToken });
    console.log('Google Sign-In Response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Google Sign-In Error:', error.response?.data || error.message);
    throw error;
  }
};
