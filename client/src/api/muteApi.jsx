import { api } from './apiConfig';

export const muteUser = (userId) => api.post(`/mute/${userId}`);
export const unmuteUser = (userId) => api.delete(`/mute/${userId}`);
export const getMutedUsers = () => api.get('/mute');


export const MuteAPI = {
    muteUser,
    unmuteUser,
    getMutedUsers
  };

  