import { Registry } from './registry';
import { ManagerFactory, ManagerFactorySettings } from './manager-factory';
import { ManagerConstructor } from './manager';

export * from './errors';
export * from './manager-factory';
export * from './manager';
export * from './registry-factory';
export * from './registry';

/**
 * Extended Registry with built-in manager factory support
 * @example
 * ```ts
 * const storehouse = new StorehouseRegistry();
 * storehouse.setManagerType(MongoManager);
 * storehouse.add({ main: { type: 'MongoManager' } });
 * ```
 */
export class StorehouseRegistry extends Registry {
  #managerFactory: ManagerFactory;

  /**
   * Create a new Storehouse registry
   * @param managerFactory - Optional manager factory instance, creates new one if not provided
   */
  constructor(managerFactory?: ManagerFactory) {
    super();
    this.#managerFactory = managerFactory || new ManagerFactory();
  }

  /**
   * Register a manager class for use with string-based type references
   * @template TConfig - Type of the configuration object
   * @param managerClass - The manager class to register
   * @returns This instance for chaining
   * @example
   * ```ts
   * Storehouse.setManagerType(MongoManager).setManagerType(PGManager);
   * ```
   */
  setManagerType<TConfig = unknown>(managerClass: ManagerConstructor<TConfig>): this {
    this.#managerFactory.setManagerType(managerClass);
    return this;
  }

  /**
   * Add managers to the registry from configuration
   * @template TConfig - Type of the configuration object
   * @param arg - Object mapping manager names to their factory settings
   * @returns This instance for chaining
   * @example
   * ```ts
   * Storehouse.add({
   *   main: { type: 'MongoManager', config: { url: '...' } },
   *   cache: { type: 'RedisManager', config: { host: '...' } }
   * });
   * ```
   */
  add<TConfig = unknown>(arg: Record<string, ManagerFactorySettings<TConfig>>): this {
    for (const name in arg) {
      this.addManager(name, this.#managerFactory.getManager({ ...arg[name], name }));
    }
    return this;
  }
}

/**
 * Default Storehouse singleton instance
 * Ready to use for most applications
 * @example
 * ```ts
 * import { Storehouse } from '@storehouse/core';
 * 
 * Storehouse.setManagerType(MyManager);
 * Storehouse.add({ main: { type: 'MyManager' } });
 * await Storehouse.close();
 * ```
 */
export const Storehouse = new StorehouseRegistry();