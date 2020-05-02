// registry.js
const Log = require('@novice1/logger').debugger('@storehouse/core:registry');

/**
 *
 * @param {Object<string, any>} [managers]
 */
function Registry(managers) {

  const _managers = {}

  var _defaultName = "";

  // init
  if (managers) {
    Object.keys(managers).forEach(
      n => this.addManager(n, managers[n])
    )
  }

  /**
   * @param {string} name
   */
  this.setDefaultConnectionName = function (name) {
    Log.info('Set default manager as [%s]', name)
    _defaultName = name
  }
  
  this.getDefaultConnectionName = function () {
    return _defaultName || "default";
  };

  this.getConnection = function (name) {
    if (typeof name === "undefined") {
      return this.getDefaultConnection();
    }

    return _managers[name].getConnection();
  };

  this.getDefaultConnection = function () {
    var name = this.getDefaultConnectionName();
    return _managers[name].getConnection();
  };

  this.closeConnection = function (name) {
    if (typeof name === "undefined") {
      return this.closeDefaultConnection();
    }
    _managers[name].closeConnection();
  };

  this.closeDefaultConnection = function () {
    var name = this.getDefaultConnectionName();
    _managers[name].closeConnection();
  };

  this.close = function (name) {
    this.closeConnection(name);
  };

  this.getManager = function (name) {
    if (typeof name === "undefined") {
      return this.getDefaultManager();
    }

    return _managers[name];
  };

  /**
   * @param {String} [name]
   * @returns {import("./managers/mongoose")}
   */
  this.getMongooseManager = function (name) {
    var manager;
    if (typeof name === "undefined") {
      manager = this.getDefaultManager();
    } else {
      manager = _managers[name]
    }

    if (
      !(manager 
      && typeof manager.getType === 'function'
      && manager.getType() === 'mongoose')) {
        manager = undefined
      }

    return manager;
  };

  this.getDefaultManager = function () {
    var name = this.getDefaultConnectionName();
    return _managers[name];
  };

  this.getModel = function (connectionName, filename) {
    var name = "";
    var filePath = "";
    if (filename) {
      name = connectionName;
      filePath = filename;
    } else {
      // getDefaultConnectionName
      var arr = connectionName.split(":");
      if (arr.length == 2) {
        name = arr[0];
        filePath = arr[1];
      } else {
        filePath = connectionName;
        name = this.getDefaultConnectionName();
      }
    }

    return _managers[name].getModel(filePath);
  };

  this.getModels = function (name) {
    if (typeof name === "undefined") {
      name = this.getDefaultConnectionName();
    }

    return _managers[name].getModels();
  };

  this.addManager = function (name, newManager) {
    if (!_managers[name]) {
      _managers[name] = newManager
      if (!_defaultName) {
        this.setDefaultConnectionName(name)
      }
    } else {
      throw new Error(`Manager "${name}" already exists!`)
    }
  }
}

module.exports = Registry;
