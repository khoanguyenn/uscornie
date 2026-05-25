import api from "@/lib/api";

export const authService = {
  async loginWithGoogle(credential: string) {
    const res = await api.post("/auth/google", { credential });
    return res.data;
  },
};
