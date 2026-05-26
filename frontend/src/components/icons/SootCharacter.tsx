import { useMemo } from "react";
import { legs, spikeRing, starPts } from "@/utils/svgHelpers";

interface SootCharacterProps {
  size?: number;
  stars?: boolean;
  starColors?: string[];
}

export default function SootCharacter({
  size = 32,
  stars = false,
  starColors = ["#f9e27a", "#f5a0b8", "#a8e6a0"],
}: SootCharacterProps) {
  const w = size;
  const ew = w * 0.16;
  const eh = w * 0.18;
  const pw = w * 0.07;

  const processedStars = useMemo(() => {
    if (!stars) return [];
    return starColors.map((c, i) => {
      const ang = -40 + i * 50;
      const r = w * 0.55;
      const x = w / 2 + r * Math.cos((ang * Math.PI) / 180);
      const y = w / 2 + r * Math.sin((ang * Math.PI) / 180);
      return {
        points: starPts(x, y, w * 0.09, w * 0.04),
        fill: c,
        rotateValues: `0 ${x} ${y};360 ${x} ${y}`,
        dur: `${3 + i}s`,
      };
    });
  }, [stars, starColors, w]);

  const sootLegs = useMemo(() => legs(w / 2, w * 0.75, 5, w * 0.08), [w]);
  const spikePath = useMemo(
    () => spikeRing(w / 2, w / 2, w * 0.36, w * 0.44, 20),
    [w],
  );

  return (
    <svg
      viewBox={`0 0 ${w} ${w}`}
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
    >
      <title>Soot Character</title>
      <circle cx={w / 2} cy={w / 2} r={w * 0.38} fill="#1a1714" />
      <path d={spikePath} fill="#1a1714" />

      <ellipse
        cx={w * 0.38}
        cy={w * 0.44}
        rx={ew / 2}
        ry={eh / 2}
        fill="white"
      />
      <ellipse
        cx={w * 0.62}
        cy={w * 0.44}
        rx={ew / 2}
        ry={eh / 2}
        fill="white"
      />

      <circle cx={w * 0.38} cy={w * 0.45} r={pw / 2} fill="#1a1714">
        <animate
          attributeName="cy"
          values={`${w * 0.45};${w * 0.44};${w * 0.45}`}
          dur="3s"
          repeatCount="indefinite"
        />
      </circle>
      <circle cx={w * 0.62} cy={w * 0.45} r={pw / 2} fill="#1a1714">
        <animate
          attributeName="cy"
          values={`${w * 0.45};${w * 0.44};${w * 0.45}`}
          dur="3s"
          repeatCount="indefinite"
        />
      </circle>

      {/* Blink */}
      <ellipse
        cx={w * 0.38}
        cy={w * 0.44}
        rx={ew / 2}
        ry={eh / 2}
        fill="white"
        opacity="0"
      >
        <animate
          attributeName="ry"
          values={`${eh / 2};${eh * 0.05};${eh / 2}`}
          dur="4s"
          repeatCount="indefinite"
          keyTimes="0;0.025;0.05"
          calcMode="spline"
          keySplines="0.4 0 0.6 1;0.4 0 0.6 1"
        />
      </ellipse>

      {sootLegs.map((leg, i) => (
        <line
          key={`leg-${leg.x1}-${leg.y1}-${i}`}
          x1={leg.x1}
          y1={leg.y1}
          x2={leg.x2}
          y2={leg.y2}
          stroke="#1a1714"
          strokeWidth="1.5"
          strokeLinecap="round"
        >
          <animate
            attributeName="y2"
            values={`${leg.y2};${leg.y2 * 0.6};${leg.y2}`}
            dur={`${leg.dur}s`}
            repeatCount="indefinite"
          />
        </line>
      ))}

      {processedStars.map((star, i) => (
        <polygon
          key={`star-${star.points}-${i}`}
          points={star.points}
          fill={star.fill}
        >
          <animateTransform
            attributeName="transform"
            type="rotate"
            values={star.rotateValues}
            dur={star.dur}
            repeatCount="indefinite"
          />
        </polygon>
      ))}
    </svg>
  );
}
