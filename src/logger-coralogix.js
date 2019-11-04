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

const {
  CoralogixLogger, messageFormatJson,
} = require('@adobe/helix-log');
const { deepclone } = require('ferrum');

let coralogixLogger = null;

// todo: sanitizing the secrets should be better handled in the logging framework.
const sanatizeParams = (params) => {
  // backup and restore __ow_logger because deepclone cannot clone it
  // eslint-disable-next-line camelcase
  const { __ow_logger } = params;
  // eslint-disable-next-line no-underscore-dangle, no-param-reassign
  delete params.__ow_logger;

  const filtered = deepclone(params);

  Object.keys(filtered).forEach((key) => {
    if (key.match(/^[A-Z0-9_]+$/)) {
      filtered[key] = '[undisclosed secret]';
    }
  });

  if (filtered.__ow_headers && filtered.__ow_headers.authorization) {
    filtered.__ow_headers.authorization = '[undisclosed secret]';
  }

  // eslint-disable-next-line no-underscore-dangle, no-param-reassign, camelcase
  params.__ow_logger = __ow_logger;

  return filtered;
};

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
    const sanitizedParams = sanatizeParams(params);
    coralogixLogger = new CoralogixLogger(CORALOGIX_API_KEY, applicationName, subsystemName, {
      level: CORALOGIX_LOG_LEVEL || config.LOG_LEVEL,
      formatter: (msg, opts) => Object.assign(messageFormatJson(msg, opts), {
        ow: {
          activationId: process.env.__OW_ACTIVATION_ID,
          actionName: process.env.__OW_ACTION_NAME,
          transactionId: process.env.__OW_TRANSACTION_ID,
          headers: sanitizedParams.__ow_headers || {},
        },
      }),
    });
  }
  return coralogixLogger;
}

module.exports = createCoralogixLogger;
