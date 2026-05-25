"use client";

import { useEffect, useState } from "react";
import CalciferCharacter from "./icons/CalciferCharacter";
import GhibliIcon from "./icons/GhibliIcon";
import SootCharacter from "./icons/SootCharacter";
import TotoroCharacter from "./icons/TotoroCharacter";

interface HeartData {
  id: number;
  left: string;
  duration: string;
  delay: string;
  size: number;
  color: string;
}

const colors = ["#f2a0a0", "#f5c0c0", "#e8b0b0", "#f0d0d0", "#e0a8a8"];

const flowerVariants = [
  {
    id: 1,
    type: "pink",
    p1: "#f7b8c8",
    p2: "#f5a8bc",
    center: "#fce88a",
    className: "fl-1 fl-sway",
  },
  {
    id: 3,
    type: "yellow",
    p1: "#fdd96a",
    p2: "#fcc84a",
    center: "#ffeaa0",
    className: "fl-3 fl-sway-slow",
  },
  {
    id: 4,
    type: "blue",
    p1: "#c0e8f9",
    p2: "#a0d8f5",
    center: "#fff8e0",
    className: "fl-4 fl-sway",
  },
  {
    id: 5,
    type: "white",
    p1: "#ffffff",
    p2: "#f0f0f0",
    center: "#fce88a",
    className: "fl-5 fl-sway-slow",
  },
];

