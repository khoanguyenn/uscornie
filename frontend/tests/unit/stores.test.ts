import { beforeEach, describe, expect, test } from "bun:test";
import { useAuthStore } from "@/lib/stores/useAuthStore";
import { useDataStore } from "@/lib/stores/useDataStore";

describe("auth store", () => {
  beforeEach(() => {
    useAuthStore.setState({ token: null, isAuthenticated: false });
  });

  test("initializes with default token and auth state", () => {
    expect(useAuthStore.getState().token).toBeNull();
    expect(useAuthStore.getState().isAuthenticated).toBe(false);
  });

  test("setToken updates state correctly", () => {
    useAuthStore.getState().actions.setToken("test-token");
    expect(useAuthStore.getState().token).toBe("test-token");
    expect(useAuthStore.getState().isAuthenticated).toBe(true);
  });

  test("clearToken resets auth state", () => {
    useAuthStore.setState({
      token: "test-token",
      isAuthenticated: true,
    });
    useAuthStore.getState().actions.clearToken();
    expect(useAuthStore.getState().token).toBeNull();
    expect(useAuthStore.getState().isAuthenticated).toBe(false);
  });
});

describe("data store", () => {
  beforeEach(() => {
    useDataStore.setState({
      items: [],
      anniversaryDate: "",
      birthdayDate: "",
    });
  });

  test("initializes with empty items and dates", () => {
    expect(useDataStore.getState().items).toEqual([]);
    expect(useDataStore.getState().anniversaryDate).toBe("");
    expect(useDataStore.getState().birthdayDate).toBe("");
  });

  test("addItem adds an item to the list", () => {
    useDataStore.getState().actions.addItem({
      category: "wishlist",
      title: "Test Gift",
      desc: "Gift Description",
    });
    const items = useDataStore.getState().items;
    expect(items.length).toBe(1);
    expect(items[0]?.title).toBe("Test Gift");
    expect(items[0]?.category).toBe("wishlist");
    expect(items[0]?.id).toBeDefined();
    expect(items[0]?.createdAt).toBeDefined();
  });

  test("setAnniversaryDate updates state", () => {
    useDataStore.getState().actions.setAnniversaryDate("2025-01-01");
    expect(useDataStore.getState().anniversaryDate).toBe("2025-01-01");
  });

  test("deleteItem removes an item", () => {
    useDataStore.getState().actions.addItem({
      category: "wishlist",
      title: "Item to delete",
    });
    const item = useDataStore.getState().items[0];
    expect(item).toBeDefined();
    if (item) {
      useDataStore.getState().actions.deleteItem(item.id);
      expect(useDataStore.getState().items.length).toBe(0);
    }
  });
});
