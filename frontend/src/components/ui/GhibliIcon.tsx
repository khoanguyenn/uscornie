import {
  BookIcon,
  CafeIcon,
  CalciferIcon,
  DateIcon,
  FilmIcon,
  FlowerIcon,
  FoodIcon,
  GiftIcon,
  HeartIcon,
  LeafIcon,
  PinIcon,
  SootIcon,
  SparkleIcon,
  TotoroIcon,
} from "./GhibliSVGIcons";

interface GhibliIconProps {
  type: string;
  size?: number | string;
  color?: string;
  style?: React.CSSProperties;
  className?: string;
}

export default function GhibliIcon({
  type,
  size = 20,
  color = "#f2a0a0",
  style,
  className,
}: GhibliIconProps) {
  const pixelSize = typeof size === "number" ? `${size}px` : size;

  return (
    <div
      className={`ghibli-icon ${className || ""}`}
      style={{
        width: pixelSize,
        height: pixelSize,
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        ...style,
      }}
    >
      {type === "heart" && <HeartIcon size={size} color={color} />}
      {type === "flower" && <FlowerIcon size={size} color={color} />}
      {(type === "soot" || type === "miniSoot") && <SootIcon size={size} />}
      {(type === "calcifer" || type === "miniCalcifer") && (
        <CalciferIcon size={size} />
      )}
      {(type === "totoro" || type === "miniTotoro") && (
        <TotoroIcon size={size} />
      )}
      {(type === "gift" || type === "wishlist") && <GiftIcon size={size} />}
      {(type === "bowl" || type === "food") && <FoodIcon size={size} />}
      {type === "cafe" && <CafeIcon size={size} />}
      {(type === "book" || type === "books") && <BookIcon size={size} />}
      {(type === "film" || type === "movies") && <FilmIcon size={size} />}
      {(type === "pin" || type === "places") && <PinIcon size={size} />}
      {(type === "leaf" || type === "habits") && <LeafIcon size={size} />}
      {(type === "sparkle" || type === "other") && <SparkleIcon size={size} />}
      {type === "date" && <DateIcon size={size} />}
    </div>
  );
}
