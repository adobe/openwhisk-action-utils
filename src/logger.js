/*
 * Copyright 2019 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */
/* eslint-disable no-underscore-dangle,no-console,no-else-return */

/**
 * Wrap function that returns an OpenWhisk function that is enabled with logging.
 *
 * **Usage:**
 *
 * ```js
 * const { logger, wrap } = require('@adobe/openwhisk-action-utils'};
 *
 * async main(params) {
 *   //…my action code…
 * }
 *
 * module.exports.main = wrap(main)
 *   .with(logger);
 * ```
 *
 * @module logger
 */

const path = require('path');
const fs = require('fs');
const http = require('http');
const bunyan = require('bunyan');
const dotenv = require('dotenv');
const {
  BunyanStreamInterface, eraseBunyanDefaultFields, rootLogger,
  JsonifyForLog, MultiLogger,
} = require('@adobe/helix-log');
const createPapertrailLogger = require('./logger-papertrail');
const createCoralogixLogger = require('./logger-coralogix');

let _config = null;
function config() {
  if (!_config) {
    _config = {
      ...{
        LOG_LEVEL: 'info',
        LOG_FORMAT: 'simple',
      },
      ...dotenv.parse(path.resolve(process.cwd(), '.env')),
      ...process.env,
    };
    try {
      const pkgJson = JSON.parse(fs.readFileSync('package.json', 'utf-8'));
      _config.pkgName = pkgJson.name;
    } catch (e) {
      _config.pkgName = 'n/a';
    }
  }
  return _config;
}

// define special 'serializers' for express request
JsonifyForLog.impl(http.IncomingMessage, (req) => ({
  method: req.method,
  url: req.url,
  headers: req.headers,
}));

// define special 'serializers' for express response
JsonifyForLog.impl(http.ServerResponse, (res) => {
  if (!res || !res.statusCode) {
    return res;
  }
  return {
    statusCode: res.statusCode,
    duration: res.duration,
    headers: res.getHeaders(),
  };
});

/**
 * Special logger for openwhisk actions that adds the activation id, action name and
 * transaction id to each log message.
 * @private
 */
class OpenWhiskLogger extends MultiLogger {
  constructor(logger, opts) {
    super(logger, {
      ...opts,
      filter: (fields) => ({
        ow: {
          activationId: process.env.__OW_ACTIVATION_ID || 'n/a',
          actionName: process.env.__OW_ACTION_NAME || 'n/a',
          transactionId: process.env.__OW_TRANSACTION_ID || 'n/a',
        },
        ...fields,
      }),
    });
  }
}

/**
 * Bunyan serializers
 * @private
 */
const serializers = {
  res: (res) => {
    if (!res || !res.statusCode) {
      return res;
    }
    return {
      statusCode: res.statusCode,
      duration: res.duration,
      headers: res.getHeaders(),
    };
  },
  req: bunyan.stdSerializers.req,
  err: bunyan.stdSerializers.err,
};

/**
 * Initializes a helix-log logger for use with an openwhisk action.
 * It ensures that, the given logger has a default console logger configured. It also looks for
 * credential params and tries to add additional external logger (eg. coralogix, papertrail).
 *
 * @private
 * @param {*} params                        - the openwhisk action params
 * @param {MultiLogger} [logger=rootLogger] - a helix multi logger. defaults to the helix
 *                                            `rootLogger`.
 */
function setupHelixLogger(params, logger = rootLogger) {
  // add openwhisklogger to helix-log logger
  if (!logger.loggers.has('OpenWhiskLogger')) {
    const owLogger = new OpenWhiskLogger({});
    logger.loggers.set('OpenWhiskLogger', owLogger);

    // add coralogix logger
    const coralogix = createCoralogixLogger(config(), params);
    if (coralogix) {
      owLogger.loggers.set('CoralogixLogger', coralogix);
      // eslint-disable-next-line no-console
      console.log('configured coralogix logger.');
    }

    // add papertail logger
    const papertrail = createPapertrailLogger(config(), params);
    if (papertrail) {
      owLogger.loggers.set('PapertraiLogger', papertrail);
      // eslint-disable-next-line no-console
      console.log('configured papertrail logger.');
    }
  }
  return logger;
}

