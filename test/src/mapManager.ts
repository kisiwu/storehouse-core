import { IManager } from '../../src/manager';

export type ModelType<T = unknown> = Map<string, T>;

export class MapManager implements IManager {
  static readonly type = 'mapping';

  #models: Map<string, ModelType>;
  public name: string;

  constructor(arg: { config?: { message: string }, name?: string }) {
    this.#models = new Map<string, ModelType>();
    this.name = arg.name || '';
  }

  getConnection<T = unknown>(): Map<string, ModelType<T>> {
    return <Map<string, ModelType<T>>>this.#models;
  }

  closeConnection(): void {
    console.log('manager.closeConnection');
  }

  getModel<T>(name: string): ModelType<T> {
    if (!this.#models.has(name)) {
      this.#models.set(name, new Map<string, T>());
    }
    return <ModelType<T>>this.#models.get(name);
  }
}