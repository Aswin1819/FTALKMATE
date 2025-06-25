import axios from 'axios';
import axiosInstance from '../features/auth/axiosInstance';



export const roomApi = {
  // Get live rooms
  getLiveRooms: async (params = {}) => {
    try {
      const response = await axiosInstance.get(
        'http://127.0.0.1:8000/api/rooms/live/', { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching live rooms:', error);
      throw error;
    }
  },

  // Create room
  createRoom: async (roomData) => {
    try {
      const response = await axiosInstance.post(
        'http://127.0.0.1:8000/api/rooms/create/', roomData);
      return response.data;
    } catch (error) {
      console.error('Error creating room:', error);
      throw error;
    }
  },

  // Get room details
  getRoomDetails: async (roomId) => {
    try {
      const response = await axiosInstance.get(
        `http://127.0.0.1:8000/api/rooms/${roomId}/`);
      return response.data;
    } catch (error) {
      console.error('Error fetching room details:', error);
      throw error;
    }
  },

  // Join room (for private rooms)
  joinRoom: async (roomId, password = '') => {
    try {
      const response = await axiosInstance.post(
        `http://127.0.0.1:8000/api/rooms/${roomId}/join/`, {
          password
        });
      return response.data;
    } catch (error) {
      console.error('Error joining room:', error);
      throw error;
    }
  },

  // Leave room
  leaveRoom: async (roomId) => {
    try {
      const response = await axiosInstance.post(
        `http://127.0.0.1:8000/api/rooms/${roomId}/leave/`);
      return response.data;
    } catch (error) {
      console.error('Error leaving room:', error);
      throw error;
    }
  },

  // End room (host only)
  endRoom: async (roomId) => {
    try {
      const response = await axiosInstance.post(
        `http://127.0.0.1:8000/api/rooms/${roomId}/end/`);
      return response.data;
    } catch (error) {
      console.error('Error ending room:', error);
      throw error;
    }
  },

  // Get room participants
  getRoomParticipants: async (roomId) => {
    try {
      const response = await axiosInstance.get(
        `http://127.0.0.1:8000/api/rooms/${roomId}/participants/`);
      return response.data;
    } catch (error) {
      console.error('Error fetching room participants:', error);
      throw error;
    }
  },

  // Get room messages
  getRoomMessages: async (roomId) => {
    try {
      const response = await axiosInstance.get(
        `http://127.0.0.1:8000/api/rooms/${roomId}/messages/`);
      return response.data;
    } catch (error) {
      console.error('Error fetching room messages:', error);
      throw error;
    }
  },

  // Get user's rooms
  getMyRooms: async () => {
    try {
      const response = await axiosInstance.get(
        'http://127.0.0.1:8000/api/rooms/my-rooms/');
      return response.data;
    } catch (error) {
      console.error('Error fetching my rooms:', error);
      throw error;
    }
  },

  // Get tags
  getTags: async () => {
    try {
      const response = await axiosInstance.get(
        'http://127.0.0.1:8000/api/rooms/tags/');
      return response.data;
    } catch (error) {
      console.error('Error fetching tags:', error);
      throw error;
    }
  },

  // Get room types
  getRoomTypes: async () => {
    try {
      const response = await axiosInstance.get(
        'http://127.0.0.1:8000/api/rooms/roomtypes/');
      return response.data;
    } catch (error) {
      console.error('Error fetching room types:', error);
      throw error;
    }
  },

  getLanguages: async () => {
    try {
      const response = await axiosInstance.get('/languages/');
      return response.data;
    } catch (error) {
      console.error('Error fetching languages:', error);
      throw error;
    }
  }

};


export default roomApi;