<script setup lang="ts">
import GhibliIcon from "@/components/icons/GhibliIcon.vue";

defineProps({
  modelValue: {
    type: String,
    required: true,
  },
  categories: {
    type: Array,
    required: true,
  },
});

defineEmits(["update:modelValue"]);
</script>

<template>
  <div class="sub-tabs">
    <button
      v-for="x in categories"
      :key="x.id"
      class="sub-tab"
      :class="{ active: modelValue === x.id }"
      @click="$emit('update:modelValue', x.id)"
    >
      <span class="st-ico"><GhibliIcon :type="x.ico" size="16" /></span>
      {{ x.label }}
    </button>
  </div>
</template>
