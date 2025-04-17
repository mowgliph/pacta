import axios from 'axios';

const API_URL = '/api/notifications';

export const getNotifications = async () => {
  const res = await axios.get(API_URL);
  return res.data;
};

export const markNotificationRead = async (id: number) => {
  const res = await axios.patch(`${API_URL}/${id}/read`);
  return res.data;
};

export const markAllNotificationsRead = async () => {
  const res = await axios.post(`${API_URL}/mark-all-read`);
  return res.data;
};

export const getNotificationPreferences = async () => {
  const res = await axios.get(`${API_URL}/preferences`);
  return res.data;
};

export const updateNotificationPreference = async (type: string, data: { email: boolean; inApp: boolean; system: boolean }) => {
  const res = await axios.put(`${API_URL}/preferences/${type}`, data);
  return res.data;
};
