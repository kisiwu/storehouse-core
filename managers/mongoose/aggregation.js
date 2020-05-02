// managers/mongoose/aggregation.js

// https://mongoosejs.com/docs/api/aggregate.html#aggregate_Aggregate
const mongoose = require('mongoose');

const AGGREGATE_METHODS = [
  'addCursorFlag',
  'addFields',
  'allowDiskUse',
  'append',
  'catch',
  'collation',
  'count',
  'countDocuments',
  'cursor',
  'exec',
  'explain',
  'facet',
  'graphLookup',
  'group',
  'hint',
  'limit',
  'lookup',
  'match',
  'model',
  'near', //$geoNear,
  'option',
  'pipeline',
  'project',
  'read',
  'readConcern',
  'redact',
  'replaceRoot',
  'sample',
  'session',
  'skip',
  'sort',
  'sortByCount',
  'then',
  'unwind',

  /*,
  "out",
  "indexStats",
  "bucket",
  "bucketAuto"*/
];

/**
 *
 * @param {*} aggregate
 * @param {Object} [cursorOptions]
 * @returns {Promise}
 */
function execWithDefaultCursor(aggregate, cursorOptions) {
  var cursor,
    doc,
    data = [],
    resp,
    PromiseClass = mongoose.Promise || Promise;
  resp = new PromiseClass(async function (resolve, reject) {
    try {
      cursor = aggregate.cursor(cursorOptions || {}).exec();
      while ((doc = await cursor.next())) {
        data.push(doc);
      }
      await cursor.close();
      resolve(data);
    } catch (e) {
      reject(e);
    }
  });

  return resp;
}

/**
 *
 * @param {*} aggregate
 * @param {Object[]} chain
 * @returns {Promise<number>}
 */
function countDocuments(aggregate, chain) {
  var cursor,
    doc,
    resp,
    count = 0,
    PromiseClass = mongoose.Promise || Promise;

  chain.forEach((ch) => {
    aggregate[ch.method].apply(aggregate, ch.args);
  });

  resp = new PromiseClass(async function (resolve, reject) {
    try {
      cursor = aggregate.count('count').cursor({}).exec();
      while ((doc = await cursor.next())) {
        count = doc.count || 0;
      }
      await cursor.close();
      resolve(count);
    } catch (e) {
      reject(e);
    }
  });

  return resp;
}

/**
 *
 * @param {mongoose.Model<mongoose.Document, {}>} model
 */
function WrapAggregation(model) {
  return function start() {
    var aggregate = model.aggregate(),
      aggregation = {},
      chain = [];

    AGGREGATE_METHODS.forEach((verb) => {
      aggregation[verb] = wrap(verb);
    });

    Object.defineProperties(aggregation, {
      // Aggregate.prototype.Symbol.asyncIterator()
      Symbol: {
        enumerable: true,
        get: () => aggregate.Symbol,
      },
      options: {
        enumerable: true,
        get: () => aggregate.options,
      },
    });

    function addChain(method, args) {
      chain.push({
        method,
        args,
      });
      return aggregate[method].apply(aggregate, args);
    }

    function wrap(verb) {
      return function () {
        var args = Array.from(arguments);

        if (['cursor', 'explain', 'pipeline'].indexOf(verb) > -1) {
          return aggregate[verb].apply(aggregate, args);
        }

        if (verb == 'model') {
          if (args.length) {
            aggregate[verb].apply(aggregate, args);
            return aggregation;
          } else {
            return aggregate[verb].apply(aggregate, args);
          }
        }

        // add default 'cursor' and exec
        if (verb == 'exec') {
          var cursorOptions;
          if (args && args.length) {
            cursorOptions = args[0];
          }
          return execWithDefaultCursor(aggregate, cursorOptions);
        }

        // add default 'cursor', count and exec
        if (verb == 'countDocuments') {
          var cursorOptions;
          if (args && args.length) {
            cursorOptions = args[0];
          }
          return countDocuments(aggregate.model().aggregate(), chain);
        }

        // add default 'cursor' and 'exec' if needed
        if (['catch', 'then'].indexOf(verb) > -1) {
          var promise = execWithDefaultCursor(aggregate);
          promise[verb].apply(promise, args);
          return promise;
        }

        aggregate = addChain(verb, args);
        return aggregation;
      };
    }

    return aggregation;
  };
}

module.exports = WrapAggregation;
