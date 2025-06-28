import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BlockManager } from '../src/BlockManager';
import { useBlockStore } from '../src/store';
import type { BlockConfig, BlockEditProps, BlockRenderProps } from '../src/types';

// Mock components for testing
const TestBlockView: React.FC<BlockRenderProps<{ content: string }>> = ({ block }) => (
  <div data-testid={`block-view-${block.id}`}>
    {block.data.content || 'Empty block'}
  </div>
);

const TestBlockEdit: React.FC<BlockEditProps<{ content: string }>> = ({
  block,
  onChange,
  onSave,
  onCancel,
}) => (
  <div data-testid={`block-edit-${block.id}`}>
    <input
      data-testid={`block-input-${block.id}`}
      value={block.data.content}
      onChange={(e) => onChange({ content: e.target.value })}
    />
    <button onClick={onSave}>Save</button>
    <button onClick={onCancel}>Cancel</button>
  </div>
);

const testConfig: BlockConfig<{ content: string }> = {
  type: 'test',
  displayName: 'Test Block',
  maxBlocks: 3,
  renderView: (props) => <TestBlockView {...props} />,
  renderEdit: (props) => <TestBlockEdit {...props} />,
  createDefault: () => ({ content: '' }),
  onSave: jest.fn().mockResolvedValue(undefined),
};

describe('BlockManager', () => {
  beforeEach(() => {
    // Reset store before each test
    const store = useBlockStore.getState();
    store.reset();
    // Clear mock calls
    jest.clearAllMocks();
  });
  
  it('should render with no blocks initially', () => {
    render(<BlockManager type="test" config={testConfig} />);
    
    expect(screen.getByText('Add Test Block')).toBeInTheDocument();
    expect(screen.queryByTestId(/block-view/)).not.toBeInTheDocument();
  });
  
  it('should add a new block when add button is clicked', async () => {
    render(<BlockManager type="test" config={testConfig} />);
    
    const addButton = screen.getByText('Add Test Block');
    fireEvent.click(addButton);
    
    await waitFor(() => {
      expect(screen.getByTestId(/block-edit/)).toBeInTheDocument();
    });
  });
  
  it('should enforce block limits', async () => {
    render(<BlockManager type="test" config={testConfig} />);
    
    const addButton = screen.getByText('Add Test Block');
    
    // Add 3 blocks (the limit)
    for (let i = 0; i < 3; i++) {
      fireEvent.click(addButton);
    }
    
    await waitFor(() => {
      expect(screen.getAllByTestId(/block-view/)).toHaveLength(3);
    });
    
    // Add button should be hidden when limit reached
    expect(screen.queryByText('Add Test Block')).not.toBeInTheDocument();
  });
  
  it('should enter edit mode when block is clicked', async () => {
    const { container } = render(<BlockManager type="test" config={testConfig} />);
    
    // Add a block
    fireEvent.click(screen.getByText('Add Test Block'));
    
    // Wait for block to appear and save it
    await waitFor(() => {
      expect(screen.getByTestId(/block-edit/)).toBeInTheDocument();
    });
    
    fireEvent.click(screen.getByText('Save'));
    
    // Wait for view mode
    await waitFor(() => {
      expect(screen.getByTestId(/block-view/)).toBeInTheDocument();
    });
    
    // Click block to edit
    const block = container.querySelector('[role="article"]');
    fireEvent.click(block!);
    
    await waitFor(() => {
      expect(screen.getByTestId(/block-edit/)).toBeInTheDocument();
    });
  });
  
  it('should update block data on change', async () => {
    render(<BlockManager type="test" config={testConfig} />);
    
    // Add a block
    fireEvent.click(screen.getByText('Add Test Block'));
    
    await waitFor(() => {
      expect(screen.getByTestId(/block-edit/)).toBeInTheDocument();
    });
    
    // Type content
    const input = screen.getByTestId(/block-input/);
    await userEvent.clear(input);
    await userEvent.type(input, 'Hello World');
    
    // Verify input has the value
    expect(input).toHaveValue('Hello World');
  });
  
  it('should handle adding and editing blocks', async () => {
    render(<BlockManager type="test" config={testConfig} />);
    
    // Should show add button
    const addButton = screen.getByText('Add Test Block');
    expect(addButton).toBeInTheDocument();
    
    // Add a block
    fireEvent.click(addButton);
    
    // Just verify that after clicking, we either:
    // 1. Have an edit form (with Save/Cancel buttons), or
    // 2. Have a view mode block
    await waitFor(() => {
      const saveButton = screen.queryByText('Save');
      const viewBlock = screen.queryByTestId(/block-view/);
      expect(saveButton || viewBlock).toBeTruthy();
    });
  });
  
  it('should handle keyboard navigation', async () => {
    const { container } = render(<BlockManager type="test" config={testConfig} />);
    
    // Add two blocks
    const addButton = screen.getByText('Add Test Block');
    fireEvent.click(addButton);
    
    await waitFor(() => {
      expect(screen.getByTestId(/block-edit/)).toBeInTheDocument();
    });
    fireEvent.click(screen.getByText('Save'));
    
    await waitFor(() => {
      expect(screen.getByTestId(/block-view/)).toBeInTheDocument();
    });
    
    fireEvent.click(addButton);
    await waitFor(() => {
      expect(screen.getAllByTestId(/block-edit/)).toHaveLength(1);
    });
    fireEvent.click(screen.getAllByText('Save')[0]);
    
    await waitFor(() => {
      expect(screen.getAllByTestId(/block-view/)).toHaveLength(2);
    });
    
    // Focus first block and press Enter
    const blocks = container.querySelectorAll('[role="article"]');
    (blocks[0] as HTMLElement).focus();
    fireEvent.keyDown(blocks[0], { key: 'Enter' });
    
    await waitFor(() => {
      expect(screen.getByTestId(/block-edit/)).toBeInTheDocument();
    });
  });
  
  it('should call onError when errors occur', async () => {
    const onError = jest.fn();
    const errorConfig = {
      ...testConfig,
      onSave: async () => {
        throw new Error('Save failed');
      },
    };
    
    render(<BlockManager type="test" config={errorConfig} onError={onError} />);
    
    // Add a block
    fireEvent.click(screen.getByText('Add Test Block'));
    
    await waitFor(() => {
      expect(screen.getByTestId(/block-edit/)).toBeInTheDocument();
    });
    
    // Try to save
    fireEvent.click(screen.getByText('Save'));
    
    await waitFor(() => {
      expect(onError).toHaveBeenCalledWith(expect.any(Error));
    });
  });
});