export default function AnimatedBackground() {
  const [hearts, setHearts] = useState<HeartData[]>([]);

  useEffect(() => {
    const initialHearts: HeartData[] = [];
    for (let i = 0; i < 6; i++) {
      initialHearts.push({
        id: i,
        left: `${5 + Math.random() * 90}%`,
        duration: `${10 + Math.random() * 8}s`,
        delay: `${Math.random() * 10}s`,
        size: 14 + Math.random() * 10,
        color: colors[i % colors.length],
      });
    }
    setHearts(initialHearts);
  }, []);

  return (
    <div className="fixed-bg">
      {/* Sky & Scene */}
      <div className="bg-scene">
        <div className="bg-sky" />

        {/* Clouds */}
        <div className="cloud cloud-1" />
        <div className="cloud cloud-2" />

        {/* Hills */}
        <div className="bg-hills">
          <div className="hill hill-1" />
          <div className="hill hill-2" />
          <div className="hill hill-3" />
        </div>
      </div>

      {/* GARDEN: Unified Flowers, Bees, Butterflies */}
      <div className="garden-layer">
        {/* Unified Shape Flowers */}
        {flowerVariants.map((f) => (
          <div key={f.id} className={`garden-elem ${f.className}`}>
            <svg
              width="40"
              height="56"
              viewBox="0 0 40 56"
              xmlns="http://www.w3.org/2000/svg"
            >
              <title>Flower</title>
              {/* Stem and leaves */}
              <line
                x1="20"
                y1="56"
                x2="20"
                y2="30"
                stroke="#8ab060"
                strokeWidth="2.5"
                strokeLinecap="round"
              />
              <ellipse
                cx="12"
                cy="38"
                rx="4"
                ry="7"
                fill="#8ab060"
                opacity="0.8"
                transform="rotate(-35 12 38)"
              />
              <ellipse
                cx="28"
                cy="40"
                rx="4"
                ry="7"
                fill="#8ab060"
                opacity="0.8"
                transform="rotate(35 28 40)"
              />

              {/* 6 fluffy petals */}
              <ellipse
                cx="20"
                cy="9"
                rx="8"
                ry="10"
                fill={f.p1}
                opacity="0.9"
              />
              <ellipse
                cx="30"
                cy="14"
                rx="8"
                ry="10"
                fill={f.p2}
                opacity="0.9"
                transform="rotate(60 30 14)"
              />
              <ellipse
                cx="30"
                cy="26"
                rx="8"
                ry="10"
                fill={f.p1}
                opacity="0.9"
                transform="rotate(120 30 26)"
              />
              <ellipse
                cx="20"
                cy="31"
                rx="8"
                ry="10"
                fill={f.p2}
                opacity="0.9"
                transform="rotate(180 20 31)"
              />
              <ellipse
                cx="10"
                cy="26"
                rx="8"
                ry="10"
                fill={f.p1}
                opacity="0.9"
                transform="rotate(240 10 26)"
              />
              <ellipse
                cx="10"
                cy="14"
                rx="8"
                ry="10"
                fill={f.p2}
                opacity="0.9"
                transform="rotate(300 10 14)"
              />

              {/* Center face */}
              <circle cx="20" cy="20" r="9" fill={f.center} opacity="0.8" />
              <circle cx="20" cy="20" r="7" fill={f.center} />

              {/* Tiny eyes */}
              <ellipse cx="17" cy="19" rx="1.2" ry="1.5" fill="#2a1a10" />
              <ellipse cx="23" cy="19" rx="1.2" ry="1.5" fill="#2a1a10" />

              {/* Blush */}
              <circle cx="14" cy="21" r="2.5" fill="#f4a0a0" opacity="0.45" />
              <circle cx="26" cy="21" r="2.5" fill="#f4a0a0" opacity="0.45" />
            </svg>
          </div>
        ))}

        {/* Butterfly */}
        <div className="garden-elem butterfly bf-1">
          <svg
            width="50"
            height="36"
            viewBox="0 0 50 36"
            xmlns="http://www.w3.org/2000/svg"
          >
            <title>Butterfly</title>
            <ellipse
              cx="16"
              cy="13"
              rx="14"
              ry="11"
              fill="#f9c0d8"
              opacity="0.88"
              className="wing-l"
            />
            <ellipse
              cx="14"
              cy="25"
              rx="10"
              ry="8"
              fill="#f5a8c8"
              opacity="0.8"
              className="wing-l-sub"
            />
            <ellipse
              cx="34"
              cy="13"
              rx="14"
              ry="11"
              fill="#f9c0d8"
              opacity="0.88"
              className="wing-r"
            />
            <ellipse
              cx="36"
              cy="25"
              rx="10"
              ry="8"
              fill="#f5a8c8"
              opacity="0.8"
              className="wing-r-sub"
            />
            <circle cx="16" cy="12" r="3" fill="#f07098" opacity="0.5" />
            <circle cx="34" cy="12" r="3" fill="#f07098" opacity="0.5" />
            <ellipse cx="25" cy="18" rx="2.5" ry="9" fill="#c87090" />
            <line
              x1="24"
              y1="9"
              x2="20"
              y2="3"
              stroke="#c87090"
              strokeWidth="1"
              strokeLinecap="round"
            />
            <circle cx="20" cy="3" r="1.5" fill="#f090b0" />
            <line
              x1="26"
              y1="9"
              x2="30"
              y2="3"
              stroke="#c87090"
              strokeWidth="1"
              strokeLinecap="round"
            />
            <circle cx="30" cy="3" r="1.5" fill="#f090b0" />
          </svg>
        </div>

        {/* Bee */}
        <div className="garden-elem bee-top">
          <svg
            width="40"
            height="30"
            viewBox="0 0 40 30"
            xmlns="http://www.w3.org/2000/svg"
          >
            <title>Bee</title>
            <ellipse cx="18" cy="18" rx="10" ry="8" fill="#fdd96a" />
            <rect
              x="14"
              y="10"
              width="2"
              height="16"
              fill="#4a3020"
              opacity="0.8"
            />
            <rect
              x="18"
              y="10"
              width="2"
              height="16"
              fill="#4a3020"
              opacity="0.8"
            />
            <rect
              x="22"
              y="10"
              width="2"
              height="16"
              fill="#4a3020"
              opacity="0.8"
            />
            <ellipse
              cx="16"
              cy="10"
              rx="8"
              ry="6"
              fill="#d0f0f8"
              opacity="0.6"
              transform="rotate(-20 16 10)"
            />
            <ellipse
              cx="20"
              cy="10"
              rx="8"
              ry="6"
              fill="#d0f0f8"
              opacity="0.6"
              transform="rotate(20 20 10)"
            />
            <circle cx="24" cy="16" r="1" fill="#4a3020" />
            <circle cx="28" cy="16" r="1" fill="#4a3020" />
            <path
              d="M25 20 Q26.5 21.5 28 20"
              stroke="#4a3020"
              strokeWidth="0.8"
              fill="none"
            />
          </svg>
        </div>
      </div>

      {/* Characters (Soot sprites under the grass/hills) */}
      <div className="character-layer">
        <div className="ghibli-char char-totoro">
          <TotoroCharacter />
        </div>
        <div className="ghibli-char char-calcifer">
          <CalciferCharacter />
        </div>

        <div className="ghibli-char char-soot soot-a">
          <SootCharacter size={28} />
        </div>
        <div className="ghibli-char char-soot soot-b">
          <SootCharacter size={22} />
        </div>
        <div className="ghibli-char char-soot soot-c">
          <SootCharacter
            size={26}
            stars={true}
            starColors={["#f5a0b8", "#a8e6cf", "#fce68a"]}
          />
        </div>
        <div className="ghibli-char char-soot soot-d">
          <SootCharacter size={18} />
        </div>
      </div>

      {/* Floating Hearts */}
      <div id="float-hearts">
        {hearts.map((heart) => (
          <div
            key={heart.id}
            className="fh"
            style={{
              left: heart.left,
              animationDuration: heart.duration,
              animationDelay: heart.delay,
            }}
          >
            <GhibliIcon type="heart" size={heart.size} color={heart.color} />
          </div>
        ))}
      </div>
    </div>
  );
}
