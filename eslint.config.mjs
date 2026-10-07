import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
  {
    files: ["src/**/*.{ts,tsx}"],
    ignores: ["src/adapters/supabase.ts", "src/domain/**"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: ["@supabase/*"],
              message: "Only src/adapters/supabase.ts talks to Supabase. Use requestAuth().",
            },
          ],
        },
      ],
    },
  },
  {
    files: ["src/domain/**/*.ts"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: ["next", "next/*", "react", "react-dom", "@supabase/*"],
              message: "src/domain is framework-free.",
            },
          ],
        },
      ],
    },
  },
]);

export default eslintConfig;
