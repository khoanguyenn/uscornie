"use client";

import { useEffect, useState } from "react";
import CalciferCharacter from "@/components/characters/CalciferCharacter";
import SootCharacter from "@/components/characters/SootCharacter";
import TotoroCharacter from "@/components/characters/TotoroCharacter";
import GhibliIcon from "@/components/ui/GhibliIcon";
import _styles from "./AnimatedBackground.module.css";
import Bee from "./garden/Bee";
import Butterfly from "./garden/Butterfly";
import Flower from "./garden/Flower";

const styles = _styles as unknown as {
  animateDrift: string;
  animateDriftReverse: string;
  animateCharBob: string;
  animateCalciferBob: string;
  animateSootBounceA: string;
  animateSootBounceB: string;
  animateSootBounceC: string;
  animateSootBounceD: string;
  animateHeartFloat: string;
  animateSway: string;
  animateSwaySlow: string;
  animateButterflyFloat: string;
  animateBugFloat: string;
  animateWingFlap: string;
  animateWingFlapR: string;
};

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
    position: "bottom-[15%] left-[8%]",
    isSlow: false,
  },
  {
    id: 3,
    type: "yellow",
    p1: "#fdd96a",
    p2: "#fcc84a",
    center: "#ffeaa0",
    position: "bottom-[8%] right-[12%]",
    isSlow: true,
  },
  {
    id: 4,
    type: "blue",
    p1: "#c0e8f9",
    p2: "#a0d8f5",
    center: "#fff8e0",
    position: "bottom-[12%] left-[30%]",
    isSlow: false,
  },
  {
    id: 5,
    type: "white",
    p1: "#ffffff",
    p2: "#f0f0f0",
    center: "#fce88a",
    position: "bottom-[18%] right-[35%]",
    isSlow: true,
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
        color: colors[i % colors.length] || "#f2a0a0",
      });
    }
    setHearts(initialHearts);
  }, []);

  return (
    <div className="fixed inset-0 -z-1 pointer-events-none">
      {/* Sky & Scene */}
      <div className="fixed inset-0 -z-2 pointer-events-none overflow-hidden bg-[#fdf8f0]">
        <div className="absolute inset-0 h-full bg-[linear-gradient(180deg,#c8e6f0_0%,#e8f4f8_40%,#fdf8f0_70%)]" />

        {/* Clouds */}
        <div
          className={`absolute bg-white/85 rounded-full blur-[2px] before:content-[''] before:absolute before:bg-inherit before:rounded-full after:content-[''] after:absolute after:bg-inherit after:rounded-full w-[180px] h-[60px] top-[12%] left-[-200px] ${styles.animateDrift} before:w-[100px] before:h-[100px] before:-top-[50px] before:left-[30px] after:w-[80px] after:h-[80px] after:-top-[30px] after:left-[90px]`}
        />
        <div
          className={`absolute bg-white/85 rounded-full blur-[2px] before:content-[''] before:absolute before:bg-inherit before:rounded-full after:content-[''] after:absolute after:bg-inherit after:rounded-full w-[140px] h-[50px] top-[25%] right-[-200px] ${styles.animateDriftReverse} opacity-70 before:w-[80px] before:h-[80px] before:-top-[40px] before:left-[20px] after:w-[60px] after:h-[60px] after:-top-[25px] after:left-[70px]`}
        />

        {/* Hills */}
        <div className="absolute bottom-0 inset-x-0 h-[50vh] w-full">
          <div className="absolute bottom-0 w-[150%] left-[-25%] rounded-t-[50%] h-full bg-[#a8cc8f] z-1 -bottom-[10vh]" />
          <div className="absolute bottom-0 w-[150%] left-[-25%] rounded-t-[50%] h-[85%] bg-[#b5d4a0] z-2 -bottom-[15vh] -translate-x-[10%]" />
          <div className="absolute bottom-0 w-[150%] left-[-25%] rounded-t-[50%] h-[70%] bg-[#c2d9a8] z-3 -bottom-[20vh] translate-x-[15%]" />
        </div>
      </div>

      {/* GARDEN: Unified Flowers, Bees, Butterflies */}
      <div>
        {flowerVariants.map((f) => (
          <Flower
            key={f.id}
            p1={f.p1}
            p2={f.p2}
            center={f.center}
            position={f.position}
            isSlow={f.isSlow}
          />
        ))}
        <Butterfly />
        <Bee />
      </div>

      {/* Characters (Soot sprites under the grass/hills) */}
      <div>
        <div
          className={`fixed z-3 pointer-events-none bottom-0 right-[5%] ${styles.animateCharBob}`}
        >
          <TotoroCharacter />
        </div>
        <div
          className={`fixed z-3 pointer-events-none bottom-[5%] left-[5%] ${styles.animateCalciferBob}`}
        >
          <CalciferCharacter />
        </div>

        <div
          className={`fixed z-3 pointer-events-none left-[15%] bottom-[12%] ${styles.animateSootBounceA}`}
        >
          <SootCharacter size={28} />
        </div>
        <div
          className={`fixed z-3 pointer-events-none left-[22%] bottom-[18%] ${styles.animateSootBounceB}`}
        >
          <SootCharacter size={22} />
        </div>
        <div
          className={`fixed z-3 pointer-events-none right-[18%] bottom-[14%] ${styles.animateSootBounceC}`}
        >
          <SootCharacter
            size={26}
            stars={true}
            starColors={["#f5a0b8", "#a8e6cf", "#fce68a"]}
          />
        </div>
        <div
          className={`fixed z-3 pointer-events-none right-[28%] bottom-[20%] ${styles.animateSootBounceD}`}
        >
          <SootCharacter size={18} />
        </div>
      </div>

      {/* Floating Hearts */}
      <div id="float-hearts">
        {hearts.map((heart) => (
          <div
            key={heart.id}
            className={`absolute ${styles.animateHeartFloat}`}
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
