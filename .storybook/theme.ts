import { create } from '@storybook/theming/create';

export default create({
  base: 'light',
  brandTitle: 'Block Party 🎉',
  brandUrl: 'https://github.com/aaronbassett/block-party',
  brandImage: undefined,
  brandTarget: '_blank',

  // Typography
  fontBase: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  fontCode: '"SF Mono", "Monaco", "Consolas", "Liberation Mono", "Courier New", monospace',

  // Colors
  colorPrimary: '#3b82f6',
  colorSecondary: '#3b82f6',

  // UI
  appBg: '#f9fafb',
  appContentBg: '#ffffff',
  appBorderColor: '#e5e7eb',
  appBorderRadius: 8,

  // Text colors
  textColor: '#111827',
  textInverseColor: '#ffffff',
  textMutedColor: '#6b7280',

  // Toolbar default and active colors
  barTextColor: '#6b7280',
  barSelectedColor: '#3b82f6',
  barBg: '#ffffff',

  // Form colors
  inputBg: '#ffffff',
  inputBorder: '#d1d5db',
  inputTextColor: '#111827',
  inputBorderRadius: 6,
});