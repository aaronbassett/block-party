import React, { useState, useEffect, useRef } from 'react';
import { fn } from '@storybook/test';
import type { BlockConfig, BlockEditProps, BlockRenderProps } from '../../src';

export interface CodeBlockData {
  code: string;
  language: string;
  filename?: string;
}

const languages = [
  'javascript',
  'typescript',
  'jsx',
  'tsx',
  'python',
  'java',
  'css',
  'html',
  'json',
  'yaml',
  'markdown',
  'bash',
];

export const CodeBlockView: React.FC<BlockRenderProps<CodeBlockData>> = ({ 
  block, 
  onEdit 
}) => {
  if (!block.data.code) {
    return (
      <div 
        className="p-4 bg-gray-900 text-gray-400 rounded cursor-pointer hover:bg-gray-800"
        onClick={onEdit}
      >
        <code className="text-sm">// Click to add code...</code>
      </div>
    );
  }

  return (
    <div className="group cursor-pointer" onClick={onEdit}>
      {block.data.filename && (
        <div className="bg-gray-800 text-gray-300 px-3 py-1 rounded-t text-sm">
          {block.data.filename}
        </div>
      )}
      <pre className={`bg-gray-900 text-gray-100 p-4 ${block.data.filename ? 'rounded-b' : 'rounded'} overflow-x-auto group-hover:bg-gray-800 transition-colors`}>
        <code className="text-sm">{block.data.code}</code>
      </pre>
      <div className="text-xs text-gray-500 mt-1">{block.data.language}</div>
    </div>
  );
};

export const CodeBlockEdit: React.FC<BlockEditProps<CodeBlockData>> = ({
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

  useEffect(() => {
    // Listen for clicks outside
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [localData]);

  return (
    <div ref={containerRef} className="p-4 border-2 border-blue-500 rounded">
      <div className="flex gap-2 mb-3">
        <select
          className="px-3 py-1 border rounded"
          value={localData.language}
          onChange={(e) => setLocalData({ ...localData, language: e.target.value })}
        >
          <option value="">Select language...</option>
          {languages.map(lang => (
            <option key={lang} value={lang}>{lang}</option>
          ))}
        </select>
        <input
          type="text"
          className="flex-1 px-3 py-1 border rounded"
          value={localData.filename || ''}
          onChange={(e) => setLocalData({ ...localData, filename: e.target.value })}
          placeholder="Filename (optional)"
        />
      </div>
      
      <textarea
        className="w-full p-3 border rounded font-mono text-sm bg-gray-50"
        value={localData.code}
        onChange={(e) => setLocalData({ ...localData, code: e.target.value })}
        onKeyDown={(e) => {
          if (e.key === 'Tab') {
            e.preventDefault();
            const start = e.currentTarget.selectionStart;
            const end = e.currentTarget.selectionEnd;
            const newCode = localData.code.substring(0, start) + '  ' + localData.code.substring(end);
            setLocalData({ ...localData, code: newCode });
            setTimeout(() => {
              e.currentTarget.selectionStart = e.currentTarget.selectionEnd = start + 2;
            }, 0);
          }
          if (e.key === 's' && (e.metaKey || e.ctrlKey)) {
            e.preventDefault();
            handleSave();
          }
          if (e.key === 'Escape') {
            e.preventDefault();
            // Escape - keep changes but exit edit mode
            onChange(localData);
            onCancel();
          }
        }}
        placeholder="Enter code..."
        rows={12}
        autoFocus
        spellCheck={false}
      />
      
      <div className="flex gap-2 mt-3">
        <button
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          onClick={handleSave}
        >
          Save (⌘+S)
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

export const codeBlockConfig: BlockConfig<CodeBlockData> = {
  type: 'code',
  displayName: 'Code',
  maxBlocks: 10,
  renderView: (props) => <CodeBlockView {...props} />,
  renderEdit: (props) => <CodeBlockEdit {...props} />,
  createDefault: () => ({ code: '', language: 'javascript' }),
  validate: (data) => data.code.length <= 10000,
  onSave: fn().mockImplementation(async (block) => {
    console.log('Saving code block:', block);
    await new Promise(resolve => setTimeout(resolve, 500));
  }),
};