import type { Block, BlockState } from './types';

// Block state helpers
export const isBlockEmpty = (block: Block): boolean => {
  return block.state === 'empty';
};

export const isBlockDirty = (block: Block): boolean => {
  return block.state === 'dirty';
};

export const isBlockClean = (block: Block): boolean => {
  return block.state === 'clean';
};

// Block creation helper
export const createBlock = <T = unknown>(
  type: string,
  data: T,
  order = 0
): Omit<Block<T>, 'id'> => {
  const now = Date.now();
  return {
    type,
    data,
    order,
    state: 'empty' as BlockState,
    isEditing: false,
    createdAt: now,
    updatedAt: now,
  };
};

// Sort blocks by order
export const sortBlocksByOrder = (blocks: Block[]): Block[] => {
  return [...blocks].sort((a, b) => a.order - b.order);
};

// Get next available order
export const getNextOrder = (blocks: Block[]): number => {
  if (blocks.length === 0) return 0;
  return Math.max(...blocks.map(b => b.order)) + 1;
};
