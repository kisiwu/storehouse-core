/**
 * Base error class for all Storehouse errors
 */
export class StorehouseError extends Error {
  /**
   * @param message - Error message
   */
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
  /**
   * @param managerName - Name of the manager that already exists
   */
  constructor(managerName: string) {
    super(`Manager "${managerName}" already exists!`);
  }
}

/**
 * Thrown when a manager is not found in the registry
 */
export class ManagerNotFoundError extends StorehouseError {
  /**
   * @param managerName - Name of the manager that was not found
   */
  constructor(managerName: string) {
    super(`Manager "${managerName}" not found`);
  }
}

/**
 * Thrown when a manager type is not registered
 */
export class ManagerTypeNotFoundError extends StorehouseError {
  /**
   * @param type - The manager type that was not found
   */
  constructor(type: string) {
    super(`Property "type" with value "${type}" is not supported!`);
  }
}

/**
 * Thrown when a model is not found
 */
export class ModelNotFoundError extends StorehouseError {
  /**
   * @param modelName - Name of the model that was not found
   * @param managerName - Optional name of the manager where the model was not found
   */
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
  /**
   * @param message - Description of the invalid configuration
   */
  constructor(message: string) {
    super(`Invalid manager configuration: ${message}`);
  }
}

/**
 * Thrown when a connection fails
 */
export class ConnectionError extends StorehouseError {
  /**
   * @param message - Error message
   * @param cause - Optional underlying error that caused the connection failure
   */
  constructor(message: string, public readonly cause?: Error) {
    super(message);
  }
}