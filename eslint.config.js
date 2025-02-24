import pluginJs from "@eslint/js";
import prettierConfig from "eslint-config-prettier";
import prettierPlugin from "eslint-plugin-prettier";
import globals from "globals";

/** @type {import('eslint').Linter.Config[]} */
export default [
  {
    languageOptions: {
      ecmaVersion: "latest", // Supports modern JS (ES12+)
      sourceType: "module", // Enables ES6 `import/export`
      globals: globals.node, // Recognizes Node.js globals
    },
    ignores: ["node_modules/", "dist/", ".env", "build/"],
    plugins: {
      prettier: prettierPlugin, // Enables Prettier as a plugin
    },
    rules: {
      indent: ["error", 2], // Enforce 2-space indentation
      quotes: ["error", "double"], // Use double quotes
      semi: ["error", "always"], // Require semicolons
      "no-unused-vars": "warn", // Warn for unused variables
      "prettier/prettier": [
        "error",
        {
          singleQuote: false, // Enforce double quotes
          trailingComma: "es5", // Add trailing commas where valid in ES5
          tabWidth: 2, // Use 2 spaces for indentation
          semi: true, // Always require semicolons
        },
      ],
    },
  },
  pluginJs.configs.recommended, // ESLint recommended rules
  prettierConfig, // Disables conflicting ESLint rules for Prettier
];
