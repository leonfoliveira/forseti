const isServer = typeof window === "undefined";

export const config = {
  version: process.env.NEXT_PUBLIC_VERSION || "0.0.0",
  api_url: isServer
    ? process.env.INTERNAL_API_URL ||
      process.env.NEXT_PUBLIC_API_URL ||
      "http://localhost:8080"
    : process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080",
  locale: process.env.NEXT_PUBLIC_LOCALE || "en-US",
  isServer,
};
