type RuntimeEnv = { VERSION?: string; HTTP_URL?: string; WS_URL?: string };

declare global {
  interface Window {
    __ENV__?: RuntimeEnv;
  }
}

// In the browser, values come from /config.js, generated at container start.
const runtimeEnv: RuntimeEnv =
  typeof window !== "undefined" ? (window.__ENV__ ?? {}) : {};

export const env = {
  version: runtimeEnv.VERSION || "latest",
  httpUrl: runtimeEnv.HTTP_URL || "http://localhost:8080",
  wsUrl: runtimeEnv.WS_URL || "ws://localhost:8081",
};
