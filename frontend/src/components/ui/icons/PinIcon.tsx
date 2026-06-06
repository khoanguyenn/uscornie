import type { IconProps } from "./HeartIcon";

export function PinIcon({ size }: Pick<IconProps, "size">) {
  return (
    <svg
      viewBox="0 0 20 20"
      width={size}
      height={size}
      xmlns="http://www.w3.org/2000/svg"
    >
      <title>Location Pin</title>
      <path
        d="M10 18 Q4 12 4 8 Q4 3 10 2 Q16 3 16 8 Q16 12 10 18Z"
        fill="#f47a60"
      />
      <circle cx="10" cy="8" r="3.5" fill="#fce8e4" />
      <path
        d="M10 12 Q7.5 9.5 8.2 8 Q8.5 7 9.2 7.5 Q9.6 7.8 10 8.5 Q10.4 7.8 10.8 7.5 Q11.5 7 11.8 8 Q12.5 9.5 10 12Z"
        fill="#f47a60"
      />
    </svg>
  );
}
