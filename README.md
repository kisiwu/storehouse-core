# @storehouse/core

See the [Documentation](https://kisiwu.github.io/storehouse/core/latest/) for more information.

## Installation

```bash
npm install @storehouse/core
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
const { Storehouse } = require('@storehouse/core');
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
import { IManager } from '@storehouse/core';

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
import { Storehouse } from '@storehouse/core';
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

## Methods

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
- **[config]**: (_unknown_)

**config** is optional and is sent as part of the the manager's constructor argument.

Example:
```ts
class MapManager implements IManager {
  constructor(arg: { config?: { message: string }, name?: string }) {
    console.log(arg.config?.message);
    // ...
  }
  // ...
}
```



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

### hasManager

```ts
const bool = Storehouse.hasManager('myManager');
```

### setManagerType

You set classes to use to create managers as:
```ts
Storehouse
  .setManagerType(MapManager)
  .setManagerType(AnotherClass);
```

If the class has a static property `type`, it will be stored with its value. Otherwise it will use the name of the class.


### removeManager

The method returns the removed manager if there is one.
```ts
const myManager = Storehouse.removeManager('myManager');
```

### closeAllConnections

The method call `closeConnection` on all of its managers.
```ts
const numberOfManagersClosed = await Storehouse.closeAllConnections();
```
or
```ts
const numberOfManagersClosed = await Storehouse.close();
```

### destroy

Calls `closeConnection` on all of its managers and removes them.
```ts
const numberOfManagersClosed = await Storehouse.destroy();
```

## Events

The `Storehouse` instance extends `EventEmitter` and emits lifecycle events that you can listen to for logging, monitoring, or extending functionality.

### Event Types

All events are fully typed in TypeScript for autocomplete and type safety.

#### Manager Events

**`manager:before:add`** - Emitted before a manager is added
```ts
Storehouse.on('manager:before:add', ({ name, manager }) => {
  console.log(`About to add manager: ${name}`);
});
```

**`manager:added`** - Emitted after a manager is successfully added
```ts
Storehouse.on('manager:added', ({ name, manager }) => {
  console.log(`Manager added: ${name}`);
});
```

**`manager:removed`** - Emitted when a manager is removed
```ts
Storehouse.on('manager:removed', ({ name, manager }) => {
  console.log(`Manager removed: ${name}`);
});
```

**`manager:default:changed`** - Emitted when the default manager changes
```ts
Storehouse.on('manager:default:changed', ({ previous, current }) => {
  console.log(`Default manager changed from ${previous} to ${current}`);
});
```

#### Connection Events

**`connection:before:close`** - Emitted before a connection closes
```ts
Storehouse.on('connection:before:close', ({ manager }) => {
  console.log(`Closing connection: ${manager}`);
});
```

**`connection:closed`** - Emitted after a connection is successfully closed
```ts
Storehouse.on('connection:closed', ({ manager }) => {
  console.log(`Connection closed: ${manager}`);
});
```

**`connection:error:close`** - Emitted when closing a connection fails
```ts
Storehouse.on('connection:error:close', ({ manager, error }) => {
  console.error(`Failed to close ${manager}:`, error);
});
```

**`connection:accessed`** - Emitted when a connection is accessed
```ts
Storehouse.on('connection:accessed', ({ manager, found }) => {
  console.log(`Connection accessed: ${manager}, found: ${found}`);
});
```

**`connection:before:close:all`** - Emitted before closing all connections
```ts
Storehouse.on('connections:before:close:all', () => {
  console.log('Closing all connections...');
});
```

**`connection:closed:all`** - Emitted after all connections are closed
```ts
Storehouse.on('connections:closed:all', ({ count }) => {
  console.log(`Closed ${count} connection(s)`);
});
```

#### Model Events

**`model:accessed`** - Emitted when a model is accessed
```ts
Storehouse.on('model:accessed', ({ manager, model, found }) => {
  console.log(`Model "${model}" accessed from ${manager || 'default'}, found: ${found}`);
});
```

#### Registry Events

**`registry:before:destroy`** - Emitted before the registry is destroyed
```ts
Storehouse.on('registry:before:destroy', () => {
  console.log('Registry about to be destroyed');
});
```

**`registry:destroy`** - Emitted after the registry is destroyed
```ts
Storehouse.on('registry:destroyed', ({ count }) => {
  console.log(`Registry destroyed, ${count} manager(s) removed`);
});
```

### Example: Monitoring and Logging

```ts
import { Storehouse } from '@storehouse/core';

// Set up comprehensive monitoring
Storehouse.on('manager:added', ({ name }) => {
  console.log(`✓ Manager "${name}" registered`);
});

Storehouse.on('connection:closed', ({ manager }) => {
  console.log(`✓ Connection "${manager}" closed gracefully`);
});

Storehouse.on('connection:error:close', ({ manager, error }) => {
  console.error(`✗ Failed to close "${manager}":`, error);
  // Send to error tracking service
});

// Track model access for analytics
const modelAccessCount = new Map<string, number>();
Storehouse.on('model:accessed', ({ model, found }) => {
  if (found) {
    modelAccessCount.set(model, (modelAccessCount.get(model) || 0) + 1);
  }
});

// Cleanup on shutdown
process.on('SIGTERM', async () => {
  console.log('Model access stats:', Object.fromEntries(modelAccessCount));
  await Storehouse.destroy();
});
```

### Example: Custom Reconnection Logic

```ts
Storehouse.on('connection:error:close', async ({ manager, error }) => {
  console.warn(`Connection error for ${manager}, attempting reconnect...`);
  
  // Wait and reconnect
  await new Promise(resolve => setTimeout(resolve, 5000));
  
  const managerInstance = Storehouse.getManager(manager);
  if (managerInstance) {
    // Reinitialize connection logic here
  }
});
```

### Using Events with Custom Registry

If you create your own registry instance, events work the same way:
```ts
import { Registry } from '@storehouse/core';

const myRegistry = new Registry();

myRegistry.on('manager:added', ({ name }) => {
  console.log(`Custom registry: manager ${name} added`);
});

myRegistry.addManager('custom', new MapManager());
```

## Health Checks

Managers can optionally implement health check methods to verify connection status and responsiveness. This is useful for monitoring, load balancers, and debugging.

### Health Check Methods

#### isConnected()

Check if a manager's connection is currently active:

```ts
const connected = Storehouse.isConnected('myManager');
if (connected) {
  console.log('Connection is active');
}
```

#### healthCheck()

Perform a comprehensive health check on a manager's connection:

```ts
const health = await Storehouse.healthCheck('myManager');

if (health?.healthy) {
  console.log(`✓ Healthy - ${health.message}`);
  console.log(`Latency: ${health.latency}ms`);
  console.log('Details:', health.details);
} else {
  console.error(`✗ Unhealthy - ${health?.message}`);
}
```

#### healthCheckAll()

Check the health of all managers at once:

```ts
const results = await Storehouse.healthCheckAll();

for (const [name, result] of Object.entries(results)) {
  console.log(`${name}: ${result.healthy ? '✓' : '✗'} ${result.message}`);
}
```

### Health Check Result Structure

```ts
interface HealthCheckResult {
  healthy: boolean;           // Overall health status
  message?: string;           // Human-readable message
  details?: Record<string, unknown>; // Additional info (versions, pool stats, etc.)
  latency?: number;           // Response time in milliseconds
  timestamp: number;          // When the check was performed
}
```

### Example: API Health Endpoint

```ts
import express from 'express';
import { Storehouse } from '@storehouse/core';

const app = express();

app.get('/health', async (req, res) => {
  const results = await Storehouse.healthCheckAll();
  const allHealthy = Object.values(results).every(r => r.healthy);
  
  res.status(allHealthy ? 200 : 503).json({
    status: allHealthy ? 'healthy' : 'degraded',
    timestamp: Date.now(),
    checks: results
  });
});
```

### Example: Periodic Health Monitoring

```ts
// Check health every 30 seconds
setInterval(async () => {
  const health = await Storehouse.healthCheck();
  
  if (!health?.healthy) {
    console.warn('Connection unhealthy:', health?.message);
    // Send alert or trigger reconnection logic
  }
}, 30000);
```

### Example: Graceful Degradation

```ts
async function getData(preferredManager: string, fallbackManager: string) {
  // Try preferred manager first
  if (Storehouse.isConnected(preferredManager)) {
    const health = await Storehouse.healthCheck(preferredManager);
    if (health?.healthy) {
      return Storehouse.getManager(preferredManager);
    }
  }
  
  // Fall back to secondary manager
  console.warn(`Falling back to ${fallbackManager}`);
  return Storehouse.getManager(fallbackManager);
}
```

### Implementing Health Checks in Custom Managers

To add health check support to your custom manager, implement the optional methods:

```ts
import { IManager, HealthCheckResult } from '@storehouse/core';

class MyCustomManager implements IManager {
  isConnected(): boolean {
    // Return true if connection is active
    return this.connection?.isOpen ?? false;
  }

  async healthCheck(): Promise<HealthCheckResult> {
    const start = Date.now();
    const timestamp = start;

    try {
      // Perform a lightweight test operation
      await this.connection.ping();
      
      return {
        healthy: true,
        message: 'Connection is healthy',
        details: {
          // Add any useful diagnostic info
          version: await this.connection.getVersion(),
          uptime: this.connection.uptime
        },
        latency: Date.now() - start,
        timestamp
      };
    } catch (error) {
      return {
        healthy: false,
        message: `Health check failed: ${error instanceof Error ? error.message : String(error)}`,
        details: {
          error: error instanceof Error ? error.stack : String(error)
        },
        latency: Date.now() - start,
        timestamp
      };
    }
  }

  // ... other required methods ...
}
```

## References

- [Documentation](https://kisiwu.github.io/storehouse/core/latest/)