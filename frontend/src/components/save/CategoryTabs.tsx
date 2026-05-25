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
    <div className="sub-tabs">
      {categories.map((x) => (
        <button
          key={x.id}
          className={`sub-tab ${value === x.id ? "active" : ""}`}
          onClick={() => onChange(x.id)}
          type="button"
        >
          <span className="st-ico">
            <GhibliIcon type={x.ico} size={16} />
          </span>
          {x.label}
        </button>
      ))}
    </div>
  );
}
