"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import GhibliIcon from "@/components/icons/GhibliIcon";
import { authService } from "@/services/authService";
import { spaceService } from "@/services/spaceService";
import { useAuthStore } from "@/stores/useAuthStore";

interface GoogleCredentialResponse {
  credential: string;
}

interface GoogleAccountsId {
  initialize: (config: {
    client_id: string;
    callback: (res: GoogleCredentialResponse) => void;
  }) => void;
  renderButton: (
    element: HTMLElement,
    config: { theme: string; size: string; shape?: string },
  ) => void;
}

interface GoogleAccounts {
  id: GoogleAccountsId;
}

interface GoogleWindow {
  google?: {
    accounts: GoogleAccounts;
  };
  _googleInitializedJoin?: boolean;
}

export default function JoinPageContent() {
  const { push } = useRouter();
  const searchParams = useSearchParams();
  const { get } = searchParams;
  const { setToken } = useAuthStore();

  const [status, setStatus] = useState("welcome"); // welcome | loading | success | error
  const [_spaceId, setSpaceId] = useState<string | null>(null);

  const handleGoogleResponse = useCallback(
    async (response: GoogleCredentialResponse) => {
      setStatus("loading");
      try {
        const data = await authService.loginWithGoogle(response.credential);
        setToken(data.access_token);

        const inviteToken = get ? get.call(searchParams, "invite_token") : null;
        if (inviteToken) {
          const joinData = await spaceService.joinSpace(inviteToken);
          setSpaceId(joinData.space_id);
          setStatus("success");
          setTimeout(() => {
            push("/");
          }, 3000);
        } else {
          push("/");
        }
      } catch (err) {
        console.error(err);
        setStatus("error");
      }
    },
    [push, searchParams, get, setToken],
  );

  useEffect(() => {
    const initializeGoogle = () => {
      const win = window as unknown as typeof window & GoogleWindow;
      const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

      if (!clientId) {
        console.warn(
          "NEXT_PUBLIC_GOOGLE_CLIENT_ID is not configured. Google sign-in initialization skipped.",
        );
        return;
      }

      if (win.google && !win._googleInitializedJoin) {
        win._googleInitializedJoin = true;
        win.google.accounts.id.initialize({
          client_id: clientId,
          callback: handleGoogleResponse,
        });
        const btn = document.getElementById("google-btn");
        if (btn) {
          win.google.accounts.id.renderButton(btn, {
            theme: "outline",
            size: "large",
            shape: "pill",
          });
        }
      }
    };

    // Run initialization
    initializeGoogle();

    // Fallback in case script loads slowly
    const timer = setTimeout(initializeGoogle, 1000);
    return () => clearTimeout(timer);
  }, [handleGoogleResponse]);

  return (
    <div className="join-page-wrapper min-h-screen w-full flex items-center justify-center p-4 md:p-8">
      <div className="main-card flex flex-col md:flex-row w-full max-w-5xl rounded-3xl overflow-hidden shadow-2xl border border-[#eae3d9]">
        {/* CỘT TRÁI: Dữ liệu demo / Screen Captures kiểu scrapbook */}
        <div className="showcase-column hidden md:flex md:w-1/2 flex-col justify-between p-10 relative overflow-hidden">
          <div className="absolute inset-0 bg-[#4a6b52]/10 backdrop-blur-[1px] z-0" />

          {/* Header cột trái */}
          <div className="relative z-10 flex flex-col gap-y-2">
            <div className="inline-flex items-center gap-2 bg-white/90 px-3 py-1.5 rounded-full border border-[#c9a96e]/30 shadow-sm w-fit">
              <span className="size-2.5 rounded-full bg-[#8cb78c] animate-pulse" />
              <span className="text-xs font-semibold text-[#5c4a3d] uppercase tracking-wider">
                Chào mừng bạn ghé thăm
              </span>
            </div>
            <h2 className="text-3xl font-extrabold text-white font-pangolin drop-shadow-md mt-2">
              Nơi cất giữ hành trình yêu thương
            </h2>
          </div>

          {/* Các thẻ Mockup mô phỏng ứng dụng */}
          <div className="mockup-cards-container relative z-10 flex flex-col items-center justify-center my-6 gap-y-6">
            {/* Thẻ 1: Kỷ niệm Polaroid */}
            <div className="mock-card polaroid-card transform -rotate-2 hover:rotate-0 hover:-translate-y-2 transition-all duration-300">
              <div className="polaroid-photo relative overflow-hidden rounded">
                <div className="absolute inset-0 bg-gradient-to-b from-[#b5d6e0] to-[#f4d1c1]" />
                <div className="absolute -bottom-8 -left-4 w-40 h-24 rounded-full bg-[#a3c9a8] opacity-90" />
                <div className="absolute -bottom-10 -right-6 w-44 h-24 rounded-full bg-[#8cb78c] opacity-90" />
                <div className="absolute top-6 left-12 size-8 rounded-full bg-[#fdf5e6] shadow-[0_0_12px_rgba(253,245,230,0.8)]" />
                <div className="absolute top-8 right-16 w-12 h-4 bg-white/70 rounded-full blur-[1px]" />
              </div>
              <p className="polaroid-text mt-3 font-pangolin text-sm text-[#5c4a3d] italic text-center">
                Ngắm hoàng hôn cùng nhau ✨
              </p>
            </div>

            {/* Thẻ 2: Đếm ngày */}
            <div className="mock-card counter-card transform rotate-3 hover:rotate-0 hover:-translate-y-2 transition-all duration-300">
              <div className="flex items-center gap-4">
                <div className="size-12 rounded-2xl bg-[#fdf8f0] border border-[#e8dcc4] flex items-center justify-center shadow-inner">
                  <GhibliIcon type="heart" size={28} />
                </div>
                <div>
                  <div className="text-2xl font-bold text-[#e0664b] font-pangolin tracking-wide">
                    365 ngày
                  </div>
                  <div className="text-xs text-[#7d6958] font-medium uppercase tracking-wider">
                    Đã bên nhau sẻ chia
                  </div>
                </div>
              </div>
            </div>

            {/* Thẻ 3: Gợi ý hẹn hò */}
            <div className="mock-card ticket-card transform -rotate-1 hover:rotate-0 hover:-translate-y-2 transition-all duration-300">
              <div className="border-b-2 border-dashed border-[#e6dfd3] pb-2 mb-2 flex justify-between items-center">
                <span className="text-[10px] font-bold text-[#a39485] tracking-widest uppercase">
                  Gợi ý hẹn hò
                </span>
                <span className="text-[10px] bg-[#8cb78c]/20 text-[#4a6b52] px-2 py-0.5 rounded-full font-bold">
                  Thử thách mới
                </span>
              </div>
              <div className="text-sm font-semibold text-[#5c4a3d]">
                Picnic công viên và vẽ tranh ngoài trời 🎨
              </div>
              <div className="text-[11px] text-[#7d6958] mt-1 italic">
                &quot;Mang theo một giỏ trái cây và những câu chuyện nhỏ…&quot;
              </div>
            </div>
          </div>

          {/* Footer cột trái */}
          <div className="relative z-10 text-xs text-white/80 font-medium">
            Dành riêng cho hai bạn • Uscornie 2026
          </div>
        </div>

        {/* CỘT PHẢI: Form Đăng nhập */}
        <div className="login-column w-full md:w-1/2 bg-[#fdfbf7] p-10 md:p-14 flex flex-col justify-center items-center relative">
          <div className="absolute inset-0 pointer-events-none opacity-[0.03] mix-blend-overlay paper-texture" />

          <AnimatePresence mode="wait">
            {status === "welcome" && (
              <motion.div
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
                    Bạn nhận được một lời mời tham gia ngôi nhà chung từ người
                    ấy.
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
              </motion.div>
            )}

            {status === "loading" && (
              <motion.div
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
              </motion.div>
            )}

            {status === "success" && (
              <motion.div
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
                  onClick={() => push("/")}
                  className="entry-button mt-4 w-full max-w-xs shadow-md"
                  type="button"
                >
                  Vào nhà ngay
                </button>
              </motion.div>
            )}

            {status === "error" && (
              <motion.div
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
                    Ôi, lỗi rồi!
                  </h2>
                  <p className="text-[#7d6958] text-base">
                    Lời mời có vẻ đã hết hạn hoặc không còn hiệu lực.
                  </p>
                </div>
                <button
                  onClick={() => push("/")}
                  className="back-button mt-4 w-full max-w-xs shadow-sm"
                  type="button"
                >
                  Quay lại trang chủ
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
