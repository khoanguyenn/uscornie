<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { SAVE_CATEGORIES, TAGS_BY_CATEGORY, SUGGESTIONS, HINTS } from "@/data/mock";
import { useDataStore } from "@/stores/useDataStore";
import GhibliIcon from "@/components/icons/GhibliIcon.vue";
import SaveItemCard from "@/components/save/SaveItemCard.vue";
import QuickAddCard from "@/components/save/QuickAddCard.vue";

const props = defineProps<{
  category: string;
}>();

const dataStore = useDataStore();

// Form state
const formTitle = ref("");
const formDescription = ref("");
const formTag = ref("");
const editingItemId = ref<string | null>(null);
const imagePreview = ref<string | null>(null);

// Suggestion state
const currentSuggestion = ref<{ n: string; d: string } | null>(null);
const isSuggestionAlreadyInList = ref(false);

// Filter state
const activeFilterTag = ref("__all__");

const currentCategory = computed(() => SAVE_CATEGORIES.find((c) => c.id === props.category));
const hints = computed(() => HINTS[props.category] || { t: "Tiêu đề", d: "Mô tả" });
const presetTags = computed(() => TAGS_BY_CATEGORY[props.category] || []);
const hasFile = computed(() => ["food", "cafe", "places"].includes(props.category));

const allItems = computed(() => dataStore.getItemsByCategory(props.category));
const filteredItems = computed(() => {
  if (activeFilterTag.value === "__all__") return allItems.value;
  return allItems.value.filter((i) => (i.tag || "") === activeFilterTag.value);
});

const tagCount = (tag: string) => {
  return allItems.value.filter((i) => (i.tag || "") === tag).length;
};

onMounted(() => {
  dataStore.loadData();
});

const selectTag = (tag: string) => {
  formTag.value = formTag.value === tag ? "" : tag;
};

