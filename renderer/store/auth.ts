import { create } from "zustand";

interface AuthState {
  user: any | null;
  token: string | null;
  loading: boolean;
  error: string | null;
  login: (credentials: { email: string; password: string }) => Promise<boolean>;
  logout: () => void;
  verify: () => Promise<void>;
}

export const useAuth = create<AuthState>((set) => ({
  user: null,
  token: null,
  loading: false,
  error: null,
  login: async (credentials) => {
    set({ loading: true, error: null });
    try {
      // @ts-ignore
      const res = await window.Electron.auth.login(credentials);
      if (res.success && res.data && res.data.user && res.data.token) {
        set({ user: res.data.user, token: res.data.token, loading: false });
        return true;
      } else {
        set({ error: res.error || "Credenciales incorrectas", loading: false });
        return false;
      }
    } catch (e: any) {
      set({ error: e.message || "Error de conexión", loading: false });
      return false;
    }
  },
  logout: () => {
    // @ts-ignore
    window.Electron.auth.logout();
    set({ user: null, token: null });
  },
  verify: async () => {
    set({ loading: true });
    try {
      // @ts-ignore
      const res = await window.Electron.auth.verify();
      if (res.success && res.user) {
        set({ user: res.user, token: res.token || null, loading: false });
      } else {
        set({ user: null, token: null, loading: false });
      }
    } catch {
      set({ user: null, token: null, loading: false });
    }
  },
}));
