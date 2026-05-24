<script setup lang="ts">
import { computed } from "vue";
import { useRoute, useRouter } from "vue-router";
import { SAVE_CATEGORIES } from "@/data/mock";
import GhibliIcon from "@/components/icons/GhibliIcon.vue";
import CategoryTabs from "@/components/save/CategoryTabs.vue";
import SaveCategoryContent from "@/components/save/SaveCategoryContent.vue";

const route = useRoute();
const router = useRouter();
const selectedCategory = computed(() => (route.query.cat as string) || "wishlist");

// Category switching via route update
const switchCategory = (idVal: string) => {
  router.push({ path: "/save", query: { cat: idVal } });
};
</script>

<template>
  <div style="width: 100%">
    <h2 class="page-title">
      <span class="pt-ico"><GhibliIcon type="soot" size="32" /></span>
      Lưu mọi thứ
    </h2>

    <!-- Navigation Tabs -->
    <CategoryTabs
      :model-value="selectedCategory"
      :categories="SAVE_CATEGORIES"
      @update:model-value="switchCategory"
    />

    <!-- Animated content section keyed by selectedCategory -->
    <Transition name="fade-slide" mode="out-in">
      <SaveCategoryContent :key="selectedCategory" :category="selectedCategory" />
    </Transition>
  </div>
</template>

<style scoped>
/* Hiệu ứng xuất hiện (Enter) - Có đàn hồi nhẹ */
.fade-slide-enter-active {
  transition:
    opacity 0.35s ease-out,
    transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
}

/* Hiệu ứng biến mất (Leave) - Nhanh và dứt khoát */
.fade-slide-leave-active {
  transition:
    opacity 0.2s ease-in,
    transform 0.2s ease-in;
}

/* Trạng thái bắt đầu của tab mới: Hơi nhỏ và nằm dưới một chút */
.fade-slide-enter-from {
  opacity: 0;
  transform: scale(0.96) translateY(12px);
}

/* Trạng thái kết thúc của tab cũ: Mờ dần và thu nhỏ nhẹ */
.fade-slide-leave-to {
  opacity: 0;
  transform: scale(0.98) translateY(-8px);
}
</style>
