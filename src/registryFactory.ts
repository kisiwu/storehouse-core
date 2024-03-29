import { Registry } from './registry';
import { IManager } from './manager';
import { ManagerFactory, ManagerFactoryArg } from './managerFactory';

export class RegistryFactory {
  #managerFactory: ManagerFactory;

  constructor() {
    this.#managerFactory = new ManagerFactory();
  }

  getManagerFactory(): ManagerFactory {
    return this.#managerFactory;
  }

  private _getManagers<TConfig = unknown>(arg: Record<string, ManagerFactoryArg<TConfig>>): Record<string, IManager> {
    const managers: Record<string, IManager> = {};
    for (const name in arg) {
      managers[name] = this.#managerFactory.getManager(arg[name]);
    }
    return managers;
  }

  getRegistry<TConfig = unknown>(arg: Record<string, ManagerFactoryArg<TConfig>>): Registry {
    const managers = this._getManagers(arg);
    return new Registry(managers);
  }
}