import type { IconProps } from "./HeartIcon";

export function CalciferIcon({ size }: Pick<IconProps, "size">) {
  return (
    <svg
      viewBox="0 0 20 20"
      width={size}
      height={size}
      xmlns="http://www.w3.org/2000/svg"
    >
      <title>Calcifer</title>
      <path
        d="M6 14 Q4 6 8 3 Q9 1 10 0 Q11 1 12 3 Q16 6 14 14Z"
        fill="#f47a30"
      />
      <path
        d="M8 14 Q7 9 9 5 Q10 3 10 3 Q10 3 11 5 Q13 9 12 14Z"
        fill="#f9b030"
      />
      <circle cx="8.5" cy="9" r="1.3" fill="white" />
      <circle cx="11.5" cy="9" r="1.3" fill="white" />
      <circle cx="8.5" cy="9.3" r="0.6" fill="#2a2018" />
      <circle cx="11.5" cy="9.3" r="0.6" fill="#2a2018" />
    </svg>
  );
}
