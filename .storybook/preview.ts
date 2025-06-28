import type { Preview } from '@storybook/react';
import theme from './theme';

const preview: Preview = {
  parameters: {
    actions: { argTypesRegex: '^on[A-Z].*' },
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/,
      },
    },
    docs: {
      theme,
      toc: true,
    },
    options: {
      storySort: {
        order: ['Introduction', 'Quick Start', 'API Reference', 'Styling', 'Core', 'Components', 'Examples'],
      },
    },
  },
};

export default preview;