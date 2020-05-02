// factory.js
const Registry = require('./registry');
const MANAGER_CLASSES = {};

/**
 * @type {{type: String, database: any, options: any, models: Array}}
 */
var buildManagerConfig;
/**
 * @type {Object.<string, buildManagerConfig>}
 */
var buildManagersArgs;

function setManagerClass(managerClass) {
  if (managerClass && managerClass.TYPE && typeof managerClass.TYPE === 'string') {
    MANAGER_CLASSES[managerClass.TYPE] = managerClass;
  }
}

/**
 * @param {string} name
 * @param {buildManagerConfig} obj
 */
function buildManager(name, obj) {
  var manager;
  if (MANAGER_CLASSES[obj.type]) {
    manager = new MANAGER_CLASSES[obj.type](
      name,
      obj.database,
      obj.options,
      obj.models
    );
  } else {
    throw new Error(
      'Property "type" with value "' + obj.type + '" is not supported !'
    );
  }
  return manager;
}

/**
 *
 * @param {buildManagersArgs} args
 */
function buildManagers(args) {
  const managers = {};
  for (var name in args) {
    managers[name] = buildManager(name, args[name]);
  }
  return managers;
}

/**
 *
 * @param {buildManagersArgs} args
 */
function RegistryFactory(args) {
  const managers = buildManagers(args);
  return new Registry(managers);
}

// defs
RegistryFactory.buildManagerConfig = buildManagerConfig;
RegistryFactory.buildManagersArgs = buildManagersArgs;

// methods
RegistryFactory.buildManager = buildManager;
RegistryFactory.buildManagers = buildManagers;
RegistryFactory.setManagerClass = setManagerClass;

module.exports = RegistryFactory;
