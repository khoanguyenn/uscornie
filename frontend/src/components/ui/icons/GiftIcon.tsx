import type { IconProps } from "./HeartIcon";

export function GiftIcon({ size }: Pick<IconProps, "size">) {
  return (
    <svg
      viewBox="0 0 20 20"
      width={size}
      height={size}
      xmlns="http://www.w3.org/2000/svg"
    >
      <title>Gift</title>
      <rect x="2" y="8" width="16" height="10" rx="2" fill="#f5a0b8" />
      <rect x="2" y="8" width="16" height="4" rx="1.5" fill="#e88aa0" />
      <rect x="9" y="8" width="2" height="10" fill="#f9e27a" />
      <rect x="2" y="9" width="16" height="2" fill="#f9e27a" opacity="0.7" />
      <path d="M10 8 Q7 4 5 5 Q4 6 5.5 7 Q7 8 10 8" fill="#f9e27a" />
      <path d="M10 8 Q13 4 15 5 Q16 6 14.5 7 Q13 8 10 8" fill="#f9e27a" />
      <circle cx="10" cy="7.5" r="1.2" fill="#f9e27a" />
    </svg>
  );
}
