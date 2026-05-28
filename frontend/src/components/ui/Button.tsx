import type * as React from "react";
import { cn } from "@/lib/utils/cn";

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary";
  size?: "default" | "small";
  ref?: React.Ref<HTMLButtonElement>;
}

export function Button({
  className,
  variant = "primary",
  size = "default",
  type = "button",
  ref,
  ...props
}: ButtonProps) {
  return (
    <button
      ref={ref}
      type={type}
      className={cn(
        "font-quicksand font-bold cursor-pointer transition-all duration-300 rounded-[24px] inline-flex items-center justify-center gap-1.5",
        variant === "primary"
          ? "bg-grass text-white shadow-[0_4px_12px_rgba(140,183,140,0.3)] hover:bg-grass-dark hover:-translate-y-0.5"
          : "bg-petal text-ink hover:bg-blush hover:-translate-y-[1px]",
        size === "default"
          ? "text-[0.9rem] py-2.5 px-6"
          : "text-[0.8rem] py-1.5 px-4",
        className,
      )}
      {...props}
    />
  );
}
