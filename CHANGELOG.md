# Changelog

## [2.1.0] - 2026-02-02

### Changed

#### Breaking Changes
- `IManager.isConnected()` method now returns `Promise<boolean>` instead of `boolean` (async instead of sync)
- `Registry.isConnected(manager?: string)` method now returns `Promise<boolean>` instead of `boolean` (async instead of sync)

---

## Migration Guide (2.0.x → 2.1.0)

### Breaking Changes

#### isConnected() is now async

```typescript
// Before (2.0.x)
if (manager.isConnected()) {
  // do something
}

// After (2.1.0)
if (await manager.isConnected()) {
  // do something
}

// Or at registry level
// Before
if (Storehouse.isConnected('myManager')) {
  // do something
}

// After
if (await Storehouse.isConnected('myManager')) {
  // do something  
}
```

- Some database drivers need async operations to accurately determine connection status
- Provides more accurate health checks across different database types
- Aligns with the async nature of connection management

---

## [2.0.0] - 2026-02-01

### Added

#### Custom Error Classes
- Added `StorehouseError` base class for all Storehouse-specific errors
- Added `ManagerAlreadyExistsError` - thrown when attempting to add a manager with a name that already exists
- Added `ManagerNotFoundError` - thrown when a requested manager is not found in the registry
- Added `ManagerTypeNotFoundError` - thrown when a manager type string is not registered
- Added `ModelNotFoundError` - thrown when a model cannot be found
- Added `InvalidManagerConfigError` - thrown when manager configuration is invalid
- Added `ConnectionError` - thrown for connection-related failures, with optional `cause` property

#### Lifecycle Events
- `Registry` now extends `EventEmitter` for comprehensive lifecycle event support
- Added `RegistryEvents` interface for type-safe event handling with full TypeScript autocomplete
- Manager events:
  - `manager:before:add` - emitted before a manager is added
  - `manager:added` - emitted after a manager is successfully added
  - `manager:removed` - emitted when a manager is removed
  - `manager:default:changed` - emitted when the default manager changes
- Connection events:
  - `connection:before:close` - emitted before a connection closes
  - `connection:closed` - emitted after a connection is successfully closed
  - `connection:error:close` - emitted when closing a connection fails
  - `connection:accessed` - emitted when a connection is accessed
  - `connections:before:close:all` - emitted before closing all connections
  - `connections:closed:all` - emitted after all connections are closed
- Model events:
  - `model:accessed` - emitted when a model is accessed
- Registry events:
  - `registry:before:destroy` - emitted before the registry is destroyed
  - `registry:destroyed` - emitted after the registry is destroyed
- Overridden `emit()`, `on()`, `once()`, and `off()` methods with full type safety

#### Health Check Support
- Added `HealthCheckResult` interface with `healthy`, `message`, `details`, `latency`, and `timestamp` properties
- Added optional `healthCheck()` method to `IManager` interface for connection health verification
- Added optional `isConnected()` method to `IManager` interface for connection status checking
- Added `Registry.isConnected(manager?: string)` - check if a manager's connection is active
- Added `Registry.healthCheck(manager?: string)` - perform health check on a specific manager
- Added `Registry.healthCheckAll()` - perform health checks on all managers at once

#### Enhanced Validation
- Added comprehensive validation in `Registry.addManager()`:
  - Validates manager name is a non-empty string
  - Validates manager is a valid object
  - Validates manager implements `getConnection()` method
- Added validation in `ManagerFactory.getManager()`:
  - Validates argument is a valid object
  - Validates type is provided
  - Wraps constructor errors in `InvalidManagerConfigError` with helpful messages
- Added optional `throwOnMissing` parameter to `Registry.getManager()` for explicit error handling

### Changed

#### Breaking Changes
- Renamed default export class from `Storehouse` to `StorehouseRegistry` to allow exporting both class and singleton instance
- `Registry` now extends `EventEmitter` - may affect type checking in some cases
- Error handling now throws specific error types instead of generic `Error` instances

#### Improvements
- `Registry.closeConnection()` and `Registry.closeDefaultConnection()` now emit events and handle errors gracefully
- `Registry.closeAllConnections()` now emits `connections:before:close:all` and `connections:closed:all` events
- `Registry.destroy()` now emits `registry:before:destroy` and `registry:destroyed` events
- `Registry.getConnection()` now emits `connection:accessed` event
- `Registry.getModel()` now emits `model:accessed` event
- Improved error messages with consistent formatting and helpful context

