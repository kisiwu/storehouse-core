import { Registry } from './registry';
import { ManagerFactory, ManagerFactoryArg } from './managerFactory';
import {  ManagerConstructor } from './manager';

class Storehouse extends Registry {
  #managerFactory: ManagerFactory;

  constructor(managerFactory?: ManagerFactory) {
    super();
    this.#managerFactory = managerFactory || new ManagerFactory();
  }

  setManagerType(managerClass: ManagerConstructor): Storehouse {
    this.#managerFactory.setManagerType(managerClass);
    return this;
  }

  add(arg: Record<string, ManagerFactoryArg>): Storehouse {
    for (const name in arg) {
      this.addManager(name, this.#managerFactory.getManager(arg[name]));
    }
    return this;
  }
}

export = new Storehouse();