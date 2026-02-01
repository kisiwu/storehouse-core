export interface HealthCheckResult {
  healthy: boolean;
  message?: string;
  details?: Record<string, unknown>;
  latency?: number; // milliseconds
  timestamp: number;
}

export interface IManager {
  getConnection(): unknown;
  closeConnection(): Promise<unknown> | void;

  getModel?(name: string): unknown;

  /**
   * Check if the connection is healthy and responsive
   * @returns Health check result with status and optional details
   */
  healthCheck?(): Promise<HealthCheckResult> | HealthCheckResult;

  /**
   * Check if the connection is currently connected/active
   * @returns true if connected, false otherwise
   */
  isConnected?(): boolean;
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