"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Suspense, useState } from "react";

export default function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 5 * 60 * 1000,
            refetchOnWindowFocus: false,
            retry: 1,
          },
        },
      }),
  );

  return (
    <QueryClientProvider client={queryClient}>
      <Suspense
        fallback={
          <div className="font-quicksand font-bold text-center text-[#7a7060] p-10">
            Đang tải…
          </div>
        }
      >
        {children}
      </Suspense>
    </QueryClientProvider>
  );
}
