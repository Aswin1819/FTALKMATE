import axiosInstance from "../features/auth/axiosInstance";

export const followApi = {
    followUser: async (userId) => {
      const response = await axiosInstance.post(`/follow/${userId}/`);
      return response.data;
    },
    unfollowUser: async (userId) => {
      const response = await axiosInstance.post(`/unfollow/${userId}/`);
      return response.data;
    },
    getFollowers: async () => {
      const response = await axiosInstance.get(`/followers/`);
      return response.data;
    },
    getFollowing: async () => {
      const response = await axiosInstance.get(`/following/`);
      return response.data;
    }
  };
export default followApi;