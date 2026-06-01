import { describe, expect, test } from "bun:test";
import { bulkImportSchema } from "@/lib/validation/items";

describe("bulkImportSchema validation", () => {
  test("passes validation with valid items", () => {
    const validData = [
      {
        title: "Valid Item 1",
        desc: "Description 1",
        tag: "Tag 1",
        image: null,
      },
      {
        title: "Valid Item 2",
        desc: "Description 2",
        tag: null,
        image: "https://example.com/image.png",
      },
    ];

    const result = bulkImportSchema.safeParse(validData);
    expect(result.success).toBe(true);
  });

  test("fails validation when list is empty", () => {
    const emptyData: unknown[] = [];
    const result = bulkImportSchema.safeParse(emptyData);
    expect(result.success).toBe(false);
  });

  test("fails validation when item title is empty", () => {
    const invalidData = [
      {
        title: "",
        desc: "Description",
      },
    ];
    const result = bulkImportSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
  });

  test("fails validation when item title exceeds max length", () => {
    const longTitle = "a".repeat(201);
    const invalidData = [
      {
        title: longTitle,
        desc: "Description",
      },
    ];
    const result = bulkImportSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
  });
});
