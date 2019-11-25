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
const bunyan = require('bunyan');
const { BunyanStreamInterface, eraseBunyanDefaultFields, rootLogger } = require('@adobe/helix-log');

/**
 * Bunyan serializers
 * @private
 */
const serializers = {
  res: (res) => {
    if (!res || !res.statusCode) {
      return res;
    }
    return {
      statusCode: res.statusCode,
      duration: res.duration,
      headers: res.getHeaders(),
    };
  },
  req: bunyan.stdSerializers.req,
  err: bunyan.stdSerializers.err,
};

/**
 * Sets up a bunyan logger suitable to use with an openwhisk action. The bunyan logger will
 * stream to the given helix logger.
 *
 * @param {Logger} [logger=rootLogger] - a helix multi logger. defaults to the helix `rootLogger`.
 * @return {BunyanLogger} A bunyan logger
 */
function createBunyanLogger(logger = rootLogger) {
  return bunyan.createLogger({
    name: 'action',
    serializers,
    streams: [{
      name: 'BunyanStreamInterface',
      level: 'trace',
      type: 'raw',
      stream: new BunyanStreamInterface({
        logger,
        filter: eraseBunyanDefaultFields,
      }),
    }],
  });
}

module.exports = createBunyanLogger;
