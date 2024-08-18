import globals from "globals";
import pluginJs from "@eslint/js";
import tseslint from "typescript-eslint";
import stylistic from "@stylistic/eslint-plugin";
import stylisticjsx from "@stylistic/eslint-plugin-jsx";

export default [
  {plugins: {"@stylistic": stylistic, "@stylistic/jsx": stylisticjsx}},
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
    "@stylistic/indent": ["error", 2],
    "@stylistic/quotes": ["error", "double"],
    "@stylistic/jsx/jsx-curly-spacing": [2, {"when": "never", "allowMultiline": false}],
  }
  },
];