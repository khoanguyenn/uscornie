<script setup lang="ts">
import { ref, computed } from "vue";

const props = defineProps({
  presetTags: {
    type: Array,
    required: true,
  },
  hasFile: {
    type: Boolean,
    required: true,
  },
});

const emit = defineEmits(["imported"]);

const qaOpen = ref(false);
const qaMode = ref("text");
const qaText = ref("");
const qaResult = ref({ msg: "", isErr: false });
const fileRows = ref([]);
const fileInput = ref(null);

const triggerFileInput = () => {
  if (fileInput.value) fileInput.value.click();
};

const qaParseText = () => {
  if (!qaText.value.trim()) return;
  const lines = qaText.value.split("\n").filter((l) => l.trim());
  const parsedItems = [];

  lines.forEach((line) => {
    const parts = line.split("-").map((p) => p.trim());
    const title = parts[0];
    if (!title) return;
    const desc = parts[1] || "";
    const tagVal = parts[2] || "";
    const validTag = props.presetTags.includes(tagVal) ? tagVal : "";

    parsedItems.push({
      title,
      desc,
      tag: validTag,
      image: null,
    });
  });

  if (parsedItems.length > 0) {
    emit("imported", parsedItems);
    qaText.value = "";
    qaResult.value = { msg: `Đã thêm thành công ${parsedItems.length} mục!`, isErr: false };
  } else {
    qaResult.value = { msg: "Không tìm thấy dòng nào hợp lệ.", isErr: true };
  }
};

const loadXLSX = () => {
  return new Promise((resolve, reject) => {
    if (window.XLSX) {
      resolve(window.XLSX);
      return;
    }
    const script = document.createElement("script");
    script.src = "https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js";
    script.onload = () => resolve(window.XLSX);
    script.onerror = (e) => reject(e);
    document.head.appendChild(script);
  });
};

const qaParseCSVLine = (line, delim) => {
  const result = [];
  let current = "",
    inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (inQuotes) {
      if (ch === '"' && line[i + 1] === '"') {
        current += '"';
        i++;
      } else if (ch === '"') inQuotes = false;
      else current += ch;
    } else {
      if (ch === '"') inQuotes = true;
      else if (ch === delim) {
        result.push(current);
        current = "";
      } else current += ch;
    }
  }
  result.push(current);
  return result;
};

const qaProcessCSV = (text, delim) => {
  const lines = text.split("\n").filter((l) => l.trim());
  if (lines.length < 2) {
    qaResult.value = { msg: "File trống hoặc chỉ có header", isErr: true };
    return;
  }

  const header = qaParseCSVLine(lines[0], delim).map((h) => h.toLowerCase().trim());
  const colMap = {};

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
  const tagKeys = ["thẻ", "the", "tag", "tags", "loại", "loai", "type", "category", "phân loại"];
  const imgKeys = ["hình", "hinh", "image", "img", "ảnh", "anh", "hình ảnh", "photo", "url"];

  header.forEach((h, i) => {
    if (!colMap.name && nameKeys.some((k) => h.includes(k))) colMap.name = i;
    else if (!colMap.addr && addrKeys.some((k) => h.includes(k))) colMap.addr = i;
    else if (!colMap.desc && descKeys.some((k) => h.includes(k))) colMap.desc = i;
    else if (!colMap.tag && tagKeys.some((k) => h.includes(k))) colMap.tag = i;
    else if (!colMap.img && imgKeys.some((k) => h.includes(k))) colMap.img = i;
  });

  if (colMap.name === undefined) colMap.name = 0;

  const rows = [];
  for (let i = 1; i < lines.length; i++) {
    const cols = qaParseCSVLine(lines[i], delim);
    const name = (cols[colMap.name] || "").trim();
    if (!name) continue;

    const addr = colMap.addr !== undefined ? (cols[colMap.addr] || "").trim() : "";
    const desc = colMap.desc !== undefined ? (cols[colMap.desc] || "").trim() : "";
    const tag = colMap.tag !== undefined ? (cols[colMap.tag] || "").trim() : "";
    const img = colMap.img !== undefined ? (cols[colMap.img] || "").trim() : "";

    const fullDesc = [addr, desc].filter(Boolean).join(" · ");
    rows.push({ name, desc: fullDesc, tag, img });
  }

  if (!rows.length) {
    qaResult.value = { msg: "Không tìm thấy dữ liệu hợp lệ trong file", isErr: true };
    return;
  }

  fileRows.value = rows;
  qaResult.value = { msg: "", isErr: false };
};

const handleFileChange = async (event) => {
  const file = event.target.files[0];
  if (!file) return;
  const ext = file.name.split(".").pop().toLowerCase();

  if (ext === "csv" || ext === "tsv") {
    const reader = new FileReader();
    reader.onload = (e) => {
      const delim = ext === "tsv" ? "\t" : ",";
      qaProcessCSV(e.target.result, delim);
    };
    reader.readAsText(file);
  } else if (ext === "xlsx" || ext === "xls") {
    qaResult.value = { msg: "Đang tải thư viện đọc Excel... Vui lòng đợi.", isErr: false };
    try {
      const xlsxLib = await loadXLSX();
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const wb = xlsxLib.read(new Uint8Array(e.target.result), { type: "array" });
          const ws = wb.Sheets[wb.SheetNames[0]];
          const csv = xlsxLib.utils.sheet_to_csv(ws);
          qaProcessCSV(csv, ",");
        } catch (err) {
          qaResult.value = { msg: `Lỗi đọc file Excel: ${err.message}`, isErr: true };
        }
      };
      reader.readAsArrayBuffer(file);
    } catch (e) {
      qaResult.value = { msg: "Không thể tải thư viện đọc Excel.", isErr: true };
    }
  } else {
    qaResult.value = {
      msg: "Định dạng không hỗ trợ. Vui lòng dùng .xlsx, .xls hoặc .csv",
      isErr: true,
    };
  }
};

