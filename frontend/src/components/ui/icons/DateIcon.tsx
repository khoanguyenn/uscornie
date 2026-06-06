import type { IconProps } from "./HeartIcon";

export function DateIcon({ size }: Pick<IconProps, "size">) {
  return (
    <svg
      viewBox="0 0 20 20"
      width={size}
      height={size}
      xmlns="http://www.w3.org/2000/svg"
    >
      <title>Date Couple</title>
      <circle cx="6.5" cy="5.5" r="2.5" fill="#7a7d78" />
      <circle cx="13.5" cy="5.5" r="2.5" fill="#9a7a5a" />
      <ellipse cx="6.5" cy="12" rx="3" ry="5" fill="#7a7d78" />
      <ellipse cx="13.5" cy="12" rx="3" ry="5" fill="#9a7a5a" />
      <path
        d="M10 4 Q8 2 7 3 Q6 4 7 5 Q8 6 10 8 Q12 6 13 5 Q14 4 13 3 Q12 2 10 4Z"
        fill="#f2a0a0"
      >
        <animate
          attributeName="opacity"
          values="1;0.6;1"
          dur="1.5s"
          repeatCount="indefinite"
        />
      </path>
    </svg>
  );
}
