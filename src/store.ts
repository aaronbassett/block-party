import { create } from 'zustand';
import type { Block, BlockConfig, BlockState } from './types';

interface BlockStore {
  // State
  blocks: Map<string, Block>;
  configs: Map<string, BlockConfig>;
  editingBlockId: string | null;
  blockCounts: Map<string, number>;

  // Config management
  registerConfig: (config: BlockConfig<any>) => void;
  unregisterConfig: (type: string) => void;

  // Block CRUD operations
  addBlock: (type: string) => string | null;
  removeBlock: (id: string) => void;
  updateBlockData: (id: string, data: any) => void;
  moveBlock: (id: string, newOrder: number) => void;

  // Edit mode orchestration
  enableBlockEdit: (id: string) => void;
  disableBlockEdit: (id: string) => void;
  saveBlock: (id: string) => Promise<void>;

  // State queries
  getBlock: (id: string) => Block | undefined;
  getBlocksByType: (type: string) => Block[];
  canAddBlock: (type: string) => boolean;
  getEditingBlock: () => Block | undefined;

  // Utility methods
  reset: () => void;
}

let blockIdCounter = 0;
const generateBlockId = () => `block-${Date.now()}-${++blockIdCounter}`;

export const useBlockStore = create<BlockStore>((set, get) => ({
  // Initial state
  blocks: new Map(),
  configs: new Map(),
  editingBlockId: null,
  blockCounts: new Map(),

  // Config management
  registerConfig: config => {
    set(state => {
      const configs = new Map(state.configs);
      configs.set(config.type, config);
      return { configs };
    });
  },

  unregisterConfig: type => {
    set(state => {
      const configs = new Map(state.configs);
      configs.delete(type);
      return { configs };
    });
  },

  // Block CRUD operations
  addBlock: type => {
    const state = get();
    const config = state.configs.get(type);

    if (!config) {
      throw new Error(`Config not found for block type: ${type}`);
    }

    // Check block limit
    const currentCount = state.blockCounts.get(type) || 0;
    if (config.maxBlocks && currentCount >= config.maxBlocks) {
      return null;
    }

    // Create new block
    const id = generateBlockId();
    const now = Date.now();
    const blocks = Array.from(state.blocks.values());
    const maxOrder = blocks.reduce(
      (max, block) => Math.max(max, block.order),
      -1
    );

    const newBlock: Block = {
      id,
      type,
      data: config.createDefault(),
      order: maxOrder + 1,
      state: 'empty' as BlockState,
      isEditing: false,
      createdAt: now,
      updatedAt: now,
    };

    // Validate if validator exists
    if (config.validate && !config.validate(newBlock.data)) {
      throw new Error('Invalid default data for block');
    }

    set(state => {
      const blocks = new Map(state.blocks);
      const blockCounts = new Map(state.blockCounts);

      blocks.set(id, newBlock);
      blockCounts.set(type, currentCount + 1);

      return { blocks, blockCounts };
    });

    return id;
  },

  removeBlock: id => {
    set(state => {
      const blocks = new Map(state.blocks);
      const block = blocks.get(id);

      if (!block) return state;

      blocks.delete(id);

      // Update block count
      const blockCounts = new Map(state.blockCounts);
      const currentCount = blockCounts.get(block.type) || 0;
      if (currentCount > 0) {
        blockCounts.set(block.type, currentCount - 1);
      }

      // Clear editing if this block was being edited
      const editingBlockId =
        state.editingBlockId === id ? null : state.editingBlockId;

      return { blocks, blockCounts, editingBlockId };
    });
  },

  updateBlockData: (id, data) => {
    set(state => {
      const blocks = new Map(state.blocks);
      const block = blocks.get(id);

      if (!block) return state;

      const updatedBlock: Block = {
        ...block,
        data,
        state: 'dirty' as BlockState,
        updatedAt: Date.now(),
      };

      blocks.set(id, updatedBlock);
      return { blocks };
    });
  },

  moveBlock: (id, newOrder) => {
    set(state => {
      const blocks = new Map(state.blocks);
      const block = blocks.get(id);

      if (!block) return state;

      const oldOrder = block.order;

      // Update all affected blocks
      blocks.forEach((b, bid) => {
        if (bid === id) {
          blocks.set(bid, { ...b, order: newOrder, updatedAt: Date.now() });
        } else if (
          oldOrder < newOrder &&
          b.order > oldOrder &&
          b.order <= newOrder
        ) {
          // Moving down: shift others up
          blocks.set(bid, { ...b, order: b.order - 1 });
        } else if (
          oldOrder > newOrder &&
          b.order >= newOrder &&
          b.order < oldOrder
        ) {
          // Moving up: shift others down
          blocks.set(bid, { ...b, order: b.order + 1 });
        }
      });

      return { blocks };
    });
  },

  // Edit mode orchestration
  enableBlockEdit: id => {
    set(state => {
      const blocks = new Map(state.blocks);
      const block = blocks.get(id);

      if (!block) return state;

      // Disable any currently editing block
      if (state.editingBlockId && state.editingBlockId !== id) {
        const editingBlock = blocks.get(state.editingBlockId);
        if (editingBlock) {
          blocks.set(state.editingBlockId, {
            ...editingBlock,
            isEditing: false,
          });
        }
      }

      // Enable edit mode for this block
      blocks.set(id, { ...block, isEditing: true });

      return { blocks, editingBlockId: id };
    });
  },

  disableBlockEdit: id => {
    set(state => {
      const blocks = new Map(state.blocks);
      const block = blocks.get(id);

      if (!block) return state;

      blocks.set(id, { ...block, isEditing: false });

      const editingBlockId =
        state.editingBlockId === id ? null : state.editingBlockId;

      return { blocks, editingBlockId };
    });
  },

  saveBlock: async id => {
    const state = get();
    const block = state.blocks.get(id);
    const config = block ? state.configs.get(block.type) : undefined;

    if (!block || !config) {
      throw new Error('Block or config not found');
    }

    // Validate if validator exists
    if (config.validate && !config.validate(block.data)) {
      throw new Error('Block data validation failed');
    }

    // Call onSave if provided
    if (config.onSave) {
      await config.onSave(block);
    }

    // Update block state
    set(state => {
      const blocks = new Map(state.blocks);
      const now = Date.now();

      blocks.set(id, {
        ...block,
        state: 'clean' as BlockState,
        isEditing: false,
        updatedAt: now,
        savedAt: now,
      });

      const editingBlockId =
        state.editingBlockId === id ? null : state.editingBlockId;

      return { blocks, editingBlockId };
    });
  },

  // State queries
  getBlock: id => {
    return get().blocks.get(id);
  },

  getBlocksByType: type => {
    const blocks = Array.from(get().blocks.values());
    return blocks
      .filter(block => block.type === type)
      .sort((a, b) => a.order - b.order);
  },

  canAddBlock: type => {
    const state = get();
    const config = state.configs.get(type);

    if (!config) return false;
    if (!config.maxBlocks) return true;

    const currentCount = state.blockCounts.get(type) || 0;
    return currentCount < config.maxBlocks;
  },

  getEditingBlock: () => {
    const state = get();
    return state.editingBlockId
      ? state.blocks.get(state.editingBlockId)
      : undefined;
  },

  // Reset store
  reset: () => {
    set({
      blocks: new Map(),
      configs: new Map(),
      editingBlockId: null,
      blockCounts: new Map(),
    });
  },
}));
