import api from "@/api";

export const authService = {
  async loginWithGoogle(credential: string) {
    const res = await api.post("/auth/google", { credential });
    return res.data;
  },
};
