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

const { SyslogStream } = require('./syslog-stream.js');

let papertrailStream = null;

function createPaperTrailStream(config, params) {
  if (!(params && params.PAPERTRAIL_HOST && params.PAPERTRAIL_PORT)) {
    return null;
  }

  if (!papertrailStream) {
    const syslogStream = new SyslogStream({
      host: params.PAPERTRAIL_HOST,
      port: Number.parseInt(params.PAPERTRAIL_PORT, 10),
      tls: true,
    });

    papertrailStream = {
      name: 'PapertrailStream',
      type: 'raw',
      level: config.LOG_LEVEL,
      stream: syslogStream,
    };
  }

  return papertrailStream;
}

module.exports = createPaperTrailStream;
