"use client";

import type React from "react";
import { useRef, useState } from "react";
import type { SaveItem } from "@/lib/types";

type QuickAddImportItem = Omit<SaveItem, "id" | "createdAt" | "category">;

interface QuickAddCardProps {
  presetTags: string[];
  hasFile: boolean;
  onImported: (items: QuickAddImportItem[]) => void;
}

interface ParsedFileRow {
  id?: string;
  name: string;
  desc: string;
  tag: string;
  img: string;
}

export default function QuickAddCard({
  presetTags,
  hasFile,
  onImported,
}: QuickAddCardProps) {
  const [qaOpen, setQaOpen] = useState(false);
  const [qaMode, setQaMode] = useState<"text" | "file">("text");
  const [qaText, setQaText] = useState("");
  const [qaResult, setQaResult] = useState({ msg: "", isErr: false });
  const [fileRows, setFileRows] = useState<ParsedFileRow[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const triggerFileInput = () => {
    if (fileInputRef.current) fileInputRef.current.click();
  };

  const qaParseText = () => {
    if (!qaText.trim()) return;
    const lines = qaText.split("\n").filter((l) => l.trim());
    const parsedItems: QuickAddImportItem[] = [];

    const tagsSet = new Set(presetTags);
    for (const line of lines) {
      const parts = line.split("-").map((p) => p.trim());
      const title = parts[0];
      if (!title) continue;
      const desc = parts[1] || "";
      const tagVal = parts[2] || "";
      const validTag = tagsSet.has(tagVal) ? tagVal : "";

      parsedItems.push({
        title,
        desc,
        tag: validTag,
        image: null,
      });
    }

    if (parsedItems.length > 0) {
      onImported(parsedItems);
      setQaText("");
      setQaResult({
        msg: `Đã thêm thành công ${parsedItems.length} mục!`,
        isErr: false,
      });
    } else {
      setQaResult({ msg: "Không tìm thấy dòng nào hợp lệ.", isErr: true });
    }
  };

  const loadXLSX = async () => {
    const xlsx = await import("xlsx");
    return xlsx;
  };

  const qaParseCSVLine = (line: string, delim: string): string[] => {
    const result: string[] = [];
    let current = "";
    let inQuotes = false;
    for (let i = 0; i < line.length; i++) {
      const ch = line[i];
      if (inQuotes) {
        if (ch === '"' && line[i + 1] === '"') {
          current += '"';
          i++;
        } else if (ch === '"') {
          inQuotes = false;
        } else {
          current += ch;
        }
      } else {
        if (ch === '"') {
          inQuotes = true;
        } else if (ch === delim) {
          result.push(current);
          current = "";
        } else {
          current += ch;
        }
      }
    }
    result.push(current);
    return result;
  };

  const qaProcessCSV = (text: string, delim: string) => {
    const lines = text.split("\n").filter((l) => l.trim());
    const firstLine = lines[0];
    if (firstLine === undefined || lines.length < 2) {
      setQaResult({ msg: "File trống hoặc chỉ có header", isErr: true });
      return;
    }

    const header = qaParseCSVLine(firstLine, delim).map((h) =>
      h.toLowerCase().trim(),
    );
    interface ColMap {
      name?: number;
      addr?: number;
      desc?: number;
      tag?: number;
      img?: number;
    }
    const colMap: ColMap = {};

    const nameKeys = [
      "tên",
      "ten",
      "name",
      "tiêu đề",
      "tieu de",
      "title",
      "tên quán",
      "ten quan",
      "quán",
      "quan",
    ];
    const addrKeys = ["địa chỉ", "dia chi", "address", "đ/c"];
    const descKeys = [
      "mô tả",
      "mo ta",
      "description",
      "desc",
      "đánh giá",
      "danh gia",
      "review",
      "ghi chú",
      "ghi chu",
      "note",
    ];
    const tagKeys = [
      "thẻ",
      "the",
      "tag",
      "tags",
      "loại",
      "loai",
      "type",
      "category",
      "phân loại",
    ];
    const imgKeys = [
      "hình",
      "hinh",
      "image",
      "img",
      "ảnh",
      "anh",
      "hình ảnh",
      "photo",
      "url",
    ];

    header.forEach((h, i) => {
      if (colMap.name === undefined && nameKeys.some((k) => h.includes(k)))
        colMap.name = i;
      else if (colMap.addr === undefined && addrKeys.some((k) => h.includes(k)))
        colMap.addr = i;
      else if (colMap.desc === undefined && descKeys.some((k) => h.includes(k)))
        colMap.desc = i;
      else if (colMap.tag === undefined && tagKeys.some((k) => h.includes(k)))
        colMap.tag = i;
      else if (colMap.img === undefined && imgKeys.some((k) => h.includes(k)))
        colMap.img = i;
    });

    if (colMap.name === undefined) colMap.name = 0;

    const rows: ParsedFileRow[] = [];
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i];
      if (line === undefined) continue;
      const cols = qaParseCSVLine(line, delim);
      const name = (cols[colMap.name ?? 0] || "").trim();
      if (!name) continue;

      const addr =
        colMap.addr !== undefined ? (cols[colMap.addr] || "").trim() : "";
      const desc =
        colMap.desc !== undefined ? (cols[colMap.desc] || "").trim() : "";
      const tag =
        colMap.tag !== undefined ? (cols[colMap.tag] || "").trim() : "";
      const img =
        colMap.img !== undefined ? (cols[colMap.img] || "").trim() : "";

      const fullDesc = [addr, desc].filter(Boolean).join(" · ");
      rows.push({ id: `row-${i}-${name}`, name, desc: fullDesc, tag, img });
    }

    if (!rows.length) {
      setQaResult({
        msg: "Không tìm thấy dữ liệu hợp lệ trong file",
        isErr: true,
      });
      return;
    }

    setFileRows(rows);
    setQaResult({ msg: "", isErr: false });
  };

  const handleFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const ext = file.name.split(".").pop()?.toLowerCase();

    if (ext === "csv" || ext === "tsv") {
      const reader = new FileReader();
      reader.onload = (e) => {
        const delim = ext === "tsv" ? "\t" : ",";
        qaProcessCSV(e.target?.result as string, delim);
      };
      reader.readAsText(file);
    } else if (ext === "xlsx" || ext === "xls") {
      setQaResult({
        msg: "Đang tải thư viện đọc Excel... Vui lòng đợi.",
        isErr: false,
      });
      try {
        const xlsxLib = await loadXLSX();
        const reader = new FileReader();
        reader.onload = (e) => {
          try {
            const data = new Uint8Array(e.target?.result as ArrayBuffer);
            const wb = xlsxLib.read(data, { type: "array" });
            const firstSheetName = wb.SheetNames[0];
            if (!firstSheetName) {
              throw new Error("File Excel không có sheet nào");
            }
            const ws = wb.Sheets[firstSheetName];
            if (!ws) {
              throw new Error("Không thể đọc dữ liệu từ sheet đầu tiên");
            }
            const csv = xlsxLib.utils.sheet_to_csv(ws);
            qaProcessCSV(csv, ",");
          } catch (err) {
            const errMsg = err instanceof Error ? err.message : String(err);
            setQaResult({
              msg: `Lỗi đọc file Excel: ${errMsg}`,
              isErr: true,
            });
          }
        };
        reader.readAsArrayBuffer(file);
      } catch (_e) {
        setQaResult({
          msg: "Không thể tải thư viện đọc Excel.",
          isErr: true,
        });
      }
    } else {
      setQaResult({
        msg: "Định dạng không hỗ trợ. Vui lòng dùng .xlsx, .xls hoặc .csv",
        isErr: true,
      });
    }
  };

  const qaImportRows = () => {
    if (!fileRows.length) return;

    const parsedItems = fileRows.map((r) => {
      const validTag = presetTags.includes(r.tag) ? r.tag : "";
      return {
        title: r.name,
        desc: r.desc,
        tag: validTag,
        image: r.img || null,
      };
    });

    onImported(parsedItems);
    setFileRows([]);
    if (fileInputRef.current) fileInputRef.current.value = "";
    setQaResult({
      msg: `Đã import thành công ${parsedItems.length} mục!`,
      isErr: false,
    });
  };

  const cancelImport = () => {
    setFileRows([]);
    if (fileInputRef.current) fileInputRef.current.value = "";
    setQaResult({ msg: "", isErr: false });
  };

  return (
    <div className="card border-2 border-dashed border-earth/30 bg-[#fffdf7]/70 hover:border-grass transition-all duration-300">
      <button
        type="button"
        className="w-full border-none bg-transparent text-left cursor-pointer flex items-center gap-2 font-pangolin text-[1.05rem] text-earth select-none"
        onClick={() => setQaOpen(!qaOpen)}
      >
        <span
          className={`text-[0.7rem] transition-transform duration-300 ${qaOpen ? "rotate-90" : ""}`}
        >
          ▶
        </span>{" "}
        Thêm nhanh
      </button>

      {qaOpen && (
        <div className="mt-4">
          {hasFile && (
            <div className="flex gap-1.5 mb-3.5">
              <button
                className={`font-quicksand font-semibold text-[0.78rem] py-1.5 px-3.5 border-[1.5px] rounded-[16px] cursor-pointer transition-all duration-200 hover:border-grass ${
                  qaMode === "text"
                    ? "bg-grass border-grass text-white"
                    : "bg-card border-earth/30 text-ink-light"
                }`}
                onClick={() => setQaMode("text")}
                type="button"
              >
                Nhập text
              </button>
              <button
                className={`font-quicksand font-semibold text-[0.78rem] py-1.5 px-3.5 border-[1.5px] rounded-[16px] cursor-pointer transition-all duration-200 hover:border-grass ${
                  qaMode === "file"
                    ? "bg-grass border-grass text-white"
                    : "bg-card border-earth/30 text-ink-light"
                }`}
                onClick={() => setQaMode("file")}
                type="button"
              >
                Import file
              </button>
            </div>
          )}

          {(!hasFile || qaMode === "text") && (
            <div>
              <div className="text-[0.78rem] text-ink-light bg-earth/[0.08] p-[8px_12px] rounded-lg mb-2.5 font-quicksand">
                Cú pháp:{" "}
                <code className="font-bold text-ink">
                  Tiêu đề - Mô tả - Gắn thẻ
                </code>
                <br />
                Mỗi dòng = 1 mục. Mô tả và thẻ có thể bỏ trống.
                <br />
                Thẻ hợp lệ cho mục này:{" "}
                <strong>{presetTags.join(" · ")}</strong>
              </div>
              <textarea
                value={qaText}
                onChange={(e) => setQaText(e.target.value)}
                className="w-full font-quicksand text-[0.85rem] p-[10px_14px] border-2 border-earth/25 rounded-xl bg-cream text-ink outline-none min-h-[90px] resize-y transition-colors duration-300 focus:border-grass"
                aria-label="Nội dung thêm nhanh"
                placeholder={`VD:\nPhở Thìn Bờ Hồ - Phở bò tái chín, nước dùng đậm - Must try\nBún chả Hương Liên - Obama đã ăn ở đây\nCơm tấm Bụi Sài Gòn`}
              />
              <div className="flex gap-2 mt-2.5 items-center">
                <button
                  className="btn btn-primary btn-small"
                  onClick={qaParseText}
                  type="button"
                >
                  Thêm tất cả
                </button>
                {qaResult.msg && (
                  <span
                    className={`inline-block text-[0.82rem] font-semibold p-[8px_12px] rounded-lg ${
                      qaResult.isErr
                        ? "text-[#c97070] bg-[#c97070]/[0.08]"
                        : "text-grass-dark bg-grass/[0.08]"
                    }`}
                  >
                    {qaResult.msg}
                  </span>
                )}
              </div>
            </div>
          )}

          {hasFile && qaMode === "file" && (
            <div>
              <div className="text-[0.78rem] text-ink-light bg-earth/[0.08] p-[8px_12px] rounded-lg mb-2.5 font-quicksand">
                Hỗ trợ file <code className="font-bold text-ink">.xlsx</code>,{" "}
                <code className="font-bold text-ink">.xls</code>,{" "}
                <code className="font-bold text-ink">.csv</code> từ Excel hoặc
                Google Sheets.
                <br />
                Cột: <code className="font-bold text-ink">Tên</code> (bắt buộc),{" "}
                <code className="font-bold text-ink">Địa chỉ</code>,{" "}
                <code className="font-bold text-ink">Mô tả</code>,{" "}
                <code className="font-bold text-ink">Thẻ</code>,{" "}
                <code className="font-bold text-ink">Hình ảnh</code> (URL)
                <br />
                Thẻ hợp lệ: <strong>{presetTags.join(" · ")}</strong>
              </div>
              <button
                type="button"
                className="w-full border-2 border-dashed border-earth/30 rounded-xl p-5 text-center cursor-pointer transition-all duration-300 text-ink-light text-[0.85rem] font-semibold bg-transparent hover:border-grass hover:text-grass-dark hover:bg-grass/[0.03]"
                onClick={triggerFileInput}
              >
                Kéo thả hoặc bấm để chọn file Excel / CSV
              </button>
              <input
                type="file"
                ref={fileInputRef}
                accept=".xlsx,.xls,.csv,.tsv"
                style={{ display: "none" }}
                onChange={handleFileChange}
                aria-label="Chọn file dữ liệu"
              />

              {/* File Preview */}
              {fileRows.length > 0 && (
                <div className="mt-2.5">
                  <div className="text-[0.82rem] text-ink-light mb-2 font-semibold">
                    Tìm thấy {fileRows.length} mục:
                  </div>
                  <div className="max-h-[200px] overflow-y-auto border border-earth/20 rounded-[10px] p-2">
                    {fileRows.slice(0, 20).map((r) => (
                      <div
                        key={r.id || r.name}
                        className="py-1 border-b border-earth/10 text-[0.8rem]"
                      >
                        <strong>{r.name}</strong>
                        {r.desc && (
                          <span className="text-ink-light">: {r.desc}</span>
                        )}
                        {r.tag && (
                          <span className="bg-petal py-0.5 px-1.5 rounded-md text-[0.7rem] ml-1">
                            {r.tag}
                          </span>
                        )}
                      </div>
                    ))}
                    {fileRows.length > 20 && (
                      <div className="py-1 text-[0.78rem] text-ink-light">
                        ...và {fileRows.length - 20} mục khác
                      </div>
                    )}
                  </div>
                  <div className="flex gap-2 mt-2.5 items-center">
                    <button
                      className="btn btn-primary btn-small"
                      onClick={qaImportRows}
                      type="button"
                    >
                      Import {fileRows.length} mục
                    </button>
                    <button
                      className="btn btn-secondary btn-small"
                      onClick={cancelImport}
                      type="button"
                    >
                      Huỷ
                    </button>
                  </div>
                </div>
              )}
              {qaResult.msg && (
                <span
                  className={`inline-block text-[0.82rem] font-semibold p-[8px_12px] rounded-lg mt-2.5 ${
                    qaResult.isErr
                      ? "text-[#c97070] bg-[#c97070]/[0.08]"
                      : "text-grass-dark bg-grass/[0.08]"
                  }`}
                >
                  {qaResult.msg}
                </span>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
