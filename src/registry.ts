import {debugger as Debug} from '@novice1/logger';
import { IManager } from './manager';

const Log = Debug('@storehouse/core:registry');

export class Registry {

  #managers: Map<string, IManager>;
  #defaultManager?: string;

  set defaultManager(name: string) {
    Log.info('Set default manager as "%s"', name);
    this.#defaultManager = name
  }

  get defaultManager(): string {
    const name = this.#defaultManager || 'default';
    return name;
  }

  get managerNames(): string[] {
    return Array.from(this.#managers.keys());
  }

  constructor(managers?: Record<string, IManager>) {
    this.#managers = new Map<string, IManager>();
    if (managers) {
      this.addManagers(managers);
    }
  }

  addManager(name: string, manager: IManager): void {
    if (!this.#managers.has(name)) {
      this.#managers.set(name, manager);
      if (!this.#defaultManager) {
        this.defaultManager = name;
      }
    } else {
      throw new Error(`Manager "${name}" already exists!`)
    }
  }

  addManagers(managers: Record<string, IManager>): void {
    Object.keys(managers).forEach(
      n => this.addManager(n, managers[n])
    );
  }

  getDefaultManager<T extends IManager = IManager>(): T | undefined {
    return <T>this.#managers.get(this.defaultManager);
  }

  hasManager(name: string): boolean {
    return this.#managers.has(name);
  }

  getManager<T extends IManager = IManager>(name?: string): T | undefined {
    if (typeof name === 'undefined') {
      return this.getDefaultManager<T>();
    }

    return <T>this.#managers.get(name);
  }

  removeManager<T extends IManager = IManager>(name: string): T | undefined {
    const r = <T>this.#managers.get(name);
    this.#managers.delete(name);
    if (r) {
      Log.info(`Removed manager "${name}"`);
    }
    return r;
  }

  getDefaultConnection<T = unknown>(): T | undefined {
    const name = this.defaultManager;
    return <T>this.#managers.get(name)?.getConnection();
  }

  getConnection<T = unknown>(manager?: string): T | undefined {
    if (typeof manager === 'undefined') {
      return this.getDefaultConnection();
    }
    return <T>this.#managers.get(manager)?.getConnection();
  }

  closeDefaultConnection<T = unknown>(): Promise<T> | void {
    const name = this.defaultManager;
    return <Promise<T> | void>this.#managers.get(name)?.closeConnection();
  }

  closeConnection<T = unknown>(manager?: string): Promise<T> | void {
    if (typeof manager === 'undefined') {
      return this.closeDefaultConnection();
    }
    return <Promise<T> | void>this.#managers.get(manager)?.closeConnection();
  }

  /**
   * Closes all connections
   * @returns The number of connections closed
   */
  async closeAllConnections(): Promise<number> {
    let i = 0;
    for (const m of this.#managers.values()) {
      await m.closeConnection();
      i++;
    }
    Log.info(`Closed ${i} manager(s)`);
    return i;
  }

  /**
   * Closes all connections
   * @returns The number of connections closed
   */
  close(): Promise<number> {
    return this.closeAllConnections();
  }

  /**
   * Closes all connections and removes all managers
   */
  async destroy(): Promise<number> {
    const result = await this.closeAllConnections();
    this.#defaultManager = undefined;
    this.#managers.clear();
    Log.info(`Removed ${result} manager(s)`);
    return result;
  }

  getModel<ModelType = unknown>(manager: string, model?: string): ModelType | undefined {
    let searchManager;
    let searchModel: string;

    if (typeof model === 'undefined') {
      searchModel = manager;
    } else {
      searchManager = manager;
      searchModel = model;
    }

    return <ModelType>this.getManager(searchManager)?.getModel?.(searchModel);
  }
}