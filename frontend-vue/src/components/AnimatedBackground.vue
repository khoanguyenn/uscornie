<script setup lang="ts">
import { onMounted, ref } from "vue";
import TotoroCharacter from "./icons/TotoroCharacter.vue";
import CalciferCharacter from "./icons/CalciferCharacter.vue";
import SootCharacter from "./icons/SootCharacter.vue";
import GhibliIcon from "./icons/GhibliIcon.vue";

const hearts = ref([]);
const colors = ["#f2a0a0", "#f5c0c0", "#e8b0b0", "#f0d0d0", "#e0a8a8"];

onMounted(() => {
  for (let i = 0; i < 6; i++) {
    hearts.value.push({
      id: i,
      left: 5 + Math.random() * 90 + "%",
      duration: 10 + Math.random() * 8 + "s",
      delay: Math.random() * 10 + "s",
      size: 14 + Math.random() * 10,
      color: colors[i % colors.length],
    });
  }
});

// Flower variants for unified shape
const flowerVariants = [
  { id: 1, type: "pink", p1: "#f7b8c8", p2: "#f5a8bc", center: "#fce88a", class: "fl-1 fl-sway" },
  {
    id: 3,
    type: "yellow",
    p1: "#fdd96a",
    p2: "#fcc84a",
    center: "#ffeaa0",
    class: "fl-3 fl-sway-slow",
  },
  { id: 4, type: "blue", p1: "#c0e8f9", p2: "#a0d8f5", center: "#fff8e0", class: "fl-4 fl-sway" },
  {
    id: 5,
    type: "white",
    p1: "#ffffff",
    p2: "#f0f0f0",
    center: "#fce88a",
    class: "fl-5 fl-sway-slow",
  },
];
</script>

