<script setup lang="ts">
import { ref, computed, onMounted, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import { EXCEL_GIFTS, OCCASIONS } from "@/data/mock";
import { useDataStore } from "@/stores/useDataStore";
import GhibliIcon from "@/components/icons/GhibliIcon.vue";

const route = useRoute();
const router = useRouter();
const dataStore = useDataStore();

const giftMode = computed(() => route.query.mode || "random");
const selOcc = ref(null);
const selGender = ref(null);
const giftRes = ref(null);

const genders = [
  { id: "female", label: "👧 Nữ" },
  { id: "male", label: "👦 Nam" },
  { id: "unisex", label: "🌈 Unisex" },
];

const swGM = (m) => {
  router.push({ path: "/gift", query: { mode: m } });
  giftRes.value = null;
  selOcc.value = null;
  selGender.value = null;
};

const selO = (id) => {
  selOcc.value = id;
  giftRes.value = null;
};

const selGnd = (id) => {
  selGender.value = id;
  giftRes.value = null;
};

const doRG = () => {
  if (!selOcc.value || !selGender.value) return;
  const pool = (EXCEL_GIFTS[selOcc.value] || {})[selGender.value] || [];
  if (!pool.length) {
    giftRes.value = { title: "Chưa có gợi ý cho lựa chọn này 🙈", reason: "" };
  } else {
    const item = pool[Math.floor(Math.random() * pool.length)];
    giftRes.value = { title: item, reason: "" };
  }
};

const wishlistItems = computed(() => dataStore.getItemsByCategory("wishlist"));

const doWG = () => {
  if (!wishlistItems.value.length) return;
  const item = wishlistItems.value[Math.floor(Math.random() * wishlistItems.value.length)];
  giftRes.value = item;
};

watch(
  () => route.query.mode,
  () => {
    giftRes.value = null;
    selOcc.value = null;
    selGender.value = null;
  },
);

onMounted(() => {
  dataStore.loadData();
});
</script>

<template>
  <div style="width: 100%; max-width: 600px; margin: 0 auto">
    <h2 class="page-title">
      <span class="pt-ico"><GhibliIcon type="calcifer" size="32" /></span>
      Gợi ý quà tặng
    </h2>

    <!-- Mode Tabs -->
    <div class="gift-mode-tabs">
      <button
        class="gift-mode-tab"
        :class="{ active: giftMode === 'random' }"
        @click="swGM('random')"
      >
        Gợi ý ngẫu nhiên
      </button>
      <button
        class="gift-mode-tab"
        :class="{ active: giftMode === 'wishlist' }"
        @click="swGM('wishlist')"
      >
        Gợi ý từ Wishlist
      </button>
    </div>

    <!-- Random Mode View -->
    <div v-if="giftMode === 'random'">
      <p style="text-align: center; color: var(--ink-light); font-weight: 500; margin-bottom: 16px">
        Chọn dịp và đối tượng để nhận gợi ý nha 🎁
      </p>

      <p
        style="
          text-align: center;
          color: var(--ink);
          font-weight: 700;
          font-size: 0.85rem;
          letter-spacing: 0.05em;
          text-transform: uppercase;
          margin-bottom: 10px;
        "
      >
        🎉 Dịp đặc biệt
      </p>

      <div class="occasion-grid" style="margin-bottom: 20px">
        <div
          v-for="o in OCCASIONS"
          :key="o.id"
          class="occasion-card"
          :class="{ selected: selOcc === o.id }"
          @click="selO(o.id)"
        >
          <div class="occasion-name">{{ o.name }}</div>
        </div>
      </div>

      <p
        style="
          text-align: center;
          color: var(--ink);
          font-weight: 700;
          font-size: 0.85rem;
          letter-spacing: 0.05em;
          text-transform: uppercase;
          margin: 20px 0 10px;
        "
      >
        🎁 Tặng cho ai?
      </p>

      <div
        style="
          display: flex;
          gap: 10px;
          justify-content: center;
          flex-wrap: wrap;
          margin-bottom: 24px;
        "
      >
        <button
          v-for="g in genders"
          :key="g.id"
          @click="selGnd(g.id)"
          :style="{
            fontFamily: `'Quicksand',sans-serif`,
            fontWeight: '700',
            fontSize: '0.95rem',
            padding: '10px 22px',
            borderRadius: '24px',
            border: `2px solid ${selGender === g.id ? 'var(--sunset)' : 'var(--earth)'}`,
            background: selGender === g.id ? 'var(--sunset)' : 'var(--card)',
            color: selGender === g.id ? 'white' : 'var(--ink)',
            cursor: 'pointer',
            transition: 'all 0.2s',
            boxShadow: selGender === g.id ? '0 4px 14px rgba(244,164,96,0.35)' : 'none',
          }"
        >
          {{ g.label }}
        </button>
      </div>

      <div v-if="selOcc && selGender" style="text-align: center; margin: 4px 0 24px">
        <button
          class="btn btn-primary"
          @click="doRG"
          style="padding: 14px 40px; font-size: 1rem; cursor: pointer"
        >
          ✨ Gợi ý giúp mình
        </button>
      </div>

      <!-- Suggestion Result -->
      <div v-if="giftRes" class="gift-result">
        <div class="gift-label">
          Gợi ý cho {{ OCCASIONS.find((o) => o.id === selOcc)?.name || "" }} ·
          {{ genders.find((g) => g.id === selGender)?.label || "" }}:
        </div>
        <div class="gift-name" style="font-size: 1.5rem; margin: 12px 0">
          {{ giftRes.title }}
        </div>
        <div v-if="giftRes.reason" class="gift-desc" style="margin-top: 6px; font-style: italic">
          💬 {{ giftRes.reason }}
        </div>
        <div style="margin-top: 20px">
          <button class="btn btn-secondary" @click="doRG" style="cursor: pointer">
            🔄 Gợi ý khác
          </button>
        </div>
      </div>
    </div>

    <!-- Wishlist Mode View -->
    <div v-else-if="giftMode === 'wishlist'">
      <p style="text-align: center; color: var(--ink-light); font-weight: 500; margin-bottom: 16px">
        Chọn dịp đặc biệt để bốc quà từ Wishlist
      </p>

      <div class="occasion-grid" style="margin-bottom: 20px">
        <div
          v-for="o in OCCASIONS"
          :key="o.id"
          class="occasion-card"
          :class="{ selected: selOcc === o.id }"
          @click="selO(o.id)"
        >
          <div class="occasion-name">{{ o.name }}</div>
        </div>
      </div>

      <div v-if="selOcc && wishlistItems.length > 0" style="text-align: center; margin: 20px 0">
        <button
          class="btn btn-primary"
          @click="doWG"
          style="padding: 14px 36px; font-size: 1rem; cursor: pointer"
        >
          Bốc quà từ Wishlist
        </button>
      </div>

      <!-- Wishlist Result -->
      <div v-if="giftRes" class="gift-result">
        <div class="gift-label">
          Gợi ý cho {{ OCCASIONS.find((o) => o.id === selOcc)?.name || "" }}:
        </div>
        <div class="gift-name">
          {{ giftRes.title }}
        </div>
        <div v-if="giftRes.desc" class="gift-desc">
          {{ giftRes.desc }}
        </div>
        <img
          v-if="giftRes.image"
          :src="giftRes.image"
          style="
            max-width: 260px;
            border-radius: 14px;
            margin-top: 16px;
            box-shadow: 0 4px 16px var(--shadow);
          "
        />
        <div style="margin-top: 16px">
          <button class="btn btn-secondary" @click="doWG" style="cursor: pointer">Bốc lại</button>
        </div>
      </div>

      <!-- Empty State -->
      <div v-if="wishlistItems.length === 0" class="empty-state">
        <GhibliIcon type="soot" size="60" style="opacity: 0.25; margin: 0 auto 12px" />
        <p style="margin-top: 12px">
          Wishlist đang trống. Hãy thêm vào mục "Wishlist quà tặng" trước nhé!
        </p>
      </div>
    </div>
  </div>
</template>
