<script setup lang="ts">
import { computed } from "vue";
import { starPts, spikeRing, legs } from "@/utils/svgHelpers";

const props = defineProps({
  size: { type: Number, default: 32 },
  stars: { type: Boolean, default: false },
  starColors: { type: Array, default: () => ["#f9e27a", "#f5a0b8", "#a8e6a0"] },
});

const w = computed(() => props.size);
const ew = computed(() => w.value * 0.16);
const eh = computed(() => w.value * 0.18);
const pw = computed(() => w.value * 0.07);

const processedStars = computed(() => {
  if (!props.stars) return [];
  return props.starColors.map((c, i) => {
    const ang = -40 + i * 50,
      r = w.value * 0.55;
    const x = w.value / 2 + r * Math.cos((ang * Math.PI) / 180);
    const y = w.value / 2 + r * Math.sin((ang * Math.PI) / 180);
    return {
      points: starPts(x, y, w.value * 0.09, w.value * 0.04),
      fill: c,
      rotateValues: `0 ${x} ${y};360 ${x} ${y}`,
      dur: `${3 + i}s`,
    };
  });
});

const sootLegs = computed(() => legs(w.value / 2, w.value * 0.75, 5, w.value * 0.08));
const spikePath = computed(() =>
  spikeRing(w.value / 2, w.value / 2, w.value * 0.36, w.value * 0.44, 20, "#1a1714"),
);
</script>

<template>
  <svg :viewBox="`0 0 ${w} ${w}`" xmlns="http://www.w3.org/2000/svg">
    <circle :cx="w / 2" :cy="w / 2" :r="w * 0.38" fill="#1a1714" />
    <path :d="spikePath" fill="#1a1714" />

    <ellipse :cx="w * 0.38" :cy="w * 0.44" :rx="ew / 2" :ry="eh / 2" fill="white" />
    <ellipse :cx="w * 0.62" :cy="w * 0.44" :rx="ew / 2" :ry="eh / 2" fill="white" />

    <circle :cx="w * 0.38" :cy="w * 0.45" :r="pw / 2" fill="#1a1714">
      <animate
        attributeName="cy"
        :values="`${w * 0.45};${w * 0.44};${w * 0.45}`"
        dur="3s"
        repeatCount="indefinite"
      />
    </circle>
    <circle :cx="w * 0.62" :cy="w * 0.45" :r="pw / 2" fill="#1a1714">
      <animate
        attributeName="cy"
        :values="`${w * 0.45};${w * 0.44};${w * 0.45}`"
        dur="3s"
        repeatCount="indefinite"
      />
    </circle>

    <!-- Blink -->
    <ellipse :cx="w * 0.38" :cy="w * 0.44" :rx="ew / 2" :ry="eh / 2" fill="white" opacity="0">
      <animate
        attributeName="ry"
        :values="`${eh / 2};${eh * 0.05};${eh / 2}`"
        dur="4s"
        repeatCount="indefinite"
        keyTimes="0;0.025;0.05"
        calcMode="spline"
        keySplines="0.4 0 0.6 1;0.4 0 0.6 1"
      />
    </ellipse>

    <line
      v-for="(leg, i) in sootLegs"
      :key="i"
      :x1="leg.x1"
      :y1="leg.y1"
      :x2="leg.x2"
      :y2="leg.y2"
      stroke="#1a1714"
      stroke-width="1.5"
      stroke-linecap="round"
    >
      <animate
        attributeName="y2"
        :values="`${leg.y2};${leg.y2 * 0.6};${leg.y2}`"
        :dur="`${leg.dur}s`"
        repeatCount="indefinite"
      />
    </line>

    <polygon v-for="(star, i) in processedStars" :key="i" :points="star.points" :fill="star.fill">
      <animateTransform
        attributeName="transform"
        type="rotate"
        :values="star.rotateValues"
        :dur="star.dur"
        repeatCount="indefinite"
      />
    </polygon>
  </svg>
</template>
