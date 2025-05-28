// src/utils/tokenUtils.js
import axios from 'axios';

export const refreshToken = async () => {
  try {
    await axios.post(
      'http://localhost:8000/users/token/refresh/',
      {},
      { withCredentials: true }
    );
    console.log("Access token refreshed.");
  } catch (err) {
    console.error("Refresh token expired or invalid", err);
    throw err;
  }
};
