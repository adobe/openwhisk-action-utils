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

const { Writable } = require('stream');
const BunyanSyslog = require('@tripod/bunyan-syslog');

let papertrailStream = null;

const LEVELS = {
  10: 'TRACE',
  20: 'DEBUG',
  30: 'INFO ',
  40: 'WARN ',
  50: 'ERROR',
  60: 'FATAL',
};

const SYSLOG_LEVELS = {
  10: 7,
  20: 7,
  30: 6,
  40: 4,
  50: 3,
  60: 0,
};

function safeCycles() {
  const seen = [];
  function bunyanCycles(_, v) {
    if (!v || typeof (v) !== 'object') {
      return (v);
    }
    if (seen.indexOf(v) !== -1) {
      return ('[Circular]');
    }
    seen.push(v);
    return (v);
  }

  return bunyanCycles;
}

class SimpleFormat extends Writable {
  constructor(options = {}, base = process.stdout) {
    super();
    this.out = base;
    this.wskLog = options.wskLog;
  }

  write(rec) {
    const {
      hostname,
      level,
      time,
      req,
      res,
      ow: {
        activationId: id = 'xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
        actionName: name = 'unknown',
      },
    } = rec;
    let {
      msg,
    } = rec;
    if (this.wskLog) {
      const line = `${LEVELS[level]} - ${msg}\n`;
      this.out.write(line);
    } else {
      // use _send directly, so we can avoid the json serialization of 'rec'
      const date = new Date(time).toJSON();
      if (req || res) {
        msg = JSON.stringify({
          req,
          res,
        }, safeCycles(), 2);
      }
      const line = `<${8 + SYSLOG_LEVELS[level]}>${date} ${hostname} ${name}[0]:${id.substring(0, 16)} ${LEVELS[level]} ${msg}`;
      this.out._send(line);
    }
  }
}

function createPaperTrailStream(config, params) {
  if (!(params && params.PAPERTRAIL_HOST && params.PAPERTRAIL_PORT)) {
    return null;
  }

  if (!papertrailStream) {
    const syslogStream = BunyanSyslog.createBunyanStream({
      type: 'tcp',
      host: params.PAPERTRAIL_HOST,
      port: Number.parseInt(params.PAPERTRAIL_PORT, 10),
    });

    papertrailStream = {
      name: 'PapertrailStream',
      type: 'raw',
      level: config.LOG_LEVEL,
      stream: new SimpleFormat({}, syslogStream),
    };
  }

  return papertrailStream;
}

module.exports = createPaperTrailStream;
