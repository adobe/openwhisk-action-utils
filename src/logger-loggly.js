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

const Bunyan2Loggly = require('bunyan-loggly');

let logglyStream = null;

function createLogglyStream(config, params) {
  if (!(params && params.LOGGLY_SUBDOMAIN && params.LOGGLY_TOKEN)) {
    return null;
  }

  if (!logglyStream) {
    const logglyConfig = {
      token: params.LOGGLY_TOKEN,
      subdomain: params.LOGGLY_SUBDOMAIN,
    };
    const bufferLength = 1000;
    const bufferTimeout = 500;
    logglyStream = {
      type: 'raw',
      level: config.LOG_LEVEL,
      stream: new Bunyan2Loggly(logglyConfig, bufferLength, bufferTimeout),
    };
  }
  return logglyStream;
}

module.exports = createLogglyStream;
