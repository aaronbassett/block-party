import React, { useState, useEffect, useRef } from 'react';
import { fn } from '@storybook/test';
import type { BlockConfig, BlockEditProps, BlockRenderProps } from '../../src';

export interface TextBlockData {
  content: string;
  format: 'normal' | 'heading' | 'quote';
}

export const TextBlockView: React.FC<BlockRenderProps<TextBlockData>> = ({ 
  block, 
  onEdit 
}) => {
  const formatClasses = {
    normal: 'text-base',
    heading: 'text-2xl font-bold',
    quote: 'text-lg italic border-l-4 border-gray-300 pl-4',
  };

  return (
    <div 
      className={`cursor-pointer p-4 hover:bg-gray-50 ${formatClasses[block.data.format]}`}
      onClick={onEdit}
    >
      {block.data.content || <span className="text-gray-400">Click to edit...</span>}
    </div>
  );
};

export const TextBlockEdit: React.FC<BlockEditProps<TextBlockData>> = ({
  block,
  onChange,
  onSave,
  onCancel,
}) => {
  const [localData, setLocalData] = useState(block.data);
  const [initialData] = useState(block.data);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleSave = () => {
    onChange(localData);
    onSave();
  };

  const handleCancel = () => {
    // Reset to initial data
    onChange(initialData);
    onCancel();
  };

  const handleClickOutside = (e: MouseEvent) => {
    if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
      // Click outside - keep changes but exit edit mode
      onChange(localData);
      onCancel();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      handleSave();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      // Escape - keep changes but exit edit mode
      onChange(localData);
      onCancel();
    }
  };

  useEffect(() => {
    // Listen for clicks outside
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [localData]);

  return (
    <div ref={containerRef} className="p-4 border-2 border-blue-500 rounded" onKeyDown={handleKeyDown}>
      <textarea
        className="w-full p-2 border rounded mb-2"
        value={localData.content}
        onChange={(e) => setLocalData({ ...localData, content: e.target.value })}
        placeholder="Enter text content..."
        rows={4}
        autoFocus
      />
      <div className="flex gap-2 mb-2">
        <select
          className="px-3 py-1 border rounded"
          value={localData.format}
          onChange={(e) => setLocalData({ ...localData, format: e.target.value as TextBlockData['format'] })}
        >
          <option value="normal">Normal</option>
          <option value="heading">Heading</option>
          <option value="quote">Quote</option>
        </select>
      </div>
      <div className="flex gap-2">
        <button
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          onClick={handleSave}
        >
          Save (⌘+Enter)
        </button>
        <button
          className="px-4 py-2 border rounded hover:bg-gray-100"
          onClick={handleCancel}
        >
          Cancel (Esc)
        </button>
      </div>
    </div>
  );
};

export const textBlockConfig: BlockConfig<TextBlockData> = {
  type: 'text',
  displayName: 'Text Block',
  maxBlocks: 10,
  renderView: (props) => <TextBlockView {...props} />,
  renderEdit: (props) => <TextBlockEdit {...props} />,
  createDefault: () => ({ content: '', format: 'normal' }),
  validate: (data) => data.content.length <= 5000,
  onSave: fn().mockImplementation(async (block) => {
    console.log('Saving text block:', block);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500));
  }),
};