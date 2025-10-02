import { Registry } from './registry';
import { IManager } from './manager';
import { ManagerFactory, ManagerFactoryArg } from './manager-factory';

export class RegistryFactory {
  #managerFactory: ManagerFactory;

  constructor() {
    this.#managerFactory = new ManagerFactory();
  }

  #getManagers<TConfig = unknown>(arg: Record<string, ManagerFactoryArg<TConfig>>): Record<string, IManager> {
    const managers: Record<string, IManager> = {};
    for (const name in arg) {
      managers[name] = this.#managerFactory.getManager(arg[name]);
    }
    return managers;
  }

  getManagerFactory(): ManagerFactory {
    return this.#managerFactory;
  }

  getRegistry<TConfig = unknown>(arg: Record<string, ManagerFactoryArg<TConfig>>): Registry {
    const managers = this.#getManagers(arg);
    return new Registry(managers);
  }
}