import axios from 'axios';

// Backup schedule
export const getBackupSchedule = async () => {
  const res = await axios.get('/api/settings/backup-schedule');
  return res.data;
};
export const updateBackupSchedule = async (data: { enabled: boolean; intervalHours: number }) => {
  const res = await axios.post('/api/settings/backup-schedule', data);
  return res.data;
};

// SMTP config
export const getSmtpConfig = async () => {
  const res = await axios.get('/api/users/smtp-config');
  return res.data;
};
export const updateSmtpConfig = async (data: any) => {
  const res = await axios.post('/api/users/smtp-config', data);
  return res.data;
};
export const testSmtpConfig = async (data: any) => {
  const res = await axios.post('/api/users/smtp-test', data);
  return res.data;
};

// Public dashboard
export const getPublicDashboardStatus = async () => {
  const res = await axios.get('/api/settings/public-dashboard');
  return res.data;
};
export const updatePublicDashboardStatus = async (enabled: boolean) => {
  const res = await axios.post('/api/settings/public-dashboard', { enabled });
  return res.data;
};
