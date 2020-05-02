// managers/mongoose
const mongoose = require('mongoose');
const WrapAggregation = require('./aggregation');

/* TYPE DEFS */
/**
 * @typedef ConnectionOptions
 * @property {*} property
 */

/**
 * @typedef {Object} Aggregation
 * @prop {AggregationChain} addCursorFlag
 * @prop {AggregationChain} addFields
 * @prop {AggregationChain} allowDiskUse
 * @prop {AggregationChain} append
 * @prop {Aggregation.then} catch
 * @prop {AggregationChain} collation
 * @prop {AggregationChain} count
 * @prop {Aggregation.countDocuments} countDocuments
 * @prop {Aggregation.cursor} cursor
 * @prop {Aggregation.exec} exec
 * @prop {Aggregation.explain} explain
 * @prop {AggregationChain} facet
 * @prop {AggregationChain} graphLookup
 * @prop {AggregationChain} group
 * @prop {AggregationChain} hint
 * @prop {AggregationChain} limit
 * @prop {AggregationChain} lookup
 * @prop {AggregationChain} match
 * @prop {Aggregation.model} model
 * @prop {AggregationChain} near $geoNear
 * @prop {AggregationChain} option
 * @prop {Object} options
 * @prop {Aggregation.pipeline} pipeline
 * @prop {AggregationChain} project
 * @prop {AggregationChain} read
 * @prop {AggregationChain} readConcern
 * @prop {AggregationChain} redact
 * @prop {AggregationChain} replaceRoot
 * @prop {AggregationChain} sample
 * @prop {AggregationChain} session
 * @prop {AggregationChain} skip
 * @prop {AggregationChain} sort
 * @prop {AggregationChain} sortByCount
 * @prop {Aggregation.then} then
 * @prop {AggregationChain} unwind
 */

/**
 * @callback AggregationChain
 * @returns {Aggregation}
 */

/**
 * @callback Aggregation.countDocuments
 * @returns {Promise<number>}
 */

/**
 * @callback Aggregation.cursor
 * @param {Object} options
 * @returns {mongoose.Aggregate}
 */

/**
 * @callback Aggregation.exec
 * @param {Object} [cursorOptions]
 * @returns {Promise}
 */

/**
 * @callback Aggregation.explain
 * @param {Function} callback
 * @returns {Promise}
 */

/**
 * @callback Aggregation.model
 * @param {mongoose.Model<mongoose.Document, {}>} [model]
 * @returns {AggregationChain|mongoose.Model<mongoose.Document, {}>}
 */

/**
 * @callback Aggregation.pipeline
 * @returns {Array}
 */

/**
 * @callback Aggregation.then
 * @returns {Promise}
 */

/**
 * @typedef {Object} ModelPlus
 * @prop {Aggregation} aggregation
 */

/**
 * @typedef {mongoose.Model<mongoose.Document, {}> & ModelPlus} YungooseModel
 *
 */
/* /TYPE DEFS */


/**
 *
 * @param {String} name
 * @param {String} uri
 * @param {ConnectionOptions} options ConnectionOptions
 * @param {{name: String, schema: Schema, collection?: String}[]} [modelsConf]
 * @param {*} [promiseLib]
 */
function Yungoose(name, uri, options, modelsConf) {
  // promise library
  if (options && options.promiseLibrary) {
    mongoose.Promise = options.promiseLibrary;
  } else {
    mongoose.Promise = Promise;
  }

  /**
   * @type {mongoose.Connection}
   */
  var connection;

  const schemas = {};

  function registerConnectionEvents() {
    connection.on('connecting', () => {
      Log.warn('Connecting [%s] ...', name);
    });
    connection.on('connected', () => {
      Log.info('[%s] connected!', name);
    });
    connection.on('disconnecting', () => {
      Log.warn('Disconnecting [%s] ...', name);
    });
    connection.on('disconnected', () => {
      Log.warn('[%s] has been disconnected!', name);
    });
    connection.on('close', () => {
      Log.info('[%s] has been closed!', name);
    });
    connection.on('reconnected', () => {
      Log.warn('[%s] has been reconnected!', name);
    });
    connection.on('error', (err) => {
      Log.error('[%s] %O', name, err);
    });
    connection.on('fullsetup', () => {
      Log.info('[%s] connected to the primary and one secondary server', name);
    });
    connection.on('all', () => {
      Log.info('[%s] connected to all servers', name);
    });
    connection.on('reconnectFailed', () => {
      Log.error('[%s] failed to reconnect', name);
    });
  }

  if (modelsConf) {
    modelsConf
      .filter((im) => im && im.name && im.schema)
      .forEach((im) => {
        schemas[im.name] = im;
      });
  }

  this.getType = function () {
    return 'mongoose';
  };

  this.getConnectionName = function () {
    return name;
  };

  this.createConnection = () => {
    Log.info('Create connection [%s]', name);
    this.close();
    connection = mongoose.createConnection(uri, options);
    registerConnectionEvents();

    for (var key in schemas) {
      this.addModel(schemas[key]);
    }

    return connection;
  };

  this.getConnection = function () {
    if (
      typeof connection == 'undefined' ||
      (connection.readyState != 1 && connection.readyState != 2)
    ) {
      this.createConnection();
    }
    return connection;
  };

  this.closeConnection = function () {
    if (connection) {
      connection.close();
    }
    connection = undefined;
  };

  this.close = function () {
    this.closeConnection();
  };

  /**
   * @param {{name: String, schema: Schema, collection?: String}} m
   */
  this.addModel = function (m) {
    this.getConnection();

    const model = connection.model(m.name, m.schema, m.collection);

    // add wrapper properties
    if (!model.aggregation) {
      var aggregation = WrapAggregation(model);
      Object.defineProperties(model, {
        aggregation: {
          enumerable: true,
          get: () => aggregation(),
        },
      });
    }

    Log("[%s] added model '%s'", name, m.name);

    return model;
  };

  /**
   * @returns {YungooseModel}
   */
  this.getModel = function (key) {
    this.getConnection();

    return connection.model(key);
  };

  this.getModels = function () {
    this.getConnection();
    const models = {};
    connection
      .modelNames()
      .forEach((name) => (models[name] = connection.model(name)));
    return models;
  };

  this.disconnectAll = function () {
    mongoose.disconnect();
  };

  /** utils **/

  this.toObjectId = function (value) {
    try {
      value = mongoose.Types.ObjectId(value);
    } catch (e) {}
    return value;
  };
}

Yungoose.TYPE = 'mongoose';

module.exports = Yungoose;
