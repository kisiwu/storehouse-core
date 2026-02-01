import { InvalidManagerConfigError, ManagerTypeNotFoundError } from './errors';
import { IManager, ManagerSettings, ManagerConstructor, ManagerArg } from './manager';

export interface ManagerFactorySettings<TConfig = unknown> extends ManagerSettings<TConfig> {
  type: string | ManagerConstructor<TConfig>;
}

export interface ManagerFactoryArg<TConfig = unknown>
  extends ManagerFactorySettings<TConfig>, ManagerArg<TConfig> {
}

export class ManagerFactory {
  #managerClasses: Map<string, ManagerConstructor>;

  constructor() {
    this.#managerClasses = new Map<string, ManagerConstructor>();
  }

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

  setManagerType<TConfig = unknown>(managerClass: ManagerConstructor<TConfig>): ManagerFactory {
    this.#managerClasses.set(managerClass.type || managerClass.name, <ManagerConstructor>managerClass);
    return this;
  }

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