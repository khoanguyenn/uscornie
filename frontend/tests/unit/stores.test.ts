import { describe, expect, test } from "bun:test";
import { createAuthStore } from "@/lib/stores/useAuthStore";
import { createDataStore } from "@/lib/stores/useDataStore";

describe("auth store", () => {
  test("initializes with default token and auth state", () => {
    const store = createAuthStore({ token: null, isAuthenticated: false });
    expect(store.getState().token).toBeNull();
    expect(store.getState().isAuthenticated).toBe(false);
  });

  test("setToken updates state correctly", () => {
    const store = createAuthStore({ token: null, isAuthenticated: false });
    store.getState().setToken("test-token");
    expect(store.getState().token).toBe("test-token");
    expect(store.getState().isAuthenticated).toBe(true);
  });

  test("clearToken resets auth state", () => {
    const store = createAuthStore({
      token: "test-token",
      isAuthenticated: true,
    });
    store.getState().clearToken();
    expect(store.getState().token).toBeNull();
    expect(store.getState().isAuthenticated).toBe(false);
  });
});

describe("data store", () => {
  test("initializes with empty items and dates", () => {
    const store = createDataStore();
    expect(store.getState().items).toEqual([]);
    expect(store.getState().anniversaryDate).toBe("");
    expect(store.getState().birthdayDate).toBe("");
  });

  test("addItem adds an item to the list", () => {
    const store = createDataStore();
    store.getState().addItem({
      category: "wishlist",
      title: "Test Gift",
      desc: "Gift Description",
    });
    const items = store.getState().items;
    expect(items.length).toBe(1);
    expect(items[0]?.title).toBe("Test Gift");
    expect(items[0]?.category).toBe("wishlist");
    expect(items[0]?.id).toBeDefined();
    expect(items[0]?.createdAt).toBeDefined();
  });

  test("setAnniversaryDate updates state", () => {
    const store = createDataStore();
    store.getState().setAnniversaryDate("2025-01-01");
    expect(store.getState().anniversaryDate).toBe("2025-01-01");
  });

  test("deleteItem removes an item", () => {
    const store = createDataStore();
    store.getState().addItem({
      category: "wishlist",
      title: "Item to delete",
    });
    const item = store.getState().items[0];
    expect(item).toBeDefined();
    if (item) {
      store.getState().deleteItem(item.id);
      expect(store.getState().items.length).toBe(0);
    }
  });
});
