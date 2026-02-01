import { expect } from 'chai';
import { ManagerFactory } from '../../src/manager-factory';
import { MapManager } from './map-manager';
import {
  InvalidManagerConfigError,
  ManagerTypeNotFoundError
} from '../../src/errors';

describe('ManagerFactory', function () {
  let factory: ManagerFactory;

  beforeEach(function () {
    factory = new ManagerFactory();
  });

  describe('getManager validation', function () {
    it('should throw on null argument', function () {
      expect(() => {
        factory.getManager(null as any);
      }).to.throw(InvalidManagerConfigError, 'Manager factory argument must be a valid object');
    });

    it('should throw on undefined argument', function () {
      expect(() => {
        factory.getManager(undefined as any);
      }).to.throw(InvalidManagerConfigError);
    });

    it('should throw on missing type', function () {
      expect(() => {
        factory.getManager({} as any);
      }).to.throw(InvalidManagerConfigError, 'Manager type is required');
    });

    it('should throw on unregistered string type', function () {
      expect(() => {
        factory.getManager({ type: 'unknown' });
      }).to.throw(ManagerTypeNotFoundError, 'Property "type" with value "unknown" is not supported!');
    });
  });

  describe('setManagerType', function () {
    it('should register manager with static type property', function () {
      factory.setManagerType(MapManager);
      const manager = factory.getManager({ type: 'mapping' });

      expect(manager).to.be.instanceOf(MapManager);
    });

    it('should register manager with class name if no type property', function () {
      class CustomManagerWithoutType {
        constructor(_arg: unknown) {
          // minimal implementation
        }

        getConnection() {
          return {};
        }

        closeConnection() {
          // noop
        }
      }
      factory.setManagerType(CustomManagerWithoutType);

      const manager = factory.getManager({ type: 'CustomManagerWithoutType' });
      expect(manager).to.be.instanceOf(CustomManagerWithoutType);
    });

    it('should allow method chaining', function () {
      const result = factory.setManagerType(MapManager);
      expect(result).to.equal(factory);
    });

    it('should override existing type', function () {
      class Manager1 extends MapManager {
        static readonly type = 'test';
      }
      class Manager2 extends MapManager {
        static readonly type = 'test';
      }

      factory.setManagerType(Manager1);
      factory.setManagerType(Manager2);

      const manager = factory.getManager({ type: 'test' });
      expect(manager).to.be.instanceOf(Manager2);
    });
  });

  describe('removeManagerType', function () {
    it('should remove registered type by string', function () {
      factory.setManagerType(MapManager);
      const removed = factory.removeManagerType('mapping');

      expect(removed).to.be.true;
      expect(() => {
        factory.getManager({ type: 'mapping' });
      }).to.throw(ManagerTypeNotFoundError);
    });

    it('should remove registered type by class', function () {
      factory.setManagerType(MapManager);
      const removed = factory.removeManagerType(MapManager);

      expect(removed).to.be.true;
      expect(() => {
        factory.getManager({ type: 'mapping' });
      }).to.throw(ManagerTypeNotFoundError);
    });

    it('should return false when removing non-existent type', function () {
      const removed = factory.removeManagerType('nonexistent');
      expect(removed).to.be.false;
    });
  });

  describe('getManager with class constructor', function () {
    it('should create manager from class directly', function () {
      const manager = factory.getManager({ type: MapManager });
      expect(manager).to.be.instanceOf(MapManager);
    });

    it('should pass config to constructor', function () {
      const manager = factory.getManager({
        type: MapManager,
        name: 'testManager',
        config: { message: 'hello' }
      });

      expect(manager).to.be.instanceOf(MapManager);
      expect((manager as MapManager).name).to.equal('testManager');
    });

    it('should throw InvalidManagerConfigError on constructor failure', function () {
      class BrokenManager {
        constructor() {
          throw new Error('Constructor failed');
        }
      }

      expect(() => {
        factory.getManager({ type: BrokenManager as any });
      }).to.throw(InvalidManagerConfigError, 'Failed to instantiate manager: Constructor failed');
    });
  });
});