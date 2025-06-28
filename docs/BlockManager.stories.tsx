import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { BlockManager } from '../src/BlockManager';
import { textBlockConfig } from './examples/TextBlock';
import { imageBlockConfig } from './examples/ImageBlock';
import { codeBlockConfig } from './examples/CodeBlock';
import './styles/drag-handle.css';

const meta = {
  title: 'Components/BlockManager',
  component: BlockManager,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: 'BlockManager is the main component for managing blocks of a specific type. It handles rendering, drag & drop, and orchestration.',
      },
    },
  },
  decorators: [
    (Story) => (
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        <Story />
      </div>
    ),
  ],
} as Meta<typeof BlockManager>;

export default meta;
type Story = StoryObj<typeof meta>;

export const TextBlocks: Story = {
  args: {
    type: 'text',
    config: textBlockConfig,
    className: 'space-y-2',
  },
  parameters: {
    docs: {
      description: {
        story: 'A BlockManager configured for text blocks with formatting options.',
      },
    },
  },
};

export const ImageBlocks: Story = {
  args: {
    type: 'image',
    config: imageBlockConfig,
    className: 'space-y-4',
  },
  parameters: {
    docs: {
      description: {
        story: 'A BlockManager configured for image blocks with URL, alt text, and captions.',
      },
    },
  },
};

export const CodeBlocks: Story = {
  args: {
    type: 'code',
    config: codeBlockConfig,
    className: 'space-y-4',
  },
  parameters: {
    docs: {
      description: {
        story: 'A BlockManager configured for code blocks with syntax highlighting and language selection.',
      },
    },
  },
};

export const WithErrorHandling: Story = {
  args: {
    type: 'text',
    config: textBlockConfig,
    className: 'space-y-2',
    onError: (error) => {
      console.error('Block error:', error);
      alert(`Error: ${error.message}`);
    },
  },
  parameters: {
    docs: {
      description: {
        story: 'BlockManager with custom error handling. Try to add more blocks than the limit.',
      },
    },
  },
};

export const MultipleManagers: Story = {
  render: () => (
    <div className="space-y-8">
      <section>
        <h2 className="text-xl font-bold mb-4">Text Content</h2>
        <BlockManager type="text" config={textBlockConfig} className="space-y-2" />
      </section>
      
      <section>
        <h2 className="text-xl font-bold mb-4">Images</h2>
        <BlockManager type="image" config={imageBlockConfig} className="space-y-4" />
      </section>
      
      <section>
        <h2 className="text-xl font-bold mb-4">Code Snippets</h2>
        <BlockManager type="code" config={codeBlockConfig} className="space-y-4" />
      </section>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Multiple BlockManagers on the same page. Only one block can be edited at a time across all managers.',
      },
    },
  },
};

export const CustomStyling: Story = {
  args: {
    type: 'text',
    config: textBlockConfig,
    className: 'custom-block-manager',
  },
  decorators: [
    (Story) => (
      <>
        <style>{`
          .custom-block-manager {
            display: flex;
            flex-direction: column;
            gap: 1rem;
          }
          
          .custom-block-manager .block-container {
            background: linear-gradient(to right, #f3f4f6, #ffffff);
            border: 2px solid #e5e7eb;
            border-radius: 8px;
            padding: 1rem;
            transition: all 0.2s;
            position: relative;
          }
          
          .custom-block-manager .block-container:hover {
            border-color: #3b82f6;
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
          }
          
          .custom-block-manager .block-container[aria-grabbed="true"] {
            opacity: 0.5;
            transform: scale(0.98);
          }
          
          .custom-block-manager .drag-handle {
            display: flex;
            align-items: center;
            justify-content: center;
            width: 32px;
            height: 32px;
            background: #ffffff;
            border: 1px solid #e5e7eb;
            border-radius: 6px;
            color: #9ca3af;
            cursor: grab;
            transition: all 0.2s;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
            z-index: 10;
          }
          
          .custom-block-manager .drag-handle:hover {
            background: #f3f4f6;
            border-color: #d1d5db;
            color: #6b7280;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
          }
          
          .custom-block-manager .drag-handle:active {
            cursor: grabbing;
            transform: scale(0.95);
          }
          
          .custom-block-manager .add-block-button {
            background: #3b82f6;
            color: white;
            border: none;
            border-radius: 8px;
            padding: 0.75rem 1.5rem;
            font-weight: 500;
            transition: background 0.2s;
          }
          
          .custom-block-manager .add-block-button:hover {
            background: #2563eb;
          }
          
          .custom-block-manager .add-block-button:disabled {
            background: #9ca3af;
            cursor: not-allowed;
          }
        `}</style>
        <Story />
      </>
    ),
  ],
  parameters: {
    docs: {
      description: {
        story: 'BlockManager with custom CSS styling. Block Party is unstyled by default, allowing full customization.',
      },
    },
  },
};