import React, { useEffect } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { useBlockStore } from '../src/store';
import { textBlockConfig } from './examples/TextBlock';

const StoreDemo = () => {
  const store = useBlockStore();

  useEffect(() => {
    // Register config on mount
    store.registerConfig(textBlockConfig);
    
    // Add some example blocks
    const id1 = store.addBlock('text');
    if (id1) {
      store.updateBlockData(id1, { content: 'First block', format: 'normal' });
    }
    
    const id2 = store.addBlock('text');
    if (id2) {
      store.updateBlockData(id2, { content: 'Second block', format: 'heading' });
    }

    return () => {
      store.reset();
    };
  }, []);

  const blocks = Array.from(store.blocks.values()).sort((a, b) => a.order - b.order);
  const textBlocks = store.getBlocksByType('text');
  const editingBlock = store.getEditingBlock();
  const canAddMore = store.canAddBlock('text');

  return (
    <div className="p-4 space-y-6">
      <section>
        <h3 className="text-lg font-semibold mb-2">Store State</h3>
        <div className="bg-gray-100 p-4 rounded space-y-2 text-sm">
          <div>Total blocks: {store.blocks.size}</div>
          <div>Text blocks: {textBlocks.length}</div>
          <div>Currently editing: {editingBlock?.id || 'None'}</div>
          <div>Can add more text blocks: {canAddMore ? 'Yes' : 'No'}</div>
        </div>
      </section>

      <section>
        <h3 className="text-lg font-semibold mb-2">Actions</h3>
        <div className="flex gap-2 flex-wrap">
          <button
            className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
            onClick={() => {
              const id = store.addBlock('text');
              if (id) {
                store.updateBlockData(id, { 
                  content: `Block ${store.blocks.size}`, 
                  format: 'normal' 
                });
              }
            }}
            disabled={!canAddMore}
          >
            Add Block
          </button>
          
          {blocks.length > 0 && (
            <>
              <button
                className="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600"
                onClick={() => {
                  const firstBlock = blocks[0];
                  store.enableBlockEdit(firstBlock.id);
                }}
              >
                Edit First Block
              </button>
              
              <button
                className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                onClick={() => {
                  const lastBlock = blocks[blocks.length - 1];
                  store.removeBlock(lastBlock.id);
                }}
              >
                Remove Last Block
              </button>
              
              <button
                className="px-3 py-1 bg-purple-500 text-white rounded hover:bg-purple-600"
                onClick={async () => {
                  if (editingBlock) {
                    await store.saveBlock(editingBlock.id);
                  }
                }}
                disabled={!editingBlock}
              >
                Save Editing Block
              </button>
            </>
          )}
          
          <button
            className="px-3 py-1 bg-gray-500 text-white rounded hover:bg-gray-600"
            onClick={() => store.reset()}
          >
            Reset Store
          </button>
        </div>
      </section>

      <section>
        <h3 className="text-lg font-semibold mb-2">Blocks</h3>
        <div className="space-y-2">
          {blocks.map((block) => (
            <div
              key={block.id}
              className={`p-4 border rounded ${
                block.isEditing ? 'border-blue-500 bg-blue-50' : 'border-gray-300'
              }`}
            >
              <div className="flex justify-between items-start">
                <div>
                  <div className="font-mono text-xs text-gray-500">#{block.id}</div>
                  <div className="font-semibold">{block.data.content || '(empty)'}</div>
                  <div className="text-sm text-gray-600">
                    Format: {block.data.format} | State: {block.state} | Order: {block.order}
                  </div>
                </div>
                <div className="flex gap-1">
                  <button
                    className="px-2 py-1 text-xs bg-blue-500 text-white rounded"
                    onClick={() => store.enableBlockEdit(block.id)}
                    disabled={block.isEditing}
                  >
                    Edit
                  </button>
                  <button
                    className="px-2 py-1 text-xs bg-red-500 text-white rounded"
                    onClick={() => store.removeBlock(block.id)}
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

const meta = {
  title: 'Core/Store',
  component: StoreDemo,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: 'The Zustand store that manages all block state and orchestration logic. This demo shows direct store manipulation.',
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
        story: 'Interactive demo of the block store. Try adding blocks, editing them, and observing how the store enforces single edit mode.',
      },
    },
  },
};