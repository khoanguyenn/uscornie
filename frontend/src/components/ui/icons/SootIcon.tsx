import type { IconProps } from "./HeartIcon";

export function SootIcon({ size }: Pick<IconProps, "size">) {
  return (
    <svg
      viewBox="0 0 20 20"
      width={size}
      height={size}
      xmlns="http://www.w3.org/2000/svg"
    >
      <title>Soot Sprite</title>
      <circle cx="10" cy="10" r="7" fill="#1a1714" />
      <ellipse cx="7.5" cy="9" rx="2" ry="2.2" fill="white" />
      <ellipse cx="12.5" cy="9" rx="2" ry="2.2" fill="white" />
      <circle cx="7.5" cy="9.3" r="1" fill="#1a1714" />
      <circle cx="12.5" cy="9.3" r="1" fill="#1a1714" />
    </svg>
  );
}
