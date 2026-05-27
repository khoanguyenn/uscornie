import GhibliIcon from "@/components/ui/GhibliIcon";
import type { Category } from "@/lib/types";
import { cn } from "@/lib/utils/cn";

interface CategoryTabsProps {
  value: string;
  categories: Category[];
  onChange: (catId: string) => void;
}

export default function CategoryTabs({
  value,
  categories,
  onChange,
}: CategoryTabsProps) {
  return (
    <div className="flex flex-wrap !gap-1.5 !mb-5 w-full max-w-full">
      {categories.map((x) => (
        <button
          key={x.id}
          className={cn(
            "flex items-center justify-center !gap-1.5 !py-2 !px-4 rounded-[20px] border-2 font-semibold text-[0.8rem] leading-none transition-all duration-250 cursor-pointer shrink-0",
            value === x.id
              ? "bg-[#c9a96e] border-[#c9a96e] text-white"
              : "bg-[#fffdf7] border-[rgba(201,169,110,0.25)] text-[#7a7060] hover:border-[#8cb78c] hover:text-[#4a4033] hover:-translate-y-px",
          )}
          onClick={() => onChange(x.id)}
          type="button"
        >
          <span className="size-4 flex items-center justify-center shrink-0">
            <GhibliIcon type={x.ico} size={16} />
          </span>
          <span className="leading-none">{x.label}</span>
        </button>
      ))}
    </div>
  );
}