### Documentation

#### JSDoc Coverage
- Added comprehensive JSDoc comments to all public interfaces and types:
  - `HealthCheckResult` interface with detailed property descriptions
  - `IManager` interface with method descriptions and examples
  - `ManagerSettings`, `ManagerArg`, and `ManagerConstructor` with template parameter documentation
  - `ManagerFactorySettings` and `ManagerFactoryArg` interfaces
  - `RegistryEvents` interface (implicit through event types)
- Added JSDoc to `ManagerFactory` class:
  - Constructor, `getManager()`, `setManagerType()`, and `removeManagerType()` methods
  - Includes `@throws` tags for error conditions
  - Includes `@example` tags for common usage patterns
- Added JSDoc to `Registry` class:
  - All public methods including new health check methods
  - Includes `@template` tags for generic type parameters
  - Includes `@throws` tags where applicable
- Added JSDoc to `RegistryFactory` class:
  - All methods with parameter and return type descriptions
  - Includes usage examples
- Added JSDoc to `StorehouseRegistry` class:
  - Constructor and all methods with detailed descriptions
  - Includes chaining behavior documentation
  - Includes `@example` tags for common patterns
- Added `@param` tags to all error class constructors

#### README Updates
- Added comprehensive "Events" section with:
  - Complete event type reference
  - Type-safe event handling examples
  - Real-world usage examples (monitoring, reconnection logic, custom registries)
- Added comprehensive "Health Checks" section with:
  - Method descriptions and signatures
  - `HealthCheckResult` structure documentation
  - API health endpoint example
  - Periodic monitoring example
  - Graceful degradation pattern
  - Custom manager implementation guide
  - Manager-specific health check details

### Testing
- Added 80+ comprehensive tests covering:
  - All custom error classes with proper error chaining and messages
  - All lifecycle events with multiple listeners and event ordering
  - Health check functionality including edge cases
  - Registry validation and edge cases
  - ManagerFactory validation and error handling
  - Event listener management (on, once, off)
  - Async operation handling
- Test coverage includes error paths, type coercion, and boundary conditions
- All tests passing with 100% success rate

### Internal
- Improved type safety throughout the codebase
- Better error propagation and handling
- Consistent use of private fields with `#` syntax
- Enhanced code organization and modularity

---

## Migration Guide (1.x → 2.0.0)

### Breaking Changes

#### Import Changes
```typescript
// Before (1.x)
import Storehouse from '@storehouse/core';

// After (2.0.0)
import { Storehouse } from '@storehouse/core';
// Or for the class itself:
import { StorehouseRegistry } from '@storehouse/core';
```

#### Error Handling
```typescript
// Before (1.x)
try {
  Storehouse.addManager('test', manager);
} catch (error) {
  if (error.message.includes('already exists')) {
    // handle duplicate
  }
}

// After (2.0.0)
import { ManagerAlreadyExistsError } from '@storehouse/core';

try {
  Storehouse.addManager('test', manager);
} catch (error) {
  if (error instanceof ManagerAlreadyExistsError) {
    // handle duplicate
  }
}
```

### New Features You Should Use

#### Add Event Monitoring

```typescript
Storehouse.on('manager:added', ({ name }) => {
  console.log(`Manager ${name} registered`);
});

Storehouse.on('connection:error:close', ({ manager, error }) => {
  console.error(`Connection error for ${manager}:`, error);
  // Send to monitoring service
});
```

#### Add Health Checks

```typescript
// Check connection status
if (Storehouse.isConnected('myManager')) {
  // proceed with operations
}

// Periodic health monitoring
setInterval(async () => {
  const health = await Storehouse.healthCheck();
  if (!health?.healthy) {
    // trigger alerts
  }
}, 30000);

// API health endpoint
app.get('/health', async (req, res) => {
  const results = await Storehouse.healthCheckAll();
  const allHealthy = Object.values(results).every(r => r.healthy);
  res.status(allHealthy ? 200 : 503).json(results);
});
```

[Unreleased]: https://github.com/kisiwu/storehouse-core/compare/v2.1.0...HEAD
[2.1.0]: https://github.com/kisiwu/storehouse-core/compare/v2.0.0...v2.1.0
[2.0.0]: https://github.com/kisiwu/storehouse-core/commits/v2.0.0