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

// @ts-ignore
import openwhisk from 'openwhisk';

/**
 * Options for the wrap functions
 */
export declare interface CreateURLOptions {

  /**
   * Openwhisk API
   * @default 'https://adobeioruntime.net/api/v1'
   */
  api?: string,

  /**
   * Openhwisk namespace
   * @default `process.env.__OW_NAMESPACE`
   */
  namespace?: string,

  /**
   * Action package name
   * @default ''
   */
  packageName?: string,

  /**
   * Action name
   */
  name: string,
}

export declare class VersionLock {
  /**
   * The name of the version lock header.
   * @returns {string} 'x-ow-version-lock'
   */
  static X_OW_VERSION_LOCK;

  /**
   * Creates a version lock class.
   * @param {object} params the openwhisk action params
   * @param {object} defaults the action name defaults.
   * @constructor
   */
  constructor(params: object, defaults: object);

  /**
   * indicates if any locks were provided.
   */
  hasLocks: boolean;

  /**
   * Transforms an action url according to the lock information.
   * @param {string} url the action url.
   */
  transformActionURL(url: string): string;

  /**
   * Creates an URL for the specified action.
   * @param {CreateURLOptions} opts options
   * @return {URL} the action url
   */
  createActionURL(opts: CreateURLOptions): URL;

  /**
   * Returns the locked action name.
   * @param {string} name Action name
   * @return {string} locked action name.
   */
  getLockedActionName(name: string): string;

  /**
   * Enhances an openwhisk client by wrapping the `invoke` method for automatic action name
   * replacement.
   * @param {openwhisk} ow openwhisk client
   * @returns {openwhisk} the wrapped client
   */
  wrapOpenwhisk(ow: openwhisk): openwhisk;
}
