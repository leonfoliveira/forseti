export const config = {
  API_URL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080",
  WS_URL: process.env.NEXT_PUBLIC_WS_URL || "http://localhost:8080/ws",
  LOCALE: process.env.NEXT_PUBLIC_LOCALE || "en",
};
