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
      {/* Heart */}
      {type === "heart" && (
        <svg
          viewBox="0 0 20 20"
          width={size}
          height={size}
          xmlns="http://www.w3.org/2000/svg"
        >
          <title>Heart</title>
          <path
            d="M10 17 Q0 10 3 5 Q5 2 8 4 Q9 5 10 7 Q11 5 12 4 Q15 2 17 5 Q20 10 10 17Z"
            fill={color}
          />
        </svg>
      )}

      {/* Flower */}
      {type === "flower" && (
        <svg
          viewBox="0 0 24 24"
          width={size}
          height={size}
          xmlns="http://www.w3.org/2000/svg"
        >
          <title>Flower</title>
          <circle cx="12" cy="12" r="4" fill={color} opacity="0.3" />
          <g fill={color}>
            <circle cx="12" cy="6" r="4" />
            <circle cx="12" cy="18" r="4" />
            <circle cx="6" cy="12" r="4" />
            <circle cx="18" cy="12" r="4" />
            <circle cx="7.5" cy="7.5" r="4" />
            <circle cx="16.5" cy="16.5" r="4" />
            <circle cx="7.5" cy="16.5" r="4" />
            <circle cx="16.5" cy="7.5" r="4" />
          </g>
          <circle cx="12" cy="12" r="5" fill="#fdf3e0" />
          <circle cx="10" cy="11" r="0.6" fill="#4a4033" />
          <circle cx="14" cy="11" r="0.6" fill="#4a4033" />
          <path
            d="M10 14 Q12 15.5 14 14"
            stroke="#4a4033"
            strokeWidth="0.6"
            fill="none"
            strokeLinecap="round"
          />
        </svg>
      )}

      {/* Mini Soot */}
      {(type === "soot" || type === "miniSoot") && (
        <svg
          viewBox="0 0 20 20"
          width={size}
          height={size}
          xmlns="http://www.w3.org/2000/svg"
        >
          <title>Soot Sprite</title>
          <circle cx="10" cy="10" r="7" fill="#1a1714" />
          <ellipse cx="7.5" cy="9" rx="2" ry="2.2" fill="white" />
          <ellipse cx="12.5" cy="9" rx="2" ry="2.2" fill="white" />
          <circle cx="7.5" cy="9.3" r="1" fill="#1a1714" />
          <circle cx="12.5" cy="9.3" r="1" fill="#1a1714" />
        </svg>
      )}

      {/* Mini Calcifer */}
      {(type === "calcifer" || type === "miniCalcifer") && (
        <svg
          viewBox="0 0 20 20"
          width={size}
          height={size}
          xmlns="http://www.w3.org/2000/svg"
        >
          <title>Calcifer</title>
          <path
            d="M6 14 Q4 6 8 3 Q9 1 10 0 Q11 1 12 3 Q16 6 14 14Z"
            fill="#f47a30"
          />
          <path
            d="M8 14 Q7 9 9 5 Q10 3 10 3 Q10 3 11 5 Q13 9 12 14Z"
            fill="#f9b030"
          />
          <circle cx="8.5" cy="9" r="1.3" fill="white" />
          <circle cx="11.5" cy="9" r="1.3" fill="white" />
          <circle cx="8.5" cy="9.3" r="0.6" fill="#2a2018" />
          <circle cx="11.5" cy="9.3" r="0.6" fill="#2a2018" />
        </svg>
      )}

      {/* Mini Totoro */}
      {(type === "totoro" || type === "miniTotoro") && (
        <svg
          viewBox="0 0 20 24"
          width={size}
          height={size}
          xmlns="http://www.w3.org/2000/svg"
        >
          <title>Totoro</title>
          <line
            x1="10"
            y1="2"
            x2="10"
            y2="0"
            stroke="#5a8a3a"
            strokeWidth="1"
            strokeLinecap="round"
          />
          <ellipse
            cx="10"
            cy="0"
            rx="1.5"
            ry="2.5"
            fill="#6aaa4a"
            transform="rotate(-15 10 0)"
          />
          <ellipse
            cx="5.5"
            cy="5"
            rx="2.5"
            ry="3.5"
            fill="#858880"
            transform="rotate(-15 5.5 5)"
          />
          <ellipse
            cx="14.5"
            cy="5"
            rx="2.5"
            ry="3.5"
            fill="#858880"
            transform="rotate(15 14.5 5)"
          />
          <ellipse cx="10" cy="15" rx="8" ry="9" fill="#858880" />
          <ellipse cx="10" cy="17.5" rx="5.5" ry="6" fill="#dedad0" />
          <ellipse cx="7" cy="11.5" rx="2.5" ry="2.8" fill="white" />
          <ellipse cx="13" cy="11.5" rx="2.5" ry="2.8" fill="white" />
          <circle cx="7.3" cy="12" r="1.4" fill="#1e1c1a" />
          <circle cx="13.3" cy="12" r="1.4" fill="#1e1c1a" />
          <circle cx="6.8" cy="11" r="0.6" fill="white" />
          <circle cx="12.8" cy="11" r="0.6" fill="white" />
          <ellipse cx="10" cy="14" rx="1" ry="0.7" fill="#555250" />
        </svg>
      )}

      {/* Mini Gift (Wishlist) */}
      {(type === "gift" || type === "wishlist") && (
        <svg
          viewBox="0 0 20 20"
          width={size}
          height={size}
          xmlns="http://www.w3.org/2000/svg"
        >
          <title>Gift</title>
          <rect x="2" y="8" width="16" height="10" rx="2" fill="#f5a0b8" />
          <rect x="2" y="8" width="16" height="4" rx="1.5" fill="#e88aa0" />
          <rect x="9" y="8" width="2" height="10" fill="#f9e27a" />
          <rect
            x="2"
            y="9"
            width="16"
            height="2"
            fill="#f9e27a"
            opacity="0.7"
          />
          <path d="M10 8 Q7 4 5 5 Q4 6 5.5 7 Q7 8 10 8" fill="#f9e27a" />
          <path d="M10 8 Q13 4 15 5 Q16 6 14.5 7 Q13 8 10 8" fill="#f9e27a" />
          <circle cx="10" cy="7.5" r="1.2" fill="#f9e27a" />
        </svg>
      )}

      {/* Mini Bowl (Food) */}
      {(type === "bowl" || type === "food") && (
        <svg
          viewBox="0 0 20 20"
          width={size}
          height={size}
          xmlns="http://www.w3.org/2000/svg"
        >
          <title>Food Bowl</title>
          <path d="M3 10 Q3 17 10 17 Q17 17 17 10Z" fill="#f4a460" />
          <ellipse cx="10" cy="10" rx="7.5" ry="2.5" fill="#e8944a" />
          <path
            d="M6 7 Q6.5 4 7 7"
            stroke="#b0a090"
            strokeWidth="1"
            fill="none"
            strokeLinecap="round"
            opacity="0.6"
          >
            <animate
              attributeName="d"
              values="M6 7 Q6.5 4 7 7;M6 6 Q6.5 3 7 6;M6 7 Q6.5 4 7 7"
              dur="2s"
              repeatCount="indefinite"
            />
          </path>
          <path
            d="M9.5 6.5 Q10 3.5 10.5 6.5"
            stroke="#b0a090"
            strokeWidth="1"
            fill="none"
            strokeLinecap="round"
            opacity="0.6"
          >
            <animate
              attributeName="d"
              values="M9.5 6.5 Q10 3.5 10.5 6.5;M9.5 5.5 Q10 2.5 10.5 5.5;M9.5 6.5 Q10 3.5 10.5 6.5"
              dur="2.3s"
              repeatCount="indefinite"
            />
          </path>
          <path
            d="M13 7 Q13.5 4 14 7"
            stroke="#b0a090"
            strokeWidth="1"
            fill="none"
            strokeLinecap="round"
            opacity="0.6"
          >
            <animate
              attributeName="d"
              values="M13 7 Q13.5 4 14 7;M13 6 Q13.5 3 14 6;M13 7 Q13.5 4 14 7"
              dur="1.8s"
              repeatCount="indefinite"
            />
          </path>
          <circle cx="7" cy="12" r="1" fill="#e0d0b0" />
          <circle cx="11" cy="11.5" r="1.3" fill="#e0d0b0" />
          <circle cx="13" cy="13" r="0.8" fill="#c8b898" />
        </svg>
      )}

      {/* Mini Cafe */}
      {type === "cafe" && (
        <svg
          viewBox="0 0 20 20"
          width={size}
          height={size}
          xmlns="http://www.w3.org/2000/svg"
        >
          <title>Cafe Cup</title>
          <rect x="3" y="8" width="11" height="10" rx="2" fill="#a8c88e" />
          <path
            d="M14 10 Q18 10 18 13 Q18 16 14 16"
            fill="none"
            stroke="#a8c88e"
            strokeWidth="1.8"
            strokeLinecap="round"
          />
          <ellipse cx="8.5" cy="8" rx="5.5" ry="1.5" fill="#8cb87a" />
          <path
            d="M7 5 Q7.5 2 8 5"
            stroke="#c8c0b0"
            strokeWidth="0.9"
            fill="none"
            strokeLinecap="round"
            opacity="0.5"
          >
            <animate
              attributeName="d"
              values="M7 5 Q7.5 2 8 5;M7 4 Q7.5 1 8 4;M7 5 Q7.5 2 8 5"
              dur="2s"
              repeatCount="indefinite"
            />
          </path>
          <path
            d="M10 5.5 Q10.5 2.5 11 5.5"
            stroke="#c8c0b0"
            strokeWidth="0.9"
            fill="none"
            strokeLinecap="round"
            opacity="0.5"
          >
            <animate
              attributeName="d"
              values="M10 5.5 Q10.5 2.5 11 5.5;M10 4.5 Q10.5 1.5 11 4.5;M10 5.5 Q10.5 2.5 11 5.5"
              dur="2.4s"
              repeatCount="indefinite"
            />
          </path>
          <ellipse
            cx="7"
            cy="13"
            rx="1.2"
            ry="0.5"
            fill="#8cb87a"
            opacity="0.4"
          />
          <ellipse
            cx="10"
            cy="12"
            rx="0.8"
            ry="0.4"
            fill="#8cb87a"
            opacity="0.4"
          />
        </svg>
      )}

      {/* Mini Book */}
      {(type === "book" || type === "books") && (
        <svg
          viewBox="0 0 20 20"
          width={size}
          height={size}
          xmlns="http://www.w3.org/2000/svg"
        >
          <title>Book</title>
          <path d="M10 5 Q6 4 2 5.5 L2 16.5 Q6 15 10 16Z" fill="#7eb8c9" />
          <path d="M10 5 Q14 4 18 5.5 L18 16.5 Q14 15 10 16Z" fill="#8ac4d4" />
          <line
            x1="10"
            y1="5"
            x2="10"
            y2="16"
            stroke="#5a9aaa"
            strokeWidth="0.5"
          />
          <line
            x1="4.5"
            y1="8"
            x2="8.5"
            y2="7.5"
            stroke="#fff"
            strokeWidth="0.6"
            opacity="0.5"
          />
          <line
            x1="4.5"
            y1="10"
            x2="8.5"
            y2="9.5"
            stroke="#fff"
            strokeWidth="0.6"
            opacity="0.5"
          />
          <line
            x1="4.5"
            y1="12"
            x2="8.5"
            y2="11.5"
            stroke="#fff"
            strokeWidth="0.6"
            opacity="0.5"
          />
          <line
            x1="11.5"
            y1="7.5"
            x2="15.5"
            y2="8"
            stroke="#fff"
            strokeWidth="0.6"
            opacity="0.5"
          />
          <line
            x1="11.5"
            y1="9.5"
            x2="15.5"
            y2="10"
            stroke="#fff"
            strokeWidth="0.6"
            opacity="0.5"
          />
          <line
            x1="11.5"
            y1="11.5"
            x2="15.5"
            y2="12"
            stroke="#fff"
            strokeWidth="0.6"
            opacity="0.5"
          />
          <path
            d="M10 4 L8 3 Q6 2.5 4 3"
            stroke="#d4a060"
            strokeWidth="0.6"
            fill="none"
          />
        </svg>
      )}

      {/* Mini Film (Movies) */}
      {(type === "film" || type === "movies") && (
        <svg
          viewBox="0 0 20 20"
          width={size}
          height={size}
          xmlns="http://www.w3.org/2000/svg"
        >
          <title>Movie Clapper</title>
          <rect x="2" y="7" width="16" height="11" rx="1.5" fill="#4a4033" />
          <rect x="2" y="7" width="16" height="3" fill="#5a5040" />
          <rect
            x="2"
            y="4"
            width="16"
            height="3.5"
            rx="1"
            fill="#5a5040"
            transform="rotate(-5 10 5.5)"
          />
          <line
            x1="5"
            y1="3.5"
            x2="6.5"
            y2="7"
            stroke="#f9e27a"
            strokeWidth="0.8"
          />
          <line
            x1="9"
            y1="3"
            x2="10.5"
            y2="6.8"
            stroke="#f9e27a"
            strokeWidth="0.8"
          />
          <line
            x1="13"
            y1="3"
            x2="14.5"
            y2="6.8"
            stroke="#f9e27a"
            strokeWidth="0.8"
          />
          <circle
            cx="7"
            cy="13"
            r="2"
            fill="none"
            stroke="#f9e27a"
            strokeWidth="0.8"
          />
          <circle cx="7" cy="13" r="0.6" fill="#f9e27a" />
          <circle
            cx="13"
            cy="13"
            r="2"
            fill="none"
            stroke="#f9e27a"
            strokeWidth="0.8"
          />
          <circle cx="13" cy="13" r="0.6" fill="#f9e27a" />
        </svg>
      )}

      {/* Mini Pin (Places) */}
      {(type === "pin" || type === "places") && (
        <svg
          viewBox="0 0 20 20"
          width={size}
          height={size}
          xmlns="http://www.w3.org/2000/svg"
        >
          <title>Location Pin</title>
          <path
            d="M10 18 Q4 12 4 8 Q4 3 10 2 Q16 3 16 8 Q16 12 10 18Z"
            fill="#f47a60"
          />
          <circle cx="10" cy="8" r="3.5" fill="#fce8e4" />
          <path
            d="M10 12 Q7.5 9.5 8.2 8 Q8.5 7 9.2 7.5 Q9.6 7.8 10 8.5 Q10.4 7.8 10.8 7.5 Q11.5 7 11.8 8 Q12.5 9.5 10 12Z"
            fill="#f47a60"
          />
        </svg>
      )}

      {/* Mini Leaf (Habits) */}
      {(type === "leaf" || type === "habits") && (
        <svg
          viewBox="0 0 20 20"
          width={size}
          height={size}
          xmlns="http://www.w3.org/2000/svg"
        >
          <title>Leaf</title>
          <line
            x1="10"
            y1="18"
            x2="10"
            y2="10"
            stroke="#6a9b6a"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
          <path d="M10 10 Q5 4 3 3 Q4 8 10 10Z" fill="#8cb78c" />
          <path d="M10 8 Q15 3 17 2 Q16 7 10 8Z" fill="#a8cc8f" />
          <path
            d="M10 10 Q6.5 6 5 5"
            stroke="#6a9b6a"
            strokeWidth="0.5"
            fill="none"
          />
          <path
            d="M10 8 Q13 5 14 4"
            stroke="#8ab88a"
            strokeWidth="0.5"
            fill="none"
          />
          <circle cx="8" cy="15" r="0.6" fill="#a8cc8f" opacity="0.5" />
          <circle cx="12" cy="16" r="0.5" fill="#a8cc8f" opacity="0.4" />
        </svg>
      )}

      {/* Mini Sparkle */}
      {(type === "sparkle" || type === "other") && (
        <svg
          viewBox="0 0 20 20"
          width={size}
          height={size}
          xmlns="http://www.w3.org/2000/svg"
        >
          <title>Sparkle</title>
          <path
            d="M10 2 L11 8 L17 10 L11 12 L10 18 L9 12 L3 10 L9 8Z"
            fill="#f9e27a"
          />
          <circle cx="5" cy="5" r="1" fill="#f5a0b8" opacity="0.6" />
          <circle cx="15" cy="4" r="0.8" fill="#a8e6cf" opacity="0.6" />
          <circle cx="16" cy="15" r="0.7" fill="#b8d4f0" opacity="0.5" />
          <path
            d="M10 2 L11 8 L17 10 L11 12 L10 18 L9 12 L3 10 L9 8Z"
            fill="#f9e27a"
            opacity="0.3"
          >
            <animateTransform
              attributeName="transform"
              type="rotate"
              values="0 10 10;360 10 10"
              dur="8s"
              repeatCount="indefinite"
            />
          </path>
        </svg>
      )}

      {/* Mini Date */}
      {type === "date" && (
        <svg
          viewBox="0 0 20 20"
          width={size}
          height={size}
          xmlns="http://www.w3.org/2000/svg"
        >
          <title>Date Couple</title>
          <circle cx="6.5" cy="5.5" r="2.5" fill="#7a7d78" />
          <circle cx="13.5" cy="5.5" r="2.5" fill="#9a7a5a" />
          <ellipse cx="6.5" cy="12" rx="3" ry="5" fill="#7a7d78" />
          <ellipse cx="13.5" cy="12" rx="3" ry="5" fill="#9a7a5a" />
          <path
            d="M10 4 Q8 2 7 3 Q6 4 7 5 Q8 6 10 8 Q12 6 13 5 Q14 4 13 3 Q12 2 10 4Z"
            fill="#f2a0a0"
          >
            <animate
              attributeName="opacity"
              values="1;0.6;1"
              dur="1.5s"
              repeatCount="indefinite"
            />
          </path>
        </svg>
      )}
    </div>
  );
}
