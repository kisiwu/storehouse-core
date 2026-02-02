import { expect } from 'chai';
import { Registry } from '../../src/registry';
import { IManager, HealthCheckResult } from '../../src/manager';

class HealthyManager implements IManager {
  getConnection() {
    return { connected: true };
  }

  closeConnection() {
    // noop
  }

  async isConnected(): Promise<boolean> {
    return true;
  }

  async healthCheck(): Promise<HealthCheckResult> {
    return {
      healthy: true,
      message: 'All good',
      latency: 10,
      timestamp: Date.now()
    };
  }
}

class UnhealthyManager implements IManager {
  getConnection() {
    return { connected: false };
  }

  closeConnection() {
    // noop
  }

  async isConnected(): Promise<boolean> {
    return false;
  }

  async healthCheck(): Promise<HealthCheckResult> {
    return {
      healthy: false,
      message: 'Connection failed',
      timestamp: Date.now()
    };
  }
}

class NoHealthCheckManager implements IManager {
  getConnection() {
    return {};
  }

  closeConnection() {
    // noop
  }
}

describe('Health Checks', function() {
  let registry: Registry;

  beforeEach(function() {
    registry = new Registry();
  });

  afterEach(async function() {
    await registry.destroy();
  });

  describe('isConnected', function() {
    it('should return true for connected manager', async function() {
      registry.addManager('healthy', new HealthyManager());
      expect(await registry.isConnected('healthy')).to.be.true;
    });

    it('should return false for disconnected manager', async function() {
      registry.addManager('unhealthy', new UnhealthyManager());
      expect(await registry.isConnected('unhealthy')).to.be.false;
    });

    it('should return false for manager without isConnected method', async function() {
      registry.addManager('nocheck', new NoHealthCheckManager());
      expect(await registry.isConnected('nocheck')).to.be.false;
    });

    it('should return false for non-existent manager', async function() {
      expect(await registry.isConnected('missing')).to.be.false;
    });

    it('should use default manager when no name provided', async function() {
      registry.addManager('default', new HealthyManager());
      expect(await registry.isConnected()).to.be.true;
    });
  });

  describe('healthCheck', function() {
    it('should return healthy status', async function() {
      registry.addManager('healthy', new HealthyManager());
      const result = await registry.healthCheck('healthy');

      expect(result).to.not.be.undefined;
      expect(result?.healthy).to.be.true;
      expect(result?.message).to.equal('All good');
      expect(result?.latency).to.equal(10);
      expect(result?.timestamp).to.be.a('number');
    });

    it('should return unhealthy status', async function() {
      registry.addManager('unhealthy', new UnhealthyManager());
      const result = await registry.healthCheck('unhealthy');

      expect(result).to.not.be.undefined;
      expect(result?.healthy).to.be.false;
      expect(result?.message).to.equal('Connection failed');
    });

    it('should return undefined for manager without healthCheck', async function() {
      registry.addManager('nocheck', new NoHealthCheckManager());
      const result = await registry.healthCheck('nocheck');

      expect(result).to.be.undefined;
    });

    it('should return undefined for non-existent manager', async function() {
      const result = await registry.healthCheck('missing');
      expect(result).to.be.undefined;
    });

    it('should use default manager when no name provided', async function() {
      registry.addManager('default', new HealthyManager());
      const result = await registry.healthCheck();

      expect(result?.healthy).to.be.true;
    });
  });

  describe('healthCheckAll', function() {
    it('should check all managers', async function() {
      registry.addManager('healthy', new HealthyManager());
      registry.addManager('unhealthy', new UnhealthyManager());

      const results = await registry.healthCheckAll();

      expect(Object.keys(results)).to.have.lengthOf(2);
      expect(results.healthy.healthy).to.be.true;
      expect(results.unhealthy.healthy).to.be.false;
    });

    it('should skip managers without healthCheck method', async function() {
      registry.addManager('healthy', new HealthyManager());
      registry.addManager('nocheck', new NoHealthCheckManager());

      const results = await registry.healthCheckAll();

      expect(Object.keys(results)).to.have.lengthOf(1);
      expect(results.healthy).to.exist;
      expect(results.nocheck).to.be.undefined;
    });

    it('should return empty object when no managers have healthCheck', async function() {
      registry.addManager('nocheck1', new NoHealthCheckManager());
      registry.addManager('nocheck2', new NoHealthCheckManager());

      const results = await registry.healthCheckAll();

      expect(Object.keys(results)).to.have.lengthOf(0);
    });

    it('should handle healthCheck throwing error', async function() {
      class ErrorManager implements IManager {
        getConnection() { return {}; }
        closeConnection() {}
        async healthCheck(): Promise<HealthCheckResult> {
          throw new Error('Health check failed');
        }
      }

      registry.addManager('error', new ErrorManager());
      const results = await registry.healthCheckAll();

      expect(results.error).to.exist;
      expect(results.error.healthy).to.be.false;
      expect(results.error.message).to.include('Health check threw error');
    });
  });
});