import { describe, expect, test } from "bun:test";
import {
  bulkImportSchema,
  createBulkImportSchema,
} from "@/lib/validation/items";

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

describe("createBulkImportSchema validation with allowedTags", () => {
  const allowedTags = ["Must try", "Cafe", "Restaurant"];
  const schema = createBulkImportSchema(allowedTags);

  test("passes with valid tags or empty tag", () => {
    const validData = [
      { title: "Item 1", tag: "Must try" },
      { title: "Item 2", tag: "" },
      { title: "Item 3", tag: null },
    ];
    const result = schema.safeParse(validData);
    expect(result.success).toBe(true);
  });

  test("fails with invalid tag", () => {
    const invalidData = [{ title: "Item 1", tag: "Invalid Tag" }];
    const result = schema.safeParse(invalidData);
    expect(result.success).toBe(false);
  });
});

describe("error formatting helper logic", () => {
  const allowedTags = ["Must try", "Cafe"];
  const schema = createBulkImportSchema(allowedTags);

  test("produces correct bullet point index and message for empty title and invalid tag", () => {
    const invalidData = [
      { title: "Item 1", tag: "Invalid Tag" },
      { title: "", tag: "Cafe" },
    ];
    const result = schema.safeParse(invalidData);
    expect(result.success).toBe(false);
    if (!result.success) {
      const errorMsg = result.error.issues
        .map((e) => {
          const index = e.path[0];
          if (typeof index === "number") {
            return `• Mục số ${index + 1}: ${e.message}`;
          }
          return `• ${e.path.join(".")}: ${e.message}`;
        })
        .join("\n");

      expect(errorMsg).toContain(
        '• Mục số 1: Thẻ "Invalid Tag" không hợp lệ. Chỉ chấp nhận: Must try, Cafe',
      );
      expect(errorMsg).toContain("• Mục số 2: Tiêu đề không được để trống");
    }
  });
});
