import { debugger as Debug } from '@novice1/logger';
import { EventEmitter } from 'node:events';
import { HealthCheckResult, IManager } from './manager';
import { InvalidManagerConfigError, ManagerAlreadyExistsError, ManagerNotFoundError } from './errors';

const Log = Debug('@storehouse/core:registry');

/**
 * Registry events interface for type-safe event handling
 */
export interface RegistryEvents {
  /**
   * Emitted before a manager is added
   */
  'manager:before:add': { name: string; manager: IManager };
  /**
   * Emitted after a manager is added
   */
  'manager:added': { name: string; manager: IManager };
  /**
   * Emitted after a manager is removed
   */
  'manager:removed': { name: string; manager: IManager };
  /**
   * Emitted when the default manager is changed
   */
  'manager:default:changed': { previous?: string; current: string };
  /**
   * Emitted before a connection is closed
   */
  'connection:before:close': { manager: string };
  /**
   * Emitted after a connection is closed
   */
  'connection:closed': { manager: string };
  /**
   * Emitted when there is an error closing a connection
   */
  'connection:error:close': { manager: string; error: unknown };
  /**
   * Emitted when a connection is accessed
   */
  'connection:accessed': { manager: string; found: boolean };
  /**
   * Emitted before all connections are closed
   */
  'connections:before:close:all': void;
  /**
   * Emitted after all connections are closed
   */
  'connections:closed:all': { count: number };
  /**
   * Emitted when a model is accessed
   */
  'model:accessed': { manager?: string; model: string; found: boolean };
  /**
   * Emitted before the registry is destroyed
   */
  'registry:before:destroy': void;
  /**
   * Emitted after the registry is destroyed
   */
  'registry:destroyed': { count: number };
}

/**
 * Registry for managing multiple database/storage managers
 * Extends EventEmitter to provide lifecycle events
 * @example
 * ```ts
 * const registry = new Registry();
 * registry.addManager('main', new MongoManager());
 * const conn = registry.getConnection('main');
 * await registry.close();
 * ```
 */
export class Registry extends EventEmitter {

  #managers: Map<string, IManager>;
  #defaultManager?: string;

  set defaultManager(name: string) {
    const previous = this.#defaultManager;
    Log.info('Set default manager as "%s"', name);
    this.#defaultManager = name;

    this.emit('manager:default:changed', { previous, current: name });
  }

  get defaultManager(): string {
    const name = this.#defaultManager || 'default';
    return name;
  }

