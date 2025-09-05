export const env = {
  VERSION: process.env.NEXT_PUBLIC_VERSION || "0.0.0",
  API_URL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080",
  LOCALE: process.env.NEXT_PUBLIC_LOCALE || "en-US",
  DEFAULT_RADIUS: "sm" as "none" | "sm" | "md" | "lg",
  DEFAULT_SHADOW: "none" as "none" | "sm" | "md" | "lg",
  DEFAULT_INPUT_VARIANT: "bordered" as
    | "flat"
    | "bordered"
    | "faded"
    | "underlined",
  DEFAULT_TABS_VARIANT: "underlined" as
    | "underlined"
    | "bordered"
    | "solid"
    | "light",
};
