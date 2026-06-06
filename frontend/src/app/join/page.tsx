"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useCallback, useEffect, useState } from "react";
import { JoinLeftArtwork } from "@/components/join/JoinLeftArtwork";
import { JoinStatusCards } from "@/components/join/JoinStatusCards";
import { authService } from "@/lib/services/authService";
import { spaceService } from "@/lib/services/spaceService";
import { useAuthActions } from "@/lib/stores/useAuthStore";

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
  const { setToken } = useAuthActions();

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

  const handleEnterHome = useCallback(() => {
    push("/");
  }, [push]);

  return (
    <div className="min-h-screen bg-[#f7e1d7] flex items-center justify-center p-4">
      {/* Container Scrapbook Look */}
      <div className="w-full max-w-[950px] bg-white rounded-3xl overflow-hidden shadow-2xl flex flex-col md:flex-row relative border-[6px] border-white">
        {/* CỘT TRÁI: Art Ghibli Scenery */}
        <JoinLeftArtwork />

        {/* CỘT PHẢI: Form Đăng nhập */}
        <div className="w-full md:w-1/2 bg-[#fdfbf7] p-10 md:p-14 flex flex-col justify-center items-center relative">
          <div className="absolute inset-0 pointer-events-none opacity-[0.03] mix-blend-overlay bg-paper-texture" />
          <JoinStatusCards status={status} onEnterHome={handleEnterHome} />
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
