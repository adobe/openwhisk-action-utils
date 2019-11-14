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
 * Helper function to easily chain OpenWhisk actions.
 *
 * **Usage:**
 *
 * ```js
 * const { wrap } = require('@adobe/openwhisk-action-utils');
 *
 * async main(params) {
 *   // …my action code…
 * }
 *
 * module.exports.main = wrap(main)
 *   .with(epsagon)
 *   .with(status)
 *   .with(logger);
 * ```
 *
 * @module wrap
 */

/**
 * The `main` function of an OpenWhisk action.
 * @callback ActionFunction
 * @param {object} params the parameters of the action function
 * @returns {object} a result
 */

/**
 * An `ActionFunction` that has been augmented to become wrappable using the `with` method.
 * @callback WrappableActionFunction
 * @param {object} params the parameters of the action function
 * @returns {object} a result
 */

/**
 * Wraps `this` action function with a wrapper created by the `fn`.
 *
 * @method WrappableActionFunction.with
 * @function
 * @param {WrapFunction} fn A wrap function for creating wrappers
 * @param {...*} opts Options
 */

/**
 * A function that wraps (and invokes your main function). It can be used
 * to decorate inputs or outputs, or to provide additional functionality
 * like logging, tracing, debugging, etc.
 *
 * @example <caption></caption>
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
 * @callback WrapFunction
 * @param {ActionFunction} main your main function
 * @param {...*} opts configuration options for the wrapping function
 * @returns {ActionFunction} a new function with the same signature as your original main function
 */

/**
 * A function that makes your action function (i.e. `main`) wrappable,
 * so that using `with` a number of wrappers can be applied. This allows
 * you to export the result as a new function.
 *
 * @example <caption></caption>
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
 *
 * Note: the execution order is that the last wrapper added will be executed first.
 *
 * @param {ActionFunction} main the `main` function to prepare for wrapping
 * @returns {WrappableActionFunction} the same main function, now including a `with` method
 */
function wrap(main) {
  const withfn = function withfn(wrapper, ...opts) {
    const wrapped = wrapper(this, ...opts);
    wrapped.with = withfn;
    return wrapped;
  };

  // eslint-disable-next-line no-param-reassign
  main.with = withfn;
  return main;
}

module.exports = { wrap };
