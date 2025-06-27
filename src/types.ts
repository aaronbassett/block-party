import { ReactElement } from 'react';
import { z } from 'zod';

// Block state types
export type BlockState = 'empty' | 'dirty' | 'clean';

// Core block interface with state management
export interface Block<T = unknown> {
  id: string;
  type: string;
  data: T;
  order: number;

  // State tracking
  state: BlockState;
  isEditing: boolean;

  // Timestamps
  createdAt: number;
  updatedAt: number;
  savedAt?: number;
}

// Block configuration for each block type
export interface BlockConfig<T = unknown> {
  type: string;
  displayName: string;
  maxBlocks?: number;

  // Render functions
  renderView: (props: BlockRenderProps<T>) => ReactElement;
  renderEdit: (props: BlockEditProps<T>) => ReactElement;

  // Lifecycle functions
  createDefault: () => T;
  validate?: (data: T) => boolean;
  onSave?: (block: Block<T>) => Promise<void>;
}

// Props for view rendering
export interface BlockRenderProps<T = unknown> {
  block: Block<T>;
  isDragging?: boolean;
}

// Props for edit rendering
export interface BlockEditProps<T = unknown> {
  block: Block<T>;
  onChange: (data: T) => void;
  onSave: () => void;
  onCancel: () => void;
}

// BlockManager component props
export interface BlockManagerProps<T = unknown> {
  type: string;
  config: BlockConfig<T>;
  className?: string;
  onError?: (error: Error) => void;
}

// Minimal Zod schemas for critical validation
export const BlockSchema = z.object({
  id: z.string(),
  type: z.string(),
  data: z.unknown(),
  order: z.number().int().min(0),
  state: z.enum(['empty', 'dirty', 'clean']),
  isEditing: z.boolean(),
  createdAt: z.number(),
  updatedAt: z.number(),
  savedAt: z.number().optional(),
});

export const BlockConfigSchema = z.object({
  type: z.string(),
  displayName: z.string(),
  maxBlocks: z.number().int().positive().optional(),
  renderView: z.function(),
  renderEdit: z.function(),
  createDefault: z.function(),
  validate: z.function().optional(),
  onSave: z.function().optional(),
});

// Type guards
export const isBlock = (value: unknown): value is Block => {
  return BlockSchema.safeParse(value).success;
};

export const isBlockConfig = (value: unknown): value is BlockConfig => {
  return BlockConfigSchema.safeParse(value).success;
};
