import { InvalidManagerConfigError, ManagerTypeNotFoundError } from './errors';
import { IManager, ManagerSettings, ManagerConstructor, ManagerArg } from './manager';

/**
 * Settings required to create a manager via the factory
 * @template TConfig - Type of the configuration object
 */
export interface ManagerFactorySettings<TConfig = unknown> extends ManagerSettings<TConfig> {
  type: string | ManagerConstructor<TConfig>;
}

/**
 * Complete arguments passed to the factory to create a manager
 * @template TConfig - Type of the configuration object
 */
export interface ManagerFactoryArg<TConfig = unknown>
  extends ManagerFactorySettings<TConfig>, ManagerArg<TConfig> {
}

/**
 * Factory for creating manager instances from registered classes
 * @example
 * ```ts
 * const factory = new ManagerFactory();
 * factory.setManagerType(MongoManager);
 * const manager = factory.getManager({ type: 'MongoManager', config: {...} });
 * ```
 */
export class ManagerFactory {
  #managerClasses: Map<string, ManagerConstructor>;

  constructor() {
    this.#managerClasses = new Map<string, ManagerConstructor>();
  }

  /**
   * Create a manager instance from factory settings
   * @template TConfig - Type of the configuration object
   * @param arg - Settings including type and config
   * @returns A new manager instance
   * @throws {InvalidManagerConfigError} If arguments are invalid
   * @throws {ManagerTypeNotFoundError} If manager type is not registered
   */
  getManager<TConfig = unknown>(arg: ManagerFactoryArg<TConfig>): IManager {
    if (!arg || typeof arg !== 'object') {
      throw new InvalidManagerConfigError('Manager factory argument must be a valid object');
    }
    if (!arg.type) {
      throw new InvalidManagerConfigError('Manager type is required');
    }

    let manager;
    const managerArg: ManagerArg<TConfig> = {
      name: arg.name,
      config: arg.config
    };
    if (typeof arg.type === 'string') {
      const mClass = this.#managerClasses.get(arg.type);
      if (!mClass) {
        throw new ManagerTypeNotFoundError(arg.type);
      }
      manager = new mClass(managerArg);
    } else {
      try {
        manager = new arg.type(managerArg);
      } catch (error) {
        throw new InvalidManagerConfigError(
          `Failed to instantiate manager: ${error instanceof Error ? error.message : String(error)}`
        );
      }
    }
    return manager;
  }

  /**
   * Register a manager class with the factory
   * @template TConfig - Type of the configuration object
   * @param managerClass - The manager class to register
   * @returns This factory instance for chaining
   * @example
   * ```ts
   * factory.setManagerType(MongoManager).setManagerType(PGManager);
   * ```
   */
  setManagerType<TConfig = unknown>(managerClass: ManagerConstructor<TConfig>): this {
    this.#managerClasses.set(managerClass.type || managerClass.name, <ManagerConstructor>managerClass);
    return this;
  }

  /**
   * Remove a registered manager type from the factory
   * @template TConfig - Type of the configuration object
   * @param managerClass - The manager class or type string to remove
   * @returns true if the type was removed, false if it wasn't registered
   */
  removeManagerType<TConfig = unknown>(managerClass: ManagerConstructor<TConfig> | string): boolean {
    let r: boolean;
    if (typeof managerClass === 'string') {
      r = this.#managerClasses.delete(managerClass);
    } else {
      r = this.#managerClasses.delete(managerClass.type || managerClass.name);
    }
    return r;
  }
}