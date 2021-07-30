export interface IManager {
  getConnection(): unknown;
  closeConnection(): Promise<unknown> | void;

  getModel?(name: string): unknown;
}

export interface ManagerSettings<TConfig = unknown> {
  config?: TConfig;
}

export interface ManagerArg<TConfig = unknown> extends ManagerSettings<TConfig> {
  name?: string;
}

export type ManagerConstructor<TConfig = unknown> = { 
  new(settings: Partial<ManagerArg<TConfig>>): IManager;
  readonly type?: string;
};