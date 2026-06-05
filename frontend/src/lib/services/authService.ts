import api from "@/lib/api";

export const authService = {
  async loginWithGoogle(credential: string) {
    const res = await api.post("/auth/google", { credential });
    return res.data;
  },
  async refreshSession(): Promise<{ access_token: string }> {
    const res = await api.post("/auth/refresh");
    return res.data;
  },
};
