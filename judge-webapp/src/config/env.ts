export const env = {
  VERSION: process.env.NEXT_PUBLIC_VERSION || "0.0.0",
  API_URL:
    typeof window === "undefined"
      ? process.env.INTERNAL_API_URL ||
        process.env.NEXT_PUBLIC_API_URL ||
        "http://localhost:8080"
      : process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080",
  LOCALE: process.env.NEXT_PUBLIC_LOCALE || "en-US",
};
