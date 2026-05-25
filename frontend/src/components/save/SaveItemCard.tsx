import GhibliIcon from "@/components/icons/GhibliIcon";
import type { SaveItem } from "@/types";

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
    <div className="item-card">
      {item.image ? (
        <img className="item-img" src={item.image} alt={item.title} />
      ) : (
        <div className="no-img">
          <GhibliIcon type={categoryIcon} size={50} />
        </div>
      )}
      <div className="item-body">
        <div className="item-title">{item.title}</div>
        <div className="item-desc">{item.desc}</div>
        {item.tag && <span className="item-tag">{item.tag}</span>}
        <div className="item-actions">
          <button
            className="btn btn-secondary btn-small"
            onClick={() => onEdit(item.id)}
            type="button"
          >
            Sửa
          </button>
          <button
            className="btn btn-danger btn-small"
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
