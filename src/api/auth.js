
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


export const fetchAccessToken = async ()=> {
  try {
    const response = await axiosInstance.get('/get-access-token/');
    return response.data.token;
  } catch (error) {
    console.log("Failed to fetch access token from backend:",error);
    return null;
  }
}