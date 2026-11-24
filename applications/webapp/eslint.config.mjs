import { defineConfig, globalIgnores } from "eslint/config";
import tseslintParser from "@typescript-eslint/parser";
import simpleImportSort from "eslint-plugin-simple-import-sort";

const eslintConfig = defineConfig([
  {
    files: ["src/**/*.{ts,tsx}", "test/**/*.{ts,tsx}"],
    languageOptions: {
      parser: tseslintParser,
    },
    plugins: {
      "simple-import-sort": simpleImportSort,
    },
    rules: {
      "simple-import-sort/imports": [
        "error",
        {
          groups: [
            ["^\\u0000"],
            ["^node:"],
            ["^@?\\w"],
            ["^@/", "^~/"],
            ["^\\.\\.(?:/|$)"],
            ["^\\./"],
            ["^\\u0000.*\\u0000$"],
          ],
        },
      ],
      "simple-import-sort/exports": "error",

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
