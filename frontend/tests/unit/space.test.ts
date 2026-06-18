import { describe, expect, test } from "bun:test";
import type { Space } from "@/lib/types";

// Dynamic active space selection logic (same as useSaveItems activeSpace memo)
function getActiveSpace(
  spaces: Space[],
  isAuthenticated: boolean,
): Space | null {
  if (!isAuthenticated || spaces.length === 0) return null;
  const shared = spaces.find((s) => s.type === "shared");
  if (shared) return shared;
  return spaces.find((s) => s.type === "personal") || null;
}

// Logic to filter visible spaces in spaces list
function getVisibleSpaces(spaces: Space[]): Space[] {
  const hasShared = spaces.some((s) => s.type === "shared");
  if (hasShared) {
    // Hide private space entry points when shared/common space is active
    return spaces.filter((s) => s.type !== "personal");
  }
  return spaces;
}

// Parsing logic for stats to default missing categories to 0
function parseStats(
  apiStats: { total: number; categories: Record<string, number> },
  expectedCategories: string[],
) {
  const categories = { ...apiStats.categories };
  for (const cat of expectedCategories) {
    if (categories[cat] === undefined) {
      categories[cat] = 0;
    }
  }
  return {
    total: apiStats.total,
    categories,
  };
}

describe("frontend space logic", () => {
  test("prefers shared space, falls back to personal", () => {
    const personalSpace: Space = {
      id: "p1",
      name: "Personal",
      type: "personal",
    };
    const sharedSpace: Space = { id: "s1", name: "Shared", type: "shared" };

    // Case 1: Unauthenticated
    expect(getActiveSpace([personalSpace, sharedSpace], false)).toBeNull();

    // Case 2: Authenticated, only personal space exists
    expect(getActiveSpace([personalSpace], true)).toEqual(personalSpace);

    // Case 3: Authenticated, both exist -> prefers shared space
    expect(getActiveSpace([personalSpace, sharedSpace], true)).toEqual(
      sharedSpace,
    );
  });

  test("hides private space entries when shared space is active", () => {
    const personalSpace: Space = {
      id: "p1",
      name: "Personal",
      type: "personal",
    };
    const sharedSpace: Space = { id: "s1", name: "Shared", type: "shared" };

    // Only personal space -> visible
    expect(getVisibleSpaces([personalSpace])).toEqual([personalSpace]);

    // Both spaces -> only shared space is visible, personal is hidden
    expect(getVisibleSpaces([personalSpace, sharedSpace])).toEqual([
      sharedSpace,
    ]);
  });

  test("dynamically aggregates stats defaulting missing categories to 0", () => {
    const apiStats = {
      total: 5,
      categories: {
        memories: 3,
        wishlist: 2,
      },
    };
    const expectedCategories = ["memories", "wishlist", "cafe", "restaurant"];

    const stats = parseStats(apiStats, expectedCategories);
    expect(stats.total).toBe(5);
    expect(stats.categories.memories).toBe(3);
    expect(stats.categories.wishlist).toBe(2);
    expect(stats.categories.cafe).toBe(0);
    expect(stats.categories.restaurant).toBe(0);
  });
});
