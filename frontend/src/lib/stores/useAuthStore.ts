import { createStore } from "zustand";

export interface AuthState {
  token: string | null;
  isAuthenticated: boolean;
}

export interface AuthActions {
  setToken: (token: string | null) => void;
  clearToken: () => void;
}

export type AuthStore = AuthState & AuthActions;

const getInitialToken = () => {
  if (typeof window !== "undefined") {
    return localStorage.getItem("uscornie_token") || null;
  }
  return null;
};

export const createAuthStore = (
  initState: AuthState = {
    token: getInitialToken(),
    isAuthenticated: !!getInitialToken(),
  },
) => {
  return createStore<AuthStore>()((set) => ({
    ...initState,
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
};
