export function isServer(): boolean {
  return typeof window === "undefined";
}

export function isClient(): boolean {
  return typeof window !== "undefined";
}

export const serverConfig = {
  version: process.env.NEXT_PUBLIC_VERSION || "0.0.0",
  locale: process.env.LOCALE || "en-US",
  apiInternalUrl: process.env.API_INTERNAL_URL || "http://localhost:8080",
  apiPublicUrl: process.env.API_PUBLIC_URL || "http://localhost:8080",
};

export type ClientConfig = {
  apiPublicUrl: string;
};
export const clientConfig = (globalThis as any)
  .__CLIENT_CONFIG__ as ClientConfig;

export function buildClientConfig(): ClientConfig {
  return {
    apiPublicUrl: serverConfig.apiPublicUrl,
  };
}
