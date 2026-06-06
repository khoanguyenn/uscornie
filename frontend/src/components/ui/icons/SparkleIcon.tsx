import type { IconProps } from "./HeartIcon";

export function SparkleIcon({ size }: Pick<IconProps, "size">) {
  return (
    <svg
      viewBox="0 0 20 20"
      width={size}
      height={size}
      xmlns="http://www.w3.org/2000/svg"
    >
      <title>Sparkle</title>
      <path
        d="M10 2 L11 8 L17 10 L11 12 L10 18 L9 12 L3 10 L9 8Z"
        fill="#f9e27a"
      />
      <circle cx="5" cy="5" r="1" fill="#f5a0b8" opacity="0.6" />
      <circle cx="15" cy="4" r="0.8" fill="#a8e6cf" opacity="0.6" />
      <circle cx="16" cy="15" r="0.7" fill="#b8d4f0" opacity="0.5" />
      <path
        d="M10 2 L11 8 L17 10 L11 12 L10 18 L9 12 L3 10 L9 8Z"
        fill="#f9e27a"
        opacity="0.3"
      >
        <animateTransform
          attributeName="transform"
          type="rotate"
          values="0 10 10;360 10 10"
          dur="8s"
          repeatCount="indefinite"
        />
      </path>
    </svg>
  );
}
