import { existsSync, readdirSync } from 'node:fs';
import { defineConfig } from 'eslint/config';
import js from '@eslint/js';
import formatjs from 'eslint-plugin-formatjs';
import pluginQuery from '@tanstack/eslint-plugin-query';
import prettier from 'eslint-config-prettier';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import globals from 'globals';
import tseslint from 'typescript-eslint';

const featuresDir = new URL('./src/features', import.meta.url);
const features = existsSync(featuresDir)
  ? readdirSync(featuresDir, { withFileTypes: true })
      .filter((entry) => entry.isDirectory())
      .map((entry) => entry.name)
  : [];

const escapeRegex = (text) => text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

// Imports that leave the current folder go through the `@/` alias, so the
// folder rules below can be checked by name.
const noParentRelative = {
  regex: String.raw`^\.\./`,
  message: 'Import from another folder with the `@/` alias.',
};

const restrictImports = (...patterns) => ['error', { patterns: [noParentRelative, ...patterns] }];

// Raw HTML would break under the node's Trusted Types policy and invites
// injection (titan ADR 0012). Server text is rendered as text or sanitised
// Markdown only.
const noRawHtml = [
  {
    selector: "JSXAttribute[name.name='dangerouslySetInnerHTML']",
    message: 'Raw HTML is not allowed. Render text, or Markdown through the sanitising renderer.',
  },
  {
    selector:
      "AssignmentExpression[left.type='MemberExpression'][left.property.name=/^(innerHTML|outerHTML)$/]",
    message: 'Raw HTML is not allowed under Trusted Types.',
  },
  {
    selector: 'CallExpression[callee.property.name=/^(insertAdjacentHTML|write|writeln)$/]',
    message: 'Raw HTML is not allowed under Trusted Types.',
  },
];

export default defineConfig(
  {
    ignores: [
      'dist/',
      'node_modules/',
      'playwright-report/',
      'test-results/',
      'src/shared/api/schema.gen.ts',
    ],
  },
  js.configs.recommended,
  tseslint.configs.strictTypeChecked,
  tseslint.configs.stylisticTypeChecked,
  {
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },
  {
    files: ['*.js'],
    extends: [tseslint.configs.disableTypeChecked],
    languageOptions: { globals: globals.node },
  },
  {
    files: ['src/**/*.{ts,tsx}'],
    extends: [
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
      pluginQuery.configs['flat/recommended'],
    ],
    plugins: { formatjs },
    languageOptions: { globals: globals.browser },
    rules: {
      'no-restricted-syntax': ['error', ...noRawHtml],
      'no-restricted-imports': restrictImports(),
      // Every text the user sees goes through the translation layer.
      'formatjs/no-literal-string-in-jsx': [
        'error',
        {
          props: {
            include: [['*', '(aria-label|aria-description|alt|title|placeholder)']],
          },
        },
      ],
      '@typescript-eslint/restrict-template-expressions': ['error', { allowNumber: true }],
    },
  },
  {
    files: ['src/shared/**/*.{ts,tsx}'],
    rules: {
      'no-restricted-imports': restrictImports({
        regex: '^@/(app|features)(/|$)',
        message: 'Shared code must not depend on the app or on features.',
      }),
    },
  },
  ...features.map((feature) => ({
    files: [`src/features/${feature}/**/*.{ts,tsx}`],
    rules: {
      'no-restricted-imports': restrictImports({
        regex: `^@/(app(/|$)|features/(?!${escapeRegex(feature)}(/|$)))`,
        message: 'A feature imports only itself and `@/shared/*`.',
      }),
    },
  })),
  {
    files: ['src/**/*.test.{ts,tsx}', 'src/test/**'],
    rules: {
      'formatjs/no-literal-string-in-jsx': 'off',
    },
  },
  prettier,
);