  get managerNames(): string[] {
    return Array.from(this.#managers.keys());
  }

  constructor(managers?: Record<string, IManager>) {
    super();
    this.#managers = new Map<string, IManager>();
    if (managers) {
      this.addManagers(managers);
    }
  }

  /**
   * override EventEmitter.emit to support typed events
   */
  emit<K extends keyof RegistryEvents>(
    event: K,
    ...args: RegistryEvents[K] extends void ? [] : [RegistryEvents[K]]
  ): boolean {
    return super.emit(event, ...args);
  }

  /**
   * override EventEmitter.on to support typed events
   */
  on<K extends keyof RegistryEvents>(
    event: K,
    listener: (args: RegistryEvents[K]) => void
  ): this {
    return super.on(event, listener);
  }

  /**
   * override EventEmitter.once to support typed events
   */
  once<K extends keyof RegistryEvents>(
    event: K,
    listener: (args: RegistryEvents[K]) => void
  ): this {
    return super.once(event, listener);
  }

  /**
   * override EventEmitter.off to support typed events
   */
  off<K extends keyof RegistryEvents>(
    event: K,
    listener: (args: RegistryEvents[K]) => void
  ): this {
    return super.off(event, listener);
  }

  /**
   * Add a manager to the registry
   * @param name - Name of the manager
   * @param manager - Manager instance
   */
  addManager(name: string, manager: IManager): void {
    // Emit before event
    this.emit('manager:before:add', { name, manager });

    if (!name || typeof name !== 'string') {
      throw new InvalidManagerConfigError('Manager name must be a non-empty string');
    }
    if (!manager || typeof manager !== 'object') {
      throw new InvalidManagerConfigError('Manager must be a valid object');
    }
    if (typeof manager.getConnection !== 'function') {
      throw new InvalidManagerConfigError('Manager must implement getConnection method');
    }
    if (this.#managers.has(name)) {
      throw new ManagerAlreadyExistsError(name);
    }
    this.#managers.set(name, manager);
    if (!this.#defaultManager) {
      this.defaultManager = name;
    }

    // Emit after event
    this.emit('manager:added', { name, manager });
  }

  /**
   * Add multiple managers at once
   * @param managers - Object mapping names to manager instances
   */
  addManagers(managers: Record<string, IManager>): void {
    Object.keys(managers).forEach(
      n => this.addManager(n, managers[n])
    );
  }

  /**
   * Get the default manager
   * @template T - Type of the manager
   * @returns The default manager instance or undefined
   */
  getDefaultManager<T extends IManager = IManager>(): T | undefined {
    return <T>this.#managers.get(this.defaultManager);
  }

  /**
   * Check if a manager exists in the registry
   * @param name - Name of the manager to check
   * @returns true if the manager exists
   */
  hasManager(name: string): boolean {
    return this.#managers.has(name);
  }

  /**
   * Get a manager by name
   * @template T - Type of the manager
   * @param name - Name of the manager, defaults to default manager
   * @param throwOnMissing - Whether to throw if manager not found
   * @returns The manager instance or undefined
   * @throws {ManagerNotFoundError} If throwOnMissing is true and manager not found
   */
  getManager<T extends IManager = IManager>(name?: string, throwOnMissing = false): T | undefined {
    const managerName = name ?? this.defaultManager;
    const manager = this.#managers.get(managerName);

    if (!manager && throwOnMissing) {
      throw new ManagerNotFoundError(managerName);
    }

    return <T>manager;
  }

  /**
   * Remove a manager by name
   * @template T - Type of the manager
   * @param name - Name of the manager to remove
   * @returns The removed manager instance or undefined
   */
  removeManager<T extends IManager = IManager>(name: string): T | undefined {
    const r = <T>this.#managers.get(name);
    this.#managers.delete(name);
    if (r) {
      Log.info(`Removed manager "${name}"`);
      this.emit('manager:removed', { name, manager: r });
    }
    return r;
  }

  /**
   * Get the default connection
   * @template T - Type of the connection
   * @returns The default connection or undefined
   */
  getDefaultConnection<T = unknown>(): T | undefined {
    const name = this.defaultManager;
    const connection = <T>this.#managers.get(name)?.getConnection();

    this.emit('connection:accessed', { manager: name, found: !!connection });

    return connection;
  }

  /**
   * Get a connection by manager name
   * @template T - Type of the connection
   * @param manager - Name of the manager, defaults to default manager
   * @returns The connection or undefined
   */
  getConnection<T = unknown>(manager?: string): T | undefined {
    if (typeof manager === 'undefined') {
      return this.getDefaultConnection();
    }

    const connection = <T>this.#managers.get(manager)?.getConnection();

    this.emit('connection:accessed', { manager, found: !!connection });

    return connection;
  }

  /**
   * Close the default connection
   * @template T - Type of the connection
   * @returns The result of the close operation or void
   */
  async closeDefaultConnection<T = unknown>(): Promise<T | void> {
    const managerName = this.defaultManager;
    const managerInstance = this.#managers.get(managerName);

    if (!managerInstance) {
      return;
    }

    // Emit before event
    this.emit('connection:before:close', { manager: managerName });

    try {
      const result = await managerInstance.closeConnection();

      // Emit success event
      this.emit('connection:closed', { manager: managerName });

      return <T>result;
    } catch (error) {
      // Emit error event
      this.emit('connection:error:close', { manager: managerName, error });
      throw error;
    }
  }

  /**
   * Close a connection by manager name
   * @template T - Type of the connection
   * @param manager - Name of the manager, defaults to default manager
   * @returns The result of the close operation or void
   */
  async closeConnection<T = unknown>(manager?: string): Promise<T | void> {
    if (typeof manager === 'undefined') {
      return await this.closeDefaultConnection();
    }

    const managerInstance = this.#managers.get(manager);
    if (!managerInstance) {
      return;
    }

    // Emit before event
    this.emit('connection:before:close', { manager: manager });

    try {
      const result = await managerInstance.closeConnection();

      // Emit success event
      this.emit('connection:closed', { manager: manager });

      return <T>result;
    } catch (error) {
      // Emit error event
      this.emit('connection:error:close', { manager: manager, error });
      throw error;
    }
  }

  /**
   * Closes all connections
   * @returns The number of connections closed
   */
  async closeAllConnections(): Promise<number> {
    this.emit('connections:before:close:all');

    let i = 0;
    for (const m of this.#managers.values()) {
      await m.closeConnection();
      i++;
    }
    Log.info(`Closed ${i} manager(s)`);

    this.emit('connections:closed:all', { count: i });

    return i;
  }

  /**
   * Closes all connections
   * @returns The number of connections closed
   */
  close(): Promise<number> {
    return this.closeAllConnections();
  }

  /**
   * Closes all connections and removes all managers
   */
  async destroy(): Promise<number> {
    this.emit('registry:before:destroy');

    const result = await this.closeAllConnections();
    this.#defaultManager = undefined;
    this.#managers.clear();
    Log.info(`Removed ${result} manager(s)`);

    this.emit('registry:destroyed', { count: result });

    return result;
  }

  /**
   * Get a model from a manager
   * @template ModelType - Type of the model
   * @param manager - Manager name or model name if second param is undefined
   * @param model - Model name (optional)
   * @returns The model instance or undefined
   */
  getModel<ModelType = unknown>(manager: string, model?: string): ModelType | undefined {
    let searchManager: string | undefined;
    let searchModel: string;

    if (typeof model === 'undefined') {
      searchModel = manager;
    } else {
      searchManager = manager;
      searchModel = model;
    }

    const modelResult = <ModelType>this.getManager(searchManager)?.getModel?.(searchModel);

    this.emit('model:accessed', {
      manager: searchManager,
      model: searchModel,
      found: !!modelResult
    });

    return modelResult;
  }

  /**
   * Check if a manager's connection is active
   * @param manager - Name of the manager, defaults to default manager
   * @returns true if connected, false otherwise
   */
  isConnected(manager?: string): boolean {
    const managerInstance = this.getManager(manager);
    return managerInstance?.isConnected?.() ?? false;
  }

  /**
   * Perform health check on a manager
   * @param manager - Name of the manager, defaults to default manager
   * @returns Health check result or undefined if not supported
   */
  async healthCheck(manager?: string): Promise<HealthCheckResult | undefined> {
    const managerInstance = this.getManager(manager);
    if (!managerInstance?.healthCheck) {
      return undefined;
    }
    return await managerInstance.healthCheck();
  }

  /**
   * Perform health checks on all managers
   * @returns Record of health check results keyed by manager name
   */
  async healthCheckAll(): Promise<Record<string, HealthCheckResult>> {
    const results: Record<string, HealthCheckResult> = {};

    for (const [name, manager] of this.#managers.entries()) {
      if (manager.healthCheck) {
        try {
          results[name] = await manager.healthCheck();
        } catch (error) {
          results[name] = {
            healthy: false,
            message: `Health check threw error: ${error instanceof Error ? error.message : String(error)}`,
            timestamp: Date.now()
          };
        }
      }
    }

    return results;
  }
}