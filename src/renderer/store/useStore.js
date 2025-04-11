import create from 'zustand';
import { logoutUser } from '@/renderer/api/electronAPI';

const useStore = create((set) => ({
  user: null,
  token: null,
  setUserAndToken: (user, token) => set({ user, token }),
  setUser: (user) => set({ user }),
  logout: async () => {
    set({ user: null, token: null });
    await logoutUser();
  },
}));

export default useStore;