import { create } from "zustand";

interface AuthState {
  token: string | null;
  isAuthenticated: boolean;
  setToken: (token: string | null) => void;
  clearToken: () => void;
}

const getInitialToken = () => {
  if (typeof window !== "undefined") {
    return localStorage.getItem("uscornie_token") || null;
  }
  return null;
};

export const useAuthStore = create<AuthState>((set) => ({
  token: getInitialToken(),
  isAuthenticated: !!getInitialToken(),
  setToken: (token) => {
    if (typeof window !== "undefined") {
      if (token) {
        localStorage.setItem("uscornie_token", token);
      } else {
        localStorage.removeItem("uscornie_token");
      }
    }
    set({ token, isAuthenticated: !!token });
  },
  clearToken: () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("uscornie_token");
    }
    set({ token: null, isAuthenticated: false });
  },
}));
