/**
 * Base error class for all Storehouse errors
 */
export class StorehouseError extends Error {
  constructor(message: string) {
    super(message);
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Thrown when a manager with the same name already exists
 */
export class ManagerAlreadyExistsError extends StorehouseError {
  constructor(managerName: string) {
    super(`Manager "${managerName}" already exists!`);
  }
}

/**
 * Thrown when a manager is not found in the registry
 */
export class ManagerNotFoundError extends StorehouseError {
  constructor(managerName: string) {
    super(`Manager "${managerName}" not found`);
  }
}

/**
 * Thrown when a manager type is not registered
 */
export class ManagerTypeNotFoundError extends StorehouseError {
  constructor(type: string) {
    super(`Property "type" with value "${type}" is not supported!`);
  }
}

/**
 * Thrown when a model is not found
 */
export class ModelNotFoundError extends StorehouseError {
  constructor(modelName: string, managerName?: string) {
    super(
      managerName 
        ? `Model "${modelName}" not found in manager "${managerName}"` 
        : `Model "${modelName}" not found`
    );
  }
}

/**
 * Thrown when manager configuration is invalid
 */
export class InvalidManagerConfigError extends StorehouseError {
  constructor(message: string) {
    super(`Invalid manager configuration: ${message}`);
  }
}

/**
 * Thrown when a connection fails
 */
export class ConnectionError extends StorehouseError {
  constructor(message: string, public readonly cause?: Error) {
    super(message);
  }
}