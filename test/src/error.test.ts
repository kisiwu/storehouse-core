import { expect } from 'chai';
import {
  StorehouseError,
  ManagerAlreadyExistsError,
  ManagerNotFoundError,
  ManagerTypeNotFoundError,
  ModelNotFoundError,
  InvalidManagerConfigError,
  ConnectionError
} from '../../src/errors';

describe('Custom Errors', function() {
  describe('StorehouseError', function() {
    it('should be an instance of Error', function() {
      const error = new StorehouseError('test message');
      expect(error).to.be.instanceOf(Error);
      expect(error).to.be.instanceOf(StorehouseError);
    });

    it('should have correct name and message', function() {
      const error = new StorehouseError('test message');
      expect(error.name).to.equal('StorehouseError');
      expect(error.message).to.equal('test message');
    });

    it('should have stack trace', function() {
      const error = new StorehouseError('test message');
      expect(error.stack).to.be.a('string');
      expect(error.stack).to.include('StorehouseError');
    });
  });

  describe('ManagerAlreadyExistsError', function() {
    it('should extend StorehouseError', function() {
      const error = new ManagerAlreadyExistsError('testManager');
      expect(error).to.be.instanceOf(StorehouseError);
      expect(error).to.be.instanceOf(ManagerAlreadyExistsError);
    });

    it('should format message correctly', function() {
      const error = new ManagerAlreadyExistsError('testManager');
      expect(error.message).to.equal('Manager "testManager" already exists!');
      expect(error.name).to.equal('ManagerAlreadyExistsError');
    });
  });

  describe('ManagerNotFoundError', function() {
    it('should format message correctly', function() {
      const error = new ManagerNotFoundError('missingManager');
      expect(error.message).to.equal('Manager "missingManager" not found');
      expect(error.name).to.equal('ManagerNotFoundError');
    });
  });

  describe('ManagerTypeNotFoundError', function() {
    it('should format message correctly', function() {
      const error = new ManagerTypeNotFoundError('unknownType');
      expect(error.message).to.equal('Property "type" with value "unknownType" is not supported!');
      expect(error.name).to.equal('ManagerTypeNotFoundError');
    });
  });

  describe('ModelNotFoundError', function() {
    it('should format message with model name only', function() {
      const error = new ModelNotFoundError('User');
      expect(error.message).to.equal('Model "User" not found');
    });

    it('should format message with model and manager names', function() {
      const error = new ModelNotFoundError('User', 'mainManager');
      expect(error.message).to.equal('Model "User" not found in manager "mainManager"');
    });
  });

  describe('InvalidManagerConfigError', function() {
    it('should format message correctly', function() {
      const error = new InvalidManagerConfigError('Missing required field');
      expect(error.message).to.equal('Invalid manager configuration: Missing required field');
    });
  });

  describe('ConnectionError', function() {
    it('should store cause error', function() {
      const cause = new Error('Connection timeout');
      const error = new ConnectionError('Failed to connect', cause);
      expect(error.message).to.equal('Failed to connect');
      expect(error.cause).to.equal(cause);
    });

    it('should work without cause', function() {
      const error = new ConnectionError('Failed to connect');
      expect(error.message).to.equal('Failed to connect');
      expect(error.cause).to.be.undefined;
    });
  });
});