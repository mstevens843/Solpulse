import { api } from './apiConfig';

export const blockUser = (userId) => api.post(`/block/${userId}`);
export const unblockUser = (userId) => api.delete(`/block/${userId}`);
export const getBlockedUsers = () => api.get('/block');
export const getBlockedByUsers = () => api.get('/block/by-others');

export const BlockAPI = {
    blockUser,
    unblockUser,
    getBlockedUsers,
    getBlockedByUsers
  };