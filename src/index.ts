import { Registry } from './registry';
import { ManagerFactory, ManagerFactorySettings } from './manager-factory';
import {  ManagerConstructor } from './manager';

export * from './errors';
export * from './manager-factory';
export * from './manager';
export * from './registry-factory';
export * from './registry';

export class StorehouseRegistry extends Registry {
  #managerFactory: ManagerFactory;

  constructor(managerFactory?: ManagerFactory) {
    super();
    this.#managerFactory = managerFactory || new ManagerFactory();
  }

  setManagerType<TConfig = unknown>(managerClass: ManagerConstructor<TConfig>): this {
    this.#managerFactory.setManagerType(managerClass);
    return this;
  }

  add<TConfig = unknown>(arg: Record<string, ManagerFactorySettings<TConfig>>): this {
    for (const name in arg) {
      this.addManager(name, this.#managerFactory.getManager({...arg[name], name}));
    }
    return this;
  }
}

export const Storehouse = new StorehouseRegistry();