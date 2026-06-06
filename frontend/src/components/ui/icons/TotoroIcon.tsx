import type { IconProps } from "./HeartIcon";

export function TotoroIcon({ size }: Pick<IconProps, "size">) {
  return (
    <svg
      viewBox="0 0 20 24"
      width={size}
      height={size}
      xmlns="http://www.w3.org/2000/svg"
    >
      <title>Totoro</title>
      <line
        x1="10"
        y1="2"
        x2="10"
        y2="0"
        stroke="#5a8a3a"
        strokeWidth="1"
        strokeLinecap="round"
      />
      <ellipse
        cx="10"
        cy="0"
        rx="1.5"
        ry="2.5"
        fill="#6aaa4a"
        transform="rotate(-15 10 0)"
      />
      <ellipse
        cx="5.5"
        cy="5"
        rx="2.5"
        ry="3.5"
        fill="#858880"
        transform="rotate(-15 5.5 5)"
      />
      <ellipse
        cx="14.5"
        cy="5"
        rx="2.5"
        ry="3.5"
        fill="#858880"
        transform="rotate(15 14.5 5)"
      />
      <ellipse cx="10" cy="15" rx="8" ry="9" fill="#858880" />
      <ellipse cx="10" cy="17.5" rx="5.5" ry="6" fill="#dedad0" />
      <ellipse cx="7" cy="11.5" rx="2.5" ry="2.8" fill="white" />
      <ellipse cx="13" cy="11.5" rx="2.5" ry="2.8" fill="white" />
      <circle cx="7.3" cy="12" r="1.4" fill="#1e1c1a" />
      <circle cx="13.3" cy="12" r="1.4" fill="#1e1c1a" />
      <circle cx="6.8" cy="11" r="0.6" fill="white" />
      <circle cx="12.8" cy="11" r="0.6" fill="white" />
      <ellipse cx="10" cy="14" rx="1" ry="0.7" fill="#555250" />
    </svg>
  );
}
