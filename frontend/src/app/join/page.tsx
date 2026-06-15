"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useCallback, useEffect } from "react";
import { AnimatePresence, domAnimation, LazyMotion, m } from "framer-motion";
import AnimatedBackground from "@/components/AnimatedBackground";
import DoubleStatsPanel from "@/components/space/DoubleStatsPanel";
import GhibliIcon from "@/components/ui/GhibliIcon";
import GhibliScenery from "@/components/ui/GhibliScenery";
import { authService } from "@/lib/services/authService";
import { spaceService } from "@/lib/services/spaceService";
import { useAuthStore, useAuthActions } from "@/lib/stores/useAuthStore";
import { cn } from "@/lib/utils/cn";
import { create } from "zustand";

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

interface JoinState {
  status: string; // welcome | loading | success | error | declined | merging
  creatorInfo: any;
  acceptorInfo: any;
  spaceId: string | null;
  setStatus: (status: string) => void;
  setCreatorInfo: (info: any) => void;
  setAcceptorInfo: (info: any) => void;
  setSpaceId: (spaceId: string | null) => void;
  loadAcceptorStats: () => Promise<void>;
  handleAccept: (inviteToken: string) => Promise<void>;
  handleDecline: (inviteToken: string) => Promise<void>;
  handleCredentialResponse: (
    credential: string,
    inviteToken: string,
    setToken: (token: string | null) => void,
  ) => Promise<void>;
}

const useJoinStore = create<JoinState>((set, get) => ({
  status: "welcome",
  creatorInfo: null,
  acceptorInfo: null,
  spaceId: null,
  setStatus: (status) => set({ status }),
  setCreatorInfo: (creatorInfo) => set({ creatorInfo }),
  setAcceptorInfo: (acceptorInfo) => set({ acceptorInfo }),
  setSpaceId: (spaceId) => set({ spaceId }),

  loadAcceptorStats: async () => {
    try {
      const mySpaces = await spaceService.fetchMySpaces();
      const personal = mySpaces.find((s: any) => s.type === "personal");
      if (personal) {
        const bStats = await spaceService.getSpaceStats(personal.id);
        set((state) => ({
          acceptorInfo: {
            ...state.acceptorInfo,
            full_name: "Bạn (Người nhận)",
            stats: bStats,
          },
        }));
      }
    } catch (_) {
      // Ignore
    }
  },

  handleAccept: async (inviteToken: string) => {
    set({ status: "merging" });
    try {
      const space = await spaceService.joinSpace(inviteToken);
      set({ spaceId: space.id });
      await get().loadAcceptorStats();
      setTimeout(() => {
        set({ status: "success" });
      }, 2000);
    } catch (_) {
      set({ status: "error" });
    }
  },

  handleDecline: async (inviteToken: string) => {
    try {
      await spaceService.updateInviteStatus(inviteToken, "declined");
      set({ status: "declined" });
    } catch (_) {
      alert("Lỗi khi từ chối lời mời");
    }
  },

  handleCredentialResponse: async (credential, _inviteToken, setToken) => {
    set({ status: "loading" });
    try {
      const authData = await authService.loginWithGoogle(credential);
      setToken(authData.access_token);

      const mySpaces = await spaceService.fetchMySpaces();
      const personal = mySpaces.find((s: any) => s.type === "personal");
      let bStats = null;
      if (personal) {
        bStats = await spaceService.getSpaceStats(personal.id);
      }
      set({
        acceptorInfo: {
          full_name: "Bạn (Người nhận)",
          picture: null,
          stats: bStats,
        },
        status: "welcome",
      });
    } catch (_) {
      set({ status: "error" });
    }
  },
}));

