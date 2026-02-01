
/**
 * Result returned by health check operations
 */
export interface HealthCheckResult {
  /** Whether the connection is healthy */
  healthy: boolean;
  /** Human-readable status message */
  message?: string;
  /** Additional diagnostic information */
  details?: Record<string, unknown>;
  /** Response time in milliseconds */
  latency?: number;
  /** Unix timestamp when the check was performed */
  timestamp: number;
}

/**
 * Interface that all managers must implement to work with Storehouse
 * @example
 * ```ts
 * class MyManager implements IManager {
 *   getConnection() { return this.client; }
 *   async closeConnection() { await this.client.close(); }
 *   getModel(name: string) { return this.models.get(name); }
 * }
 * ```
 */
export interface IManager {
  /**
   * Get the underlying connection/client instance
   * @returns The connection object (database client, pool, etc.)
   */
  getConnection(): unknown;

  /**
   * Close the connection gracefully
   * @returns Promise that resolves when connection is closed, or void for synchronous close
   */
  closeConnection(): Promise<unknown> | void;

  /**
   * Get a model by name (optional)
   * @param name - The name of the model to retrieve
   * @returns The model instance or undefined if not found
   */
  getModel?(name: string): unknown;

  /**
   * Check if the connection is healthy and responsive (optional)
   * @returns Health check result with status and optional details
   */
  healthCheck?(): Promise<HealthCheckResult> | HealthCheckResult;

  /**
   * Check if the connection is currently connected/active (optional)
   * @returns true if connected, false otherwise
   */
  isConnected?(): boolean;
}

/**
 * Settings passed to manager constructors
 * @template TConfig - Type of the configuration object
 */
export interface ManagerSettings<TConfig = unknown> {
  /** Optional configuration specific to the manager type */
  config?: TConfig;
}

/**
 * Arguments passed to manager constructors, including the manager name
 * @template TConfig - Type of the configuration object
 */
export interface ManagerArg<TConfig = unknown> extends ManagerSettings<TConfig> {
  /** Optional name for the manager instance */
  name?: string;
}

/**
 * Constructor type for manager classes
 * @template TConfig - Type of the configuration object
 */
export type ManagerConstructor<TConfig = unknown> = {
  /** Constructor that creates a new manager instance */
  new(settings: Partial<ManagerArg<TConfig>>): IManager;
  /** Optional type identifier for the manager class */
  readonly type?: string;
};