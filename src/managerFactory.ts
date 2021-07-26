import { IManager, ManagerSettings, ManagerConstructor } from './manager';

export interface ManagerFactoryArg extends ManagerSettings {
  type: string | ManagerConstructor;
}

export class ManagerFactory {
  #managerClasses: Map<string, ManagerConstructor>;

  constructor() {
    this.#managerClasses = new Map<string, ManagerConstructor>();
  }

  getManager(arg: ManagerFactoryArg): IManager {
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

  setManagerType(managerClass: ManagerConstructor): ManagerFactory {
    this.#managerClasses.set(managerClass.type || managerClass.name, managerClass);
    return this;
  }

  removeManagerType(managerClass: ManagerConstructor | string): boolean {
    let r: boolean;
    if (typeof managerClass === 'string') {
      r = this.#managerClasses.delete(managerClass);
    } else {
      r = this.#managerClasses.delete(managerClass.type || managerClass.name);
    }
    return r;
  }
}