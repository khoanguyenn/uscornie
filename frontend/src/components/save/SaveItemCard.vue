<script setup lang="ts">
import GhibliIcon from "@/components/icons/GhibliIcon.vue";

defineProps({
  item: {
    type: Object,
    required: true,
  },
  categoryIcon: {
    type: String,
    required: true,
  },
});

defineEmits(["edit", "delete"]);
</script>

<template>
  <div class="item-card">
    <img v-if="item.image" class="item-img" :src="item.image" :alt="item.title" />
    <div v-else class="no-img">
      <GhibliIcon :type="categoryIcon" size="50" />
    </div>
    <div class="item-body">
      <div class="item-title">{{ item.title }}</div>
      <div class="item-desc">{{ item.desc }}</div>
      <span v-if="item.tag" class="item-tag">{{ item.tag }}</span>
      <div class="item-actions">
        <button class="btn btn-secondary btn-small" @click="$emit('edit', item.id)">Sửa</button>
        <button class="btn btn-danger btn-small" @click="$emit('delete', item.id)">Xoá</button>
      </div>
    </div>
  </div>
</template>
