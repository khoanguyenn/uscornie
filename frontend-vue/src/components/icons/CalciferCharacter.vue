<template>
  <svg viewBox="0 0 60 70" xmlns="http://www.w3.org/2000/svg">
    <g>
      <ellipse cx="30" cy="52" rx="18" ry="8" fill="#8a6a4a" opacity="0.5" />
      <path d="M18 42 Q14 20 22 10 Q26 4 30 2 Q34 4 38 10 Q46 20 42 42Z" fill="#f47a30">
        <animate
          attributeName="d"
          values="M18 42 Q14 20 22 10 Q26 4 30 2 Q34 4 38 10 Q46 20 42 42Z;M17 42 Q13 22 21 12 Q25 5 30 3 Q35 5 39 12 Q47 22 43 42Z;M18 42 Q14 20 22 10 Q26 4 30 2 Q34 4 38 10 Q46 20 42 42Z"
          dur="1.5s"
          repeatCount="indefinite"
        />
      </path>
      <path d="M22 42 Q20 26 26 16 Q28 12 30 10 Q32 12 34 16 Q40 26 38 42Z" fill="#f9b030">
        <animate
          attributeName="d"
          values="M22 42 Q20 26 26 16 Q28 12 30 10 Q32 12 34 16 Q40 26 38 42Z;M21 42 Q19 28 25 18 Q27 13 30 11 Q33 13 35 18 Q41 28 39 42Z;M22 42 Q20 26 26 16 Q28 12 30 10 Q32 12 34 16 Q40 26 38 42Z"
          dur="1.2s"
          repeatCount="indefinite"
        />
      </path>
      <path d="M26 42 Q25 32 28 24 Q29 20 30 18 Q31 20 32 24 Q35 32 34 42Z" fill="#fce68a" />
      <ellipse cx="25" cy="32" rx="3.5" ry="4" fill="white" />
      <ellipse cx="35" cy="32" rx="3.5" ry="4" fill="white" />
      <circle cx="25.5" cy="33" r="1.8" fill="#2a2018" />
      <circle cx="35.5" cy="33" r="1.8" fill="#2a2018" />
      <path
        d="M27 38 Q30 40 33 38"
        stroke="#c04020"
        stroke-width="1.5"
        fill="none"
        stroke-linecap="round"
      />
      <path d="M16 44 Q12 42 10 46 Q14 46 16 44Z" fill="#f47a30" opacity="0.6">
        <animate attributeName="opacity" values="0.6;0.3;0.6" dur="2s" repeatCount="indefinite" />
      </path>
      <path d="M44 44 Q48 42 50 46 Q46 46 44 44Z" fill="#f47a30" opacity="0.6">
        <animate
          attributeName="opacity"
          values="0.6;0.3;0.6"
          dur="2s"
          repeatCount="indefinite"
          begin="0.5s"
        />
      </path>
      <rect x="12" y="44" width="36" height="10" rx="4" fill="#8a6a4a" />
      <ellipse cx="15" cy="49" rx="4" ry="5" fill="#9a7a5a" />
      <circle cx="14" cy="49" r="3" fill="#b09070" />
      <circle cx="14" cy="49" r="1.5" fill="#c0a080" />
      <animateTransform
        attributeName="transform"
        type="translate"
        values="0 0;0 -3;0 0"
        dur="3s"
        repeatCount="indefinite"
      />
    </g>
  </svg>
</template>
