"use client";

import { createContext, use, useRef } from "react";
import { useStore } from "zustand";
import { type AuthStore, createAuthStore } from "@/lib/stores/useAuthStore";

export type AuthStoreApi = ReturnType<typeof createAuthStore>;
const AuthStoreContext = createContext<AuthStoreApi | undefined>(undefined);

export const AuthStoreProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const storeRef = useRef<AuthStoreApi>(undefined);
  if (!storeRef.current) {
    storeRef.current = createAuthStore();
  }
  return (
    <AuthStoreContext.Provider value={storeRef.current}>
      {children}
    </AuthStoreContext.Provider>
  );
};

export const useAuthStore = <T,>(selector: (store: AuthStore) => T): T => {
  const context = use(AuthStoreContext);
  if (!context) {
    throw new Error("useAuthStore must be used within AuthStoreProvider");
  }
  return useStore(context, selector);
};
