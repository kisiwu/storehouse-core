export interface IManager {
  getConnection(): unknown;
  closeConnection(): Promise<unknown> | void;

  getModel?(name: string): unknown;
}

export interface ManagerSettings {
  //type: string,
  database?: unknown;
  options?: unknown;
  models?: unknown[];
}

export type ManagerConstructor = { 
  new(settings: ManagerSettings): IManager;
  readonly type?: string;
};