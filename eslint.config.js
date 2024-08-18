import globals from "globals";
import pluginJs from "@eslint/js";
import tseslint from "typescript-eslint";
import stylistic from "@stylistic/eslint-plugin";

export default [
  {plugins: {'@stylistic': stylistic,}},
  {files: ["**/*.{js,mjs,cjs,ts}"]},
  {languageOptions: { globals: {...globals.browser, ...globals.node} }},
  pluginJs.configs.recommended,
  ...tseslint.configs.recommended,
  {rules: {
    "no-unused-vars": "error",
    "no-undef": "error",
    "no-shadow": "error",
    "no-unused-expressions": "error",
    "no-console": "error",
    "@stylistic/indent": ['error', 2],
    "@stylistic/jsx/jsx-indent": ['error', 2],
    "@stylistic/jsx/jsx-curly-spacing": [2, {"when": "never", "allowMultiline": false}],
    "@stylistic/js/quotes": ["error", "double"]
  }
  },
];