import Image from "next/image";
import GhibliIcon from "@/components/ui/GhibliIcon";
import type { SaveItem } from "@/lib/types";

interface SaveItemCardProps {
  item: SaveItem;
  categoryIcon: string;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
}

export default function SaveItemCard({
  item,
  categoryIcon,
  onEdit,
  onDelete,
}: SaveItemCardProps) {
  return (
    <div className="flex flex-col bg-card border-2 border-earth/20 rounded-2xl overflow-hidden shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300">
      {item.image ? (
        <div className="relative h-48 w-full">
          <Image
            src={item.image}
            alt={item.title}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        </div>
      ) : (
        <div className="flex items-center justify-center h-48 bg-cream text-earth/40">
          <GhibliIcon type={categoryIcon} size={50} />
        </div>
      )}
      <div className="flex flex-col flex-1 p-5">
        <div className="font-pangolin text-lg font-bold text-ink mb-1">
          {item.title}
        </div>
        <div className="text-sm text-ink-light leading-relaxed mb-4 flex-1">
          {item.desc}
        </div>
        {item.tag && (
          <span className="self-start inline-block bg-petal text-sunset text-xs font-bold px-3 py-1 rounded-full mb-4">
            {item.tag}
          </span>
        )}
        <div className="flex gap-2.5 mt-auto">
          <button
            className="flex-1 px-4 py-2 text-sm font-bold rounded-xl border-2 border-earth/30 text-ink-light bg-transparent hover:bg-cream hover:text-ink cursor-pointer transition-all duration-200"
            onClick={() => onEdit(item.id)}
            type="button"
          >
            Sửa
          </button>
          <button
            className="flex-1 px-4 py-2 text-sm font-bold rounded-xl border-2 border-red-200 text-red-500 bg-transparent hover:bg-red-50 hover:border-red-300 cursor-pointer transition-all duration-200"
            onClick={() => onDelete(item.id)}
            type="button"
          >
            Xoá
          </button>
        </div>
      </div>
    </div>
  );
}