/**
 * Sets up a bunyan logger suitable to use with an openwhisk action. The bunyan logger will
 * stream to the given helix logger. It will add a new bunyan-logger to `params.__ow_logger`
 * if not already present.
 *
 * @private
 * @param {*} params                   - the openwhisk action params
 * @param {Logger} [logger=rootLogger] - a helix multi logger. defaults to the helix `rootLogger`.
 * @return {BunyanLogger} A bunyan logger
 */
function setupBunyanLogger(params, logger = rootLogger) {
  const cfg = config();
  if (!params.__ow_logger) {
    // eslint-disable-next-line no-param-reassign
    params.__ow_logger = bunyan.createLogger({
      name: cfg.pkgName,
      serializers,
      streams: [],
    });
  }
  const { __ow_logger: log } = params;

  // check if not already added
  if (!log.streams.find((s) => s.name === 'BunyanStreamInterface')) {
    log.addStream({
      name: 'BunyanStreamInterface',
      level: 'trace',
      type: 'raw',
      stream: new BunyanStreamInterface({
        logger,
        filter: eraseBunyanDefaultFields,
      }),
    });
  }
  return log;
}

/**
 * Initializes helix-log and sets up external loggers. It also creates a bunyan-logger
 * if not already present on `params.__ow_logger`.
 *
 * @param {*} params - openwhisk action params.
 * @param {MultiLogger} [logger=rootLogger] - a helix multi logger. defaults to the helix
 *                                            `rootLogger`.
 * @return BunyanLogger A bunyan logger.
 */
function init(params, logger = rootLogger) {
  setupHelixLogger(params, logger);
  setupBunyanLogger(params, logger);
  return params.__ow_logger;
}

/**
 * Takes a main OpenWhisk function and intitializes logging, by invoking {@link init}.
 * It logs invocation details on `trace` level before and after the actual action invocation.
 * it also creates a bunyan logger and binds it to the `__ow_logger` params.
 *
 * @param {ActionFunction} fn - original OpenWhisk action main function
 * @param {*} params - OpenWhisk action params
 * @param {MultiLogger} [logger=rootLogger] - a helix multi logger. defaults to the helix
 *                                            `rootLogger`.
 * @returns {*} the return value of the action
 */
async function wrap(fn, params = {}, logger = rootLogger) {
  try {
    const disclosedParams = { ...params };
    Object.keys(disclosedParams)
      .forEach((key) => {
        if (key.match(/^[A-Z0-9_]+$/)) {
          delete disclosedParams[key];
        }
      });
    const log = init(params, logger);
    try {
      log.trace({
        params: disclosedParams,
      }, 'before');
      const result = await fn(params);
      log.trace({
        result,
      }, 'result');
      return result;
    } catch (e) {
      log.error({
        params: disclosedParams,
        error: e,
      }, 'error');
      return {
        statusCode: e.statusCode || 500,
      };
    }
  } catch (e) {
    console.error(e);
    return {
      statusCode: e.statusCode || 500,
    };
  }
}

/**
 * Wrap function that returns an OpenWhisk function that is enabled with logging.
 *
 * @example <caption></caption>
 *
 * ```js
 * const { logger, wrap } = require('@adobe/openwhisk-action-utils'};
 *
 * async main(params) {
 *   //…my action code…
 * }
 *
 * module.exports.main = wrap(main)
 *   .with(logger);
 * ```
 *
 * @function logger
 * @param {ActionFunction} fn - original OpenWhisk action main function
 * @param {MultiLogger} [logger=rootLogger] - a helix multi logger. defaults to the helix
 *                                            `rootLogger`.
 * @returns {ActionFunction} a new function with the same signature as your original main function
 */
function wrapper(fn, logger = rootLogger) {
  return (params) => wrap(fn, params, logger);
}

module.exports = Object.assign(wrapper, {
  wrap,
  init,
});
