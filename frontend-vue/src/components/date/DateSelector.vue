<script setup lang="ts">
import { DATE_SLOTS, DATE_MOODS } from "@/data/mock";
import GhibliIcon from "@/components/icons/GhibliIcon.vue";

const props = defineProps({
  selectedSlots: {
    type: Array,
    required: true,
  },
  selectedMoods: {
    type: Array,
    required: true,
  },
});

const emit = defineEmits(["update:selectedSlots", "update:selectedMoods", "generate"]);

const toggleDateSlot = (id) => {
  const updated = [...props.selectedSlots];
  if (updated.includes(id)) {
    emit(
      "update:selectedSlots",
      updated.filter((x) => x !== id),
    );
  } else {
    if (updated.length >= 2) {
      updated.shift();
    }
    updated.push(id);
    emit("update:selectedSlots", updated);
  }
};

const toggleDateMood = (id) => {
  const updated = [...props.selectedMoods];
  if (updated.includes(id)) {
    emit(
      "update:selectedMoods",
      updated.filter((x) => x !== id),
    );
  } else {
    if (updated.length >= 3) return;
    updated.push(id);
    emit("update:selectedMoods", updated);
  }
};
</script>

<template>
  <div class="card">
    <div
      style="
        font-family: &quot;Pangolin&quot;, cursive;
        font-size: 1.1rem;
        color: var(--earth);
        margin-bottom: 18px;
        display: flex;
        align-items: center;
        gap: 6px;
      "
    >
      <GhibliIcon type="date" size="20" />
      <span>Chọn khung giờ</span>
      <span
        style="
          font-size: 0.8rem;
          color: var(--ink-light);
          font-family: &quot;Quicksand&quot;, sans-serif;
        "
        >(tối đa 2 khung)</span
      >
    </div>

    <div style="display: flex; flex-wrap: wrap; gap: 10px; margin-bottom: 24px">
      <div
        v-for="s in DATE_SLOTS"
        :key="s.id"
        @click="toggleDateSlot(s.id)"
        :style="{
          cursor: 'pointer',
          padding: '10px 16px',
          borderRadius: '16px',
          border: `2px solid ${selectedSlots.includes(s.id) ? 'var(--sunset)' : 'var(--earth)'}`,
          background: selectedSlots.includes(s.id) ? 'var(--sunset)' : 'var(--card)',
          color: selectedSlots.includes(s.id) ? 'white' : 'var(--ink)',
          transition: 'all 0.2s',
          textAlign: 'center',
          boxShadow: selectedSlots.includes(s.id) ? '0 4px 14px rgba(244,164,96,0.35)' : 'none',
          minWidth: '120px',
          flex: '1 1 calc(33.33% - 10px)',
        }"
      >
        <div style="font-size: 1rem">{{ s.sub }}</div>
        <div
          style="font-size: 0.8rem; font-weight: 700; margin-top: 2px"
          :style="{ opacity: selectedSlots.includes(s.id) ? 1 : 0.7 }"
        >
          {{ s.label }}
        </div>
      </div>
    </div>

    <div
      style="
        font-family: &quot;Pangolin&quot;, cursive;
        font-size: 1.1rem;
        color: var(--earth);
        margin-bottom: 12px;
        display: flex;
        align-items: center;
        gap: 6px;
      "
    >
      <GhibliIcon type="heart" size="18" />
      <span>Mood hẹn hò</span>
      <span
        style="
          font-size: 0.8rem;
          color: var(--ink-light);
          font-family: &quot;Quicksand&quot;, sans-serif;
        "
        >(tối đa 3 thẻ)</span
      >
    </div>

    <div style="display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 24px">
      <button
        v-for="m in DATE_MOODS"
        :key="m.id"
        @click="toggleDateMood(m.id)"
        :style="{
          fontFamily: `'Quicksand',sans-serif`,
          fontWeight: '700',
          fontSize: '0.88rem',
          padding: '8px 18px',
          borderRadius: '24px',
          border: `2px solid ${selectedMoods.includes(m.id) ? 'var(--grass)' : 'var(--earth)'}`,
          background: selectedMoods.includes(m.id) ? 'var(--grass)' : 'var(--card)',
          color: selectedMoods.includes(m.id) ? 'white' : 'var(--ink)',
          cursor: 'pointer',
          transition: 'all 0.2s',
          boxShadow: selectedMoods.includes(m.id) ? '0 3px 10px rgba(140,183,140,0.4)' : 'none',
        }"
      >
        {{ m.label }}
      </button>
    </div>

    <div v-if="selectedSlots.length > 0 && selectedMoods.length > 0" style="text-align: center">
      <button
        class="btn btn-primary"
        @click="$emit('generate')"
        style="
          padding: 13px 40px;
          font-size: 1rem;
          display: inline-flex;
          align-items: center;
          gap: 8px;
          cursor: pointer;
        "
      >
        <GhibliIcon type="heart" size="16" color="#fff" />
        Tạo kế hoạch hẹn hò
      </button>
    </div>
    <div
      v-else
      style="text-align: center; color: var(--ink-light); font-size: 0.9rem; padding: 8px 0"
    >
      Chọn ít nhất 1 khung giờ và 1 mood để bắt đầu nhé 💫
    </div>
  </div>
</template>
