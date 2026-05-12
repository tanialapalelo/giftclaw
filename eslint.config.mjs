import js from "@eslint/js";
import nextVitals from "eslint-config-next/core-web-vitals";
import tseslint from "typescript-eslint";
import prettier from "eslint-config-prettier";

const eslintConfig = [
  js.configs.recommended,

  ...tseslint.configs.recommended,

  ...nextVitals,

  prettier,

  {
    ignores: [".next/**", "node_modules/**", "coverage/**", "dist/**"],

    rules: {
      // TypeScript
      "@typescript-eslint/no-unused-vars": [
        "warn",
        { argsIgnorePattern: "^_" },
      ],
      "@typescript-eslint/no-explicit-any": "warn",

      // React
      "react/self-closing-comp": "warn",

      // Disable overly aggressive React Compiler rules
      "react-hooks/refs": "off",
      "react-hooks/set-state-in-effect": "off",
      "react-hooks/static-components": "off",

      // Optional
      "react-hooks/exhaustive-deps": "warn",

      // JSX entities
      "react/no-unescaped-entities": "off",

      // JS
      "prefer-const": "error",
    },
  },
];

export default eslintConfig;
