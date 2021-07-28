export interface IManager {
  getConnection(): unknown;
  closeConnection(): Promise<unknown> | void;

  getModel?(name: string): unknown;
}

export interface ManagerSettings<TDatabase = unknown, TOptions = unknown, TModels = unknown> {
  //type: string,
  database?: TDatabase;
  options?: TOptions;
  models?: TModels;
}

export type ManagerConstructor<TDatabase = unknown, TOptions = unknown, TModels = unknown> = { 
  new(settings: ManagerSettings<TDatabase, TOptions, TModels>): IManager;
  readonly type?: string;
};