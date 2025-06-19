import axiosInstance from "../features/auth/axiosInstance";


// Get user settings
export const fetchUserSettings = async () => {
  try {
    const response = await axiosInstance.get('/settings/');
    return response.data;
  } catch (error) {
    console.error('Error fetching user settings:', error);
    throw error;
  }
};

// Update user settings
export const updateUserSettings = async (settingsData) => {
  try {
    const response = await axiosInstance.put('/settings/', settingsData);
    return response.data;
  } catch (error) {
    console.error('Error updating user settings:', error);
    throw error;
  }
};

// Change password
export const changePassword = async (passwordData) => {
  try {
     const response = await axiosInstance.post('/settings/change-password/', passwordData);
    return response.data;
  } catch (error) {
    console.error('Error changing password:', error);
    throw error;
  }
};

// Get available languages
export const fetchAvailableLanguages = async () => {
  try {
    const response = await axiosInstance.get('/languages/');
    return response.data;
  } catch (error) {
    console.error('Error fetching available languages:', error);
    throw error;
  }
};

// Delete account
export const deleteAccount = async () => {
  try {
    const response = await axiosInstance.post('/settings/delete-account/');
    return response.data;
  } catch (error) {
    console.error('Error deleting account:', error);
    throw error;
  }
};