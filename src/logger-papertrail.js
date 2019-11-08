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
const { messageFormatJson, numericLogLevel } = require('@adobe/helix-log');
const { SyslogStream } = require('./syslog-stream.js');

let papertrailLogger = null;

class PapertraiLogger {
  constructor(opts = {}) {
    const {
      level = 'silly',
      formatter = messageFormatJson,
      host,
      port,
      tls,
      ...fmtOpts
    } = opts;
    Object.assign(this, {
      level, formatter, fmtOpts,
    });
    this.stream = new SyslogStream({
      host,
      port,
      tls,
    });
  }

  log(msg, opts = {}) {
    const { level = 'info' } = opts || {};
    if (numericLogLevel(level) > numericLogLevel(this.level)) {
      return;
    }
    const rec = this.formatter(msg, { ...opts, ...this.fmtOpts, level });
    this.stream.write(rec);
  }
}

function createPapertrailLogger(config, params) {
  const {
    PAPERTRAIL_HOST,
    PAPERTRAIL_PORT,
    PAPERTRAIL_TLS = 'true',
    PAPERTRAIL_LOG_LEVEL = config.LOG_LEVEL,
  } = params;
  if (!PAPERTRAIL_HOST || !PAPERTRAIL_PORT) {
    return null;
  }

  if (!papertrailLogger) {
    papertrailLogger = new PapertraiLogger({
      host: PAPERTRAIL_HOST,
      port: Number.parseInt(PAPERTRAIL_PORT, 10),
      tls: PAPERTRAIL_TLS !== 'false',
      level: PAPERTRAIL_LOG_LEVEL,
    });
  }
  return papertrailLogger;
}

module.exports = createPapertrailLogger;
