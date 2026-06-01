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
  .min(1, "Danh sách không được trống")
  .max(100, "Không thể nhập quá 100 mục cùng lúc");

export const createBulkImportSchema = (allowedTags: string[]) =>
  z
    .array(
      z.object({
        title: z
          .string()
          .min(1, "Tiêu đề không được để trống")
          .max(200, "Tiêu đề tối đa 200 ký tự"),
        desc: z
          .string()
          .max(1000, "Mô tả tối đa 1000 ký tự")
          .optional()
          .nullable(),
        tag: z
          .string()
          .max(50, "Thẻ tối đa 50 ký tự")
          .superRefine((val, ctx) => {
            if (val && val.length <= 50 && !allowedTags.includes(val)) {
              ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: `Thẻ "${val}" không hợp lệ. Chỉ chấp nhận: ${allowedTags.join(", ")}`,
              });
            }
          })
          .optional()
          .nullable(),
        image: z.string().optional().nullable(),
      }),
    )
    .min(1, "Danh sách không được trống")
    .max(100, "Không thể nhập quá 100 mục cùng lúc");
