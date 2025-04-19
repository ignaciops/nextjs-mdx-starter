import { FlatCompat } from "@eslint/eslintrc";
import { Linter } from "eslint";
import eslintPlugin from "@eslint/js";

const compat = new FlatCompat();

const eslintConfig = [
  {
    name: 'custom/eslint/recommended',
    files: ['**/*.ts?(x)'],
    ...eslintPlugin.configs.recommended,
  },
]

const ignoresConfig = [
  {
    name: 'custom/eslint/ignores',
    ignores: [
      '.next/',
      '.vscode/',
      'public',
    ]
  },
] as Linter.Config[]

const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  ...eslintConfig,
  ...ignoresConfig,
] satisfies Linter.Config[];

export default eslintConfig;