const handleImgUpload = (event: Event) => {
  const target = event.target as HTMLInputElement;
  const file = target.files?.[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = (e) => {
    imagePreview.value = e.target?.result as string;
  };
  reader.readAsDataURL(file);
};

const clearForm = () => {
  formTitle.value = "";
  formDescription.value = "";
  formTag.value = "";
  imagePreview.value = null;
  editingItemId.value = null;
  const fileEl = document.getElementById("if") as HTMLInputElement | null;
  if (fileEl) fileEl.value = "";
};

const saveItem = () => {
  if (!formTitle.value.trim()) {
    alert("Vui lòng nhập tiêu đề!");
    return;
  }

  if (editingItemId.value) {
    dataStore.updateItem({
      id: editingItemId.value,
      title: formTitle.value.trim(),
      desc: formDescription.value.trim(),
      tag: formTag.value,
      image: imagePreview.value,
    });
  } else {
    dataStore.addItem({
      category: props.category,
      title: formTitle.value.trim(),
      desc: formDescription.value.trim(),
      tag: formTag.value,
      image: imagePreview.value,
    });
  }

  clearForm();
};

const startEdit = (idVal: string) => {
  editingItemId.value = idVal;
  const item = dataStore.items.find((x) => x.id === idVal);
  if (item) {
    formTitle.value = item.title;
    formDescription.value = item.desc || "";
    formTag.value = item.tag || "";
    imagePreview.value = item.image || null;
    window.scrollTo({ top: 0, behavior: "smooth" });
  }
};

const deleteItem = (idVal: string) => {
  if (confirm("Bạn có chắc chắn muốn xoá mục này?")) {
    dataStore.deleteItem(idVal);
    if (editingItemId.value === idVal) {
      clearForm();
    }
  }
};

// Suggestions
const pickRandomSuggestion = () => {
  const pool = SUGGESTIONS[props.category];
  if (!pool || !pool.length) return;

  const existingNames = new Set(
    dataStore.items
      .filter((i) => i.category === props.category)
      .map((i) => i.title.trim().toLowerCase()),
  );

  const fresh = pool.filter((p) => !existingNames.has(p.n.trim().toLowerCase()));
  const candidates = fresh.length > 0 ? fresh : pool;

  let next = null;
  for (let k = 0; k < 8; k++) {
    next = candidates[Math.floor(Math.random() * candidates.length)];
    if (!currentSuggestion.value || next.n !== currentSuggestion.value.n || candidates.length === 1)
      break;
  }

  currentSuggestion.value = next;
  isSuggestionAlreadyInList.value = existingNames.has(next.n.trim().toLowerCase());
};

const addSuggestionToList = () => {
  if (!currentSuggestion.value) return;
  dataStore.addItem({
    category: props.category,
    title: currentSuggestion.value.n,
    desc: currentSuggestion.value.d,
    tag: "",
    image: null,
  });
  isSuggestionAlreadyInList.value = true;
  alert(`Đã thêm "${currentSuggestion.value.n}" vào list!`);
};

const handleBulkImport = (newItems: any[]) => {
  // Add category to each item
  const itemsWithCat = newItems.map((item) => ({
    ...item,
    category: props.category,
  }));
  dataStore.addItems(itemsWithCat);
};
</script>

<template>
  <div>
    <!-- Form Card -->
    <div class="card">
      <div
        style="
          font-family: &quot;Pangolin&quot;, cursive;
          font-size: 1.2rem;
          color: var(--earth);
          margin-bottom: 14px;
          display: flex;
          align-items: center;
          gap: 8px;
        "
      >
        <GhibliIcon v-if="currentCategory" :type="currentCategory.ico" size="24" />
        {{ editingItemId ? "Sửa mục:" : "Thêm vào:" }} {{ currentCategory?.label }}
      </div>

      <div class="form-group">
        <label>Tiêu đề</label>
        <input v-model="formTitle" class="form-input" :placeholder="hints.t" />
      </div>

      <div class="form-group">
        <label>Mô tả</label>
        <textarea v-model="formDescription" class="form-textarea" :placeholder="hints.d"></textarea>
      </div>

      <div class="form-group">
        <label>Gắn thẻ</label>
        <div class="tag-pick-row">
          <button
            v-for="(t, idx) in presetTags"
            :key="t"
            type="button"
            class="tag-pick"
            :class="[`c${idx % 6}`, { active: formTag === t }]"
            @click="selectTag(t)"
          >
            {{ t }}
          </button>
        </div>
      </div>

      <div class="form-group">
        <label class="file-upload-label" for="if">Chọn hình ảnh</label>
        <input
          type="file"
          id="if"
          accept="image/*"
          style="display: none"
          @change="handleImgUpload"
        />
        <img v-if="imagePreview" :src="imagePreview" class="img-preview" />
      </div>

      <div style="display: flex; gap: 10px; margin-top: 8px">
        <button class="btn btn-primary" @click="saveItem">Lưu lại</button>
        <button v-if="editingItemId" class="btn btn-secondary" @click="clearForm">Huỷ</button>
      </div>
    </div>

    <!-- Suggestions (if available) -->
    <div v-if="SUGGESTIONS[props.category]" class="card sugg-card">
      <div class="sugg-header">
        <div class="sugg-title">
          <GhibliIcon type="calcifer" size="22" />
          Gợi ý {{ currentCategory?.label.toLowerCase() }}
        </div>
        <button class="btn btn-primary btn-small" @click="pickRandomSuggestion">
          {{ currentSuggestion ? "Gợi ý khác" : "Bốc thử một quán" }}
        </button>
      </div>

      <div v-if="currentSuggestion" class="sugg-body">
        <div class="sugg-name">
          <GhibliIcon v-if="currentCategory" :type="currentCategory.ico" size="20" />
          {{ currentSuggestion.n }}
        </div>
        <div class="sugg-desc">{{ currentSuggestion.d }}</div>
        <div class="sugg-actions">
          <button class="btn btn-primary btn-small" @click="addSuggestionToList">
            <span style="display: inline-flex; align-items: center; gap: 4px">
              <GhibliIcon type="heart" size="16" />
              Thêm vào list
            </span>
          </button>
          <button class="btn btn-secondary btn-small" @click="pickRandomSuggestion">
            🔄 Gợi ý khác
          </button>
        </div>
        <div v-if="isSuggestionAlreadyInList" class="sugg-warn">
          Quán này đã có trong list của bạn rồi nhé ✿
        </div>
      </div>
      <div v-else class="sugg-empty">
        Bấm nút để nhận gợi ý ngẫu nhiên từ {{ SUGGESTIONS[props.category].length }}
        {{ currentCategory?.label.toLowerCase() }} ở Sài Gòn ✿
      </div>
    </div>

    <!-- Quick Add -->
    <QuickAddCard :preset-tags="presetTags" :has-file="hasFile" @imported="handleBulkImport" />

    <!-- Tag Filter -->
    <div v-if="allItems.length > 0 && presetTags.length > 0" class="tag-filter">
      <span class="tag-filter-label">Lọc theo thẻ:</span>
      <button
        class="tag-chip"
        :class="{ active: activeFilterTag === '__all__' }"
        @click="activeFilterTag = '__all__'"
      >
        Tất cả <span class="tag-count">({{ allItems.length }})</span>
      </button>
      <button
        v-for="t in presetTags"
        :key="t"
        class="tag-chip"
        :class="{ active: activeFilterTag === t }"
        @click="activeFilterTag = t"
      >
        {{ t }} <span class="tag-count">({{ tagCount(t) }})</span>
      </button>
    </div>

    <!-- Items List -->
    <div v-if="allItems.length === 0" class="empty-state">
      <GhibliIcon v-if="currentCategory" :type="currentCategory.ico" size="60" />
      <p style="margin-top: 12px">Chưa có gì ở đây cả... Hãy thêm kỷ niệm đầu tiên nhé!</p>
    </div>
    <div v-else-if="filteredItems.length === 0" class="empty-state">
      <GhibliIcon v-if="currentCategory" :type="currentCategory.ico" size="60" />
      <p style="margin-top: 12px">
        Không có mục nào với thẻ "<strong>{{ activeFilterTag }}</strong
        >".
      </p>
    </div>
    <div v-else class="items-grid">
      <SaveItemCard
        v-for="item in filteredItems"
        :key="item.id"
        :item="item"
        :category-icon="currentCategory?.ico || ''"
        @edit="startEdit"
        @delete="deleteItem"
      />
    </div>
  </div>
</template>
