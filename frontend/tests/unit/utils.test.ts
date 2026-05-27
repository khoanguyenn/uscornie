import { describe, expect, test } from "bun:test";
import { cn } from "@/lib/utils/cn";
import { legs, spikeRing, starPts } from "@/lib/utils/svgHelpers";

describe("cn utility", () => {
  test("combines class names correctly", () => {
    expect(cn("a", "b")).toBe("a b");
    expect(cn("a", false && "b", "c")).toBe("a c");
    expect(cn("a", undefined, "b")).toBe("a b");
  });

  test("handles tailwind conflicts via twMerge", () => {
    expect(cn("px-2 py-1", "p-4")).toBe("p-4");
    expect(cn("text-red-500", "text-blue-500")).toBe("text-blue-500");
  });
});

describe("svgHelpers utilities", () => {
  test("starPts generates correct coordinate points string", () => {
    const pts = starPts(10, 10, 5, 2);
    expect(typeof pts).toBe("string");
    expect(pts.split(" ").length).toBe(10); // 10 points for a star
  });

  test("spikeRing generates a valid path string", () => {
    const path = spikeRing(10, 10, 5, 10, 4);
    expect(typeof path).toBe("string");
    expect(path.startsWith("M")).toBe(true);
  });

  test("legs generates list of leg coordinate items", () => {
    const items = legs(10, 20, 4, 15);
    expect(items.length).toBe(4);
    expect(items[0]).toHaveProperty("x1");
    expect(items[0]).toHaveProperty("y1");
    expect(items[0]).toHaveProperty("x2");
    expect(items[0]).toHaveProperty("y2");
    expect(items[0]).toHaveProperty("dur");
  });
});
