import { z } from "zod";

export const bulkImportItemSchema = z.object({
  title: z
    .string()
    .min(1, "Tiêu đề không được để trống")
    .max(200, "Tiêu đề tối đa 200 ký tự"),
  desc: z.string().max(1000, "Mô tả tối đa 1000 ký tự").optional().nullable(),
  tag: z.string().max(50, "Thẻ tối đa 50 ký tự").optional().nullable(),
  image: z.string().optional().nullable(),
});

export const bulkImportSchema = z
  .array(bulkImportItemSchema)
  .min(1, "Danh sách không được trống");
