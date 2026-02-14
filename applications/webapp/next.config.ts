import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const nextConfig: NextConfig = {
  allowedDevOrigins: ["https://judge.app"],
  experimental: {
    authInterrupts: true,
  },
  compiler: {
    removeConsole:
      process.env.NODE_ENV === "production"
        ? {
            exclude: ["error"],
          }
        : false,
  },
};

const withNextIntl = createNextIntlPlugin();
export default withNextIntl(nextConfig);
