import { IManager, ManagerSettings } from '../../src/manager';

export type ModelType<T = unknown> = Map<string, T>;

interface MMSettings extends ManagerSettings {
  database?: string;
  models?: string[];
}

export class MapManager implements IManager {
  static readonly type = 'mapping';

  #models: Map<string, ModelType>;

  constructor(s: MMSettings) {
    this.#models = new Map<string, ModelType>();
    console.log(s.database);
  }

  getConnection<T = unknown>(): Map<string, ModelType<T>> {
    return <Map<string, ModelType<T>>>this.#models;
  }

  closeConnection(): void {
    console.log('closeConnection');
  }

  getModel<T>(name: string): ModelType<T> {
    if (!this.#models.has(name)) {
      this.#models.set(name, new Map<string, T>());
    }
    return <ModelType<T>>this.#models.get(name);
  }
}