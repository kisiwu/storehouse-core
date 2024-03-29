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
    let manager;
    const managerArg: ManagerArg<TConfig> = {
      name: arg.name,
      config: arg.config
    };
    if (typeof arg.type === 'string') {
      const mClass = this.#managerClasses.get(arg.type);
      if (mClass) {
        manager = new mClass(managerArg);
      } else {
        throw new Error(
          `Property "type" with value "${arg.type}" is not supported!`
        );
      }
    } else {
      manager = new arg.type(managerArg);
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