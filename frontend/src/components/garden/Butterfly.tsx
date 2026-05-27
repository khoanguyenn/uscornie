"use client";

import _styles from "../AnimatedBackground.module.css";

const styles = _styles as unknown as {
  animateButterflyFloat: string;
  animateWingFlap: string;
  animateWingFlapR: string;
};

export default function Butterfly() {
  return (
    <div
      className={`fixed z-1 w-min h-min flex flex-col justify-end top-[15%] left-[15%] ${styles.animateButterflyFloat}`}
    >
      <svg
        width="50"
        height="36"
        viewBox="0 0 50 36"
        xmlns="http://www.w3.org/2000/svg"
        className="block"
      >
        <title>Butterfly</title>
        <ellipse
          cx="16"
          cy="13"
          rx="14"
          ry="11"
          fill="#f9c0d8"
          opacity="0.88"
          className={`wing-l origin-[25px_18px] ${styles.animateWingFlap}`}
        />
        <ellipse
          cx="14"
          cy="25"
          rx="10"
          ry="8"
          fill="#f5a8c8"
          opacity="0.8"
          className={`wing-l-sub origin-[25px_18px] ${styles.animateWingFlap}`}
        />
        <ellipse
          cx="34"
          cy="13"
          rx="14"
          ry="11"
          fill="#f9c0d8"
          opacity="0.88"
          className={`wing-r origin-[25px_18px] ${styles.animateWingFlapR}`}
        />
        <ellipse
          cx="36"
          cy="25"
          rx="10"
          ry="8"
          fill="#f5a8c8"
          opacity="0.8"
          className={`wing-r-sub origin-[25px_18px] ${styles.animateWingFlapR}`}
        />
        <circle cx="16" cy="12" r="3" fill="#f07098" opacity="0.5" />
        <circle cx="34" cy="12" r="3" fill="#f07098" opacity="0.5" />
        <ellipse cx="25" cy="18" rx="2.5" ry="9" fill="#c87090" />
        <line
          x1="24"
          y1="9"
          x2="20"
          y2="3"
          stroke="#c87090"
          strokeWidth="1"
          strokeLinecap="round"
        />
        <circle cx="20" cy="3" r="1.5" fill="#f090b0" />
        <line
          x1="26"
          y1="9"
          x2="30"
          y2="3"
          stroke="#c87090"
          strokeWidth="1"
          strokeLinecap="round"
        />
        <circle cx="30" cy="3" r="1.5" fill="#f090b0" />
      </svg>
    </div>
  );
}
