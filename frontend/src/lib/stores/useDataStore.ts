import { create } from "zustand";
import { combine } from "zustand/middleware";
import type { SaveItem } from "@/lib/types";

export const useDataStore = create(
  combine(
    {
      items: [] as SaveItem[],
      anniversaryDate: "",
      birthdayDate: "",
    },
    (set, get) => ({
      actions: {
        addItem: (item: Omit<SaveItem, "id" | "createdAt">) => {
          const newItem: SaveItem = {
            id: Date.now().toString(),
            createdAt: new Date().toISOString(),
            ...item,
          };
          set((state) => ({
            items: [...state.items, newItem],
          }));
        },

        addItems: (newItems: Omit<SaveItem, "id" | "createdAt">[]) => {
          const startId = Date.now();
          const itemsToAdd: SaveItem[] = newItems.map((item, index) => ({
            id: (startId + index).toString(),
            createdAt: new Date().toISOString(),
            ...item,
          }));
          set((state) => ({
            items: [...state.items, ...itemsToAdd],
          }));
        },

        updateItem: (updatedItem: Partial<SaveItem> & { id: string }) => {
          set((state) => ({
            items: state.items.map((i) =>
              i.id === updatedItem.id ? { ...i, ...updatedItem } : i,
            ),
          }));
        },

        deleteItem: (itemId: string) => {
          set((state) => ({
            items: state.items.filter((i) => i.id !== itemId),
          }));
        },

        setAnniversaryDate: (date: string) => {
          set({ anniversaryDate: date });
        },

        setBirthdayDate: (date: string) => {
          set({ birthdayDate: date });
        },

        getItemsByCategory: (category: string) => {
          return get().items.filter((item) => item.category === category);
        },
      },
    }),
  ),
);

export const useDataActions = () => useDataStore((s) => s.actions);
export type DataStore = ReturnType<typeof useDataStore.getState>;
