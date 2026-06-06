"use client";

import { AnimatePresence, domAnimation, LazyMotion, m } from "framer-motion";
import GhibliIcon from "@/components/ui/GhibliIcon";

interface JoinStatusCardsProps {
  status: string; // welcome | loading | success | error
  onEnterHome: () => void;
}

export function JoinStatusCards({ status, onEnterHome }: JoinStatusCardsProps) {
  return (
    <LazyMotion features={domAnimation}>
      <AnimatePresence mode="wait">
        {status === "welcome" && (
          <m.div
            key="welcome"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.3 }}
            className="w-full gap-y-6 md:gap-y-8 flex flex-col items-center"
          >
            <div className="flex justify-center transform hover:scale-105 transition-transform duration-300">
              <GhibliIcon type="totoro" size={90} />
            </div>

            <div className="flex flex-col gap-y-3 text-center">
              <h1 className="text-4xl font-extrabold text-[#5c4a3d] font-pangolin tracking-wide drop-shadow-sm">
                Uscornie
              </h1>
              <p className="text-[#7d6958] text-base leading-relaxed max-w-xs mx-auto">
                Bạn nhận được một lời mời tham gia ngôi nhà chung từ người ấy.
              </p>
            </div>

            <div className="flex flex-col items-center w-full max-w-xs gap-y-4">
              <div
                id="google-btn"
                className="w-full flex justify-center py-2"
              />
              <p className="text-[11px] text-[#a39485] italic text-center leading-normal">
                Kết nối nhanh chóng bằng tài khoản Google.
                <br />
                Không cần thiết lập mật khẩu phức tạp.
              </p>
            </div>
          </m.div>
        )}

        {status === "loading" && (
          <m.div
            key="loading"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.3 }}
            className="flex flex-col items-center justify-center gap-y-6 py-12"
          >
            <div className="animate-pulse">
              <GhibliIcon type="heart" size={90} />
            </div>
            <div className="flex flex-col gap-y-2 text-center">
              <p className="text-[#5c4a3d] font-bold text-2xl font-pangolin">
                Đang xây tổ ấm…
              </p>
              <p className="text-sm text-[#7d6958] italic">
                Đợi một chút để chuẩn bị góc nhỏ của hai bạn
              </p>
            </div>
          </m.div>
        )}

        {status === "success" && (
          <m.div
            key="success"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.3 }}
            className="w-full gap-y-6 flex flex-col items-center"
          >
            <div className="flex justify-center animate-pulse">
              <GhibliIcon type="calcifer" size={90} />
            </div>
            <div className="flex flex-col gap-y-2 text-center">
              <h2 className="text-3xl font-bold text-[#e0664b] font-pangolin">
                Chào mừng về nhà!
              </h2>
              <p className="text-[#7d6958] text-base">
                Bạn đã gia nhập thành công vào không gian riêng tư.
              </p>
            </div>
            <button
              onClick={onEnterHome}
              className="bg-[#e0664b] text-white font-pangolin text-[1.1rem] font-bold py-3 px-6 rounded-full border-2 border-[#c4543b] cursor-pointer transition-all duration-200 hover:bg-[#cc543a] hover:-translate-y-0.5 hover:shadow-[0_4px_12px_rgba(224,102,75,0.3)] mt-4 w-full max-w-xs shadow-md"
              type="button"
            >
              Vào nhà ngay
            </button>
          </m.div>
        )}

        {status === "error" && (
          <m.div
            key="error"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.3 }}
            className="w-full gap-y-6 flex flex-col items-center"
          >
            <div className="flex justify-center">
              <GhibliIcon type="soot" size={90} />
            </div>
            <div className="flex flex-col gap-y-2 text-center">
              <h2 className="text-3xl font-bold text-[#5c4a3d] font-pangolin">
                Ối, lỗi rồi!
              </h2>
              <p className="text-[#7d6958] text-base">
                Lời mời có vẻ đã hết hạn hoặc không còn hiệu lực.
              </p>
            </div>
            <button
              onClick={onEnterHome}
              className="bg-[#fdf8f0] text-[#5c4a3d] font-pangolin text-[1rem] py-2.5 px-5 rounded-full border border-[#eae3d9] cursor-pointer transition-all duration-200 hover:bg-[#f7efe2] hover:-translate-y-px mt-4 w-full max-w-xs shadow-sm"
              type="button"
            >
              Quay lại trang chủ
            </button>
          </m.div>
        )}
      </AnimatePresence>
    </LazyMotion>
  );
}
