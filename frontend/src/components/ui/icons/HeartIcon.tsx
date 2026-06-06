export interface IconProps {
  size: number | string;
  color: string;
}

export function HeartIcon({ size, color }: IconProps) {
  return (
    <svg
      viewBox="0 0 20 20"
      width={size}
      height={size}
      xmlns="http://www.w3.org/2000/svg"
    >
      <title>Heart</title>
      <path
        d="M10 17 Q0 10 3 5 Q5 2 8 4 Q9 5 10 7 Q11 5 12 4 Q15 2 17 5 Q20 10 10 17Z"
        fill={color}
      />
    </svg>
  );
}
