"use client";

import { createContext, use, useRef } from "react";
import { useStore } from "zustand";
import { createDataStore, type DataStore } from "@/lib/stores/useDataStore";

export type DataStoreApi = ReturnType<typeof createDataStore>;
const DataStoreContext = createContext<DataStoreApi | undefined>(undefined);

export const DataStoreProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const storeRef = useRef<DataStoreApi>(undefined);
  if (!storeRef.current) {
    storeRef.current = createDataStore();
  }
  return (
    <DataStoreContext.Provider value={storeRef.current}>
      {children}
    </DataStoreContext.Provider>
  );
};

export const useDataStore = <T,>(selector: (store: DataStore) => T): T => {
  const context = use(DataStoreContext);
  if (!context) {
    throw new Error("useDataStore must be used within DataStoreProvider");
  }
  return useStore(context, selector);
};