<template>
  <div class="fixed-bg">
    <!-- Sky & Scene -->
    <div class="bg-scene">
      <div class="bg-sky"></div>

      <!-- Clouds -->
      <div class="cloud cloud-1"></div>
      <div class="cloud cloud-2"></div>

      <!-- Hills -->
      <div class="bg-hills">
        <div class="hill hill-1"></div>
        <div class="hill hill-2"></div>
        <div class="hill hill-3"></div>
      </div>
    </div>

    <!-- GARDEN: Unified Flowers, Bees, Butterflies -->
    <div class="garden-layer">
      <!-- Unified Shape Flowers -->
      <div v-for="f in flowerVariants" :key="f.id" class="garden-elem" :class="f.class">
        <svg width="40" height="56" viewBox="0 0 40 56" xmlns="http://www.w3.org/2000/svg">
          <!-- Stem and leaves -->
          <line
            x1="20"
            y1="56"
            x2="20"
            y2="30"
            stroke="#8ab060"
            stroke-width="2.5"
            stroke-linecap="round"
          />
          <ellipse
            cx="12"
            cy="38"
            rx="4"
            ry="7"
            fill="#8ab060"
            opacity="0.8"
            transform="rotate(-35 12 38)"
          />
          <ellipse
            cx="28"
            cy="40"
            rx="4"
            ry="7"
            fill="#8ab060"
            opacity="0.8"
            transform="rotate(35 28 40)"
          />

          <!-- 6 fluffy petals -->
          <ellipse cx="20" cy="9" rx="8" ry="10" :fill="f.p1" opacity="0.9" />
          <ellipse
            cx="30"
            cy="14"
            rx="8"
            ry="10"
            :fill="f.p2"
            opacity="0.9"
            transform="rotate(60 30 14)"
          />
          <ellipse
            cx="30"
            cy="26"
            rx="8"
            ry="10"
            :fill="f.p1"
            opacity="0.9"
            transform="rotate(120 30 26)"
          />
          <ellipse
            cx="20"
            cy="31"
            rx="8"
            ry="10"
            :fill="f.p2"
            opacity="0.9"
            transform="rotate(180 20 31)"
          />
          <ellipse
            cx="10"
            cy="26"
            rx="8"
            ry="10"
            :fill="f.p1"
            opacity="0.9"
            transform="rotate(240 10 26)"
          />
          <ellipse
            cx="10"
            cy="14"
            rx="8"
            ry="10"
            :fill="f.p2"
            opacity="0.9"
            transform="rotate(300 10 14)"
          />

          <!-- Center face -->
          <circle cx="20" cy="20" r="9" :fill="f.center" opacity="0.8" />
          <circle cx="20" cy="20" r="7" :fill="f.center" />

          <!-- Tiny eyes -->
          <ellipse cx="17" cy="19" rx="1.2" ry="1.5" fill="#2a1a10" />
          <ellipse cx="23" cy="19" rx="1.2" ry="1.5" fill="#2a1a10" />

          <!-- Blush -->
          <circle cx="14" cy="21" r="2.5" fill="#f4a0a0" opacity="0.45" />
          <circle cx="26" cy="21" r="2.5" fill="#f4a0a0" opacity="0.45" />
        </svg>
      </div>

      <!-- Butterfly -->
      <div class="garden-elem butterfly bf-1">
        <svg width="50" height="36" viewBox="0 0 50 36" xmlns="http://www.w3.org/2000/svg">
          <ellipse cx="16" cy="13" rx="14" ry="11" fill="#f9c0d8" opacity="0.88" class="wing-l" />
          <ellipse cx="14" cy="25" rx="10" ry="8" fill="#f5a8c8" opacity="0.8" class="wing-l-sub" />
          <ellipse cx="34" cy="13" rx="14" ry="11" fill="#f9c0d8" opacity="0.88" class="wing-r" />
          <ellipse cx="36" cy="25" rx="10" ry="8" fill="#f5a8c8" opacity="0.8" class="wing-r-sub" />
          <circle cx="16" cy="12" r="3" fill="#f07098" opacity="0.5" />
          <circle cx="34" cy="12" r="3" fill="#f07098" opacity="0.5" />
          <ellipse cx="25" cy="18" rx="2.5" ry="9" fill="#c87090" />
          <line
            x1="24"
            y1="9"
            x2="20"
            y2="3"
            stroke="#c87090"
            stroke-width="1"
            stroke-linecap="round"
          />
          <circle cx="20" cy="3" r="1.5" fill="#f090b0" />
          <line
            x1="26"
            y1="9"
            x2="30"
            y2="3"
            stroke="#c87090"
            stroke-width="1"
            stroke-linecap="round"
          />
          <circle cx="30" cy="3" r="1.5" fill="#f090b0" />
        </svg>
      </div>

      <!-- Bee -->
      <div class="garden-elem bee-top">
        <svg width="40" height="30" viewBox="0 0 40 30" xmlns="http://www.w3.org/2000/svg">
          <ellipse cx="18" cy="18" rx="10" ry="8" fill="#fdd96a" />
          <rect x="14" y="10" width="2" height="16" fill="#4a3020" opacity="0.8" />
          <rect x="18" y="10" width="2" height="16" fill="#4a3020" opacity="0.8" />
          <rect x="22" y="10" width="2" height="16" fill="#4a3020" opacity="0.8" />
          <ellipse
            cx="16"
            cy="10"
            rx="8"
            ry="6"
            fill="#d0f0f8"
            opacity="0.6"
            transform="rotate(-20 16 10)"
          />
          <ellipse
            cx="20"
            cy="10"
            rx="8"
            ry="6"
            fill="#d0f0f8"
            opacity="0.6"
            transform="rotate(20 20 10)"
          />
          <circle cx="24" cy="16" r="1" fill="#4a3020" />
          <circle cx="28" cy="16" r="1" fill="#4a3020" />
          <path d="M25 20 Q26.5 21.5 28 20" stroke="#4a3020" stroke-width="0.8" fill="none" />
        </svg>
      </div>
    </div>

    <!-- Characters (Soot sprites under the grass/hills) -->
    <div class="character-layer">
      <div class="ghibli-char char-totoro">
        <TotoroCharacter />
      </div>
      <div class="ghibli-char char-calcifer">
        <CalciferCharacter />
      </div>

      <div class="ghibli-char char-soot soot-a">
        <SootCharacter :size="28" />
      </div>
      <div class="ghibli-char char-soot soot-b">
        <SootCharacter :size="22" />
      </div>
      <div class="ghibli-char char-soot soot-c">
        <SootCharacter :size="26" :stars="true" :starColors="['#f5a0b8', '#a8e6cf', '#fce68a']" />
      </div>
      <div class="ghibli-char char-soot soot-d">
        <SootCharacter :size="18" />
      </div>
    </div>

    <!-- Floating Hearts -->
    <div id="float-hearts">
      <div
        v-for="heart in hearts"
        :key="heart.id"
        class="fh"
        :style="{
          left: heart.left,
          animationDuration: heart.duration,
          animationDelay: heart.delay,
        }"
      >
        <GhibliIcon type="heart" :size="heart.size" :color="heart.color" />
      </div>
    </div>
  </div>
