# Block Party Documentation

This directory contains the interactive Storybook documentation for Block Party.

## Running the Documentation

```bash
npm run storybook
```

This will start the Storybook dev server (default port 6006).

## Building for Production

```bash
npm run build-storybook
```

This will build a static version of the documentation in the `docs-build` directory.

## Documentation Structure

- **Introduction.mdx** - Overview and philosophy
- **QuickStart.mdx** - Getting started guide
- **APIReference.mdx** - Complete API documentation
- **Styling.mdx** - CSS and styling guide
- **BlockManager.stories.tsx** - Component examples
- **Store.stories.tsx** - Store usage demo
- **Playground.stories.tsx** - Interactive playground
- **examples/** - Example block implementations
  - TextBlock.tsx
  - ImageBlock.tsx
  - CodeBlock.tsx

## Adding New Documentation

1. For new documentation pages, create `.mdx` files
2. For new examples, create `.stories.tsx` files
3. Import example components from the `examples/` directory

## Storybook Configuration

- **.storybook/main.ts** - Main configuration
- **.storybook/preview.ts** - Preview configuration and sorting
- **.storybook/theme.ts** - Custom theme and branding