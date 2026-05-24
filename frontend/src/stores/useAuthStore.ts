import { defineStore } from "pinia";

export const useAuthStore = defineStore("auth", {
  state: () => ({
    token: (localStorage.getItem("uscornie_token") || null) as string | null,
  }),
  getters: {
    isAuthenticated: (state) => !!state.token,
  },
  actions: {
    setToken(token: string | null) {
      this.token = token;
      if (token) {
        localStorage.setItem("uscornie_token", token);
      } else {
        localStorage.removeItem("uscornie_token");
      }
    },
    clearToken() {
      this.token = null;
      localStorage.removeItem("uscornie_token");
    },
  },
});
