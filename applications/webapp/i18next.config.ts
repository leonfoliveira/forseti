import { defineConfig } from "i18next-cli";

export default defineConfig({
  locales: ["en", "pt"],
  extract: {
    input: "src/**/*.{js,jsx,mjs,ts,tsx}",
    output: "public/locales/{{language}}/{{namespace}}.json",
    primaryLanguage: "en",
  },
  lint: {
    ignore: ["src/app/ErrorBoundary.tsx"],
  },
});
