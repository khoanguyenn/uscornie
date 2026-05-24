<script setup lang="ts">
import { ref, onMounted, onUnmounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import GhibliIcon from "./icons/GhibliIcon.vue";
import { SAVE_CATEGORIES, GIFT_MODES } from "@/data/mock";

const route = useRoute();
const router = useRouter();

const openDD = ref(null);

const toggleDD = (name, event) => {
  if (event) event.stopPropagation();
  openDD.value = openDD.value === name ? null : name;
};

const closeDD = () => {
  openDD.value = null;
};

const go = (path) => {
  openDD.value = null;
  router.push(path);
};

const goSave = (catId) => {
  openDD.value = null;
  router.push({ path: "/save", query: { cat: catId } });
};

const goGift = (modeId) => {
  openDD.value = null;
  router.push({ path: "/gift", query: { mode: modeId } });
};

onMounted(() => {
  window.addEventListener("click", closeDD);
});

onUnmounted(() => {
  window.removeEventListener("click", closeDD);
});
</script>

<template>
  <nav class="nav-bar">
    <!-- Trang chủ -->
    <div class="nav-item">
      <button class="nav-btn" :class="{ active: route.path === '/' }" @click="go('/')">
        <GhibliIcon type="totoro" size="20" class="nav-ico" />
        <span>Trang chủ</span>
      </button>
    </div>

    <!-- Lưu mọi thứ (Dropdown) -->
    <div class="nav-item" :class="{ open: openDD === 'save' }" @click.stop>
      <button
        class="nav-btn"
        :class="{ active: route.path === '/save' }"
        @click="toggleDD('save', $event)"
      >
        <GhibliIcon type="soot" size="20" class="nav-ico" />
        <span>Lưu mọi thứ</span>
        <span class="arrow">▼</span>
      </button>
      <div class="nav-dropdown">
        <button
          v-for="c in SAVE_CATEGORIES"
          :key="c.id"
          class="dd-item"
          :class="{ active: route.path === '/save' && route.query.cat === c.id }"
          @click="goSave(c.id)"
        >
          <GhibliIcon :type="c.ico" size="18" class="dd-ico" />
          <span>{{ c.label }}</span>
        </button>
      </div>
    </div>

    <!-- Ngày bên nhau -->
    <div class="nav-item">
      <button
        class="nav-btn"
        :class="{ active: route.path === '/calendar' }"
        @click="go('/calendar')"
      >
        <GhibliIcon type="heart" size="20" class="nav-ico" />
        <span>Ngày bên nhau</span>
      </button>
    </div>

    <!-- Gợi ý quà (Dropdown) -->
    <div class="nav-item" :class="{ open: openDD === 'gift' }" @click.stop>
      <button
        class="nav-btn"
        :class="{ active: route.path === '/gift' }"
        @click="toggleDD('gift', $event)"
      >
        <GhibliIcon type="calcifer" size="20" class="nav-ico" />
        <span>Gợi ý quà</span>
        <span class="arrow">▼</span>
      </button>
      <div class="nav-dropdown">
        <button
          v-for="m in GIFT_MODES"
          :key="m.id"
          class="dd-item"
          :class="{ active: route.path === '/gift' && route.query.mode === m.id }"
          @click="goGift(m.id)"
        >
          <span>{{ m.label }}</span>
        </button>
      </div>
    </div>

    <!-- Gợi ý hẹn hò -->
    <div class="nav-item">
      <button class="nav-btn" :class="{ active: route.path === '/date' }" @click="go('/date')">
        <GhibliIcon type="soot" size="20" class="nav-ico" />
        <span>Gợi ý hẹn hò</span>
      </button>
    </div>
  </nav>
</template>
