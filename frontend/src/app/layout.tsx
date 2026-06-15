import type { Metadata } from "next";
import { Pangolin, Quicksand } from "next/font/google";
import Script from "next/script";
import Providers from "./providers";
import "./globals.css";

const pangolin = Pangolin({
  weight: "400",
  variable: "--font-pangolin",
  subsets: ["latin"],
});

const quicksand = Quicksand({
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-quicksand",
  subsets: ["latin", "vietnamese"],
});

export const metadata: Metadata = {
  title: "Uscornie - Không gian riêng tư",
  description: "Nơi lưu giữ những kỷ niệm quý giá nhất chỉ dành cho hai người.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="vi"
      className={`${pangolin.variable} ${quicksand.variable} h-full antialiased`}
    >
      <head>
        {/* Google Identity Services */}
        <Script
          src="https://accounts.google.com/gsi/client"
          strategy="lazyOnload"
        />
        {process.env.NODE_ENV === "development" && (
          <script
            src="https://unpkg.com/react-scan/dist/auto.global.js"
            async
          />
        )}
      </head>
      <body className="min-h-full flex flex-col">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
