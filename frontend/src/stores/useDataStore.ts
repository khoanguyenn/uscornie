import { defineStore } from "pinia";
import type { SaveItem } from "@/types";

interface DataState {
  items: SaveItem[];
  anniversaryDate: string;
  birthdayDate: string;
}

export const useDataStore = defineStore("data", {
  state: (): DataState => ({
    items: [],
    anniversaryDate: "",
    birthdayDate: "",
  }),
  getters: {
    getItemsByCategory:
      (state) =>
      (category: string): SaveItem[] => {
        return state.items.filter((item) => item.category === category);
      },
  },
  actions: {
    loadData() {
      const dataStr = localStorage.getItem("olc_data");
      if (dataStr) {
        try {
          const parsed = JSON.parse(dataStr);
          this.items = parsed.items || [];
          this.anniversaryDate = parsed.anniversaryDate || "";
          this.birthdayDate = parsed.birthdayDate || "";
        } catch (e) {
          console.error("Failed to parse olc_data from localStorage:", e);
        }
      }
    },
    saveData() {
      const data = {
        items: this.items,
        anniversaryDate: this.anniversaryDate,
        birthdayDate: this.birthdayDate,
      };
      localStorage.setItem("olc_data", JSON.stringify(data));
    },
    addItem(item: Omit<SaveItem, "id" | "createdAt">) {
      this.items.push({
        id: Date.now().toString(),
        createdAt: new Date().toISOString(),
        ...item,
      });
      this.saveData();
    },
    addItems(newItems: Omit<SaveItem, "id" | "createdAt">[]) {
      const startId = Date.now();
      newItems.forEach((item, index) => {
        this.items.push({
          id: (startId + index).toString(),
          createdAt: new Date().toISOString(),
          ...item,
        });
      });
      this.saveData();
    },
    updateItem(updatedItem: Partial<SaveItem> & { id: string }) {
      const idx = this.items.findIndex((i) => i.id === updatedItem.id);
      if (idx !== -1) {
        this.items[idx] = { ...this.items[idx], ...updatedItem };
        this.saveData();
      }
    },
    deleteItem(itemId: string) {
      this.items = this.items.filter((i) => i.id !== itemId);
      this.saveData();
    },
    setAnniversaryDate(date: string) {
      this.anniversaryDate = date;
      this.saveData();
    },
    setBirthdayDate(date: string) {
      this.birthdayDate = date;
      this.saveData();
    },
  },
});
