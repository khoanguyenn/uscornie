import type * as React from "react";
import { cn } from "@/lib/utils/cn";

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string | undefined;
  ref?: React.Ref<HTMLInputElement>;
}

export function Input({
  className,
  type = "text",
  label,
  error,
  id,
  ref,
  ...props
}: InputProps) {
  return (
    <div className="flex flex-col gap-1.5 mb-4 w-full">
      {label && (
        <label
          htmlFor={id}
          className="font-semibold text-[0.9rem] text-ink block"
        >
          {label}
        </label>
      )}
      <input
        id={id}
        type={type}
        ref={ref}
        className={cn(
          "w-full font-quicksand text-[0.9rem] p-[10px_14px] border-2 border-earth/25 rounded-xl bg-cream text-ink focus:border-grass outline-none transition-colors duration-300",
          className,
        )}
        {...props}
      />
      {error && <p className="text-[#c97070] text-[0.8rem] mt-0.5">{error}</p>}
    </div>
  );
}
