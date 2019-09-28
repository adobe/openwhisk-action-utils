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

const path = require('path');
const fs = require('fs');
const http = require('http');
const bunyan = require('bunyan');
const dotenv = require('dotenv');
const {
  Bunyan2HelixLog, rootLogger, ConsoleLogger, messageFormatSimple, JsonifyForLog,
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

const openhwiskConsoleLogger = new ConsoleLogger({
  level: config().LOG_LEVEL,
  stream: process.stdout,
  formatter: (msg, opts) => {
    // remove last message argument if object. this suppresses the bunyan fields being
    // logged to the activation logs. once helix-log supports proper data logging,
    // this can be simplified.
    if (msg.length > 0) {
      const lst = msg[msg.length - 1];
      if (typeof lst === 'object' && !(lst instanceof Error)) {
        // eslint-disable-next-line no-param-reassign
        msg = msg.slice(0, msg.length - 1);
      }
    }
    return messageFormatSimple(msg, opts);
  },
});

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

function addLogger(parent, name, createFN, cfg, params) {
  const logger = createFN(cfg, params);
  if (!logger) {
    return false;
  }
  if (parent.loggers.has(name)) {
    return true;
  }
  parent.loggers.set(name, logger);
  return true;
}

/**
 * Initializes a helix-log logger for use with an openwhisk action.
 * It ensures that, the given logger has a default console logger configured. It also looks for
 * credential params and tries to add additional external logger (eg. coralogix, papertrail).
 *
 * @param {*} params                        - the openwhisk action params
 * @param {MultiLogger} [logger=rootLogger] - a helix multi logger. defaults to the helix
 *                                            `rootLogger`.
 */
function setupHelixLogger(params, logger = rootLogger) {
  // replace default logger with our own console logger
  logger.loggers.set('default', openhwiskConsoleLogger);

  if (addLogger(logger, 'CoralogixLogger', createCoralogixLogger, config(), params)) {
    // eslint-disable-next-line no-console
    console.log('configured coralogix logger.');
  }
  if (addLogger(logger, 'PapertraiLogger', createPapertrailLogger, config(), params)) {
    // eslint-disable-next-line no-console
    console.log('configured papertrail logger.');
  }
  return logger;
}

/**
 * Creates a bunyan logger suitable to use with an openwhisk action. The bunyan logger will
 * stream to the given helix logger.
 * It will also setup external log streams (papertrail) if the respective credentials
 * are available.
 *
 * Please note that those external streams are not support by helix-log and therefore only
 * work with this bunyan logger.
 *
 * @param {*} params                   - the openwhisk action params
 * @param {Logger} [logger=rootLogger] - a helix multi logger. defaults to the helix `rootLogger`.
 */
function createBunyanLogger(params, logger = rootLogger) {
  const cfg = config();
  return bunyan.createLogger({
    name: cfg.pkgName,
    serializers,
    streams: [{
      name: 'Bunyan2HelixLog',
      level: 'trace',
      type: 'raw',
      stream: new Bunyan2HelixLog(logger),
    }],
  });
}

/**
 * Initializes helix-log and sets up external loggers. It also creates a bunyan-logger
 * if not already present on `params.__ow_logger`.
 *
 * @param {*} params - openwhisk action params.
 * @param {MultiLogger} [logger=rootLogger] - a helix multi logger. defaults to the helix
 *                                            `rootLogger`.
 */
function init(params, logger = rootLogger) {
  setupHelixLogger(params, logger);
  if (!params.__ow_logger) {
    // eslint-disable-next-line no-param-reassign
    params.__ow_logger = createBunyanLogger(params);
  }
  return params.__ow_logger;
}

/**
 * Wraps a main openwhisk function and intitializes logging.
 * it also creates a bunyan logger and binds it to the `__ow_logger` params.
 *
 * @param {Function} fn - original openwhisk action main function
 * @param {*} params - openwhisk action params
 * @returns {*} the return value of the action
 */
async function wrap(fn, params = {}) {
  try {
    const disclosedParams = { ...params };
    Object.keys(disclosedParams)
      .forEach((key) => {
        if (key.match(/^[A-Z0-9_]+$/)) {
          delete disclosedParams[key];
        }
      });
    const logger = init(params);
    try {
      logger.trace({
        params: disclosedParams,
      }, 'before');
      const result = await fn(params);
      logger.trace({
        result,
      }, 'result');
      return result;
    } catch (e) {
      logger.error({
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

module.exports = {
  wrap,
  init,
  setupHelixLogger,
  createBunyanLogger,
};
