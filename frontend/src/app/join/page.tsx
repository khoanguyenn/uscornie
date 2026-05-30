"use client";

import { AnimatePresence, domAnimation, LazyMotion, m } from "framer-motion";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useCallback, useEffect, useState } from "react";
import GhibliIcon from "@/components/ui/GhibliIcon";
import { useAuthStore } from "@/lib/providers/auth-store-provider";
import { authService } from "@/lib/services/authService";
import { spaceService } from "@/lib/services/spaceService";

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

function JoinPageContent() {
  const { push } = useRouter();
  const searchParams = useSearchParams();
  const { get } = searchParams;
  const setToken = useAuthStore((s) => s.setToken);

  const [status, setStatus] = useState("welcome"); // welcome | loading | success | error
  const [_spaceId, setSpaceId] = useState<string | null>(null);

  const handleCredentialResponse = useCallback(
    async (res: GoogleCredentialResponse) => {
      const inviteToken = get ? get.call(searchParams, "token") : null;
      if (!inviteToken) {
        setStatus("error");
        return;
      }

      setStatus("loading");
      try {
        const authData = await authService.loginWithGoogle(res.credential);
        setToken(authData.token);

        const space = await spaceService.joinSpace(inviteToken);
        setSpaceId(space.id);
        setStatus("success");
      } catch (_err) {
        setStatus("error");
      }
    },
    [searchParams, get, setToken],
  );

  useEffect(() => {
    document.title = "Join space - Uscornie";

    const w = window as unknown as GoogleWindow;
    if (w.google && !w._googleInitializedJoin) {
      w.google.accounts.id.initialize({
        client_id:
          "702434694462-n4i82p90r7042a96b71f9hsq5m3mlik1.apps.googleusercontent.com",
        callback: handleCredentialResponse,
      });
      w._googleInitializedJoin = true;
    }

    const btn = document.getElementById("google-btn");
    if (btn && w.google) {
      w.google.accounts.id.renderButton(btn, {
        theme: "outline",
        size: "large",
        shape: "pill",
      });
    }
  }, [handleCredentialResponse]);

  return (
    <div className="min-h-screen bg-[#f7e1d7] flex items-center justify-center p-4">
      {/* Container Scrapbook Look */}
      <div className="w-full max-w-[950px] bg-white rounded-3xl overflow-hidden shadow-2xl flex flex-col md:flex-row relative border-[6px] border-white">
        {/* CỘT TRÁI: Art Ghibli Scenery */}
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

        {/* CỘT PHẢI: Form Đăng nhập */}
        <div className="w-full md:w-1/2 bg-[#fdfbf7] p-10 md:p-14 flex flex-col justify-center items-center relative">
          <div className="absolute inset-0 pointer-events-none opacity-[0.03] mix-blend-overlay bg-paper-texture" />

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
                    onClick={() => push("/")}
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
                    onClick={() => push("/")}
                    className="bg-[#fdf8f0] text-[#5c4a3d] font-pangolin text-[1rem] py-2.5 px-5 rounded-full border border-[#eae3d9] cursor-pointer transition-all duration-200 hover:bg-[#f7efe2] hover:-translate-y-px mt-4 w-full max-w-xs shadow-sm"
                    type="button"
                  >
                    Quay lại trang chủ
                  </button>
                </m.div>
              )}
            </AnimatePresence>
          </LazyMotion>
        </div>
      </div>
    </div>
  );
}

export default function JoinPage() {
  return (
    <Suspense
      fallback={
        <div className="font-quicksand font-bold text-center text-[#7a7060] p-10">
          Đang tải…
        </div>
      }
    >
      <JoinPageContent />
    </Suspense>
  );
}
