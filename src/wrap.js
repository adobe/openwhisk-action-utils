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
 * @callback ActionFunction
 * This is your `main` function that does the actual work.
 * @param {object} params the parameters of the action function
 * @returns {object} a result
 */

/**
 * @callback WrappingFunction
 * A function that wraps (and invokes your main function). It can be used
 * to decorate inputs or outputs, or to provide additional functionality
 * like logging, tracing, debugging, etc.
 * @param {ActionFunction} main your main function
 * @param {...*} opts configuration options for the wrapping function
 * @returns {ActionFunction} a new function with the same signature as your original main function
 */

/**
 * @callback WrapFunction
 * A method on a `WrappableActionFunction` that wraps this action function
 * with a wrapping function.
 * @param {WrappingFunction} wrapper the wrapping function to apply
 * @param {...*} opts options for the wrapping function
 */

/**
 * @typedef WrappableActionFunction
 * @extends function
 * An `ActionFunction` that has been augmented to become wrappable using the `with` method.
 *
 * @property {WrapFunction} with wraps the current function with the provided wrapping function
 */

/**
 * A function that makes your action function (i.e. `main`) wrappable,
 * so that using `with` a number of wrappers can be applied. This allows
 * you to export the result as a new function.
 *
 * Usage:
 *
 * ```javascript
 * async main(params) {
 *   //…my action code…
 * }
 *
 * module.exports.main = wrap(main)
 * .with(logger)
 * .with(status)
 * .with(epsagon);
 * ```
 * Note: the execution order is that the last wrapper added will be executed first.
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
