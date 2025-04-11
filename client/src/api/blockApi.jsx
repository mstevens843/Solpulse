import { api } from './apiConfig';

export const blockUser = (userId) => api.post(`/blocked-muted/block/${userId}`);
export const unblockUser = (userId) => api.delete(`/blocked-muted/block/${userId}`);
export const getBlockedUsers = () => api.get('/blocked-muted/block');
export const getBlockedByUsers = () => api.get('/blocked-muted/block/by-others');

export const BlockAPI = {
  blockUser,
  unblockUser,
  getBlockedUsers,
  getBlockedByUsers
};