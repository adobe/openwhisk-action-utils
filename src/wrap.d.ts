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

/**
 * A function that makes your action function (i.e. `main`) wrappable,
 * so that using `with` a number of wrappers can be applied. This allows
 * you to export the result as a new function.
 *
 * Usage:
 *
 * ```js
 * async main(params) {
 *   //…my action code…
 * }
 *
 * module.exports.main = wrap(main)
 * .with(epsagon)
 * .with(status)
 * .with(logger);
 * ```
 * Note: the execution order is that the last wrapper added will be executed first.
 * @param {ActionFunction} main the `main` function to prepare for wrapping
 * @returns {WrappableActionFunction} the same main function, now including a `with` method
 */
export declare function wrap(main: ActionFunction): WrappableActionFunction;

/**
 * The `main` function of an OpenWhisk action.
 * @param {object} params the parameters of the action function
 * @returns {object} a result
 */
export declare type ActionFunction = (params: object) => object;

/**
 * An `ActionFunction` that has been augmented to become wrappable using the `with` method.
 */
export declare interface WrappableActionFunction {
  (params: object): object;

  /**
   * Wraps `this` action function with a wrapper created by the `fn`.
   * @param {WrapFunction} fn A wrap function that creates the wrapper.
   * @param {...*} opts Additional configuration options for the wrapping function.
   */
  with(fn: WrapFunction, ...opts: any[]): WrappableActionFunction;
}

/**
 * A function that wraps (and invokes your main function). It can be used
 * to decorate inputs or outputs, or to provide additional functionality
 * like logging, tracing, debugging, etc.
 *
 * @example
 *
 * ```js
 * function tracer(fn, level) {
 *   return (params) => {
 *     log[level]('enter');
 *     const ret = fn(params);
 *     log[level]('exit');
 *     return ret;
 *   }
 * }
 * ```
 *
 * @param {ActionFunction} main your main function
 * @param {...*} opts configuration options for the wrapping function
 * @returns {ActionFunction} a new function with the same signature as your original main function
 */
export declare type WrapFunction = (main: ActionFunction, ...opts: any[]) => ActionFunction;
