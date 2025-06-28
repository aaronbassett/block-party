import React from 'react';
import { renderHook, act } from '@testing-library/react';
import { useBlockStore } from '../src/store';
import type { BlockConfig } from '../src/types';

// Mock config for testing
const mockTextConfig: BlockConfig<{ content: string }> = {
  type: 'text',
  displayName: 'Text Block',
  maxBlocks: 3,
  renderView: () => <div />,
  renderEdit: () => <div />,
  createDefault: () => ({ content: '' }),
  validate: (data) => typeof data.content === 'string',
};

const mockImageConfig: BlockConfig<{ url: string }> = {
  type: 'image',
  displayName: 'Image Block',
  renderView: () => <div />,
  renderEdit: () => <div />,
  createDefault: () => ({ url: '' }),
};

describe('BlockStore', () => {
  beforeEach(() => {
    const { result } = renderHook(() => useBlockStore());
    act(() => {
      result.current.reset();
    });
  });
  
  describe('Config Management', () => {
    it('should register and unregister configs', () => {
      const { result } = renderHook(() => useBlockStore());
      
      act(() => {
        result.current.registerConfig(mockTextConfig);
      });
      
      expect(result.current.configs.has('text')).toBe(true);
      
      act(() => {
        result.current.unregisterConfig('text');
      });
      
      expect(result.current.configs.has('text')).toBe(false);
    });
  });
  
  describe('Block CRUD Operations', () => {
    it('should add a new block', () => {
      const { result } = renderHook(() => useBlockStore());
      
      act(() => {
        result.current.registerConfig(mockTextConfig);
      });
      
      let blockId: string | null = null;
      act(() => {
        blockId = result.current.addBlock('text');
      });
      
      expect(blockId).toBeTruthy();
      const block = result.current.getBlock(blockId!);
      expect(block).toBeDefined();
      expect(block?.type).toBe('text');
      expect(block?.state).toBe('empty');
      expect(block?.data).toEqual({ content: '' });
    });
    
    it('should enforce block limits', () => {
      const { result } = renderHook(() => useBlockStore());
      
      act(() => {
        result.current.registerConfig(mockTextConfig);
      });
      
      // Add 3 blocks (the limit)
      const blockIds: string[] = [];
      act(() => {
        for (let i = 0; i < 3; i++) {
          const id = result.current.addBlock('text');
          if (id) blockIds.push(id);
        }
      });
      
      expect(blockIds).toHaveLength(3);
      expect(result.current.canAddBlock('text')).toBe(false);
      
      // Try to add one more
      let extraBlockId: string | null = null;
      act(() => {
        extraBlockId = result.current.addBlock('text');
      });
      
      expect(extraBlockId).toBeNull();
    });
    
    it('should remove blocks', () => {
      const { result } = renderHook(() => useBlockStore());
      
      act(() => {
        result.current.registerConfig(mockTextConfig);
      });
      
      let blockId: string | null = null;
      act(() => {
        blockId = result.current.addBlock('text');
      });
      
      expect(result.current.blocks.size).toBe(1);
      
      act(() => {
        result.current.removeBlock(blockId!);
      });
      
      expect(result.current.blocks.size).toBe(0);
      expect(result.current.getBlock(blockId!)).toBeUndefined();
    });
    
    it('should update block data and mark as dirty', () => {
      const { result } = renderHook(() => useBlockStore());
      
      act(() => {
        result.current.registerConfig(mockTextConfig);
      });
      
      let blockId: string | null = null;
      act(() => {
        blockId = result.current.addBlock('text');
      });
      
      act(() => {
        result.current.updateBlockData(blockId!, { content: 'Hello World' });
      });
      
      const block = result.current.getBlock(blockId!);
      expect(block?.data).toEqual({ content: 'Hello World' });
      expect(block?.state).toBe('dirty');
    });
    
    it('should move blocks and update order', () => {
      const { result } = renderHook(() => useBlockStore());
      
      act(() => {
        result.current.registerConfig(mockTextConfig);
      });
      
      const blockIds: string[] = [];
      act(() => {
        for (let i = 0; i < 3; i++) {
          const id = result.current.addBlock('text');
          if (id) blockIds.push(id);
        }
      });
      
      // Move first block to position 2
      act(() => {
        result.current.moveBlock(blockIds[0], 2);
      });
      
      const blocks = result.current.getBlocksByType('text');
      expect(blocks[0].id).toBe(blockIds[1]);
      expect(blocks[1].id).toBe(blockIds[2]);
      expect(blocks[2].id).toBe(blockIds[0]);
    });
  });
  
  describe('Edit Mode Orchestration', () => {
    it('should enforce single edit mode', () => {
      const { result } = renderHook(() => useBlockStore());
      
      act(() => {
        result.current.registerConfig(mockTextConfig);
      });
      
      const blockIds: string[] = [];
      act(() => {
        for (let i = 0; i < 2; i++) {
          const id = result.current.addBlock('text');
          if (id) blockIds.push(id);
        }
      });
      
      // Enable edit on first block
      act(() => {
        result.current.enableBlockEdit(blockIds[0]);
      });
      
      expect(result.current.getBlock(blockIds[0])?.isEditing).toBe(true);
      expect(result.current.editingBlockId).toBe(blockIds[0]);
      
      // Enable edit on second block
      act(() => {
        result.current.enableBlockEdit(blockIds[1]);
      });
      
      // First block should no longer be editing
      expect(result.current.getBlock(blockIds[0])?.isEditing).toBe(false);
      expect(result.current.getBlock(blockIds[1])?.isEditing).toBe(true);
      expect(result.current.editingBlockId).toBe(blockIds[1]);
    });
    
    it('should save block and mark as clean', async () => {
      const { result } = renderHook(() => useBlockStore());
      
      const onSaveMock = jest.fn();
      const configWithSave = {
        ...mockTextConfig,
        onSave: onSaveMock,
      };
      
      act(() => {
        result.current.registerConfig(configWithSave);
      });
      
      let blockId: string | null = null;
      act(() => {
        blockId = result.current.addBlock('text');
      });
      
      act(() => {
        result.current.updateBlockData(blockId!, { content: 'Test content' });
      });
      
      await act(async () => {
        await result.current.saveBlock(blockId!);
      });
      
      const block = result.current.getBlock(blockId!);
      expect(block?.state).toBe('clean');
      expect(block?.isEditing).toBe(false);
      expect(block?.savedAt).toBeDefined();
      expect(onSaveMock).toHaveBeenCalledWith(expect.objectContaining({
        id: blockId,
        data: { content: 'Test content' },
      }));
    });
  });
  
  describe('State Queries', () => {
    it('should get blocks by type', () => {
      const { result } = renderHook(() => useBlockStore());
      
      act(() => {
        result.current.registerConfig(mockTextConfig);
        result.current.registerConfig(mockImageConfig);
      });
      
      act(() => {
        result.current.addBlock('text');
        result.current.addBlock('image');
        result.current.addBlock('text');
      });
      
      const textBlocks = result.current.getBlocksByType('text');
      const imageBlocks = result.current.getBlocksByType('image');
      
      expect(textBlocks).toHaveLength(2);
      expect(imageBlocks).toHaveLength(1);
    });
    
    it('should track block counts correctly', () => {
      const { result } = renderHook(() => useBlockStore());
      
      act(() => {
        result.current.registerConfig(mockTextConfig);
      });
      
      const blockIds: string[] = [];
      act(() => {
        for (let i = 0; i < 2; i++) {
          const id = result.current.addBlock('text');
          if (id) blockIds.push(id);
        }
      });
      
      expect(result.current.blockCounts.get('text')).toBe(2);
      
      act(() => {
        result.current.removeBlock(blockIds[0]);
      });
      
      expect(result.current.blockCounts.get('text')).toBe(1);
    });
    
    it('should get currently editing block', () => {
      const { result } = renderHook(() => useBlockStore());
      
      act(() => {
        result.current.registerConfig(mockTextConfig);
      });
      
      let blockId: string | null = null;
      act(() => {
        blockId = result.current.addBlock('text');
      });
      
      expect(result.current.getEditingBlock()).toBeUndefined();
      
      act(() => {
        result.current.enableBlockEdit(blockId!);
      });
      
      const editingBlock = result.current.getEditingBlock();
      expect(editingBlock?.id).toBe(blockId);
    });
  });
});