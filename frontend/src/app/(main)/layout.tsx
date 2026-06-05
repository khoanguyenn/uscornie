"use client";

import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import GoogleSignInButton from "@/components/GoogleSignInButton";
import NavBar from "@/components/NavBar";
import GhibliIcon from "@/components/ui/GhibliIcon";
import { authService } from "@/lib/services/authService";
import { useAuthStore } from "@/lib/stores/useAuthStore";
import { cn } from "@/lib/utils/cn";

const AnimatedBackground = dynamic(
  () => import("@/components/AnimatedBackground"),
  {
    ssr: false,
  },
);

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { push } = useRouter();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const setToken = useAuthStore((s) => s.setToken);
  const clearToken = useAuthStore((s) => s.clearToken);

  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [showToast, setShowToast] = useState(false);

  const triggerError = useCallback((msg: string) => {
    setErrorMsg(msg);
    setShowToast(true);
  }, []);

  useEffect(() => {
    let timer: NodeJS.Timeout | undefined;
    if (showToast) {
      timer = setTimeout(() => {
        setShowToast(false);
      }, 4000);
    }
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [showToast]);

  const handleLoginSuccess = useCallback(
    async (response: { credential: string }) => {
      try {
        const data = await authService.loginWithGoogle(response.credential);
        setToken(data.access_token);
        window.location.reload();
      } catch (_err) {
        triggerError("Đăng nhập thất bại. Vui lòng thử lại!");
      }
    },
    [setToken, triggerError],
  );

  const logout = () => {
    clearToken();
    window.location.reload();
  };

  return (
    <div className="min-h-screen flex flex-col relative z-1">
      <AnimatedBackground />

      <header className="relative z-10 text-center px-5 pt-[30px] pb-2.5">
        <button
          className="inline-block cursor-pointer mb-[15px] bg-transparent border-0"
          onClick={() => push("/")}
          type="button"
          aria-label="Trang chủ"
        >
          <div className="size-[60px] bg-[#fdf8f0] border-2 border-[#c9a96e] rounded-[16px] flex items-center justify-center shadow-[inset_0_0_10px_rgba(201,169,110,0.2),0_4px_12px_rgba(74,64,51,0.1)] relative after:content-[''] after:absolute after:inset-[4px] after:border after:border-[#c9a96e]/30 after:rounded-[12px]">
            <GhibliIcon type="leaf" size={40} />
          </div>
        </button>
        <h1 className="font-pangolin text-[3rem] text-[#4a4033] [text-shadow:2px_2px_0_rgba(255,255,255,0.5)]">
          Our Little Corner
        </h1>
        <p className="text-[0.92rem] text-[#7a7060] mt-[2px] font-medium">
          Một góc nhỏ của riêng mình
        </p>

        <div className="absolute top-5 right-5">
          {isAuthenticated ? (
            <button
              onClick={logout}
              className="text-[0.8rem] text-[#7a7060] underline bg-transparent border-0 cursor-pointer opacity-60 hover:opacity-100"
              type="button"
            >
              Đăng xuất
            </button>
          ) : (
            <GoogleSignInButton onSuccess={handleLoginSuccess} />
          )}
        </div>
      </header>

      <NavBar />

      <main className="flex-1 w-full max-w-[1000px] mx-auto p-5 relative z-10 flex flex-col items-center">
        {children}
      </main>

      <div
        className={cn(
          "fixed bottom-[30px] left-1/2 -translate-x-1/2 bg-[#e0664b] text-white font-quicksand font-bold text-[0.9rem] px-7 py-3 rounded-[24px] shadow-[0_6px_24px_rgba(224,102,75,0.4)] z-[10000] flex items-center gap-2 transition-all duration-400 opacity-0 pointer-events-none translate-y-[80px]",
          showToast && "opacity-100 translate-y-0 pointer-events-auto",
        )}
      >
        <GhibliIcon type="calcifer" size={20} />
        <span>{errorMsg || "Có lỗi xảy ra"}</span>
      </div>
    </div>
  );
}