</template>

<style scoped>
.fixed-bg {
  position: fixed;
  inset: 0;
  z-index: -1;
  pointer-events: none;
}

.garden-elem {
  position: fixed;
  z-index: 1;
  width: min-content;
  height: min-content;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
}

.garden-elem svg {
  display: block;
}

/* Flowers positions */
.fl-1 {
  bottom: 15%;
  left: 8%;
}
.fl-3 {
  bottom: 8%;
  right: 12%;
}
.fl-4 {
  bottom: 12%;
  left: 30%;
}
.fl-5 {
  bottom: 18%;
  right: 35%;
}

/* Butterfly & Bee */
.bf-1 {
  top: 15%;
  left: 15%;
  animation: butterflyFloat 10s ease-in-out infinite;
}
.bee-top {
  top: 10%;
  right: 10%;
  animation: bugFloat 6s ease-in-out infinite;
}

/* Wing Flap Animation */
.wing-l,
.wing-l-sub,
.wing-r,
.wing-r-sub {
  transform-origin: 25px 18px;
  animation: wingFlap 0.5s ease-in-out infinite alternate;
}
.wing-r,
.wing-r-sub {
  transform: scaleX(-1);
}

@keyframes wingFlap {
  from {
    transform: scaleX(1);
  }
  to {
    transform: scaleX(0.2);
  }
}

@keyframes butterflyFloat {
  0%,
  100% {
    transform: translate(0, 0) rotate(0deg);
  }
  25% {
    transform: translate(30px, -20px) rotate(5deg);
  }
  50% {
    transform: translate(60px, 0px) rotate(-5deg);
  }
  75% {
    transform: translate(30px, 20px) rotate(5deg);
  }
}

@keyframes bugFloat {
  0%,
  100% {
    transform: translateX(0);
  }
  50% {
    transform: translateX(-20px);
  }
}

/* Pure rotational sway - no vertical movement */
@keyframes pureSway {
  0%,
  100% {
    transform: rotate(-3deg) translateY(0);
  }
  50% {
    transform: rotate(3deg) translateY(0);
  }
}

.fl-sway {
  animation: pureSway 4s ease-in-out infinite;
  transform-origin: bottom center;
}

.fl-sway-slow {
  animation: pureSway 6s ease-in-out infinite;
  transform-origin: bottom center;
}

/* Soot Sprites on grass */
.char-soot {
  position: fixed;
  bottom: 0;
  z-index: 2;
}
.soot-a {
  left: 15%;
  bottom: 12%;
}
.soot-b {
  left: 22%;
  bottom: 18%;
}
.soot-c {
  right: 18%;
  bottom: 14%;
}
.soot-d {
  right: 28%;
  bottom: 20%;
}

.ghibli-char.char-totoro {
  bottom: 0;
  right: 5%;
}
.ghibli-char.char-calcifer {
  bottom: 5%;
  left: 5%;
}
</style>
