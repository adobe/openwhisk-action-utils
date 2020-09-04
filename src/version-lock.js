/*
 * Copyright 2020 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */
const querystring = require('querystring');
const path = require('path').posix;

/**
 * Helper class that uses the information in the `x-ow-version-lock` header to lock the version
 * of an openwhisk action.
 */
class VersionLock {
  /**
   * The name of the version lock header.
   * @returns {string} 'x-ow-version-lock'
   */
  static get X_OW_VERSION_LOCK() {
    return 'x-ow-version-lock';
  }

  /**
   * Creates a version lock class.
   * @param {object} params the openwhisk action params
   * @param {object} defaults the action name defaults.
   * @constructor
   */
  constructor({
    __ow_headers: headers = {},
    __ow_logger: logger = console,
    X_OW_VERSION_LOCK: lockParam,
  } = {}, defaults = {}) {
    this._header = headers[VersionLock.X_OW_VERSION_LOCK] || lockParam || '';
    this._locks = querystring.parse(this._header);
    // eslint-disable-next-line no-underscore-dangle
    this._defaults = {
      api: 'https://adobeioruntime.net/api/v1',
      // eslint-disable-next-line no-underscore-dangle
      namespace: process.env.__OW_NAMESPACE || '',
      packageName: '',
      ...defaults,
    };
    this._log = logger;
    this._hasLocks = Object.keys(this._locks).length > 0;
    if (this.hasLocks) {
      this._log.info(`initialized version lock with ${JSON.stringify(this._locks)}`);
    }
  }

  get log() {
    return this._log;
  }

  get hasLocks() {
    return this._hasLocks;
  }

  get header() {
    return this._header;
  }

  /**
   * Transforms an action url according to the lock information.
   * @param {string} url the action url.
   */
  transformActionURL(url) {
    // ignore urls not starting with API prefix
    if (!url.startsWith(this._defaults.api)) {
      return url;
    }
    // assume action name is last part of url
    const idx = url.lastIndexOf('/');
    const name = url.substring(idx + 1);
    const actionName = this.getLockedActionName(name);
    if (actionName === name) {
      return url;
    }
    return url.substring(0, idx + 1) + actionName;
  }

  createActionURL(opts) {
    const { name } = opts;
    if (!name) {
      throw Error('action name missing.');
    }
    const namespace = opts.namespace || this._defaults.namespace;
    if (!namespace) {
      throw Error('namespace missing.');
    }
    const api = opts.api || this._defaults.api;
    const packageName = opts.packageName || this._defaults.packageName;
    const actionName = this.getLockedActionName(name);
    return new URL(path.join(api, 'web', namespace, packageName, actionName));
  }

  getLockedActionName(name) {
    let actionName = this._locks[name];
    if (!actionName) {
      // test un-versioned variant
      const idx = name.lastIndexOf('@');
      if (idx > 0) {
        actionName = this._locks[name.substring(0, idx)];
      }
    }
    if (actionName) {
      this.log.info(`Using locked version ${actionName} for ${name} service.`);
      return actionName;
    }
    return name;
  }

  /**
   * Enhances an openwhisk client by wrapping the `invoke` method for automatic action name
   * replacement.
   * @param {OpenWhisk} ow openwhisk client
   * @returns {OpenWhisk} the wrapped client
   */
  wrapOpenwhisk(ow) {
    if (!this.hasLocks) {
      return ow;
    }
    const { client, invoke } = ow.actions;
    const originalParams = client.params.bind(client);
    const originalInvoke = invoke.bind(ow.actions);

    // inject x-ow-version-lock if not present
    client.params = async (...args) => {
      const ps = await originalParams(...args);
      ps.headers[VersionLock.X_OW_VERSION_LOCK] = this.header;
      return ps;
    };

    // override invoke method
    // eslint-disable-next-line no-param-reassign
    ow.actions.invoke = async (options) => {
      let { name } = options;
      // check if name has package
      const idx = name.indexOf('/');
      if (idx > 0) {
        name = name.substring(0, idx + 1) + this.getLockedActionName(name.substring(idx + 1));
      } else {
        name = this.getLockedActionName(options.name);
      }

      // eslint-disable-next-line no-param-reassign
      options.name = name;
      return originalInvoke(options);
    };

    return ow;
  }
}

module.exports = VersionLock;
