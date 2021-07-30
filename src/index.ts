import { Registry } from './registry';
import { ManagerFactory, ManagerFactorySettings } from './managerFactory';
import {  ManagerConstructor } from './manager';

class Storehouse extends Registry {
  #managerFactory: ManagerFactory;

  constructor(managerFactory?: ManagerFactory) {
    super();
    this.#managerFactory = managerFactory || new ManagerFactory();
  }

  setManagerType<TConfig = unknown>(managerClass: ManagerConstructor<TConfig>): Storehouse {
    this.#managerFactory.setManagerType(managerClass);
    return this;
  }

  add<TConfig = unknown>(arg: Record<string, ManagerFactorySettings<TConfig>>): Storehouse {
    for (const name in arg) {
      this.addManager(name, this.#managerFactory.getManager({...arg[name], name}));
    }
    return this;
  }
}

export = new Storehouse();