const qaImportRows = () => {
  if (!fileRows.value.length) return;

  const parsedItems = fileRows.value.map((r) => {
    const validTag = props.presetTags.includes(r.tag) ? r.tag : "";
    return {
      title: r.name,
      desc: r.desc,
      tag: validTag,
      image: r.img || null,
    };
  });

  emit("imported", parsedItems);
  fileRows.value = [];
  if (fileInput.value) fileInput.value.value = "";
  qaResult.value = { msg: `Đã import thành công ${parsedItems.length} mục!`, isErr: false };
};

const cancelImport = () => {
  fileRows.value = [];
  if (fileInput.value) fileInput.value.value = "";
  qaResult.value = { msg: "", isErr: false };
};
</script>

<template>
  <div class="card qa-card">
    <div class="qa-toggle" :class="{ open: qaOpen }" @click="qaOpen = !qaOpen">
      <span class="qa-arrow">▶</span> Thêm nhanh
    </div>

    <div v-if="qaOpen" class="qa-body">
      <div v-if="hasFile" class="qa-tabs">
        <button class="qa-tab" :class="{ active: qaMode === 'text' }" @click="qaMode = 'text'">
          Nhập text
        </button>
        <button class="qa-tab" :class="{ active: qaMode === 'file' }" @click="qaMode = 'file'">
          Import file
        </button>
      </div>

      <div v-if="!hasFile || qaMode === 'text'">
        <div class="qa-syntax">
          Cú pháp: <code>Tiêu đề - Mô tả - Gắn thẻ</code><br />
          Mỗi dòng = 1 mục. Mô tả và thẻ có thể bỏ trống.<br />
          Thẻ hợp lệ cho mục này: <strong>{{ presetTags.join(" · ") }}</strong>
        </div>
        <textarea
          v-model="qaText"
          class="qa-textarea"
          placeholder="VD:&#10;Phở Thìn Bờ Hồ - Phở bò tái chín, nước dùng đậm - Must try&#10;Bún chả Hương Liên - Obama đã ăn ở đây&#10;Cơm tấm Bụi Sài Gòn"
        ></textarea>
        <div style="display: flex; gap: 8px; margin-top: 10px; align-items: center">
          <button class="btn btn-primary btn-small" @click="qaParseText">Thêm tất cả</button>
          <span v-if="qaResult.msg" class="qa-result" :class="{ err: qaResult.isErr }">{{
            qaResult.msg
          }}</span>
        </div>
      </div>

      <div v-else>
        <div class="qa-syntax">
          Hỗ trợ file <code>.xlsx</code>, <code>.xls</code>, <code>.csv</code> từ Excel hoặc Google
          Sheets.<br />
          Cột: <code>Tên</code> (bắt buộc), <code>Địa chỉ</code>, <code>Mô tả</code>,
          <code>Thẻ</code>, <code>Hình ảnh</code> (URL)<br />
          Thẻ hợp lệ: <strong>{{ presetTags.join(" · ") }}</strong>
        </div>
        <div class="qa-file-zone" @click="triggerFileInput">
          Kéo thả hoặc bấm để chọn file Excel / CSV
        </div>
        <input
          type="file"
          ref="fileInput"
          accept=".xlsx,.xls,.csv,.tsv"
          style="display: none"
          @change="handleFileChange"
        />

        <!-- File Preview -->
        <div v-if="fileRows.length" style="margin-top: 10px">
          <div
            style="
              font-size: 0.82rem;
              color: var(--ink-light);
              margin-bottom: 8px;
              font-weight: 600;
            "
          >
            Tìm thấy {{ fileRows.length }} mục:
          </div>
          <div
            style="
              max-height: 200px;
              overflow-y: auto;
              border: 1px solid rgba(201, 169, 110, 0.2);
              border-radius: 10px;
              padding: 8px;
            "
          >
            <div
              v-for="(r, idx) in fileRows.slice(0, 20)"
              :key="idx"
              style="
                padding: 4px 0;
                border-bottom: 1px solid rgba(201, 169, 110, 0.1);
                font-size: 0.8rem;
              "
            >
              <strong>{{ r.name }}</strong>
              <span v-if="r.desc" style="color: var(--ink-light)"> — {{ r.desc }}</span>
              <span
                v-if="r.tag"
                style="
                  background: var(--petal);
                  padding: 1px 6px;
                  border-radius: 6px;
                  font-size: 0.7rem;
                  margin-left: 5px;
                "
                >{{ r.tag }}</span
              >
            </div>
            <div
              v-if="fileRows.length > 20"
              style="padding: 4px 0; font-size: 0.78rem; color: var(--ink-light)"
            >
              ...và {{ fileRows.length - 20 }} mục khác
            </div>
          </div>
          <div style="display: flex; gap: 8px; margin-top: 10px; align-items: center">
            <button class="btn btn-primary btn-small" @click="qaImportRows">
              Import {{ fileRows.length }} mục
            </button>
            <button class="btn btn-secondary btn-small" @click="cancelImport">Huỷ</button>
          </div>
        </div>
        <span v-if="qaResult.msg" class="qa-result" :class="{ err: qaResult.isErr }">{{
          qaResult.msg
        }}</span>
      </div>
    </div>
  </div>
</template>
