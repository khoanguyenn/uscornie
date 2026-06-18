import GhibliIcon from "@/components/ui/GhibliIcon";

export default function GhibliScenery() {
  return (
    <div className="w-full md:w-1/2 relative min-h-[300px] md:min-h-[550px] bg-gradient-to-b from-[#7eb8c9] to-[#c8e6f0]">
      {/* Scenery Layout inside Left Column */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Scenery Clouds, Hills, Houses, Characters */}
        <div className="absolute inset-0 bg-[linear-gradient(180deg,#c8e6f0_0%,#e8f4f8_40%,#fdf8f0_70%)]" />
        {/* Hills */}
        <div className="absolute bottom-0 inset-x-0 h-[40%]">
          <div className="absolute bottom-0 w-[150%] left-[-25%] rounded-t-[50%] h-full bg-[#a8cc8f] z-1 -bottom-[5%]" />
          <div className="absolute bottom-0 w-[150%] left-[-25%] rounded-t-[50%] h-[85%] bg-[#b5d4a0] z-2 -bottom-[10%] -translate-x-[5%]" />
        </div>
        {/* Characters */}
        <div className="absolute bottom-0 left-[20%] z-10 animate-[charBob_4s_ease-in-out_infinite]">
          <GhibliIcon type="totoro" size={100} />
        </div>
        <div className="absolute bottom-[2%] left-[45%] z-10 animate-[charBob_3s_ease-in-out_infinite_0.5s]">
          <GhibliIcon type="soot" size={35} />
        </div>
      </div>
    </div>
  );
}
