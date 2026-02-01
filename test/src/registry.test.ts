import { expect } from 'chai';
import { Registry } from '../../src/registry';
import { MapManager } from './map-manager';
import {
  ManagerAlreadyExistsError,
  ManagerNotFoundError,
  InvalidManagerConfigError
} from '../../src/errors';

describe('Registry Edge Cases', function() {
  let registry: Registry;

  beforeEach(function() {
    registry = new Registry();
  });

  afterEach(async function() {
    await registry.destroy();
  });

  describe('addManager validation', function() {
    it('should throw on empty manager name', function() {
      expect(() => {
        registry.addManager('', new MapManager({ name: 'test' }));
      }).to.throw(InvalidManagerConfigError, 'Manager name must be a non-empty string');
    });

    it('should throw on non-string manager name', function() {
      expect(() => {
        registry.addManager(null as any, new MapManager({ name: 'test' }));
      }).to.throw(InvalidManagerConfigError);
    });

    it('should throw on null manager', function() {
      expect(() => {
        registry.addManager('test', null as any);
      }).to.throw(InvalidManagerConfigError, 'Manager must be a valid object');
    });

    it('should throw on manager without getConnection', function() {
      expect(() => {
        registry.addManager('test', {} as any);
      }).to.throw(InvalidManagerConfigError, 'Manager must implement getConnection method');
    });

    it('should throw when adding duplicate manager', function() {
      registry.addManager('test', new MapManager({ name: 'test' }));
      
      expect(() => {
        registry.addManager('test', new MapManager({ name: 'test2' }));
      }).to.throw(ManagerAlreadyExistsError, 'Manager "test" already exists!');
    });
  });

  describe('getManager with throwOnMissing', function() {
    it('should return undefined when manager not found and throwOnMissing=false', function() {
      const result = registry.getManager('missing', false);
      expect(result).to.be.undefined;
    });

    it('should throw when manager not found and throwOnMissing=true', function() {
      expect(() => {
        registry.getManager('missing', true);
      }).to.throw(ManagerNotFoundError, 'Manager "missing" not found');
    });

    it('should throw with default manager name when throwOnMissing=true', function() {
      expect(() => {
        registry.getManager(undefined, true);
      }).to.throw(ManagerNotFoundError, 'Manager "default" not found');
    });
  });

  describe('defaultManager behavior', function() {
    it('should set first added manager as default', function() {
      registry.addManager('first', new MapManager({ name: 'first' }));
      registry.addManager('second', new MapManager({ name: 'second' }));
      
      expect(registry.defaultManager).to.equal('first');
    });

    it('should return "default" when no managers exist', function() {
      expect(registry.defaultManager).to.equal('default');
    });

    it('should allow manual override of default manager', function() {
      registry.addManager('first', new MapManager({ name: 'first' }));
      registry.defaultManager = 'second';
      
      expect(registry.defaultManager).to.equal('second');
    });
  });

  describe('closeConnection edge cases', function() {
    it('should handle closing non-existent manager gracefully', async function() {
      const result = await registry.closeConnection('missing');
      expect(result).to.be.undefined;
    });

    it('should handle closing default manager when none exists', async function() {
      const result = await registry.closeDefaultConnection();
      expect(result).to.be.undefined;
    });
  });

  describe('managerNames', function() {
    it('should return empty array when no managers', function() {
      expect(registry.managerNames).to.be.an('array').that.is.empty;
    });

    it('should return all manager names', function() {
      registry.addManager('first', new MapManager({ name: 'first' }));
      registry.addManager('second', new MapManager({ name: 'second' }));
      
      expect(registry.managerNames).to.have.members(['first', 'second']);
    });
  });

  describe('removeManager', function() {
    it('should return undefined when removing non-existent manager', function() {
      const result = registry.removeManager('missing');
      expect(result).to.be.undefined;
    });

    it('should return removed manager', function() {
      const manager = new MapManager({ name: 'test' });
      registry.addManager('test', manager);
      
      const removed = registry.removeManager('test');
      expect(removed).to.equal(manager);
    });
  });

  describe('getModel with overloaded parameters', function() {
    it('should get model with just model name', function() {
      registry.addManager('default', new MapManager({ name: 'default' }));
      const model = registry.getModel('users');
      
      expect(model).to.be.instanceOf(Map);
    });

    it('should get model with manager and model name', function() {
      registry.addManager('test', new MapManager({ name: 'test' }));
      const model = registry.getModel('test', 'users');
      
      expect(model).to.be.instanceOf(Map);
    });

    it('should return undefined for missing manager', function() {
      const model = registry.getModel('missing', 'users');
      expect(model).to.be.undefined;
    });
  });

  describe('destroy', function() {
    it('should close all connections and clear managers', async function() {
      registry.addManager('test1', new MapManager({ name: 'test1' }));
      registry.addManager('test2', new MapManager({ name: 'test2' }));
      
      const count = await registry.destroy();
      
      expect(count).to.equal(2);
      expect(registry.managerNames).to.be.empty;
    });

    it('should return 0 when no managers', async function() {
      const count = await registry.destroy();
      expect(count).to.equal(0);
    });
  });
});