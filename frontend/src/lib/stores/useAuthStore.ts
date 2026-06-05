import { create } from "zustand";

export interface AuthState {
  token: string | null;
  isAuthenticated: boolean;
}

export interface AuthActions {
  setToken: (token: string | null) => void;
  clearToken: () => void;
}

export type AuthStore = AuthState & AuthActions;

export const useAuthStore = create<AuthStore>()((set) => ({
  token: null,
  isAuthenticated: false,
  setToken: (token) => {
    set({ token, isAuthenticated: !!token });
  },
  clearToken: () => {
    set({ token: null, isAuthenticated: false });
  },
}));
