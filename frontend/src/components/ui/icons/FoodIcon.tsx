import type { IconProps } from "./HeartIcon";

export function FoodIcon({ size }: Pick<IconProps, "size">) {
  return (
    <svg
      viewBox="0 0 20 20"
      width={size}
      height={size}
      xmlns="http://www.w3.org/2000/svg"
    >
      <title>Food Bowl</title>
      <path d="M3 10 Q3 17 10 17 Q17 17 17 10Z" fill="#f4a460" />
      <ellipse cx="10" cy="10" rx="7.5" ry="2.5" fill="#e8944a" />
      <path
        d="M6 7 Q6.5 4 7 7"
        stroke="#b0a090"
        strokeWidth="1"
        fill="none"
        strokeLinecap="round"
        opacity="0.6"
      >
        <animate
          attributeName="d"
          values="M6 7 Q6.5 4 7 7;M6 6 Q6.5 3 7 6;M6 7 Q6.5 4 7 7"
          dur="2s"
          repeatCount="indefinite"
        />
      </path>
      <path
        d="M9.5 6.5 Q10 3.5 10.5 6.5"
        stroke="#b0a090"
        strokeWidth="1"
        fill="none"
        strokeLinecap="round"
        opacity="0.6"
      >
        <animate
          attributeName="d"
          values="M9.5 6.5 Q10 3.5 10.5 6.5;M9.5 5.5 Q10 2.5 10.5 5.5;M9.5 6.5 Q10 3.5 10.5 6.5"
          dur="2.3s"
          repeatCount="indefinite"
        />
      </path>
      <path
        d="M13 7 Q13.5 4 14 7"
        stroke="#b0a090"
        strokeWidth="1"
        fill="none"
        strokeLinecap="round"
        opacity="0.6"
      >
        <animate
          attributeName="d"
          values="M13 7 Q13.5 4 14 7;M13 6 Q13.5 3 14 6;M13 7 Q13.5 4 14 7"
          dur="1.8s"
          repeatCount="indefinite"
        />
      </path>
      <circle cx="7" cy="12" r="1" fill="#e0d0b0" />
      <circle cx="11" cy="11.5" r="1.3" fill="#e0d0b0" />
      <circle cx="13" cy="13" r="0.8" fill="#c8b898" />
    </svg>
  );
}
