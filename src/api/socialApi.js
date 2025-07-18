import axiosInstance from "../features/auth/axiosInstance";

export const socialApi = {
    // List endpoints (paginated)
    getFollowers: async (userId, params = {}) => {
      const url = userId ? `/social/${userId}/followers/` : `/social/followers/`;
      const res = await axiosInstance.get(url, { params });
      return res.data; // {count,next,previous,results:[...FollowCard...]}
    },
    getFollowing: async (userId, params = {}) => {
      const url = userId ? `/social/${userId}/following/` : `/social/following/`;
      const res = await axiosInstance.get(url, { params });
      return res.data;
    },
    getFriends: async (userId, params = {}) => {
      const url = userId ? `/social/${userId}/friends/` : `/social/friends/`;
      const res = await axiosInstance.get(url, { params });
      return res.data;
    },
  
    // Follow / Unfollow with structured response
    followUser: async (userId) => {
      const res = await axiosInstance.post(`/social/follow/${userId}/`);
      return res.data; // SocialActionResponse payload
    },
    unfollowUser: async (userId) => {
      const res = await axiosInstance.post(`/social/unfollow/${userId}/`);
      return res.data;
    },
  };
  
  export default socialApi;