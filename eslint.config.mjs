import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  {
    rules: {
      // Disable or modify specific rules
      "react/no-unescaped-entities": "off", // Turns off apostrophe warnings
      "@typescript-eslint/no-unused-vars": [
        "warn", // Makes unused vars warnings instead of errors
        { 
          "argsIgnorePattern": "^_",
          "varsIgnorePattern": "^_",
          "caughtErrorsIgnorePattern": "^_"
        }
      ],
      "react-hooks/exhaustive-deps": "warn" // Makes missing deps warnings
    }
  }
];

export default eslintConfig;