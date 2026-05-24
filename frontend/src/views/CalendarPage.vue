<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { OCCASIONS } from "@/data/mock";
import { useDataStore } from "@/stores/useDataStore";
import GhibliIcon from "@/components/icons/GhibliIcon.vue";

const dataStore = useDataStore();

const anniversaryDate = computed(() => dataStore.anniversaryDate);
const birthdayDate = computed(() => dataStore.birthdayDate);

onMounted(() => {
  dataStore.loadData();
});

const daysTogether = computed(() => {
  if (!anniversaryDate.value) return null;
  const start = new Date(anniversaryDate.value);
  const now = new Date();
  const diff = now - start;
  return Math.max(0, Math.floor(diff / (1000 * 60 * 60 * 24)));
});

const detailTime = computed(() => {
  if (!anniversaryDate.value) return "";
  const start = new Date(anniversaryDate.value);
  const now = new Date();
  let years = now.getFullYear() - start.getFullYear();
  let months = now.getMonth() - start.getMonth();
  let days = now.getDate() - start.getDate();

  if (days < 0) {
    months--;
    const lastMonth = new Date(now.getFullYear(), now.getMonth(), 0);
    days += lastMonth.getDate();
  }
  if (months < 0) {
    years--;
    months += 12;
  }

  const parts = [];
  if (years > 0) parts.push(`${years} năm`);
  if (months > 0) parts.push(`${months} tháng`);
  if (days > 0) parts.push(`${days} ngày`);
  return parts.join(", ") || "0 ngày";
});

const calDate = ref(new Date());
const mn = [
  "Tháng 1",
  "Tháng 2",
  "Tháng 3",
  "Tháng 4",
  "Tháng 5",
  "Tháng 6",
  "Tháng 7",
  "Tháng 8",
  "Tháng 9",
  "Tháng 10",
  "Tháng 11",
  "Tháng 12",
];
const dn = ["CN", "T2", "T3", "T4", "T5", "T6", "T7"];

const specialDays = computed(() => {
  const list = [];
  const month = calDate.value.getMonth();
  const m = month + 1;

  if (birthdayDate.value) {
    const bd = new Date(birthdayDate.value);
    if (bd.getMonth() === month) {
      list.push({ day: bd.getDate(), label: "Sinh nhật 🎂" });
    }
  }

  if (anniversaryDate.value) {
    const ad = new Date(anniversaryDate.value);
    if (ad.getMonth() === month) {
      list.push({ day: ad.getDate(), label: "Anniversary 💖" });
    }
  }

  OCCASIONS.forEach((o) => {
    if (o.month === m) {
      list.push({ day: o.day, label: o.name });
    }
  });

  return list;
});

const calendarData = computed(() => {
  const y = calDate.value.getFullYear();
  const m = calDate.value.getMonth();
  const firstDay = new Date(y, m, 1).getDay();
  const daysInMonth = new Date(y, m + 1, 0).getDate();

  const days = [];
  for (let i = 0; i < firstDay; i++) {
    days.push({ day: null, class: "empty" });
  }
  for (let d = 1; d <= daysInMonth; d++) {
    const isToday =
      d === new Date().getDate() && m === new Date().getMonth() && y === new Date().getFullYear();
    const special = specialDays.value.find((s) => s.day === d);
    let cls = "";
    if (isToday) cls = "today";
    else if (special) cls = "special";

    days.push({
      day: d,
      class: cls,
      tooltip: special ? special.label : null,
    });
  }
  return days;
});

const prevMonth = () => {
  calDate.value = new Date(calDate.value.getFullYear(), calDate.value.getMonth() - 1, 1);
};
const nextMonth = () => {
  calDate.value = new Date(calDate.value.getFullYear(), calDate.value.getMonth() + 1, 1);
};

const saveAD = (v) => {
  dataStore.setAnniversaryDate(v);
};

const saveBD = (v) => {
  dataStore.setBirthdayDate(v);
};
</script>

<template>
  <div style="width: 100%; max-width: 600px; margin: 0 auto">
    <h2 class="page-title">
      <span class="pt-ico"><GhibliIcon type="heart" size="32" /></span>
      Ngày bên nhau
    </h2>

    <div class="couple-counter">
      <div class="deco-svg deco-l">
        <GhibliIcon type="calcifer" size="40" />
      </div>
      <div class="deco-svg deco-r">
        <GhibliIcon type="soot" size="40" />
      </div>
      <div class="big-number">{{ daysTogether !== null ? daysTogether : "?" }}</div>
      <div class="counter-label">ngày bên nhau</div>
      <div v-if="detailTime" class="counter-sub">{{ detailTime }}</div>
    </div>

    <div class="card">
      <div class="form-group">
        <label>Ngày sinh nhật</label>
        <input
          type="date"
          class="form-input"
          style="max-width: 220px"
          :value="birthdayDate"
          @change="saveBD($event.target.value)"
        />
      </div>
      <div class="form-group">
        <label>Ngày anniversary</label>
        <input
          type="date"
          class="form-input"
          style="max-width: 220px"
          :value="anniversaryDate"
          @change="saveAD($event.target.value)"
        />
      </div>
    </div>

    <div class="card">
      <div class="cal-nav">
        <button @click="prevMonth">&lt;</button>
        <span>{{ mn[calDate.getMonth()] }} {{ calDate.getFullYear() }}</span>
        <button @click="nextMonth">&gt;</button>
      </div>
      <div class="calendar-grid">
        <div v-for="d in dn" :key="d" class="cal-header">{{ d }}</div>
        <div v-for="(d, i) in calendarData" :key="i" class="cal-day" :class="d.class">
          {{ d.day }}
          <span v-if="d.tooltip" class="tooltip-text">{{ d.tooltip }}</span>
        </div>
      </div>
      <div class="special-dates">
        <span v-for="s in specialDays" :key="s.label" class="special-item">
          {{ s.day }}/{{ calDate.getMonth() + 1 }} — {{ s.label }}
        </span>
      </div>
    </div>
  </div>
</template>
