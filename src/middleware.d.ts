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

import { BunyanLogger } from "./createBunyanLogger";

/**
 * Express request.
 * @see https://expressjs.com/en/4x/api.html#req
 */
declare interface ExpressRequest {}

/**
 * Express response.
 * @see https://expressjs.com/en/4x/api.html#res
 */
declare interface ExpressResponse {}

/**
 * Express middle ware function.
 * @see https://expressjs.com/en/4x/api.html#middleware-callback-function-examples
 */
declare type ExpressMiddleware = (req: ExpressRequest, res: ExpressResponse, next: ExpressMiddleware) => void;

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
 * @param {BunyanLogger} logger The logger to use for reporting errors.
 * @returns {ExpressMiddleware} an express middleware function.
 */
export declare function errorHandler(logger: BunyanLogger): ExpressMiddleware;

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
export declare function cacheControl(value: string): ExpressMiddleware;

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
export declare function logRequest(logger: BunyanLogger, level?: string): ExpressMiddleware;

/**
 * Hides headers from enumeration.
 *
 * @example <caption></caption>
 *
 * ```js
 * // install first
 * app.use(hideHeaders(['x-token', 'authentication'));
 * app.use(logRequest(log));
 * ```
 *
 * @param {string[]} headerNames Names of headers to make un-enumerable
 * @returns {ExpressMiddleware} an express middleware function.
 */
export declare function hideHeaders(headerNames: string[]): ExpressMiddleware;

/**
 * Wraps the route middleware so it can catch potential promise rejections during the async
 * invocation.
 *
 * @param {ExpressMiddleware} fn an extended express middleware function
 * @returns {ExpressMiddleware} an express middleware function.
 */
export declare function asyncHandler(fn: ExpressMiddleware): ExpressMiddleware;
