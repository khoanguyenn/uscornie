import type * as React from "react";
import { cn } from "@/lib/utils/cn";

export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string | undefined;
  ref?: React.Ref<HTMLTextAreaElement>;
}

export function Textarea({
  className,
  label,
  error,
  id,
  ref,
  ...props
}: TextareaProps) {
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
      <textarea
        id={id}
        ref={ref}
        className={cn(
          "w-full font-quicksand text-[0.9rem] p-[10px_14px] border-2 border-earth/25 rounded-xl bg-cream text-ink focus:border-grass outline-none resize-y min-h-[80px] transition-colors duration-300",
          className,
        )}
        {...props}
      />
      {error && <p className="text-[#c97070] text-[0.8rem] mt-0.5">{error}</p>}
    </div>
  );
}
