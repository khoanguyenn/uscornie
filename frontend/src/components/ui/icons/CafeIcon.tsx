import type { IconProps } from "./HeartIcon";

export function CafeIcon({ size }: Pick<IconProps, "size">) {
  return (
    <svg
      viewBox="0 0 20 20"
      width={size}
      height={size}
      xmlns="http://www.w3.org/2000/svg"
    >
      <title>Cafe Cup</title>
      <rect x="3" y="8" width="11" height="10" rx="2" fill="#a8c88e" />
      <path
        d="M14 10 Q18 10 18 13 Q18 16 14 16"
        fill="none"
        stroke="#a8c88e"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      <ellipse cx="8.5" cy="8" rx="5.5" ry="1.5" fill="#8cb87a" />
      <path
        d="M7 5 Q7.5 2 8 5"
        stroke="#c8c0b0"
        strokeWidth="0.9"
        fill="none"
        strokeLinecap="round"
        opacity="0.5"
      >
        <animate
          attributeName="d"
          values="M7 5 Q7.5 2 8 5;M7 4 Q7.5 1 8 4;M7 5 Q7.5 2 8 5"
          dur="2s"
          repeatCount="indefinite"
        />
      </path>
      <path
        d="M10 5.5 Q10.5 2.5 11 5.5"
        stroke="#c8c0b0"
        strokeWidth="0.9"
        fill="none"
        strokeLinecap="round"
        opacity="0.5"
      >
        <animate
          attributeName="d"
          values="M10 5.5 Q10.5 2.5 11 5.5;M10 4.5 Q10.5 1.5 11 4.5;M10 5.5 Q10.5 2.5 11 5.5"
          dur="2.4s"
          repeatCount="indefinite"
        />
      </path>
      <ellipse cx="7" cy="13" rx="1.2" ry="0.5" fill="#8cb87a" opacity="0.4" />
      <ellipse cx="10" cy="12" rx="0.8" ry="0.4" fill="#8cb87a" opacity="0.4" />
    </svg>
  );
}
