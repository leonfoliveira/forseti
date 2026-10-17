import { defineConfig, globalIgnores } from "eslint/config";
import tseslintParser from "@typescript-eslint/parser";

const eslintConfig = defineConfig([
  {
    files: ["src/**/*.{ts,tsx}", "test/**/*.{ts,tsx}"],
    languageOptions: {
      parser: tseslintParser,
    },
    rules: {
      "@typescript-eslint/no-explicit-any": "off",
      "react-hooks/set-state-in-effect": "off",
      "react-hooks/immutability": "off",
      "react-hooks/exhaustive-deps": "off",
      "react-hooks/refs": "off",
    },
  },
  globalIgnores(["out/**", "build/**", "dist/**"]),
]);

export default eslintConfig;
