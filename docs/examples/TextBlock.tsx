import React, { useState } from 'react';
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

  const handleSave = () => {
    onChange(localData);
    onSave();
  };

  return (
    <div className="p-4 border-2 border-blue-500 rounded">
      <textarea
        className="w-full p-2 border rounded mb-2"
        value={localData.content}
        onChange={(e) => setLocalData({ ...localData, content: e.target.value })}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && e.metaKey) handleSave();
          if (e.key === 'Escape') onCancel();
        }}
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
          onClick={onCancel}
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
  onSave: async (block) => {
    console.log('Saving text block:', block);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500));
  },
};