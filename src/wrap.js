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
class WrapUtil {
  constructor(main = () => { }) {
    this.inner = main;
    this.wrapped = (...opts) => this.inner(...opts);
  }

  /**
  * @function run
  * @param {ActionFunction} fn The action function to run.
  * @returns {ActionFunction} A function that can be invoked as action.
  */
  run(fn) {
    // replace the innermost function
    if (fn) {
      this.inner = fn;
    }
    // and return the full wrapper
    return this.wrapped;
  }

  /**
  * @function with
  * @param {PluginFunction} wrapper The wrapper to apply to the action
  * @param {*} ...opts the options passed into the wrapper
  * @returns {WrapUtil} this
  */
  with(wrapper, ...opts) {
    // add another layer of wrapping
    this.wrapped = wrapper(this.wrapped, ...opts);
    // enable chaining
    return this;
  }
}

/**
 * Plugin function that returns the wrapper function.
 * @callback ActionFunction
 * @param {*} ...opts The options passed to the action.
 * @returns {*} A result.
 */

/**
 * Plugin function that returns the wrapper function.
 * The `wrap` function can be used to create a chain of wrappers around
 * a `main` function. Usage:
 *
 * ```javascript
 * async main(params) {
 *   //…my action code…
 * }
 *
 * module.exports.main = wrap()
 * .with(logger)
 * .with(status)
 * .with(epsagon)
 * .run(main);
 * ```
 * @callback PluginFunction
 * @param {ActionFunction} fn The function that this wrapper needs to invoke.
 * @param {*} ...opts The options passed to the action.
 * @returns {ActionFunction} An action function that can be invoked.
 */
function wrap(main) {
  return new WrapUtil(main);
}

module.exports = { wrap };
