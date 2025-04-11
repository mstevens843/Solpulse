import { api } from './apiConfig';

export const muteUser = (userId) => api.post(`/blocked-muted/mute/${userId}`);
export const unmuteUser = (userId) => api.delete(`/blocked-muted/mute/${userId}`);
export const getMutedUsers = () => api.get('/blocked-muted/mute');

export const MuteAPI = {
  muteUser,
  unmuteUser,
  getMutedUsers
};
  