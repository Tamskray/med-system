import js from "@eslint/js";
import globals from "globals";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import { defineConfig, globalIgnores } from "eslint/config";
import importPlugin from "eslint-plugin-import";
import tseslint from "@typescript-eslint/eslint-plugin";
import tsParser from "@typescript-eslint/parser";

export default defineConfig([
  globalIgnores(["dist"]),
  {
    files: ["**/*.{js,jsx}"],
    extends: [
      js.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    plugins: {
      import: importPlugin,
    },
    languageOptions: {
      ecmaVersion: 2020,
      globals: { ...globals.browser, ...globals.jest },
      parserOptions: {
        ecmaVersion: "latest",
        ecmaFeatures: { jsx: true },
        sourceType: "module",
      },
    },
    rules: {
      "no-unused-vars": ["error", { varsIgnorePattern: "^[A-Z_]" }],

      "no-multiple-empty-lines": ["error", { max: 1 }],

      // "import/order": [
      //   "error",
      //   {
      //     groups: ["builtin", "external", "internal", ["parent", "sibling", "index"]],
      //     pathGroups: [
      //       // 1. React & Router at the very top
      //       {
      //         pattern: "{react,react-dom,react-router,react-router-dom}",
      //         group: "external",
      //         position: "before",
      //       },

      //       // 2. Redux Group (Combines NPM react-redux with your local ./redux folder!)
      //       { pattern: "react-redux", group: "internal", position: "before" },
      //       { pattern: "**/redux/**", group: "internal", position: "before" },

      //       // 3. MUI Group (Pushed to the bottom of the external packages)
      //       { pattern: "@mui/**", group: "external", position: "after" },

      //       // 4. Components & Hooks
      //       { pattern: "**/components/**", group: "internal", position: "after" },

      //       // 5. Constants (Pushed towards the end)
      //       { pattern: "**/constants/**", group: "index", position: "before" },

      //       // 6. Styles (Absolute bottom)
      //       { pattern: "**/*.+(css|scss|less)", group: "index", position: "after" },
      //       { pattern: "**/styles", group: "index", position: "after" },
      //       { pattern: "**/styles/**", group: "index", position: "after" },
      //     ],
      //     // CRITICAL: This allows us to re-route NPM packages like react-redux
      //     pathGroupsExcludedImportTypes: ["builtin"],
      //     "newlines-between": "always",
      //     alphabetize: {
      //       order: "asc",
      //       caseInsensitive: true,
      //     },
      //   },
      // ],
    },
  },
  {
    files: ["**/*.{ts,tsx}"],
    extends: [
      js.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    plugins: {
      import: importPlugin,
      "@typescript-eslint": tseslint,
    },
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
      parser: tsParser,
      parserOptions: {
        ecmaVersion: "latest",
        ecmaFeatures: { jsx: true },
        sourceType: "module",
      },
    },
    rules: {
      ...tseslint.configs.recommended.rules,
      "no-unused-vars": "off",
      "@typescript-eslint/no-unused-vars": ["error", { varsIgnorePattern: "^[A-Z_]" }],
      "no-multiple-empty-lines": ["error", { max: 1 }],
    },
  },
]);
