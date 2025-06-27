import React, { useEffect, useRef, useCallback, KeyboardEvent } from 'react';
import {
  DndContext,
  DragEndEvent,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  closestCenter,
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

import { useBlockStore } from './store';
import type { Block, BlockManagerProps, BlockConfig } from './types';
import { sortBlocksByOrder } from './utils';

// Individual sortable block component
interface SortableBlockProps<T = unknown> {
  block: Block<T>;
  config: BlockConfig<T>;
  onError?: (error: Error) => void;
}

function SortableBlock<T>({ block, config, onError }: SortableBlockProps<T>) {
  const store = useBlockStore();
  const blockRef = useRef<HTMLDivElement>(null);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: block.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  // Handle keyboard events for edit mode
  const handleKeyDown = useCallback(
    (e: KeyboardEvent<HTMLDivElement>) => {
      if (e.key === 'Enter' && !block.isEditing) {
        e.preventDefault();
        store.enableBlockEdit(block.id);
      }
    },
    [block.id, block.isEditing, store]
  );

  // Handle click to edit
  const handleClick = useCallback(() => {
    if (!block.isEditing) {
      store.enableBlockEdit(block.id);
    }
  }, [block.id, block.isEditing, store]);

  // Handle data changes
  const handleChange = useCallback(
    (data: unknown) => {
      store.updateBlockData(block.id, data);
    },
    [block.id, store]
  );

  // Handle save
  const handleSave = useCallback(async () => {
    try {
      await store.saveBlock(block.id);
    } catch (error) {
      onError?.(error as Error);
    }
  }, [block.id, store, onError]);

  // Handle cancel
  const handleCancel = useCallback(() => {
    store.disableBlockEdit(block.id);
  }, [block.id, store]);

  // Focus on edit mode
  useEffect(() => {
    if (block.isEditing && blockRef.current) {
      blockRef.current.focus();
    }
  }, [block.isEditing]);

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="block-container"
      tabIndex={block.isEditing ? -1 : 0}
      onKeyDown={handleKeyDown}
      onClick={handleClick}
      role="article"
      aria-label={`${config.displayName} ${block.order + 1}`}
    >
      <div ref={blockRef}>
        {block.isEditing
          ? config.renderEdit({
              block,
              onChange: handleChange,
              onSave: handleSave,
              onCancel: handleCancel,
            })
          : config.renderView({
              block,
              isDragging,
            })}
      </div>
    </div>
  );
}

// Main BlockManager component
export function BlockManager<T = unknown>({
  type,
  config,
  className,
  onError,
}: BlockManagerProps<T>): React.ReactElement {
  const store = useBlockStore();
  const containerRef = useRef<HTMLDivElement>(null);

  // Register config on mount
  useEffect(() => {
    store.registerConfig(config);
    return () => {
      store.unregisterConfig(type);
    };
  }, [type]); // Only depend on type, not config object

  // Get blocks for this type
  const blocks = store.getBlocksByType(type);
  const canAdd = store.canAddBlock(type);

  // DnD sensors
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Handle drag end
  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;

      if (over && active.id !== over.id) {
        const activeBlock = blocks.find(b => b.id === active.id);
        const overBlock = blocks.find(b => b.id === over.id);

        if (activeBlock && overBlock) {
          store.moveBlock(activeBlock.id, overBlock.order);
        }
      }
    },
    [blocks, store]
  );

  // Add new block
  const handleAddBlock = useCallback(() => {
    try {
      const blockId = store.addBlock(type);
      if (blockId) {
        // Auto-focus new block
        setTimeout(() => {
          store.enableBlockEdit(blockId);
        }, 100);
      }
    } catch (error) {
      onError?.(error as Error);
    }
  }, [store, type, onError]);

  // Handle keyboard navigation between blocks
  const handleContainerKeyDown = useCallback(
    (e: KeyboardEvent<HTMLDivElement>) => {
      const target = e.target as HTMLElement;
      const blockElements = Array.from(
        containerRef.current?.querySelectorAll('[role="article"]') || []
      );

      const currentIndex = blockElements.indexOf(target);

      if (
        e.key === 'Tab' &&
        !e.shiftKey &&
        currentIndex === blockElements.length - 1
      ) {
        // Tab from last block - focus add button if available
        const addButton = containerRef.current?.querySelector(
          '[aria-label="Add block"]'
        ) as HTMLElement;
        if (addButton && canAdd) {
          e.preventDefault();
          addButton.focus();
        }
      }
    },
    [canAdd]
  );

  const sortedBlocks = sortBlocksByOrder(blocks);

  return (
    <div
      ref={containerRef}
      className={className}
      onKeyDown={handleContainerKeyDown}
    >
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={sortedBlocks.map(b => b.id)}
          strategy={verticalListSortingStrategy}
        >
          {sortedBlocks.map(block => (
            <SortableBlock<T>
              key={block.id}
              block={block as Block<T>}
              config={config}
              onError={onError}
            />
          ))}
        </SortableContext>
      </DndContext>

      {canAdd && (
        <button
          onClick={handleAddBlock}
          aria-label="Add block"
          className="add-block-button"
        >
          Add {config.displayName}
        </button>
      )}
    </div>
  );
}
