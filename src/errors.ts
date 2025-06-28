// Custom error classes for better debugging

export class BlockPartyError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'BlockPartyError';
    Object.setPrototypeOf(this, BlockPartyError.prototype);
  }
}

export class ConfigNotFoundError extends BlockPartyError {
  constructor(public type: string) {
    super(`No config registered for block type: "${type}"`);
    this.name = 'ConfigNotFoundError';
  }
}

export class BlockNotFoundError extends BlockPartyError {
  constructor(public id: string) {
    super(`Block not found: "${id}"`);
    this.name = 'BlockNotFoundError';
  }
}

export class BlockLimitError extends BlockPartyError {
  constructor(public type: string, public limit: number) {
    super(`Cannot add more blocks of type "${type}". Limit: ${limit}`);
    this.name = 'BlockLimitError';
  }
}

export class InvalidBlockDataError extends BlockPartyError {
  constructor(public id: string, public reason: string) {
    super(`Invalid data for block "${id}": ${reason}`);
    this.name = 'InvalidBlockDataError';
  }
}

export class BlockSaveError extends BlockPartyError {
  constructor(public id: string, public originalError: unknown) {
    const errorMessage =
      originalError instanceof Error
        ? originalError.message
        : String(originalError);
    super(`Failed to save block "${id}": ${errorMessage}`);
    this.name = 'BlockSaveError';
    this.cause = originalError;
  }
}

export class DragDropError extends BlockPartyError {
  constructor(public reason: string) {
    super(`Drag and drop error: ${reason}`);
    this.name = 'DragDropError';
  }
}

export class BlockValidationError extends BlockPartyError {
  constructor(public id: string, public data: unknown) {
    super(`Validation failed for block "${id}"`);
    this.name = 'BlockValidationError';
  }
}

export class BlockEditError extends BlockPartyError {
  constructor(public id: string, public reason: string) {
    super(`Cannot edit block "${id}": ${reason}`);
    this.name = 'BlockEditError';
  }
}
