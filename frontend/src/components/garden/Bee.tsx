"use client";

import _styles from "../AnimatedBackground.module.css";

const styles = _styles as unknown as {
  animateBugFloat: string;
};

export default function Bee() {
  return (
    <div
      className={`fixed z-1 w-min h-min flex flex-col justify-end top-[10%] right-[10%] ${styles.animateBugFloat}`}
    >
      <svg
        width="40"
        height="30"
        viewBox="0 0 40 30"
        xmlns="http://www.w3.org/2000/svg"
        className="block"
      >
        <title>Bee</title>
        <ellipse cx="18" cy="18" rx="10" ry="8" fill="#fdd96a" />
        <rect
          x="14"
          y="10"
          width="2"
          height="16"
          fill="#4a3020"
          opacity="0.8"
        />
        <rect
          x="18"
          y="10"
          width="2"
          height="16"
          fill="#4a3020"
          opacity="0.8"
        />
        <rect
          x="22"
          y="10"
          width="2"
          height="16"
          fill="#4a3020"
          opacity="0.8"
        />
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
        <path
          d="M25 20 Q26.5 21.5 28 20"
          stroke="#4a3020"
          strokeWidth="0.8"
          fill="none"
        />
      </svg>
    </div>
  );
}
