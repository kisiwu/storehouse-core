# @storehouse/core

## Installation

```bash
$ npm install @storehouse/core
```

## Usage (Javascript)

mapManager.js
```js
function MapManager() {
  this._models = new Map();
}

MapManager.type = 'mapping';

MapManager.prototype.getConnection = function () {
  return this._models;
};

MapManager.prototype.closeConnection = function () {
  console.log('closeConnection');
};

MapManager.prototype.getModel = function (name) {
  if (!this._models.has(name)) {
    this._models.set(name, new Map());
  }
  return this._models.get(name);
};

module.exports = MapManager;
```

index.js
```js
const Storehouse = require('@storehouse/core');
const MapManager = require('./mapManager');

/* settings */

// Define the class to use to create managers. You define multiple classes by using the method multiple times.
Storehouse.setManagerType(MapManager);
// Set the name of the default manager. That will enable the use of some methods without having to define the manager to use and fallback to the default one.
Storehouse.defaultManager = 'myManager';
// Add managers. If no default manager was previously set, the first one will be set as default.
Storehouse.add({
  myManager: {
    type: 'mapping'
  }
});

/* access data */

// insert user
const model = Storehouse.getModel('users'); // or Storehouse.getManager('myManager', 'users');
if (model) {
  model.set('id1234', { name: 'keeper' });
}
    
// get user
const mapping = Storehouse.getManager(); // or Storehouse.getManager('myManager');
if (mapping) {
  const user = mapping.getModel('users').get('id1234');
 // do something
}

/* close possible connections */

// close all connections
await Storehouse.close();
```

## Usage (Typescript)

mapManager.ts
```ts
import { IManager } from '@storehouse/core/lib/manager';

export type ModelType<T = unknown> = Map<string, T>;

export class MapManager implements IManager {
  static readonly type = 'mapping';

  #models: Map<string, ModelType>;

  constructor() {
    this.#models = new Map<string, ModelType>();
  }

  getConnection<T = unknown>(): Map<string, ModelType<T>> {
    return <Map<string, ModelType<T>>>this.#models;
  }

  closeConnection(): void {
    console.log('closeConnection');
  }

  getModel<T>(name: string): ModelType<T> {
    if (!this.#models.has(name)) {
      this.#models.set(name, new Map<string, T>());
    }
    return <ModelType<T>>this.#models.get(name);
  }
}
```

index.ts
```ts
import Storehouse from '@storehouse/core';
import { MapManager, ModelType } from './mapManager'

interface User {
  name: string;
  address?: string;
}

/* settings */

// Define the class to use to create managers. You define multiple classes by using the method multiple times.
Storehouse.setManagerType(MapManager);
// Set the name of the default manager. That will enable the use of some methods without having to define the manager to use and fallback to the default one.
Storehouse.defaultManager = 'myManager';
// Add managers. If no default manager was previously set, the first one will be set as default.
Storehouse.add({
  myManager: {
    type: 'mapping'
  }
});

/* access data */

// insert user
const model = Storehouse.getModel<ModelType<User>>('users'); // or Storehouse.getManager('myManager', 'users');
if (model) {
  model.set('id1234', { name: 'keeper' });
}
    
// get user
const mapping = Storehouse.getManager<MapManager>(); // or Storehouse.getManager('myManager');
if (mapping) {
  const user = mapping.getModel<User>('users').get('id1234');
 // do something
}

/* close possible connections */

// close all connections
await Storehouse.close();
```

## Settings

### add

You add managers in the storehouse as: 
```ts
Storehouse.add({
  nameOfTheManager: {
    type: MapManager
  }
});
```

The options to create the manager are:
- **type**: (_string|function_) The class to use to instanciate the manager. Can be a string if classes were already set with method `setManagerType`. If it's a string, its value should be:
  - the same as the class's static property `type` (if present)
  - the name of the class (default).
- **[database]**: (_unknown_)
- **[options]**: (_unknown_)
- **[models]**: (_unknown[]_)

**database**, **options** and **models** are optional and are sent to the manager's constructor.



### addManager

You could also add a manager as:
```ts
Storehouse.addManager('myManager', new MapManager());
```



### defaultManager

If you only have one manager or if you don't want to always precise the manager to use when it is often the same, you can define one as a default.
```ts
Storehouse.defaultManager = 'myManager';

// then
Storehouse.getManager(); // will search for 'myManager'
```

The default manager is always the first one added if you didn't set `defaultManager` manually. 



### setManagerType

You set classes to use to create managers as:
```ts
Storehouse
  .setManagerType(MapManager)
  .setManagerType(AnotherClass);
```

If the class has a static property `type`, it will be stored with its value. Otherwise it will use the name of the class.



## References

- [Documentation](https://socket.io/)