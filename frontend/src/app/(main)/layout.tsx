"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import AnimatedBackground from "@/components/AnimatedBackground";
import GoogleSignInButton from "@/components/GoogleSignInButton";
import GhibliIcon from "@/components/icons/GhibliIcon";
import NavBar from "@/components/NavBar";
import { authService } from "@/services/authService";
import { useAuthStore } from "@/stores/useAuthStore";

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
    if (showToast) {
      const timer = setTimeout(() => {
        setShowToast(false);
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [showToast]);

  const handleLoginSuccess = useCallback(
    // biome-ignore lint/suspicious/noExplicitAny: Google Identity response is untyped
    async (response: any) => {
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
    <div className="app-layout">
      <AnimatedBackground />

      <header className="header">
        <button
          className="logo-container"
          onClick={() => push("/")}
          type="button"
          aria-label="Trang chủ"
          style={{ background: "none", border: "none", cursor: "pointer" }}
        >
          <div className="logo-frame">
            <GhibliIcon type="leaf" size={40} />
          </div>
        </button>
        <h1>Our Little Corner</h1>
        <p>Một góc nhỏ của riêng mình</p>

        <div className="auth-status">
          {isAuthenticated ? (
            <button onClick={logout} className="logout-link" type="button">
              Đăng xuất
            </button>
          ) : (
            <GoogleSignInButton onSuccess={handleLoginSuccess} />
          )}
        </div>
      </header>

      <NavBar />

      <main className="main-container">{children}</main>

      <div className={`toast error ${showToast ? "show" : ""}`}>
        <GhibliIcon type="calcifer" size={20} />
        <span>{errorMsg || "Có lỗi xảy ra"}</span>
      </div>
    </div>
  );
}
