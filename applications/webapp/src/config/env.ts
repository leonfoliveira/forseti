type RuntimeEnv = { VERSION?: string; API_URL?: string };

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
  apiUrl: runtimeEnv.API_URL || "http://localhost:8080",
};
