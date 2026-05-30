"use client";

import GhibliIcon from "@/components/ui/GhibliIcon";

export default function GlobalError({
  error: _error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[350px] gap-5 text-center p-5">
      <GhibliIcon type="soot" size={70} />
      <div className="flex flex-col gap-2">
        <h2 className="font-pangolin text-2xl text-[#4a4033] font-bold">
          Ối, đã xảy ra lỗi!
        </h2>
        <p className="text-[#7a7060] text-[0.95rem] max-w-md font-medium">
          Có lỗi nhỏ xảy ra trên giao diện. Bạn hãy nhấn nút phía dưới để thử
          tải lại trang nhé.
        </p>
      </div>
      <button
        onClick={reset}
        className="bg-earth text-white border-none py-2.5 px-6 rounded-full font-bold cursor-pointer hover:bg-[#bfa065] transition-colors duration-200 shadow-sm"
        type="button"
      >
        Tải lại trang
      </button>
    </div>
  );
}
