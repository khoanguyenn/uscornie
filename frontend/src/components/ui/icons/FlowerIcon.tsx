import type { IconProps } from "./HeartIcon";

export function FlowerIcon({ size, color }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      xmlns="http://www.w3.org/2000/svg"
    >
      <title>Flower</title>
      <circle cx="12" cy="12" r="4" fill={color} opacity="0.3" />
      <g fill={color}>
        <circle cx="12" cy="6" r="4" />
        <circle cx="12" cy="18" r="4" />
        <circle cx="6" cy="12" r="4" />
        <circle cx="18" cy="12" r="4" />
        <circle cx="7.5" cy="7.5" r="4" />
        <circle cx="16.5" cy="16.5" r="4" />
        <circle cx="7.5" cy="16.5" r="4" />
        <circle cx="16.5" cy="7.5" r="4" />
      </g>
      <circle cx="12" cy="12" r="5" fill="#fdf3e0" />
      <circle cx="10" cy="11" r="0.6" fill="#4a4033" />
      <circle cx="14" cy="11" r="0.6" fill="#4a4033" />
      <path
        d="M10 14 Q12 15.5 14 14"
        stroke="#4a4033"
        strokeWidth="0.6"
        fill="none"
        strokeLinecap="round"
      />
    </svg>
  );
}
