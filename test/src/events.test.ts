import { expect } from 'chai';
import { Registry } from '../../src/registry';
import { MapManager } from './map-manager';

describe('Registry Events', function() {
  let registry: Registry;

  beforeEach(function() {
    registry = new Registry();
  });

  afterEach(async function() {
    await registry.destroy();
  });

  describe('Manager Events', function() {
    it('should emit manager:before:add event', function(done) {
      registry.once('manager:before:add', ({ name, manager }) => {
        expect(name).to.equal('test');
        expect(manager).to.be.instanceOf(MapManager);
        done();
      });

      registry.addManager('test', new MapManager({ name: 'test' }));
    });

    it('should emit manager:added event', function(done) {
      registry.once('manager:added', ({ name, manager }) => {
        expect(name).to.equal('test');
        expect(manager).to.be.instanceOf(MapManager);
        done();
      });

      registry.addManager('test', new MapManager({ name: 'test' }));
    });

    it('should emit events in correct order', function() {
      const events: string[] = [];

      registry.on('manager:before:add', () => events.push('before'));
      registry.on('manager:added', () => events.push('added'));

      registry.addManager('test', new MapManager({ name: 'test' }));

      expect(events).to.deep.equal(['before', 'added']);
    });

    it('should emit manager:removed event', function(done) {
      registry.addManager('test', new MapManager({ name: 'test' }));

      registry.once('manager:removed', ({ name, manager }) => {
        expect(name).to.equal('test');
        expect(manager).to.be.instanceOf(MapManager);
        done();
      });

      registry.removeManager('test');
    });

    it('should emit manager:default:changed event', function(done) {
      registry.addManager('first', new MapManager({ name: 'first' }));

      registry.once('manager:default:changed', ({ previous, current }) => {
        expect(previous).to.equal('first');
        expect(current).to.equal('second');
        done();
      });

      registry.defaultManager = 'second';
    });
  });

  describe('Connection Events', function() {
    it('should emit connection:before:close event', function(done) {
      registry.addManager('test', new MapManager({ name: 'test' }));

      registry.once('connection:before:close', ({ manager }) => {
        expect(manager).to.equal('test');
        done();
      });

      registry.closeConnection('test');
    });

    it('should emit connection:closed event', async function() {
      registry.addManager('test', new MapManager({ name: 'test' }));

      return new Promise<void>((resolve) => {
        registry.once('connection:closed', ({ manager }) => {
          expect(manager).to.equal('test');
          resolve();
        });

        registry.closeConnection('test');
      });
    });

    it('should emit connection:accessed event', function(done) {
      registry.addManager('test', new MapManager({ name: 'test' }));

      registry.once('connection:accessed', ({ manager, found }) => {
        expect(manager).to.equal('test');
        expect(found).to.be.true;
        done();
      });

      registry.getConnection('test');
    });

    it('should emit connection:accessed with found=false', function(done) {
      registry.once('connection:accessed', ({ manager, found }) => {
        expect(manager).to.equal('missing');
        expect(found).to.be.false;
        done();
      });

      registry.getConnection('missing');
    });

    it('should emit connections:before:close:all event', function(done) {
      registry.addManager('test1', new MapManager({ name: 'test1' }));
      registry.addManager('test2', new MapManager({ name: 'test2' }));

      registry.once('connections:before:close:all', () => {
        done();
      });

      registry.closeAllConnections();
    });

    it('should emit connections:closed:all event', async function() {
      registry.addManager('test1', new MapManager({ name: 'test1' }));
      registry.addManager('test2', new MapManager({ name: 'test2' }));

      return new Promise<void>((resolve) => {
        registry.once('connections:closed:all', ({ count }) => {
          expect(count).to.equal(2);
          resolve();
        });

        registry.closeAllConnections();
      });
    });
  });

  describe('Model Events', function() {
    it('should emit model:accessed event when found', function(done) {
      registry.addManager('test', new MapManager({ name: 'test' }));

      registry.once('model:accessed', ({ manager, model, found }) => {
        expect(manager).to.be.undefined;
        expect(model).to.equal('users');
        expect(found).to.be.true;
        done();
      });

      registry.getModel('users');
    });

    it('should emit model:accessed event with manager name', function(done) {
      registry.addManager('test', new MapManager({ name: 'test' }));

      registry.once('model:accessed', ({ manager, model, found }) => {
        expect(manager).to.equal('test');
        expect(model).to.equal('users');
        expect(found).to.be.true;
        done();
      });

      registry.getModel('test', 'users');
    });
  });

  describe('Registry Events', function() {
    it('should emit registry:before:destroy event', function(done) {
      registry.addManager('test', new MapManager({ name: 'test' }));

      registry.once('registry:before:destroy', () => {
        done();
      });

      registry.destroy();
    });

    it('should emit registry:destroyed event', async function() {
      registry.addManager('test', new MapManager({ name: 'test' }));

      return new Promise<void>((resolve) => {
        registry.once('registry:destroyed', ({ count }) => {
          expect(count).to.equal(1);
          resolve();
        });

        registry.destroy();
      });
    });
  });

  describe('Multiple Event Listeners', function() {
    it('should call all listeners for the same event', function() {
      let count = 0;

      registry.on('manager:added', () => count++);
      registry.on('manager:added', () => count++);
      registry.on('manager:added', () => count++);

      registry.addManager('test', new MapManager({ name: 'test' }));

      expect(count).to.equal(3);
    });

    it('should support removing listeners with off', function() {
      let count = 0;
      const listener = () => count++;

      registry.on('manager:added', listener);
      registry.addManager('test1', new MapManager({ name: 'test1' }));
      expect(count).to.equal(1);

      registry.off('manager:added', listener);
      registry.addManager('test2', new MapManager({ name: 'test2' }));
      expect(count).to.equal(1); // Should not increment
    });
  });
});