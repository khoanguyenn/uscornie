import GhibliIcon from "@/components/icons/GhibliIcon";
import type { Category } from "@/types";

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
    <div className="flex flex-wrap gap-3 justify-center mb-8">
      {categories.map((x) => (
        <button
          key={x.id}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-full border-2 font-bold transition-all duration-200 cursor-pointer ${
            value === x.id
              ? "bg-sunset border-sunset text-white shadow-[0_4px_16px_rgba(244,164,96,0.3)]"
              : "bg-card border-earth/20 text-ink-light hover:border-grass hover:text-ink hover:-translate-y-0.5"
          }`}
          onClick={() => onChange(x.id)}
          type="button"
        >
          <span className="flex items-center justify-center">
            <GhibliIcon type={x.ico} size={16} />
          </span>
          {x.label}
        </button>
      ))}
    </div>
  );
}
