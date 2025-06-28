import React, { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { BlockManager, useBlockStore } from '../src';
import type { BlockConfig } from '../src';
import {
  BlockPartyError,
  ConfigNotFoundError,
  BlockNotFoundError,
  BlockLimitError,
  InvalidBlockDataError,
  BlockSaveError,
  DragDropError,
  BlockValidationError,
  BlockEditError
} from '../src/errors';

const ErrorDemo = () => {
  const [errors, setErrors] = useState<Array<{ time: string; error: Error }>>([]);
  const store = useBlockStore();

  const logError = (error: Error) => {
    setErrors(prev => [...prev, {
      time: new Date().toLocaleTimeString(),
      error
    }]);
  };

  // Config that always fails validation
  const failingConfig: BlockConfig<{ value: number }> = {
    type: 'failing',
    displayName: 'Always Fails',
    renderView: ({ block }) => <div>Value: {block.data.value}</div>,
    renderEdit: ({ block, onChange, onSave }) => (
      <div>
        <input
          type="number"
          value={block.data.value}
          onChange={(e) => onChange({ value: Number(e.target.value) })}
        />
        <button onClick={onSave}>Save</button>
      </div>
    ),
    createDefault: () => ({ value: 0 }),
    validate: () => false, // Always fails
  };

  // Config that fails on save
  const saveFailConfig: BlockConfig<{ text: string }> = {
    type: 'save-fail',
    displayName: 'Save Fails',
    maxBlocks: 2,
    renderView: ({ block }) => <div>{block.data.text}</div>,
    renderEdit: ({ block, onChange, onSave, onCancel }) => (
      <div>
        <input
          value={block.data.text}
          onChange={(e) => onChange({ text: e.target.value })}
        />
        <button onClick={onSave}>Save (will fail)</button>
        <button onClick={onCancel}>Cancel</button>
      </div>
    ),
    createDefault: () => ({ text: 'Edit me' }),
    onSave: async () => {
      throw new Error('Simulated save failure!');
    },
  };

  React.useEffect(() => {
    store.registerConfig(failingConfig);
    store.registerConfig(saveFailConfig);
    return () => {
      store.unregisterConfig('failing');
      store.unregisterConfig('save-fail');
    };
  }, []);

  const triggerErrors = {
    configNotFound: () => {
      try {
        store.addBlock('non-existent');
      } catch (error) {
        logError(error as Error);
      }
    },
    blockNotFound: () => {
      try {
        store.updateBlockData('fake-id', {});
      } catch (error) {
        logError(error as Error);
      }
    },
    blockLimit: () => {
      logError(new BlockLimitError('save-fail', 2));
    },
    validation: () => {
      try {
        const id = store.addBlock('failing');
        if (id) store.saveBlock(id);
      } catch (error) {
        logError(error as Error);
      }
    },
    saveError: async () => {
      try {
        const id = store.addBlock('save-fail');
        if (id) {
          store.updateBlockData(id, { text: 'Will fail on save' });
          await store.saveBlock(id);
        }
      } catch (error) {
        logError(error as Error);
      }
    },
    dragDrop: () => {
      logError(new DragDropError('Invalid drag operation: blocks not found'));
    },
  };

  return (
    <div className="p-4 space-y-6">
      <section>
        <h3 className="text-lg font-semibold mb-2">Trigger Errors</h3>
        <div className="flex gap-2 flex-wrap">
          <button
            className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
            onClick={triggerErrors.configNotFound}
          >
            Config Not Found
          </button>
          <button
            className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
            onClick={triggerErrors.blockNotFound}
          >
            Block Not Found
          </button>
          <button
            className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
            onClick={triggerErrors.blockLimit}
          >
            Block Limit
          </button>
          <button
            className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
            onClick={triggerErrors.validation}
          >
            Validation Error
          </button>
          <button
            className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
            onClick={triggerErrors.saveError}
          >
            Save Error
          </button>
          <button
            className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
            onClick={triggerErrors.dragDrop}
          >
            Drag Drop Error
          </button>
        </div>
      </section>

      <section>
        <h3 className="text-lg font-semibold mb-2">Error Log</h3>
        <div className="space-y-2 max-h-96 overflow-y-auto">
          {errors.length === 0 ? (
            <div className="text-gray-500 italic">No errors yet. Click buttons above to trigger errors.</div>
          ) : (
            errors.map((entry, i) => (
              <div key={i} className="p-3 bg-red-50 border border-red-200 rounded">
                <div className="flex justify-between text-sm text-gray-600 mb-1">
                  <span className="font-semibold">{entry.error.name}</span>
                  <span>{entry.time}</span>
                </div>
                <div className="text-red-700">{entry.error.message}</div>
                {entry.error instanceof BlockPartyError && entry.error.cause && (
                  <div className="mt-1 text-xs text-gray-600">
                    Caused by: {String(entry.error.cause)}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
        {errors.length > 0 && (
          <button
            className="mt-2 text-sm text-blue-600 hover:underline"
            onClick={() => setErrors([])}
          >
            Clear errors
          </button>
        )}
      </section>

      <section>
        <h3 className="text-lg font-semibold mb-2">BlockManager with Error Handler</h3>
        <div className="border rounded p-4">
          <BlockManager
            type="save-fail"
            config={saveFailConfig}
            onError={(error) => {
              logError(error);
              alert(`BlockManager Error: ${error.message}`);
            }}
          />
        </div>
      </section>
    </div>
  );
};

const meta = {
  title: 'Core/Error Handling',
  component: ErrorDemo,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: `Block Party provides custom error classes for better debugging experience. 
        
All errors extend from \`BlockPartyError\` and provide specific context about what went wrong.

## Error Types

- **ConfigNotFoundError**: Block type not registered
- **BlockNotFoundError**: Block ID doesn't exist
- **BlockLimitError**: Maximum blocks reached
- **BlockValidationError**: Validation failed
- **BlockSaveError**: Save operation failed
- **DragDropError**: Drag and drop operation failed
- **InvalidBlockDataError**: Invalid data provided
- **BlockEditError**: Cannot edit block

## Usage

\`\`\`tsx
import { BlockManager, BlockLimitError } from 'block-party';

<BlockManager
  type="text"
  config={config}
  onError={(error) => {
    if (error instanceof BlockLimitError) {
      alert(\`Cannot add more than \${error.limit} blocks\`);
    } else {
      console.error('Block error:', error);
    }
  }}
/>
\`\`\``,
      },
    },
  },
} as Meta;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  parameters: {
    docs: {
      description: {
        story: 'Interactive demo showing all error types. Click the buttons to trigger different errors and see how they appear in the error log.',
      },
    },
  },
};