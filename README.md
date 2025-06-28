# Block Party 🎉

> Lean block orchestration library for React - manages content blocks with single edit mode, limits, and drag & drop

Block Party provides a flexible orchestration system for managing blocks of content in React applications. It handles the coordination of multiple block types, enforces single edit mode across all blocks, manages block limits per type, and provides a clean API for external components to interact with blocks.

## Features

- 🎯 **Single Edit Mode** - Only one block can be edited at a time across all managers
- 🚫 **Block Limits** - Enforce maximum blocks per type
- 🔄 **Drag & Drop** - Reorder blocks with dedicated drag handles that appear on hover
- 📦 **State Tracking** - Track block states: empty, dirty, clean
- ⌨️ **Keyboard Navigation** - Full keyboard support with Tab/Enter
- 🎨 **Unstyled** - Bring your own styles, no CSS included
- 🛡️ **Type Safe** - Full TypeScript support with generics
- 🪶 **Lightweight** - ~400 lines of code, minimal dependencies
- 🔌 **Flexible** - Bring your own block implementations

## What This Library Does

- Orchestrates multiple block managers on a page
- Enforces single edit mode across all blocks
- Manages block limits per type
- Coordinates focus navigation between blocks
- Provides a clean API for adding, removing, and updating blocks
- Handles block reordering with drag & drop
- Provides custom error classes for better debugging

## What This Library Does NOT Do

