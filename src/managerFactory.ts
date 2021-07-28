import { IManager, ManagerSettings, ManagerConstructor } from './manager';

export interface ManagerFactoryArg<TDatabase = unknown, TOptions = unknown, TModels = unknown> extends ManagerSettings<TDatabase, TOptions, TModels> {
  type: string | ManagerConstructor<TDatabase, TOptions, TModels>;
}

export class ManagerFactory {
  #managerClasses: Map<string, ManagerConstructor>;

  constructor() {
    this.#managerClasses = new Map<string, ManagerConstructor>();
  }

  getManager<TDatabase = unknown, TOptions = unknown, TModels = unknown>(arg: ManagerFactoryArg<TDatabase, TOptions, TModels>): IManager {
    let manager;
    if (typeof arg.type === 'string') {
      const mClass = this.#managerClasses.get(arg.type);
      if (mClass) {
        manager = new mClass({
          database: arg.database,
          options: arg.options,
          models: arg.models
        });
      } else {
        throw new Error(
          `Property "manager" with value "${arg.type}" is not supported!`
        );
      }
    } else {
      manager = new arg.type({
        database: arg.database,
        options: arg.options,
        models: arg.models
      });
    }
    return manager;
  }

  setManagerType<TDatabase = unknown, TOptions = unknown, TModels = unknown>(managerClass: ManagerConstructor<TDatabase, TOptions, TModels>): ManagerFactory {
    this.#managerClasses.set(managerClass.type || managerClass.name, <ManagerConstructor>managerClass);
    return this;
  }

  removeManagerType<TDatabase = unknown, TOptions = unknown, TModels = unknown>(managerClass: ManagerConstructor<TDatabase, TOptions, TModels> | string): boolean {
    let r: boolean;
    if (typeof managerClass === 'string') {
      r = this.#managerClasses.delete(managerClass);
    } else {
      r = this.#managerClasses.delete(managerClass.type || managerClass.name);
    }
    return r;
  }
}