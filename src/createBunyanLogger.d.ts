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
 * Logger from Bunyan
 * @see https://github.com/trentm/node-bunyan
 */
declare interface BunyanLogger {}

/**
 * Helix Logger
 * @see https://github.com/adobe/helix-log
 */
declare interface HelixLogger {}

/**
 * Sets up a bunyan logger suitable to use with an openwhisk action. The bunyan logger will
 * stream to the given helix logger.
 *
 * @param {HelixLogger} [logger=rootLogger] - a helix logger. defaults to the helix `rootLogger`.
 * @return {BunyanLogger} A bunyan logger
 */
export declare function createBunyanLogger(logger: HelixLogger): BunyanLogger;