- Does NOT implement specific block types (that's your responsibility)
- Does NOT handle persistence (blocks must bring their own save functions)
- Does NOT manage block UI (blocks render themselves)
- Does NOT validate block data (blocks handle their own validation)

## Installation

```bash
npm install @aaronbassett/block-party
# or
yarn add @aaronbassett/block-party
# or
pnpm add @aaronbassett/block-party
```

## Quick Start

```tsx
import { BlockManager, useBlockStore } from '@aaronbassett/block-party';
import type { BlockConfig, BlockEditProps, BlockRenderProps } from 'block-party';

// Define your block data type
interface TextBlockData {
  content: string;
}

// Create view component
const TextBlockView: React.FC<BlockRenderProps<TextBlockData>> = ({ block }) => (
  <div>{block.data.content || 'Click to edit...'}</div>
);

// Create edit component
const TextBlockEdit: React.FC<BlockEditProps<TextBlockData>> = ({
  block,
  onChange,
  onSave,
  onCancel,
}) => (
  <div>
    <input
      value={block.data.content}
      onChange={(e) => onChange({ content: e.target.value })}
      onKeyDown={(e) => {
        if (e.key === 'Enter') onSave();
        if (e.key === 'Escape') onCancel();
      }}
    />
    <button onClick={onSave}>Save</button>
    <button onClick={onCancel}>Cancel</button>
  </div>
);

// Create block configuration
const textBlockConfig: BlockConfig<TextBlockData> = {
  type: 'text',
  displayName: 'Text Block',
  maxBlocks: 5,
  renderView: (props) => <TextBlockView {...props} />,
  renderEdit: (props) => <TextBlockEdit {...props} />,
  createDefault: () => ({ content: '' }),
  validate: (data) => data.content.length <= 1000,
  onSave: async (block) => {
    // Optional: persist to backend
    console.log('Saving block:', block);
  },
};

// Use in your app
function App() {
  return (
    <BlockManager
      type="text"
      config={textBlockConfig}
      onError={(error) => console.error(error)}
    />
  );
}
```

## API Reference

### Types

#### `Block<T>`
Core block interface with state management:

```typescript
interface Block<T = unknown> {
  id: string;
  type: string;
  data: T;
  order: number;
  state: 'empty' | 'dirty' | 'clean';
  isEditing: boolean;
  createdAt: number;
  updatedAt: number;
  savedAt?: number;
}
```

#### `BlockConfig<T>`
Configuration for each block type:

```typescript
interface BlockConfig<T = unknown> {
  type: string;
  displayName: string;
  maxBlocks?: number;
  
  // Render functions
  renderView: (props: BlockRenderProps<T>) => ReactElement;
  renderEdit: (props: BlockEditProps<T>) => ReactElement;
  
  // Lifecycle functions
  createDefault: () => T;
  validate?: (data: T) => boolean;
  onSave?: (block: Block<T>) => Promise<void>;
}
```

### Components

#### `<BlockManager>`
Main component for managing blocks of a specific type:

```tsx
<BlockManager
  type="text"
  config={blockConfig}
  className="my-blocks"
  onError={(error) => console.error(error)}
/>
```

### Store

Access the global block store using the `useBlockStore` hook:

```tsx
const store = useBlockStore();

// Add a block
const blockId = store.addBlock('text');

// Update block data
store.updateBlockData(blockId, { content: 'Hello' });

// Enable edit mode (disables others)
store.enableBlockEdit(blockId);

// Save block
await store.saveBlock(blockId);

// Query blocks
const textBlocks = store.getBlocksByType('text');
const canAdd = store.canAddBlock('text');
```

## Advanced Example

Here's a more complete example with multiple block types:

```tsx
import { BlockManager, useBlockStore } from '@aaronbassett/block-party';
import type { BlockConfig } from 'block-party';

// Text block implementation
const textBlockConfig: BlockConfig<{ content: string; format: string }> = {
  type: 'text',
  displayName: 'Text',
  maxBlocks: 10,
  renderView: ({ block }) => (
    <div className={`text-${block.data.format}`}>
      {block.data.content}
    </div>
  ),
  renderEdit: ({ block, onChange, onSave, onCancel }) => (
    <div>
      <textarea
        value={block.data.content}
        onChange={(e) => onChange({ ...block.data, content: e.target.value })}
      />
      <select
        value={block.data.format}
        onChange={(e) => onChange({ ...block.data, format: e.target.value })}
      >
        <option value="normal">Normal</option>
        <option value="heading">Heading</option>
        <option value="quote">Quote</option>
      </select>
      <button onClick={onSave}>Save</button>
      <button onClick={onCancel}>Cancel</button>
    </div>
  ),
  createDefault: () => ({ content: '', format: 'normal' }),
  validate: (data) => data.content.length > 0 && data.content.length <= 5000,
};

// Image block implementation
const imageBlockConfig: BlockConfig<{ url: string; alt: string }> = {
  type: 'image',
  displayName: 'Image',
  maxBlocks: 5,
  renderView: ({ block }) => (
    <img src={block.data.url} alt={block.data.alt} />
  ),
  renderEdit: ({ block, onChange, onSave, onCancel }) => (
    <div>
      <input
        placeholder="Image URL"
        value={block.data.url}
        onChange={(e) => onChange({ ...block.data, url: e.target.value })}
      />
      <input
        placeholder="Alt text"
        value={block.data.alt}
        onChange={(e) => onChange({ ...block.data, alt: e.target.value })}
      />
      <button onClick={onSave}>Save</button>
      <button onClick={onCancel}>Cancel</button>
    </div>
  ),
  createDefault: () => ({ url: '', alt: '' }),
  validate: (data) => data.url.startsWith('http'),
};

// Page component with multiple block types
function Page() {
  const store = useBlockStore();
  
  return (
    <div className="page">
      <h1>My Page</h1>
      
      <section>
        <h2>Text Blocks</h2>
        <BlockManager type="text" config={textBlockConfig} />
      </section>
      
      <section>
        <h2>Image Blocks</h2>
        <BlockManager type="image" config={imageBlockConfig} />
      </section>
      
      <button onClick={() => {
        // Save all blocks
        const allBlocks = [
          ...store.getBlocksByType('text'),
          ...store.getBlocksByType('image'),
        ];
        console.log('Saving all blocks:', allBlocks);
      }}>
        Save Page
      </button>
    </div>
  );
}
```

## Block States

Blocks have three states that help track their lifecycle:

- **`empty`** - New block with default data
- **`dirty`** - Block has unsaved changes
- **`clean`** - Block has been saved

You can check block state using the utility functions:

```tsx
import { isBlockEmpty, isBlockDirty, isBlockClean } from 'block-party';

const block = store.getBlock(blockId);
if (isBlockDirty(block)) {
  console.log('Block has unsaved changes');
}
```

## Keyboard Support

- **Tab/Shift+Tab** - Navigate between blocks
- **Enter** - Enter edit mode on focused block
- **Escape** - Cancel editing (in your edit component)
- **Ctrl/Cmd+S** - Save block (in your edit component)

## Styling

Block Party is unstyled by default. Add your own CSS:

```css
/* Example styles */
.block-container {
  margin: 1rem 0;
  padding: 1rem;
  border: 1px solid #ccc;
  cursor: pointer;
}

.block-container:focus {
  outline: 2px solid blue;
}

.block-container[aria-grabbed="true"] {
  opacity: 0.5;
}

.add-block-button {
  margin-top: 1rem;
  padding: 0.5rem 1rem;
  border: 2px dashed #ccc;
  background: none;
  cursor: pointer;
}
```

## TypeScript

Block Party is written in TypeScript and provides full type safety:

```tsx
import type { Block, BlockConfig, BlockEditProps, BlockRenderProps } from 'block-party';

// Define your block data type
interface MyBlockData {
  title: string;
  content: string;
}

// Components get fully typed props
const MyBlockEdit: React.FC<BlockEditProps<MyBlockData>> = ({ block, onChange }) => {
  // block.data is typed as MyBlockData
  return <input value={block.data.title} onChange={(e) => onChange({ ...block.data, title: e.target.value })} />;
};
```

## Publishing

This package is automatically published to npm when changes are merged to the `main` branch. The release process uses [semantic-release](https://github.com/semantic-release/semantic-release) to:

1. Analyze commit messages to determine the next version
2. Generate release notes from commit messages
3. Publish to npm
4. Create a GitHub release

### Commit Message Format

We follow the [Conventional Commits](https://www.conventionalcommits.org/) specification:

- `feat:` - New features (triggers minor version bump)
- `fix:` - Bug fixes (triggers patch version bump)
- `docs:` - Documentation changes (no release)
- `chore:` - Maintenance tasks (no release)
- `refactor:` - Code refactoring (no release)
- `test:` - Test changes (no release)

Breaking changes should include `BREAKING CHANGE:` in the commit body or append `!` to the type (e.g., `feat!:`).

### Setup for Publishing

1. **Add NPM Token**: Go to your repository settings on GitHub and add a secret named `NPM_TOKEN` with your npm authentication token.

2. **Ensure Main Branch Protection**: The release workflow runs on pushes to `main`, so protect your main branch and use pull requests.

### Manual Publishing

If you need to publish manually:

```bash
npm run clean
npm run build
npm publish
```

## License

MIT © Aaron Bassett