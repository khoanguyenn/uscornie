"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
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

  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [showToast, setShowToast] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

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

  useEffect(() => {
    // Check if google is available on window
    const checkGoogle = () => {
      const win = window as any;
      const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

      if (!clientId) {
        console.warn(
          "NEXT_PUBLIC_GOOGLE_CLIENT_ID is not configured. Google sign-in initialization skipped.",
        );
        return;
      }

      if (
        typeof window !== "undefined" &&
        win.google &&
        !isAuthenticated &&
        !win._googleInitializedMain
      ) {
        win._googleInitializedMain = true;
        win.google.accounts.id.initialize({
          client_id: clientId,
          callback: handleLoginSuccess,
          auto_select: true,
        });

        win.google.accounts.id.prompt((notification: any) => {
          if (notification.isNotDisplayed()) {
            console.warn(
              "Google One Tap not displayed reason:",
              notification.getNotDisplayedReason(),
            );
          } else if (notification.isSkippedMoment()) {
            console.warn(
              "Google One Tap skipped reason:",
              notification.getSkippedReason(),
            );
          } else if (notification.isDismissedMoment()) {
            console.warn(
              "Google One Tap dismissed reason:",
              notification.getDismissedReason(),
            );
          }
        });

        const btn = document.getElementById("google-btn-header");
        if (btn) {
          win.google.accounts.id.renderButton(btn, {
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
          {!mounted ? (
            <div id="google-btn-header"></div>
          ) : isAuthenticated ? (
            <button onClick={logout} className="logout-link" type="button">
              Đăng xuất
            </button>
          ) : (
            <div id="google-btn-header"></div>
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
