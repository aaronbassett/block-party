# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Block Party is a lean block orchestration library for React. It manages content blocks with single edit mode enforcement, block limits, and drag & drop functionality. The codebase is intentionally minimal (~400 lines) and focuses on orchestration, not implementation of specific block types.

## Common Development Commands

```bash
# Install dependencies
npm install

# Build the TypeScript package
npm run build

# Run tests
npm test

# Run tests in watch mode
npm run test:watch

# Run linting
npm run lint

# Run type checking
npm run typecheck

# Clean build artifacts
npm run clean

# Create a conventional commit
npm run cm
```

## Architecture Overview

This is a lean TypeScript package with minimal structure:

- **Source Structure**: 
  - `src/types.ts` - Core interfaces and Zod schemas
  - `src/store.ts` - Single Zustand store managing all block state
  - `src/BlockManager.tsx` - React component with drag & drop
  - `src/utils.ts` - Helper functions
  - `src/errors.ts` - Custom error classes for better debugging
  - `src/index.ts` - All exports

- **Key Design Decisions**:
  - Single store pattern (no separate block/page stores)
  - Minimal types (Block, BlockConfig, render props)
  - Custom error classes for specific scenarios (BlockValidationError, BlockSaveError, etc.)
  - Direct event handling (no complex focus management)
  - Unstyled components (consumers handle styling)

- **Testing**: Jest with React Testing Library
  - Test files in `tests/` directory with `.test.{ts,tsx}` extension
  - Unit tests only - no e2e or complex integration tests
  - Coverage focus on store logic and component behavior

- **Dependencies**:
  - `zustand` - State management
  - `@dnd-kit/core` & `@dnd-kit/sortable` - Drag & drop
  - `zod` - Runtime type validation (minimal usage)
  - React 18+ as peer dependency

## Key Functionality

1. **Block State Machine**: Each block tracks state (empty/dirty/clean) and edit mode
2. **Single Edit Mode**: Only one block can be edited at a time across all managers
3. **Block Limits**: Enforced per block type via config
4. **Drag & Drop**: Reordering within a BlockManager
5. **Keyboard Navigation**: Tab between blocks, Enter to edit

## Important Notes

- Blocks handle their own rendering and validation
- Library doesn't persist data (blocks bring their own save functions)
- No styling provided - completely unstyled
- Focus on orchestration, not implementation