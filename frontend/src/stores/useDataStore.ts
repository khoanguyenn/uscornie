import { create } from "zustand";
import type { SaveItem } from "@/types";

interface DataState {
  items: SaveItem[];
  anniversaryDate: string;
  birthdayDate: string;
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

export const useDataStore = create<DataState>((set, get) => ({
  items: [],
  anniversaryDate: "",
  birthdayDate: "",

  loadData: () => {
    if (typeof window !== "undefined") {
      let dataStr = localStorage.getItem("olc_data:v1");
      if (!dataStr) {
        // Fallback and migration
        const oldData = localStorage.getItem("olc_data");
        if (oldData) {
          localStorage.setItem("olc_data:v1", oldData);
          localStorage.removeItem("olc_data");
          dataStr = oldData;
        }
      }
      if (dataStr) {
        try {
          const parsed = JSON.parse(dataStr);
          set({
            items: parsed.items || [],
            anniversaryDate: parsed.anniversaryDate || "",
            birthdayDate: parsed.birthdayDate || "",
          });
        } catch (e) {
          console.error("Failed to parse olc_data from localStorage:", e);
        }
      }
    }
  },

  saveData: () => {
    if (typeof window !== "undefined") {
      const state = get();
      const data = {
        items: state.items,
        anniversaryDate: state.anniversaryDate,
        birthdayDate: state.birthdayDate,
      };
      localStorage.setItem("olc_data:v1", JSON.stringify(data));
    }
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
