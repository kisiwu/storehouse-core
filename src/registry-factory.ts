import { Registry } from './registry';
import { IManager } from './manager';
import { ManagerFactory, ManagerFactoryArg } from './manager-factory';

/**
 * Factory for creating Registry instances with pre-configured managers
 * @example
 * ```ts
 * const factory = new RegistryFactory();
 * factory.getManagerFactory().setManagerType(MongoManager);
 * const registry = factory.getRegistry({
 *   main: { type: 'MongoManager', config: {...} }
 * });
 * ```
 */
export class RegistryFactory {
  #managerFactory: ManagerFactory;

  constructor() {
    this.#managerFactory = new ManagerFactory();
  }

  /**
   * Create manager instances from configuration
   * @private
   * @template TConfig - Type of the configuration object
   * @param arg - Object mapping manager names to their settings
   * @returns Object mapping manager names to manager instances
   */
  #getManagers<TConfig = unknown>(arg: Record<string, ManagerFactoryArg<TConfig>>): Record<string, IManager> {
    const managers: Record<string, IManager> = {};
    for (const name in arg) {
      managers[name] = this.#managerFactory.getManager(arg[name]);
    }
    return managers;
  }

  /**
   * Get the underlying manager factory
   * @returns The manager factory instance
   */
  getManagerFactory(): ManagerFactory {
    return this.#managerFactory;
  }

  /**
   * Create a new Registry with managers created from configuration
   * @template TConfig - Type of the configuration object
   * @param arg - Object mapping manager names to their settings
   * @returns A new Registry instance with configured managers
   */
  getRegistry<TConfig = unknown>(arg: Record<string, ManagerFactoryArg<TConfig>>): Registry {
    const managers = this.#getManagers(arg);
    return new Registry(managers);
  }
}