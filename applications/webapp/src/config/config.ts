export function isServerSide(): boolean {
  return typeof window === "undefined";
}

export function isClientSide(): boolean {
  return typeof window !== "undefined";
}

export const serverConfig = {
  version: process.env.NEXT_PUBLIC_VERSION || "latest",
  locale: process.env.LOCALE || "en-US",
  apiInternalUrl: process.env.API_INTERNAL_URL || "http://localhost:8080/api",
  apiPublicUrl: process.env.API_PUBLIC_URL || "http://localhost:8080/api",
  wsPublicUrl: process.env.WS_PUBLIC_URL || "http://localhost:8080/ws",
};

/**
 * Client configs need to be injected on the browser context on runtime, because
 * we can't guarantee that environment variables are the same on build time and
 * runtime, especially when using containerized deployments.
 */

export type ClientConfig = {
  apiPublicUrl: string;
  wsPublicUrl: string;
};
export const clientConfig =
  ((globalThis as any).__CLIENT_CONFIG__ as ClientConfig) || serverConfig;

export function buildClientConfig(): ClientConfig {
  return {
    apiPublicUrl: serverConfig.apiPublicUrl,
    wsPublicUrl: serverConfig.wsPublicUrl,
  };
}
