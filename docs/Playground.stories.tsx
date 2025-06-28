import React, { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { BlockManager, useBlockStore } from '../src';
import type { BlockConfig } from '../src';

interface PlaygroundBlockData {
  content: string;
  style: {
    backgroundColor: string;
    textColor: string;
    fontSize: string;
    padding: string;
  };
}

const PlaygroundDemo = ({ 
  maxBlocks,
  enableDragDrop,
  showStateIndicators,
  customStyles 
}: {
  maxBlocks: number;
  enableDragDrop: boolean;
  showStateIndicators: boolean;
  customStyles: string;
}) => {
  const [savedCount, setSavedCount] = useState(0);
  
  const blockConfig: BlockConfig<PlaygroundBlockData> = {
    type: 'playground',
    displayName: 'Playground Block',
    maxBlocks,
    renderView: ({ block, onEdit, isFocused }) => (
      <div 
        style={{
          backgroundColor: block.data.style.backgroundColor,
          color: block.data.style.textColor,
          fontSize: block.data.style.fontSize,
          padding: block.data.style.padding,
          cursor: 'pointer',
          position: 'relative',
          minHeight: '60px',
          display: 'flex',
          alignItems: 'center',
        }}
        onClick={onEdit}
      >
        {block.data.content || <em style={{ opacity: 0.5 }}>Click to edit...</em>}
        
        {showStateIndicators && (
          <div style={{
            position: 'absolute',
            top: '4px',
            right: '4px',
            fontSize: '12px',
            padding: '2px 6px',
            borderRadius: '4px',
            backgroundColor: 'rgba(0,0,0,0.1)',
          }}>
            {block.state}
          </div>
        )}
      </div>
    ),
    renderEdit: ({ block, onChange, onSave, onCancel }) => {
      const [localData, setLocalData] = useState(block.data);
      
      return (
        <div style={{ 
          border: '2px solid #3b82f6', 
          borderRadius: '8px', 
          padding: '16px',
          backgroundColor: '#f0f9ff',
        }}>
          <div style={{ marginBottom: '12px' }}>
            <label style={{ display: 'block', marginBottom: '4px', fontSize: '14px' }}>
              Content:
            </label>
            <textarea
              value={localData.content}
              onChange={(e) => setLocalData({ ...localData, content: e.target.value })}
              style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
              rows={3}
              autoFocus
            />
          </div>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '4px', fontSize: '14px' }}>
                Background:
              </label>
              <input
                type="color"
                value={localData.style.backgroundColor}
                onChange={(e) => setLocalData({
                  ...localData,
                  style: { ...localData.style, backgroundColor: e.target.value }
                })}
                style={{ width: '100%', height: '32px', cursor: 'pointer' }}
              />
            </div>
            
            <div>
              <label style={{ display: 'block', marginBottom: '4px', fontSize: '14px' }}>
                Text Color:
              </label>
              <input
                type="color"
                value={localData.style.textColor}
                onChange={(e) => setLocalData({
                  ...localData,
                  style: { ...localData.style, textColor: e.target.value }
                })}
                style={{ width: '100%', height: '32px', cursor: 'pointer' }}
              />
            </div>
            
            <div>
              <label style={{ display: 'block', marginBottom: '4px', fontSize: '14px' }}>
                Font Size:
              </label>
              <select
                value={localData.style.fontSize}
                onChange={(e) => setLocalData({
                  ...localData,
                  style: { ...localData.style, fontSize: e.target.value }
                })}
                style={{ width: '100%', padding: '6px', borderRadius: '4px', border: '1px solid #ccc' }}
              >
                <option value="14px">Small</option>
                <option value="16px">Medium</option>
                <option value="20px">Large</option>
                <option value="24px">X-Large</option>
              </select>
            </div>
            
            <div>
              <label style={{ display: 'block', marginBottom: '4px', fontSize: '14px' }}>
                Padding:
              </label>
              <select
                value={localData.style.padding}
                onChange={(e) => setLocalData({
                  ...localData,
                  style: { ...localData.style, padding: e.target.value }
                })}
                style={{ width: '100%', padding: '6px', borderRadius: '4px', border: '1px solid #ccc' }}
              >
                <option value="8px">Small</option>
                <option value="16px">Medium</option>
                <option value="24px">Large</option>
                <option value="32px">X-Large</option>
              </select>
            </div>
          </div>
          
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              onClick={() => {
                onChange(localData);
                onSave();
              }}
              style={{
                padding: '8px 16px',
                backgroundColor: '#3b82f6',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
              }}
            >
              Save
            </button>
            <button
              onClick={onCancel}
              style={{
                padding: '8px 16px',
                backgroundColor: '#e5e7eb',
                color: '#374151',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
              }}
            >
              Cancel
            </button>
          </div>
        </div>
      );
    },
    createDefault: () => ({
      content: '',
      style: {
        backgroundColor: '#f3f4f6',
        textColor: '#111827',
        fontSize: '16px',
        padding: '16px',
      },
    }),
    validate: (data) => data.content.length <= 200,
    onSave: async (block) => {
      await new Promise(resolve => setTimeout(resolve, 300));
      setSavedCount(prev => prev + 1);
    },
  };

  return (
    <div>
      <div style={{ 
        marginBottom: '16px', 
        padding: '12px', 
        backgroundColor: '#f0f9ff', 
        borderRadius: '8px',
        fontSize: '14px',
      }}>
        <strong>Stats:</strong> Blocks saved: {savedCount} | 
        Drag & Drop: {enableDragDrop ? 'Enabled' : 'Disabled'} | 
        Max blocks: {maxBlocks}
      </div>
      
      {customStyles && <style>{customStyles}</style>}
      
      <BlockManager
        type="playground"
        config={blockConfig}
        className={enableDragDrop ? '' : 'no-drag'}
        onError={(error) => alert(`Error: ${error.message}`)}
      />
      
      {!enableDragDrop && (
        <style>{`.no-drag .block-container { cursor: pointer !important; }`}</style>
      )}
    </div>
  );
};

const meta = {
  title: 'Examples/Playground',
  component: PlaygroundDemo,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: 'Interactive playground to experiment with Block Party features.',
      },
    },
  },
  argTypes: {
    maxBlocks: {
      control: { type: 'range', min: 1, max: 10, step: 1 },
      description: 'Maximum number of blocks allowed',
    },
    enableDragDrop: {
      control: 'boolean',
      description: 'Enable drag and drop reordering',
    },
    showStateIndicators: {
      control: 'boolean',
      description: 'Show block state badges (empty/dirty/clean)',
    },
    customStyles: {
      control: 'text',
      description: 'Custom CSS to apply (be careful!)',
    },
  },
} as Meta<typeof PlaygroundDemo>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    maxBlocks: 5,
    enableDragDrop: true,
    showStateIndicators: true,
    customStyles: `.block-container {
  margin-bottom: 12px;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  transition: all 0.2s;
}

.block-container:hover {
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.block-container[aria-grabbed="true"] {
  opacity: 0.8;
  transform: scale(0.98);
}

.add-block-button {
  width: 100%;
  padding: 12px;
  border: 2px dashed #d1d5db;
  background: transparent;
  border-radius: 8px;
  color: #6b7280;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.add-block-button:hover {
  border-color: #9ca3af;
  background: #f9fafb;
}

.add-block-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}`,
  },
};