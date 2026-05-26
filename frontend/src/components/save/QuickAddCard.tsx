"use client";

import type React from "react";
import { useRef, useState } from "react";
import type { SaveItem } from "@/types";

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
    if (lines.length < 2) {
      setQaResult({ msg: "File trống hoặc chỉ có header", isErr: true });
      return;
    }

    const header = qaParseCSVLine(lines[0], delim).map((h) =>
      h.toLowerCase().trim(),
    );
    const colMap: { [key: string]: number | undefined } = {
      name: undefined,
      addr: undefined,
      desc: undefined,
      tag: undefined,
      img: undefined,
    };

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
      const cols = qaParseCSVLine(lines[i], delim);
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
            const ws = wb.Sheets[wb.SheetNames[0]];
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
    <div className="card qa-card">
      <button
        type="button"
        className={`qa-toggle ${qaOpen ? "open" : ""}`}
        onClick={() => setQaOpen(!qaOpen)}
        style={{
          width: "100%",
          border: "none",
          background: "none",
          textAlign: "left",
          cursor: "pointer",
        }}
      >
        <span className="qa-arrow">{qaOpen ? "▼" : "▶"}</span> Thêm nhanh
      </button>

      {qaOpen && (
        <div className="qa-body">
          {hasFile && (
            <div className="qa-tabs">
              <button
                className={`qa-tab ${qaMode === "text" ? "active" : ""}`}
                onClick={() => setQaMode("text")}
                type="button"
              >
                Nhập text
              </button>
              <button
                className={`qa-tab ${qaMode === "file" ? "active" : ""}`}
                onClick={() => setQaMode("file")}
                type="button"
              >
                Import file
              </button>
            </div>
          )}

          {(!hasFile || qaMode === "text") && (
            <div>
              <div className="qa-syntax">
                Cú pháp: <code>Tiêu đề - Mô tả - Gắn thẻ</code>
                <br />
                Mỗi dòng = 1 mục. Mô tả và thẻ có thể bỏ trống.
                <br />
                Thẻ hợp lệ cho mục này:{" "}
                <strong>{presetTags.join(" · ")}</strong>
              </div>
              <textarea
                value={qaText}
                onChange={(e) => setQaText(e.target.value)}
                className="qa-textarea"
                aria-label="Nội dung thêm nhanh"
                placeholder={`VD:\nPhở Thìn Bờ Hồ - Phở bò tái chín, nước dùng đậm - Must try\nBún chả Hương Liên - Obama đã ăn ở đây\nCơm tấm Bụi Sài Gòn`}
              />
              <div
                style={{
                  display: "flex",
                  gap: "8px",
                  marginTop: "10px",
                  alignItems: "center",
                }}
              >
                <button
                  className="btn btn-primary btn-small"
                  onClick={qaParseText}
                  type="button"
                >
                  Thêm tất cả
                </button>
                {qaResult.msg && (
                  <span className={`qa-result ${qaResult.isErr ? "err" : ""}`}>
                    {qaResult.msg}
                  </span>
                )}
              </div>
            </div>
          )}

          {hasFile && qaMode === "file" && (
            <div>
              <div className="qa-syntax">
                Hỗ trợ file <code>.xlsx</code>, <code>.xls</code>,{" "}
                <code>.csv</code> từ Excel hoặc Google Sheets.
                <br />
                Cột: <code>Tên</code> (bắt buộc), <code>Địa chỉ</code>,{" "}
                <code>Mô tả</code>, <code>Thẻ</code>, <code>Hình ảnh</code>{" "}
                (URL)
                <br />
                Thẻ hợp lệ: <strong>{presetTags.join(" · ")}</strong>
              </div>
              <button
                type="button"
                className="qa-file-zone"
                onClick={triggerFileInput}
                style={{ width: "100%", background: "none", cursor: "pointer" }}
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
                <div style={{ marginTop: "10px" }}>
                  <div
                    style={{
                      fontSize: "0.82rem",
                      color: "var(--ink-light)",
                      marginBottom: "8px",
                      fontWeight: 600,
                    }}
                  >
                    Tìm thấy {fileRows.length} mục:
                  </div>
                  <div
                    style={{
                      maxHeight: "200px",
                      overflowY: "auto",
                      border: "1px solid rgba(201, 169, 110, 0.2)",
                      borderRadius: "10px",
                      padding: "8px",
                    }}
                  >
                    {fileRows.slice(0, 20).map((r) => (
                      <div
                        key={r.id || r.name}
                        style={{
                          padding: "4px 0",
                          borderBottom: "1px solid rgba(201, 169, 110, 0.1)",
                          fontSize: "0.8rem",
                        }}
                      >
                        <strong>{r.name}</strong>
                        {r.desc && (
                          <span style={{ color: "var(--ink-light)" }}>
                            {" "}
                            — {r.desc}
                          </span>
                        )}
                        {r.tag && (
                          <span
                            style={{
                              background: "var(--petal)",
                              padding: "1px 6px",
                              borderRadius: "6px",
                              fontSize: "0.7rem",
                              marginLeft: "5px",
                            }}
                          >
                            {r.tag}
                          </span>
                        )}
                      </div>
                    ))}
                    {fileRows.length > 20 && (
                      <div
                        style={{
                          padding: "4px 0",
                          fontSize: "0.78rem",
                          color: "var(--ink-light)",
                        }}
                      >
                        ...và {fileRows.length - 20} mục khác
                      </div>
                    )}
                  </div>
                  <div
                    style={{
                      display: "flex",
                      gap: "8px",
                      marginTop: "10px",
                      alignItems: "center",
                    }}
                  >
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
                <span className={`qa-result ${qaResult.isErr ? "err" : ""}`}>
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
