export interface IManager {
  getConnection(): unknown;
  closeConnection(): Promise<unknown> | void;

  getModel?(name: string): unknown;
}

export interface ManagerSettings<TConfig = unknown> {
  config?: TConfig;
}

export type ManagerConstructor<TConfig = unknown> = { 
  new(settings: ManagerSettings<TConfig>): IManager;
  readonly type?: string;
};