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

/* eslint-disable no-underscore-dangle */
const { CoralogixLogger } = require('@adobe/helix-log');

let coralogixLogger = null;

function createCoralogixLogger(config, params) {
  const {
    CORALOGIX_API_KEY,
    CORALOGIX_APPLICATION_NAME,
    CORALOGIX_SUBSYSTEM_NAME,
    CORALOGIX_LOG_LEVEL,
  } = params;
  if (!CORALOGIX_API_KEY) {
    return null;
  }
  if (!coralogixLogger) {
    const {
      __OW_ACTION_NAME: actionName = '',
      __OW_NAMESPACE: namespace = 'n/a',
    } = process.env;

    // we use the openwhisk package name as subsystem
    const [, , owPackage] = actionName.split('/');
    const applicationName = CORALOGIX_APPLICATION_NAME || namespace;
    const subsystemName = CORALOGIX_SUBSYSTEM_NAME || owPackage || 'n/a';
    coralogixLogger = new CoralogixLogger(CORALOGIX_API_KEY, applicationName, subsystemName, {
      level: CORALOGIX_LOG_LEVEL || config.LOG_LEVEL,
    });
  }
  return coralogixLogger;
}

module.exports = createCoralogixLogger;
