import eslintPlugin from "@eslint/js";
import tseslint, { configs as tseslintConfigs } from 'typescript-eslint';
import type { FlatConfig } from '@typescript-eslint/utils/ts-eslint';
import importPlugin from 'eslint-plugin-import';
import reactPlugin from 'eslint-plugin-react';
import reactHooksPlugin from 'eslint-plugin-react-hooks';
import jsxA11yPlugin from 'eslint-plugin-jsx-ally';
import nextPlugin from '@next/eslint-plugin-next';


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
] as FlatConfig.Config[]

const tseslintConfig = tseslint.config(
  {
    name: 'custom/typescript-eslint/recommended',
    files: ['**/*.mjs', '**/*.ts?(x)'],
    extends: [
      ...tseslintConfigs.recommended,
      ...tseslintConfigs.stylistic,
    ] as FlatConfig.ConfigArray,
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
        warnOnUnsupportedTypeScriptVersion: true,
      },
    },
  },
  {
    files: ['**/*.mjs'],
    ...tseslintConfigs.disableTypeChecked,
    name: 'custom/typescript-eslint/disable-type-checked',
  },
)

const nextConfig = [
  {
    name: 'custom/next/config',
        // no files (option) for this config as we want to apply it to all files
        plugins: {
            'react': reactPlugin,
            'jsx-a11y': jsxA11yPlugin,
            /* eslint-disable @typescript-eslint/no-unsafe-assignment */
            'react-hooks': reactHooksPlugin,
            '@next/next': nextPlugin,
            'import': importPlugin,
            /* eslint-enable @typescript-eslint/no-unsafe-assignment */
        },
        rules: {
            ...reactPlugin.configs.recommended.rules,
            ...reactPlugin.configs['jsx-runtime'].rules,
            /* eslint-disable @typescript-eslint/no-unsafe-member-access */
            ...reactHooksPlugin.configs.recommended.rules,
            ...nextPlugin.configs.recommended.rules,
            // this is the nextjs strict mode
            ...nextPlugin.configs['core-web-vitals'].rules,
            ...importPlugin.configs.recommended.rules,
            /* eslint-enable @typescript-eslint/no-unsafe-member-access */
            //...jsxA11yPlugin.configs.recommended.rules,
            // OR more strict a11y rules
            ...jsxA11yPlugin.configs.strict.rules,
            // rules from eslint-config-next
            'import/no-anonymous-default-export': 'warn',
            'react/no-unknown-property': 'off',
            'react/react-in-jsx-scope': 'off',
            'react/prop-types': 'off',
            'react/jsx-no-target-blank': 'off',
            'jsx-a11y/alt-text': ['warn', { elements: ['img'], img: ['Image'], },],
            'jsx-a11y/aria-props': 'warn',
            'jsx-a11y/aria-proptypes': 'warn',
            'jsx-a11y/aria-unsupported-elements': 'warn',
            'jsx-a11y/role-has-required-aria-props': 'warn',
            'jsx-a11y/role-supports-aria-props': 'warn',
        },
        settings: {
            'react': {
                version: 'detect',
            },
            // only needed if you use (eslint-import-resolver-)typescript
            'import/resolver': {
                typescript: {
                    alwaysTryTypes: true
                }
            }
        },
    }
] as FlatConfig.Config[]

export default [
  ...eslintConfig,
  ...ignoresConfig,
  ...tseslintConfig,
  ...nextConfig,
] satisfies FlatConfig.Config[]