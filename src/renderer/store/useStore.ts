import { create } from 'zustand';
import { logoutUser } from '@/renderer/api/electronAPI';

interface User {
  id: string;
  email: string;
  name: string;
  role: string;
}

interface StoreState {
  user: User | null;
  token: string | null;
  setUserAndToken: (user: User, token: string) => void;
  setUser: (user: User) => void;
  logout: () => Promise<void>;
}

const useStore = create<StoreState>((set) => ({
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