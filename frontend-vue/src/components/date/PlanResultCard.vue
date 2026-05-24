<script setup lang="ts">
import { DATE_MOODS } from "@/data/mock";
import GhibliIcon from "@/components/icons/GhibliIcon.vue";

defineProps({
  plan: {
    type: Array,
    required: true,
  },
  selectedMoods: {
    type: Array,
    required: true,
  },
});

defineEmits(["regenerate", "reset"]);

const moodColors = {
  nhonnhip: "#f4a460",
  langman: "#f2a0a0",
  khampha: "#7ec8c8",
  thugian: "#a8c88e",
  nghethuat: "#b39ddb",
  haihuoc: "#ffcc80",
  sangchanh: "#c9a96e",
  khac: "#aaa",
};
</script>

<template>
  <div>
    <div class="card" style="padding: 28px">
      <div
        style="
          font-family: &quot;Pangolin&quot;, cursive;
          font-size: 1.35rem;
          color: var(--ink);
          margin-bottom: 4px;
          display: flex;
          align-items: center;
          gap: 8px;
        "
      >
        <GhibliIcon type="date" size="24" />
        Kế hoạch hẹn hò của bạn
      </div>
      <div style="font-size: 0.83rem; color: var(--ink-light); margin-bottom: 22px">
        Mood:
        {{
          selectedMoods.map((id) => DATE_MOODS.find((m) => m.id === id)?.label || "").join(" · ")
        }}
      </div>

      <div v-for="block in plan" :key="block.slot.id" style="margin-bottom: 28px">
        <div
          style="
            font-family: &quot;Pangolin&quot;, cursive;
            font-size: 1.2rem;
            color: var(--ink);
            margin-bottom: 14px;
            display: flex;
            align-items: center;
            gap: 8px;
          "
        >
          <span>{{ block.slot.label }}</span>
          <span
            style="
              font-size: 0.8rem;
              color: var(--ink-light);
              font-family: &quot;Quicksand&quot;, sans-serif;
            "
            >{{ block.slot.sub }}</span
          >
        </div>
        <div style="display: flex; flex-direction: column; gap: 10px">
          <div
            v-for="(item, idx) in block.items"
            :key="idx"
            class="date-activity-item"
            :style="{
              background: 'var(--cream)',
              border: '1.5px solid rgba(201,169,110,0.2)',
              borderRadius: '14px',
              padding: '14px 18px',
              display: 'flex',
              gap: '14px',
              alignItems: 'flex-start',
              animation: `fadeUp 0.35s ease ${idx * 0.08}s both`,
              transition: 'all 0.25s',
            }"
          >
            <div
              :style="{
                width: '34px',
                height: '34px',
                borderRadius: '50%',
                background: (moodColors[item.mood] || 'var(--earth)') + '22',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                fontSize: '0.9rem',
                fontWeight: '700',
                color: moodColors[item.mood] || 'var(--ink)',
              }"
            >
              {{ DATE_MOODS.find((m) => m.id === item.mood)?.label?.split(" ")[0] || "✨" }}
            </div>
            <div style="flex: 1; min-width: 0">
              <div
                style="
                  font-family: &quot;Pangolin&quot;, cursive;
                  font-size: 1rem;
                  color: var(--ink);
                  margin-bottom: 3px;
                "
              >
                {{ item.a }}
              </div>
              <div
                style="
                  font-size: 0.82rem;
                  color: var(--ink-light);
                  display: flex;
                  align-items: center;
                  gap: 4px;
                "
              >
                <GhibliIcon type="pin" size="13" />
                {{ item.l || "—" }}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div style="text-align: center; margin-top: 12px">
      <button
        class="btn btn-secondary"
        @click="$emit('regenerate')"
        style="margin-right: 8px; cursor: pointer"
      >
        🔄 Tạo lại
      </button>
      <button class="btn btn-primary" @click="$emit('reset')" style="cursor: pointer">
        Đặt lại
      </button>
    </div>
  </div>
</template>

<style scoped>
.date-activity-item:hover {
  box-shadow: 0 4px 14px rgba(74, 64, 51, 0.1);
  transform: translateX(3px);
}
</style>
