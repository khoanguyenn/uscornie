<template>
  <svg viewBox="0 0 80 105" xmlns="http://www.w3.org/2000/svg">
    <g>
      <!-- Leaf on head -->
      <line
        x1="40"
        y1="8"
        x2="40"
        y2="2"
        stroke="#5a8a3a"
        stroke-width="1.5"
        stroke-linecap="round"
      />
      <ellipse cx="40" cy="1" rx="3" ry="5" fill="#6aaa4a" transform="rotate(-20 40 1)" />

      <!-- Left ear -->
      <ellipse cx="24" cy="16" rx="6" ry="9" fill="#7a7d78" transform="rotate(-15 24 16)" />
      <!-- Right ear -->
      <ellipse cx="56" cy="16" rx="6" ry="9" fill="#7a7d78" transform="rotate(15 56 16)" />

      <!-- Main body — big round grey -->
      <ellipse cx="40" cy="62" rx="30" ry="34" fill="#858880" />

      <!-- Cream belly — large oval -->
      <ellipse cx="40" cy="72" rx="20" ry="23" fill="#dedad0" />

      <!-- Big white eyes -->
      <ellipse cx="30" cy="48" rx="8" ry="9" fill="white" />
      <ellipse cx="50" cy="48" rx="8" ry="9" fill="white" />
      <!-- Pupils -->
      <circle cx="31" cy="49" r="4" fill="#1e1c1a">
        <animate attributeName="cx" values="31;30;31" dur="4s" repeatCount="indefinite" />
      </circle>
      <circle cx="51" cy="49" r="4" fill="#1e1c1a">
        <animate attributeName="cx" values="51;50;51" dur="4s" repeatCount="indefinite" />
      </circle>
      <!-- Eye shine -->
      <circle cx="29" cy="46" r="1.5" fill="white" />
      <circle cx="49" cy="46" r="1.5" fill="white" />

      <!-- Nose -->
      <ellipse cx="40" cy="57" rx="2.5" ry="1.8" fill="#555250" />

      <!-- Belly claw marks — 4 vertical lines -->
      <line
        x1="33"
        y1="70"
        x2="33"
        y2="80"
        stroke="#b0aca0"
        stroke-width="1.8"
        stroke-linecap="round"
      />
      <line
        x1="37"
        y1="68"
        x2="37"
        y2="80"
        stroke="#b0aca0"
        stroke-width="1.8"
        stroke-linecap="round"
      />
      <line
        x1="41"
        y1="68"
        x2="41"
        y2="80"
        stroke="#b0aca0"
        stroke-width="1.8"
        stroke-linecap="round"
      />
      <line
        x1="45"
        y1="70"
        x2="45"
        y2="80"
        stroke="#b0aca0"
        stroke-width="1.8"
        stroke-linecap="round"
      />

      <!-- Bob animation -->
      <animateTransform
        attributeName="transform"
        type="translate"
        values="0 0;0 -4;0 0"
        dur="4s"
        repeatCount="indefinite"
      />
    </g>
  </svg>
</template>
