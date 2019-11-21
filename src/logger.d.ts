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

import { ActionFunction } from './wrap';
import { MultiLogger } from '@adobe/helix-log';

/**
 * Logger from Bunyan
 * @see https://github.com/trentm/node-bunyan
 */
declare interface BunyanLogger {}

/**
 * Options for the wrap functions
 */
declare interface WrapOptions {

  /**
   * Helix multi logger. defaults to the helix `rootLogger`.
   */
  logger?: MultiLogger,

  /**
   * Additional fields to log with the `ow` logging fields.
   */
  fields?: object,
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
 * @param {WrapOptions} [opts] - optional options.
 * @returns {ActionFunction} a new function with the same signature as your original main function
 */
export declare function logger(fn: ActionFunction, opts: WrapOptions): ActionFunction;

export declare namespace logger {
  /**
   * Initializes helix-log and sets up external loggers. It also creates a bunyan-logger
   * if not already present on `params.__ow_logger`.
   *
   * @param {*} params - openwhisk action params.
   * @param {MultiLogger} [logger=rootLogger] - a helix multi logger. defaults to the helix
   *                                            `rootLogger`.
   * @returns BunyanLogger a bunyan logger.
   */
  export function init(params: object, logger: MultiLogger): BunyanLogger;

  /**
   * Takes a main OpenWhisk function and intitializes logging, by invoking {@link init}.
   * it also creates a bunyan logger and binds it to the `__ow_logger` params.
   *
   * @param {ActionFunction} fn - original OpenWhisk action main function
   * @param {*} params - OpenWhisk action params
   * @param {WrapOptions} [opts] - optional options.
   * @returns {*} the return value of the action
   */
  export function wrap(fn: ActionFunction, params: object, opts: WrapOptions): object;

  /**
   * Creates a tracer function that logs invocation details on `trace` level before and after the
   * actual action invocation.
   *
   * @param {ActionFunction} fn - original OpenWhisk action main function
   * @returns {ActionFunction} an action function instrumented with tracing.
   */
  export function trace(fn: ActionFunction): ActionFunction;
}
