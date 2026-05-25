"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect } from "react";
import AnimatedBackground from "@/components/AnimatedBackground";
import GhibliIcon from "@/components/icons/GhibliIcon";
import NavBar from "@/components/NavBar";
import { authService } from "@/services/authService";
import { useAuthStore } from "@/stores/useAuthStore";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { isAuthenticated, setToken, clearToken } = useAuthStore();

  const handleLoginSuccess = useCallback(
    async (response: any) => {
      try {
        const data = await authService.loginWithGoogle(response.credential);
        setToken(data.access_token);
        window.location.reload();
      } catch (_err) {
        alert("Đăng nhập thất bại");
      }
    },
    [setToken],
  );

  const logout = () => {
    clearToken();
    window.location.reload();
  };

  useEffect(() => {
    // Check if google is available on window
    const checkGoogle = () => {
      if (
        typeof window !== "undefined" &&
        (window as any).google &&
        !isAuthenticated
      ) {
        (window as any).google.accounts.id.initialize({
          client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || "",
          callback: handleLoginSuccess,
          auto_select: true,
        });

        (window as any).google.accounts.id.prompt();

        const btn = document.getElementById("google-btn-header");
        if (btn) {
          (window as any).google.accounts.id.renderButton(btn, {
            theme: "outline",
            size: "medium",
          });
        }
      }
    };

    // Run check
    checkGoogle();

    // Fallback timer in case script loads slowly
    const timer = setTimeout(checkGoogle, 1000);
    return () => clearTimeout(timer);
  }, [isAuthenticated, handleLoginSuccess]);

  return (
    <div className="app-layout">
      <AnimatedBackground />

      <header className="header">
        <div className="logo-container" onClick={() => router.push("/")}>
          <div className="logo-frame">
            <GhibliIcon type="leaf" size={40} />
          </div>
        </div>
        <h1>Our Little Corner</h1>
        <p>Một góc nhỏ của riêng mình</p>

        <div className="auth-status">
          {isAuthenticated ? (
            <button onClick={logout} className="logout-link">
              Đăng xuất
            </button>
          ) : (
            <div id="google-btn-header"></div>
          )}
        </div>
      </header>

      <NavBar />

      <main className="main-container">{children}</main>
    </div>
  );
}
