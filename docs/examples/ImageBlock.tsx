import React, { useState, useEffect, useRef } from 'react';
import { fn } from '@storybook/test';
import type { BlockConfig, BlockEditProps, BlockRenderProps } from '../../src';

export interface ImageBlockData {
  url: string;
  alt: string;
  caption?: string;
}

export const ImageBlockView: React.FC<BlockRenderProps<ImageBlockData>> = ({ 
  block, 
  onEdit 
}) => {
  if (!block.data.url) {
    return (
      <div 
        className="p-8 border-2 border-dashed border-gray-300 rounded cursor-pointer hover:border-gray-400 text-center"
        onClick={onEdit}
      >
        <div className="text-gray-400">
          <svg className="w-12 h-12 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          Click to add image
        </div>
      </div>
    );
  }

  return (
    <figure className="cursor-pointer group" onClick={onEdit}>
      <div className="relative overflow-hidden rounded">
        <img 
          src={block.data.url} 
          alt={block.data.alt}
          className="w-full h-auto group-hover:opacity-90 transition-opacity"
        />
        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition-all flex items-center justify-center">
          <span className="text-white opacity-0 group-hover:opacity-100 transition-opacity">
            Click to edit
          </span>
        </div>
      </div>
      {block.data.caption && (
        <figcaption className="mt-2 text-sm text-gray-600 text-center">
          {block.data.caption}
        </figcaption>
      )}
    </figure>
  );
};

export const ImageBlockEdit: React.FC<BlockEditProps<ImageBlockData>> = ({
  block,
  onChange,
  onSave,
  onCancel,
}) => {
  const [localData, setLocalData] = useState(block.data);
  const [initialData] = useState(block.data);
  const [preview, setPreview] = useState(true);
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
      <div className="space-y-3 mb-4">
        <input
          type="url"
          className="w-full p-2 border rounded"
          value={localData.url}
          onChange={(e) => setLocalData({ ...localData, url: e.target.value })}
          placeholder="Image URL (https://...)"
          autoFocus
        />
        <input
          type="text"
          className="w-full p-2 border rounded"
          value={localData.alt}
          onChange={(e) => setLocalData({ ...localData, alt: e.target.value })}
          placeholder="Alt text (for accessibility)"
        />
        <input
          type="text"
          className="w-full p-2 border rounded"
          value={localData.caption || ''}
          onChange={(e) => setLocalData({ ...localData, caption: e.target.value })}
          placeholder="Caption (optional)"
        />
      </div>

      {preview && localData.url && (
        <div className="mb-4">
          <div className="text-sm text-gray-600 mb-2">Preview:</div>
          <img 
            src={localData.url} 
            alt={localData.alt || 'Preview'}
            className="max-w-full h-auto max-h-64 rounded"
            onError={() => setPreview(false)}
          />
        </div>
      )}

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

export const imageBlockConfig: BlockConfig<ImageBlockData> = {
  type: 'image',
  displayName: 'Image',
  maxBlocks: 5,
  renderView: (props) => <ImageBlockView {...props} />,
  renderEdit: (props) => <ImageBlockEdit {...props} />,
  createDefault: () => ({ url: '', alt: '' }),
  validate: (data) => {
    if (!data.url) return true; // Allow empty for new blocks
    try {
      new URL(data.url);
      return data.url.startsWith('http') && data.alt.length > 0;
    } catch {
      return false;
    }
  },
  onSave: fn().mockImplementation(async (block) => {
    console.log('Saving image block:', block);
    await new Promise(resolve => setTimeout(resolve, 500));
  }),
};