export interface Category {
  id: string;
  label: string;
  ico: string;
}

export interface GiftMode {
  id: string;
  label: string;
}

export interface Suggestion {
  n: string; // name
  d: string; // description
}

export type SuggestionsMap = Record<string, Suggestion[]>;
export type TagsByCategoryMap = Record<string, string[]>;

export interface SaveItem {
  id?: string;
  category: string;
  title: string;
  note?: string;
  tags?: string[];
  link?: string;
  createdAt?: string;
}

export interface OLCData {
  items: SaveItem[];
  anniversaryDate: string;
  birthdayDate: string;
}