function JoinPageContent() {
  const { push } = useRouter();
  const searchParams = useSearchParams();
  const { setToken } = useAuthActions();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const token = useAuthStore((s) => s.token);

  // Zustand Join Store selectors
  const status = useJoinStore((s) => s.status);
  const creatorInfo = useJoinStore((s) => s.creatorInfo);
  const acceptorInfo = useJoinStore((s) => s.acceptorInfo);
  const setStatus = useJoinStore((s) => s.setStatus);
  const setCreatorInfo = useJoinStore((s) => s.setCreatorInfo);
  const loadAcceptorStats = useJoinStore((s) => s.loadAcceptorStats);
  const storeHandleAccept = useJoinStore((s) => s.handleAccept);
  const storeHandleDecline = useJoinStore((s) => s.handleDecline);
  const storeHandleCredentialResponse = useJoinStore(
    (s) => s.handleCredentialResponse,
  );

  const inviteToken = searchParams.get("token") || searchParams.get("invite_token");

  const handleCredentialResponse = useCallback(
    async (res: GoogleCredentialResponse) => {
      if (!inviteToken) {
        setStatus("error");
        return;
      }
      await storeHandleCredentialResponse(
        res.credential,
        inviteToken,
        setToken,
      );
    },
    [inviteToken, setToken, setStatus, storeHandleCredentialResponse],
  );

  // Initialize invitation token status & creator details
  useEffect(() => {
    document.title = "Join space - Uscornie";
    if (!inviteToken) {
      setStatus("error");
      return;
    }

    spaceService
      .getInviteStatus(inviteToken)
      .then(async (statusData) => {
        if (statusData.status !== "pending") {
          setStatus("error");
          return;
        }
        setCreatorInfo(statusData.creator);

        // If B is already logged in, load B's stats
        if (token) {
          await loadAcceptorStats();
        }
      })
      .catch(() => {
        setStatus("error");
      });
  }, [inviteToken, loadAcceptorStats, setCreatorInfo, setStatus, token]);

  // Google Sign In button initialization
  useEffect(() => {
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

  const handleAccept = async () => {
    if (!inviteToken) return;
    await storeHandleAccept(inviteToken);
  };

  const handleDecline = async () => {
    if (!inviteToken) return;
    await storeHandleDecline(inviteToken);
  };

  const isBLoggedIn = isAuthenticated && acceptorInfo;

  const showScenery =
    !isBLoggedIn && status !== "merging" && status !== "success";

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative z-1 overflow-hidden">
      <AnimatedBackground />

      {/* Container Scrapbook Look */}
      <div
        className={cn(
          "w-full bg-white rounded-3xl overflow-hidden shadow-2xl flex flex-col md:flex-row relative border-[6px] border-white transition-all duration-350",
          showScenery ? "max-w-[950px]" : "max-w-[800px]",
        )}
      >
        {/* CỘT TRÁI: Art Ghibli Scenery */}
        {showScenery && <GhibliScenery />}

        {/* CỘT PHẢI: Form & Content */}
        <div
          className={cn(
            "bg-[#fdfbf7] p-10 md:p-14 flex flex-col justify-center items-center relative min-h-[550px]",
            showScenery ? "w-full md:w-1/2" : "w-full",
          )}
        >
          <div className="absolute inset-0 pointer-events-none opacity-[0.03] mix-blend-overlay bg-paper-texture" />

          <LazyMotion features={domAnimation}>
            <AnimatePresence mode="wait">
              {status === "welcome" && !isBLoggedIn && (
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
                      ấy ({creatorInfo?.full_name || "A"}).
                    </p>
                  </div>

                  <div className="flex flex-col items-center w-full max-w-xs gap-y-4">
                    <div
                      id="google-btn"
                      className="w-full flex justify-center py-2"
                    />
                    <p className="text-[11px] text-[#a39485] italic text-center leading-normal">
                      Đăng nhập Google để xem so sánh và đồng bộ không gian.
                    </p>
                  </div>
                </m.div>
              )}

              {status === "welcome" && isBLoggedIn && (
                <m.div
                  key="decision"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  transition={{ duration: 0.3 }}
                  className="w-full gap-y-6 flex flex-col items-center"
                >
                  <h2 className="font-pangolin text-2xl text-[#5c4a3d] text-center mb-2">
                    Kêu gọi xây tổ ấm chung!
                  </h2>

                  <DoubleStatsPanel
                    creatorInfo={creatorInfo}
                    acceptorInfo={acceptorInfo}
                    showAcceptorWaiting={false}
                    isMerging={false}
                  />

                  <div className="flex gap-4 w-full max-w-xs mt-4">
                    <button
                      onClick={handleDecline}
                      className="flex-1 bg-white hover:bg-gray-50 text-[#5c4a3d] font-pangolin font-bold py-2.5 px-4 rounded-full border border-gray-300 shadow-sm cursor-pointer text-center"
                      type="button"
                      id="decline-btn"
                    >
                      Từ chối
                    </button>
                    <button
                      onClick={handleAccept}
                      className="flex-1 bg-[#e0664b] hover:bg-[#cc543a] text-white font-pangolin font-bold py-2.5 px-4 rounded-full border-2 border-[#c4543b] shadow-md cursor-pointer text-center"
                      type="button"
                      id="accept-btn"
                    >
                      Chấp nhận
                    </button>
                  </div>
                </m.div>
              )}

              {status === "merging" && (
                <m.div
                  key="merging"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.3 }}
                  className="w-full gap-y-6 flex flex-col items-center"
                >
                  <h2 className="font-pangolin text-2xl text-[#5c4a3d] text-center">
                    💞 Đang đồng bộ kỷ niệm...
                  </h2>
                  <DoubleStatsPanel
                    creatorInfo={creatorInfo}
                    acceptorInfo={acceptorInfo}
                    showAcceptorWaiting={false}
                    isMerging={true}
                  />
                  <div className="text-sm text-[#7d6958] italic animate-pulse">
                    Chuẩn bị tổ ấm chung cho hai bạn...
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
                  className="w-full gap-y-6 flex flex-col items-center"
                >
                  <h2 className="font-pangolin text-2xl text-[#5c4a3d] text-center">
                    💞 Đang xây tổ ấm...
                  </h2>
                  <DoubleStatsPanel
                    creatorInfo={creatorInfo}
                    acceptorInfo={acceptorInfo}
                    showAcceptorWaiting={false}
                    isMerging={true}
                  />
                  <div className="text-sm text-[#7d6958] italic animate-pulse">
                    Đợi một chút để chuẩn bị góc nhỏ của hai bạn...
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

              {status === "declined" && (
                <m.div
                  key="declined"
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
                    <h2
                      className="text-3xl font-bold text-[#5c4a3d] font-pangolin"
                      id="declined-message"
                    >
                      Đã từ chối lời mời
                    </h2>
                    <p className="text-[#7d6958] text-base">
                      Bạn đã từ chối tham gia không gian này.
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
                    <p className="text-[#7d6958] text-base" id="error-message">
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
