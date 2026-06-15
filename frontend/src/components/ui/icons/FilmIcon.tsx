import type { IconProps } from "./HeartIcon";

export function FilmIcon({ size }: Pick<IconProps, "size">) {
  return (
    <svg
      viewBox="0 0 20 20"
      width={size}
      height={size}
      xmlns="http://www.w3.org/2000/svg"
    >
      <title>Movie Clapper</title>
      <rect x="2" y="7" width="16" height="11" rx="1.5" fill="#4a4033" />
      <rect x="2" y="7" width="16" height="3" fill="#5a5040" />
      <rect
        x="2"
        y="4"
        width="16"
        height="3.5"
        rx="1"
        fill="#5a5040"
        transform="rotate(-5 10 5.5)"
      />
      <line
        x1="5"
        y1="3.5"
        x2="6.5"
        y2="7"
        stroke="#f9e27a"
        strokeWidth="0.8"
      />
      <line
        x1="9"
        y1="3"
        x2="10.5"
        y2="6.8"
        stroke="#f9e27a"
        strokeWidth="0.8"
      />
      <line
        x1="13"
        y1="3"
        x2="14.5"
        y2="6.8"
        stroke="#f9e27a"
        strokeWidth="0.8"
      />
      <circle
        cx="7"
        cy="13"
        r="2"
        fill="none"
        stroke="#f9e27a"
        strokeWidth="0.8"
      />
      <circle cx="7" cy="13" r="0.6" fill="#f9e27a" />
      <circle
        cx="13"
        cy="13"
        r="2"
        fill="none"
        stroke="#f9e27a"
        strokeWidth="0.8"
      />
      <circle cx="13" cy="13" r="0.6" fill="#f9e27a" />
    </svg>
  );
}
