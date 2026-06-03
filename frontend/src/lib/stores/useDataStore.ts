import { createStore } from "zustand";
import type { SaveItem } from "@/lib/types";

export interface DataState {
  items: SaveItem[];
  anniversaryDate: string;
  birthdayDate: string;
}

export interface DataActions {
  loadData: () => void;
  saveData: () => void;
  addItem: (item: Omit<SaveItem, "id" | "createdAt">) => void;
  addItems: (newItems: Omit<SaveItem, "id" | "createdAt">[]) => void;
  updateItem: (updatedItem: Partial<SaveItem> & { id: string }) => void;
  deleteItem: (itemId: string) => void;
  setAnniversaryDate: (date: string) => void;
  setBirthdayDate: (date: string) => void;
  getItemsByCategory: (category: string) => SaveItem[];
}

export type DataStore = DataState & DataActions;

export const createDataStore = (
  initState: DataState = {
    items: [],
    anniversaryDate: "",
    birthdayDate: "",
  },
) => {
  return createStore<DataStore>()((set, get) => ({
    ...initState,

    loadData: () => {
      // Disabled localStorage: Only use database for persistence
    },

    saveData: () => {
      // Disabled localStorage: Only use database for persistence
    },

    addItem: (item) => {
      const newItem: SaveItem = {
        id: Date.now().toString(),
        createdAt: new Date().toISOString(),
        ...item,
      };
      set((state) => ({
        items: [...state.items, newItem],
      }));
      get().saveData();
    },

    addItems: (newItems) => {
      const startId = Date.now();
      const itemsToAdd: SaveItem[] = newItems.map((item, index) => ({
        id: (startId + index).toString(),
        createdAt: new Date().toISOString(),
        ...item,
      }));
      set((state) => ({
        items: [...state.items, ...itemsToAdd],
      }));
      get().saveData();
    },

    updateItem: (updatedItem) => {
      set((state) => ({
        items: state.items.map((i) =>
          i.id === updatedItem.id ? { ...i, ...updatedItem } : i,
        ),
      }));
      get().saveData();
    },

    deleteItem: (itemId) => {
      set((state) => ({
        items: state.items.filter((i) => i.id !== itemId),
      }));
      get().saveData();
    },

    setAnniversaryDate: (date) => {
      set({ anniversaryDate: date });
      get().saveData();
    },

    setBirthdayDate: (date) => {
      set({ birthdayDate: date });
      get().saveData();
    },

    getItemsByCategory: (category) => {
      return get().items.filter((item) => item.category === category);
    },
  }));
};
