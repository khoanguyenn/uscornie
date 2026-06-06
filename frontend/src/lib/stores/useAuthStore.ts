import { create } from "zustand";
import { combine } from "zustand/middleware";

export const useAuthStore = create(
  combine(
    {
      token: null as string | null,
      isAuthenticated: false,
    },
    (set) => ({
      actions: {
        setToken: (token: string | null) => {
          set({ token, isAuthenticated: !!token });
        },
        clearToken: () => {
          set({ token: null, isAuthenticated: false });
        },
      },
    }),
  ),
);

export const useAuthActions = () => useAuthStore((s) => s.actions);
export type AuthStore = ReturnType<typeof useAuthStore.getState>;
