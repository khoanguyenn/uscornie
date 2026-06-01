import api from "@/lib/api";
import type { SaveItem } from "@/lib/types";

export const itemService = {
  async fetchItems(spaceId: string): Promise<SaveItem[]> {
    const res = await api.get(`/spaces/${spaceId}/items`);
    return res.data;
  },
  async addItem(
    spaceId: string,
    item: Omit<SaveItem, "id" | "createdAt">,
  ): Promise<SaveItem> {
    const res = await api.post(`/spaces/${spaceId}/items`, item);
    return res.data;
  },

  async updateItem(
    spaceId: string,
    itemId: string,
    item: Partial<SaveItem>,
  ): Promise<SaveItem> {
    const res = await api.put(`/spaces/${spaceId}/items/${itemId}`, item);
    return res.data;
  },
  async deleteItem(spaceId: string, itemId: string): Promise<void> {
    await api.delete(`/spaces/${spaceId}/items/${itemId}`);
  },
};
