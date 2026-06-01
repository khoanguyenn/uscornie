import type { NextConfig } from "next";

const REQUIRED_ENV_VARS = [
  "NEXT_PUBLIC_GOOGLE_CLIENT_ID",
  "NEXT_PUBLIC_API_URL",
];

if (
  process.env.NODE_ENV === "production" &&
  // biome-ignore lint/complexity/useLiteralKeys: TypeScript requires bracket notation for index signatures
  process.env["SKIP_ENV_VALIDATION"] !== "true"
) {
  for (const envVar of REQUIRED_ENV_VARS) {
    if (!process.env[envVar]) {
      throw new Error(
        `❌ Missing required build-time environment variable: ${envVar}`,
      );
    }
  }
}

const nextConfig: NextConfig = {
  output: "export",
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
