"use client";

import { useEffect, useRef } from "react";

interface GoogleSignInButtonProps {
  // biome-ignore lint/suspicious/noExplicitAny: Google Identity response type is dynamic
  onSuccess: (response: any) => void;
}

export default function GoogleSignInButton({
  onSuccess,
}: GoogleSignInButtonProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // biome-ignore lint/suspicious/noExplicitAny: window has no typing for google identity services
    const win = window as any;
    const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

    if (!clientId) {
      console.warn(
        "NEXT_PUBLIC_GOOGLE_CLIENT_ID is not configured. Google sign-in skipped.",
      );
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

      // biome-ignore lint/suspicious/noExplicitAny: notification callback parameters are untyped
      win.google.accounts.id.prompt((notification: any) => {
        if (notification.isNotDisplayed()) {
          console.warn(
            "Google One Tap not displayed:",
            notification.getNotDisplayedReason(),
          );
        } else if (notification.isSkippedMoment()) {
          console.warn(
            "Google One Tap skipped:",
            notification.getSkippedReason(),
          );
        } else if (notification.isDismissedMoment()) {
          console.warn(
            "Google One Tap dismissed:",
            notification.getDismissedReason(),
          );
        }
      });

      return true;
    }

    // Try immediately, fall back with a timer if GSI script hasn't loaded yet
    if (!init()) {
      const timer = setTimeout(init, 1000);
      return () => clearTimeout(timer);
    }
  }, [onSuccess]);

  return <div ref={containerRef} />;
}
