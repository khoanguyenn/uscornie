"use client";

import { useEffect, useRef } from "react";

interface GoogleSignInButtonProps {
  onSuccess: (response: { credential: string }) => void;
}

export default function GoogleSignInButton({
  onSuccess,
}: GoogleSignInButtonProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const win = window as typeof window & {
      google?: {
        accounts: {
          id: {
            initialize: (config: {
              client_id: string;
              callback: (response: { credential: string }) => void;
              auto_select?: boolean;
            }) => void;
            renderButton: (
              element: HTMLElement,
              options: { theme: string; size: string },
            ) => void;
            prompt: () => void;
          };
        };
      };
    };
    const clientId: string = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || "";

    if (!clientId) {
      return;
    }

    function init() {
      if (!win.google || !containerRef.current) return false;

      win.google.accounts.id.initialize({
        client_id: clientId,
        callback: onSuccess,
        auto_select: true,
      });

      win.google.accounts.id.renderButton(containerRef.current, {
        theme: "outline",
        size: "medium",
      });

      win.google.accounts.id.prompt();

      return true;
    }

    let timer: NodeJS.Timeout | undefined;
    if (!init()) {
      timer = setTimeout(init, 1000);
    }
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [onSuccess]);

  return <div ref={containerRef} />;
}
