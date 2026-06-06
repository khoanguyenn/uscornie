import type { IconProps } from "./HeartIcon";

export function BookIcon({ size }: Pick<IconProps, "size">) {
  return (
    <svg
      viewBox="0 0 20 20"
      width={size}
      height={size}
      xmlns="http://www.w3.org/2000/svg"
    >
      <title>Book</title>
      <path d="M10 5 Q6 4 2 5.5 L2 16.5 Q6 15 10 16Z" fill="#7eb8c9" />
      <path d="M10 5 Q14 4 18 5.5 L18 16.5 Q14 15 10 16Z" fill="#8ac4d4" />
      <line x1="10" y1="5" x2="10" y2="16" stroke="#5a9aaa" strokeWidth="0.5" />
      <line
        x1="4.5"
        y1="8"
        x2="8.5"
        y2="7.5"
        stroke="#fff"
        strokeWidth="0.6"
        opacity="0.5"
      />
      <line
        x1="4.5"
        y1="10"
        x2="8.5"
        y2="9.5"
        stroke="#fff"
        strokeWidth="0.6"
        opacity="0.5"
      />
      <line
        x1="4.5"
        y1="12"
        x2="8.5"
        y2="11.5"
        stroke="#fff"
        strokeWidth="0.6"
        opacity="0.5"
      />
      <line
        x1="11.5"
        y1="7.5"
        x2="15.5"
        y2="8"
        stroke="#fff"
        strokeWidth="0.6"
        opacity="0.5"
      />
      <line
        x1="11.5"
        y1="9.5"
        x2="15.5"
        y2="10"
        stroke="#fff"
        strokeWidth="0.6"
        opacity="0.5"
      />
      <line
        x1="11.5"
        y1="11.5"
        x2="15.5"
        y2="12"
        stroke="#fff"
        strokeWidth="0.6"
        opacity="0.5"
      />
      <path
        d="M10 4 L8 3 Q6 2.5 4 3"
        stroke="#d4a060"
        strokeWidth="0.6"
        fill="none"
      />
    </svg>
  );
}
