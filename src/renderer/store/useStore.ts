import { create } from 'zustand';
import { electronAPI } from '@/renderer/api/electronAPI';

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

interface StoreState {
  user: User | null;
  token: string | null;
  setUserAndToken: (user: User, token: string) => void;
  setUser: (user: User) => void;
  updateUser: (userData: Partial<User>) => Promise<void>;
  logout: () => Promise<void>;
}

const useStore = create<StoreState>((set) => ({
  user: null,
  token: null,
  setUserAndToken: (user, token) => set({ user, token }),
  setUser: (user) => set({ user }),
  updateUser: async (userData: Partial<User>): Promise<void> => {
    try {
      const currentUser = useStore.getState().user;
      if (!currentUser) throw new Error('No hay usuario autenticado');
      
      // Llamar a la API para actualizar el usuario usando el método auth
      await electronAPI.auth.updateProfile(userData);
      
      // Actualizar el estado local con los datos actualizados
      set({ 
        user: { 
          ...currentUser, 
          ...userData 
        } 
      });
    } catch (error) {
      console.error('Error actualizando usuario:', error);
      throw error;
    }
  },
  logout: async () => {
    set({ user: null, token: null });
    await electronAPI.auth.logout();
  },
}));

export default useStore;