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
const crypto = require('crypto');

/**
 * Helper functions for expressified actions.
 *
 * **Usage:**
 *
 * ```js
 * const {
 *   expressify, logRequest, errorHandler, asyncHandler, cacheControl, createBunyanLogger,
 * } = require('@adobe/openwhisk-action-utils');
 *
 * async function startHandler(params, req, res) {
 *    res.send('Hello, world.');
 * }

 * async function main(params) {
 *   const log = createBunyanLogger();
 *   const app = express();
 *   app.use(logRequest(log));
 *   app.use(cacheControl());
 *   app.get('/', asyncHandler(startHandler));
 *   app.get('/ping', asyncHandler(pingHandler));
 *   app.use(errorHandler(log));
 *
 *   return expressify(app)(params);
 * }
 * ```
 *
 * @module middleware
 */

/**
 * Extended middleware function to be use with the {@link module:middleware~asyncHandler}.
 *
 * @see https://expressjs.com/en/4x/api.html#middleware-callback-function-examples
 *
 * @callback ActionMiddlewareFunction
 * @param {*} params The action params
 * @param {ExpressRequest} req The express request
 * @param {ExpressResponse} res The express response
 * @param {ExpressMiddleware} next The next handler in chain.
 */

/**
 * Error handler. Reports errors that happen during the request processing and responds
 * with a `500` if not already set.
 *
 * @example <caption></caption>
 *
 * ```js
 * // install last
 * app.use(errorHandler(log));
 * ```
 *
 * @param {BunyanLogger} log The logger to use for reporting errors.
 * @returns {ExpressMiddleware} an express middleware function.
 */
function errorHandler(log) {
  return (err, req, res, next) => {
    log.error(err.message);
    if (log.level() < 20) {
      // only log on trace level
      log.error(err.stack);
    }
    if (!res.headersSent) {
      res.status(err.status || 500).send();
    }
    next();
  };
}

/**
 * Ensures cache control. Sets cache control headers.
 *
 * @example <caption></caption>
 *
 * ```
 * app.use(cacheControl());
 * ```
 *
 * @param {string} [value = no-store, private, must-revalidate] Cache control header value.
 * @returns {ExpressMiddleware} an express middleware function.
 */
function cacheControl(value = 'no-store, private, must-revalidate') {
  return (req, res, next) => {
    if (!res.get('cache-control')) {
      res.set('cache-control', value);
    }
    next();
  };
}

/**
 * Creates a bunyan child logger for the request and adds it to the request. This ensures that
 * important header values, like `x-request-id` are included in every log entry. It also
 * logs the request and response lines.
 *
 * @example <caption></caption>
 *
 * ```js
 * // install first
 * app.use(logRequest(log));
 * ```
 *
 * @param {BunyanLogger} logger - the bunyan logger
 * @param {string} [level=debug] - the log level to use for logging the request information.
 * @returns {ExpressMiddleware} an express middleware function.
 */
function logRequest(logger, level = 'debug') {
  if (typeof logger[level] !== 'function') {
    throw Error(`invalid log level specified: ${level}`);
  }
  return (req, res, next) => {
    // Use X-Request-ID from request if it is set, otherwise generate a uuid
    req.id = req.headers['x-request-id']
      || req.headers['x-github-delivery']
      || crypto.randomBytes(16).toString('hex');
    res.setHeader('x-request-id', req.id);

    // Make a logger available on the request
    req.log = logger.child({ id: req.id });
    req.log.fields.name = 'http';

    // Request started
    req.log[level]({ req }, `${req.method} ${req.url}`);

    // Start the request timer
    const time = process.hrtime();

    res.on('finish', () => {
      // Calculate how long the request took
      const [seconds, nanoseconds] = process.hrtime(time);
      res.duration = (seconds * 1e3 + nanoseconds * 1e-6).toFixed(2);

      const message = `${req.method} ${req.url} ${res.statusCode} - ${res.duration} ms`;

      if (req.log) {
        req.log[level]({ res }, message);
      }
    });
    next();
  };
}

/**
 * Wraps the route middleware so it can catch potential promise rejections
 * during the async invocation.
 *
 * @param {ExpressMiddleware} fn an extended express middleware function
 * @returns {ExpressMiddleware} an express middleware function.
 */
function asyncHandler(fn) {
  return (req, res, next) => (Promise.resolve(fn(req, res, next)).catch(next));
}

module.exports = {
  errorHandler,
  cacheControl,
  logRequest,
  asyncHandler,
};
