// index.js
const RegistryFactory = require('./factory');
const Registry = require('./registry');

/**
 * @param {RegistryFactory.buildManagersArgs} args
 */
function add(args) {
  const managers = RegistryFactory.buildManagers(args);
  Object.keys(managers).forEach((name) => {
    this.addManager(name, managers[name]);
  });
}

/**
 * @description useful methods for that singleton Registry
 */
function SingletonMethods() {}
SingletonMethods.prototype.add = add;
SingletonMethods.prototype.setManagerClass = RegistryFactory.setManagerClass;

/**
 * @type {Registry & SingletonMethods}
 */
const instance = RegistryFactory({});

// add SingletonMethods prototypes
Object.keys(SingletonMethods.prototype).forEach(
  (method) =>
    (instance[method] = SingletonMethods.prototype[method].bind(instance))
);

module.exports = instance;
