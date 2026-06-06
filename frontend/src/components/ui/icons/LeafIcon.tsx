import type { IconProps } from "./HeartIcon";

export function LeafIcon({ size }: Pick<IconProps, "size">) {
  return (
    <svg
      viewBox="0 0 20 20"
      width={size}
      height={size}
      xmlns="http://www.w3.org/2000/svg"
    >
      <title>Leaf</title>
      <line
        x1="10"
        y1="18"
        x2="10"
        y2="10"
        stroke="#6a9b6a"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <path d="M10 10 Q5 4 3 3 Q4 8 10 10Z" fill="#8cb78c" />
      <path d="M10 8 Q15 3 17 2 Q16 7 10 8Z" fill="#a8cc8f" />
      <path
        d="M10 10 Q6.5 6 5 5"
        stroke="#6a9b6a"
        strokeWidth="0.5"
        fill="none"
      />
      <path
        d="M10 8 Q13 5 14 4"
        stroke="#8ab88a"
        strokeWidth="0.5"
        fill="none"
      />
      <circle cx="8" cy="15" r="0.6" fill="#a8cc8f" opacity="0.5" />
      <circle cx="12" cy="16" r="0.5" fill="#a8cc8f" opacity="0.4" />
    </svg>
  );
}
