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
 * @module middleware
 * @private
 * @todo: ensure good jsdoc
 */

/**
 * Error handler.
 *
 *
 * ```
 * ...
 * // install last
 * app.use(errorHandler(log));
 * ```
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
 * Ensures cache control.
 *
 * ```
 * app.use(cacheControl());
 * ```
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
 * Creates a bunyan child logger for the request and adds it to the request.
 * @param {Bunyan} logger - the bunyan logger
 *
 * ```
 * // install first
 * app.use(logRequest(log));
 * ...
 * ```
 */
function logRequest(logger) {
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
    req.log.info({ req }, `${req.method} ${req.url}`);

    // Start the request timer
    const time = process.hrtime();

    res.on('finish', () => {
      // Calculate how long the request took
      const [seconds, nanoseconds] = process.hrtime(time);
      res.duration = (seconds * 1e3 + nanoseconds * 1e-6).toFixed(2);

      const message = `${req.method} ${req.url} ${res.statusCode} - ${res.duration} ms`;

      if (req.log) {
        req.log.info({ res }, message);
      }
    });
    next();
  };
}

/**
 * Wraps the route middleware so it can bind the params and catch potential promise rejections
 * during the async invocation.
 *
 * @param fn {Function} the handler
 * @param params {object} action params
 * @returns {Function} the expressjs router function
 */
function asyncHandler(fn, params) {
  return (req, res, next) => (Promise.resolve(fn(params, req, res, next)).catch(next));
}

module.exports = {
  errorHandler,
  cacheControl,
  logRequest,
  asyncHandler,
};
