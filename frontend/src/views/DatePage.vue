<script setup lang="ts">
import { ref } from "vue";
import { DATE_DB, DATE_SLOTS } from "@/data/mock";
import GhibliIcon from "@/components/icons/GhibliIcon.vue";
import DateSelector from "@/components/date/DateSelector.vue";
import PlanResultCard from "@/components/date/PlanResultCard.vue";

const selDateSlots = ref([]);
const selDateMoods = ref([]);
const datePlan2 = ref(null);

const burst = () => {
  let c = document.getElementById("heart-burst");
  if (!c) {
    c = document.createElement("div");
    c.id = "heart-burst";
    c.className = "heart-burst";
    document.body.appendChild(c);
  }
  const cols = ["#f2a0a0", "#f5c0c0", "#f9e27a", "#a8e6cf", "#f5a0b8"];
  for (let i = 0; i < 14; i++) {
    const p = document.createElement("div");
    p.className = "hb-particle";
    p.style.left = 30 + Math.random() * 40 + "%";
    p.style.bottom = "35%";
    p.style.animationDelay = Math.random() * 0.4 + "s";
    p.style.animationDuration = 1.4 + Math.random() * 0.8 + "s";
    const sz = 16 + Math.random() * 18;
    p.innerHTML = `<svg width="${sz}" height="${sz}" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path d="M10 17 Q0 10 3 5 Q5 2 8 4 Q9 5 10 7 Q11 5 12 4 Q15 2 17 5 Q20 10 10 17Z" fill="${cols[Math.floor(Math.random() * cols.length)]}"/></svg>`;
    c.appendChild(p);
    setTimeout(() => p.remove(), 2500);
  }
};

const genDatePlan2 = () => {
  if (!selDateSlots.value.length || !selDateMoods.value.length) return;
  const plan = [];
  const used = new Set();

  selDateSlots.value.forEach((slotId) => {
    const slotData = DATE_DB[slotId] || {};
    const slotInfo = DATE_SLOTS.find((s) => s.id === slotId);
    const activities = [];

    // Collect from selected moods (excluding 'khac' first)
    const primaryMoods = selDateMoods.value.filter((m) => m !== "khac");
    const hasKhac = selDateMoods.value.includes("khac");

    primaryMoods.forEach((moodId) => {
      (slotData[moodId] || []).forEach((item) => {
        if (!used.has(item.a)) activities.push({ ...item, mood: moodId });
      });
    });

    // Also include 'khac' if selected
    if (hasKhac) {
      (slotData["khac"] || []).forEach((item) => {
        if (!used.has(item.a)) activities.push({ ...item, mood: "khac" });
      });
    }

    // Shuffle
    activities.sort(() => Math.random() - 0.5);

    // Pick 3-5
    let picked = activities.slice(0, Math.min(5, activities.length));

    // If < 3, fill from 'khac' fallback regardless of selection
    if (picked.length < 3) {
      const fallback = (slotData["khac"] || []).filter(
        (item) => !used.has(item.a) && !picked.some((p) => p.a === item.a),
      );
      fallback.sort(() => Math.random() - 0.5);
      picked = picked.concat(fallback.slice(0, 3 - picked.length));
    }

    // Still < 3? Fill from any mood in that slot
    if (picked.length < 3) {
      const allInSlot = [];
      Object.values(slotData).forEach((arr) =>
        arr.forEach((item) => {
          if (!used.has(item.a) && !picked.some((p) => p.a === item.a)) allInSlot.push(item);
        }),
      );
      allInSlot.sort(() => Math.random() - 0.5);
      picked = picked.concat(allInSlot.slice(0, 3 - picked.length));
    }

    picked.forEach((p) => used.add(p.a));
    plan.push({ slot: slotInfo, items: picked });
  });

  datePlan2.value = plan;
  burst();
};

const resetPlan = () => {
  datePlan2.value = null;
};
</script>

<template>
  <div style="width: 100%; max-width: 600px; margin: 0 auto">
    <h2 class="page-title">
      <span class="pt-ico"><GhibliIcon type="soot" size="32" /></span>
      Gợi ý hẹn hò
    </h2>

    <!-- Settings Card -->
    <DateSelector
      v-if="!datePlan2"
      v-model:selected-slots="selDateSlots"
      v-model:selected-moods="selDateMoods"
      @generate="genDatePlan2"
    />

    <!-- Results Card -->
    <PlanResultCard
      v-if="datePlan2"
      :plan="datePlan2"
      :selected-moods="selDateMoods"
      @regenerate="genDatePlan2"
      @reset="resetPlan"
    />

    <!-- Empty State -->
    <div v-if="!datePlan2" class="empty-state" style="padding: 32px 20px">
      <GhibliIcon type="date" size="60" style="opacity: 0.25; margin: 0 auto 12px" />
      <p style="margin-top: 12px">Chọn khung giờ và mood rồi bấm tạo kế hoạch nhé!</p>
    </div>
  </div>
</template>
