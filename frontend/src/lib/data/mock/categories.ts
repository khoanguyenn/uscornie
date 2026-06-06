import type { Category, GiftMode, TagsByCategoryMap } from "@/lib/types";

export const SAVE_CATEGORIES: Category[] = [
  { id: "wishlist", label: "Wishlist quà tặng", ico: "gift" },
  { id: "food", label: "Quán ăn", ico: "bowl" },
  { id: "cafe", label: "Quán cafe", ico: "cafe" },
  { id: "books", label: "Sách", ico: "book" },
  { id: "movies", label: "Phim", ico: "film" },
  { id: "places", label: "Địa điểm vui chơi", ico: "pin" },
  { id: "habits", label: "Thói quen nhỏ", ico: "leaf" },
  { id: "other", label: "Khác", ico: "sparkle" },
];

export const GIFT_MODES: GiftMode[] = [
  { id: "random", label: "Gợi ý ngẫu nhiên" },
  { id: "wishlist", label: "Gợi ý từ Wishlist" },
];

export const TAGS_BY_CATEGORY: TagsByCategoryMap = {
  food: ["Yêu thích", "Must try", "Muốn đến", "Kỉ niệm", "Khác"],
  cafe: ["Yêu thích", "Must try", "Muốn đến", "Kỉ niệm", "Khác"],
  places: ["Yêu thích", "Must try", "Muốn đến", "Kỉ niệm", "Khác"],
  books: ["Yêu thích", "Muốn xem", "Kỉ niệm", "Khác"],
  movies: ["Yêu thích", "Muốn xem", "Kỉ niệm", "Khác"],
  other: ["Yêu thích", "Sẽ thử", "Kỉ niệm", "Khác"],
  wishlist: ["Cho mình", "Người ấy", "Khác"],
  habits: ["Đáng yêu", "Cần thay đổi", "Kỉ niệm", "Thói quen chưa tốt", "Khác"],
};
