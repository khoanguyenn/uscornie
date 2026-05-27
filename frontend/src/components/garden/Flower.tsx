"use client";

import _styles from "../AnimatedBackground.module.css";

const styles = _styles as unknown as {
  animateSway: string;
  animateSwaySlow: string;
};

interface FlowerProps {
  p1: string;
  p2: string;
  center: string;
  position: string;
  isSlow: boolean;
}

export default function Flower({
  p1,
  p2,
  center,
  position,
  isSlow,
}: FlowerProps) {
  return (
    <div
      className={`fixed z-1 w-min h-min flex flex-col justify-end ${position} ${
        isSlow ? styles.animateSwaySlow : styles.animateSway
      }`}
    >
      <svg
        width="40"
        height="56"
        viewBox="0 0 40 56"
        xmlns="http://www.w3.org/2000/svg"
        className="block"
      >
        <title>Flower</title>
        {/* Stem and leaves */}
        <line
          x1="20"
          y1="56"
          x2="20"
          y2="30"
          stroke="#8ab060"
          strokeWidth="2.5"
          strokeLinecap="round"
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

        {/* 6 fluffy petals */}
        <ellipse cx="20" cy="9" rx="8" ry="10" fill={p1} opacity="0.9" />
        <ellipse
          cx="30"
          cy="14"
          rx="8"
          ry="10"
          fill={p2}
          opacity="0.9"
          transform="rotate(60 30 14)"
        />
        <ellipse
          cx="30"
          cy="26"
          rx="8"
          ry="10"
          fill={p1}
          opacity="0.9"
          transform="rotate(120 30 26)"
        />
        <ellipse
          cx="20"
          cy="31"
          rx="8"
          ry="10"
          fill={p2}
          opacity="0.9"
          transform="rotate(180 20 31)"
        />
        <ellipse
          cx="10"
          cy="26"
          rx="8"
          ry="10"
          fill={p1}
          opacity="0.9"
          transform="rotate(240 10 26)"
        />
        <ellipse
          cx="10"
          cy="14"
          rx="8"
          ry="10"
          fill={p2}
          opacity="0.9"
          transform="rotate(300 10 14)"
        />

        {/* Center face */}
        <circle cx="20" cy="20" r="9" fill={center} opacity="0.8" />
        <circle cx="20" cy="20" r="7" fill={center} />

        {/* Tiny eyes */}
        <ellipse cx="17" cy="19" rx="1.2" ry="1.5" fill="#2a1a10" />
        <ellipse cx="23" cy="19" rx="1.2" ry="1.5" fill="#2a1a10" />

        {/* Blush */}
        <circle cx="14" cy="21" r="2.5" fill="#f4a0a0" opacity="0.45" />
        <circle cx="26" cy="21" r="2.5" fill="#f4a0a0" opacity="0.45" />
      </svg>
    </div>
  );
}
