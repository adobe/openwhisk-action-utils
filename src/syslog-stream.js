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
 * @module syslog-stream
 * @private
 */

// eslint-disable-next-line max-classes-per-file
const os = require('os');
const { Stream } = require('stream');
const net = require('net');
const tls = require('tls');

const HOSTNAME = os.hostname();

const SYSLOG_LEVELS = {
  silly: 7,
  trace: 7,
  verbose: 7,
  debug: 7,
  info: 6,
  warn: 4,
  error: 3,
  fatal: 0,
};

const SYSLOG_FACILITY = {
  kern: 0,
  user: 1,
  mail: 2,
  daemon: 3,
  auth: 4,
  syslog: 5,
  lpr: 6,
  news: 7,
  uucp: 8,
  authpriv: 10,
  ftp: 11,
  cron: 15,
  local0: 16,
  local1: 17,
  local2: 18,
  local3: 19,
  local4: 20,
  local5: 21,
  local6: 22,
  local7: 23,
};

function safeCycles() {
  const seen = [];
  function guard(_, v) {
    if (!v || typeof (v) !== 'object') {
      return (v);
    }
    if (seen.indexOf(v) !== -1) {
      return ('[Circular]');
    }
    seen.push(v);
    return (v);
  }
  return guard;
}

class SyslogStream extends Stream {
  constructor(opts) {
    super(opts);
    this.facility = opts.facility || 1;
    this.name = opts.name || process.title || process.argv[0];
    this.writable = true;
    this.host = opts.host || '127.0.0.1';
    this.port = opts.port || 514;
    this.transport = opts.tls ? tls : net;
    this.queue = [];
    this.socket = null;

    this.connect();
  }

  connect() {
    this.socket = this.transport.connect({
      host: this.host,
      port: this.port,
      servername: this.host,
    });

    this.socket.on('error', (err) => {
      // eslint-disable-next-line no-console
      console.error('socket error', err);
      // reopen connection if unable to connect
      setTimeout(this.connect.bind(this), 1000);
    });

    this.socket.on('timeout', () => {
      if (this.socket.readyState !== 'open') {
        this.socket.destroy();
      }
      this.emit('timeout');
    });

    this.socket.on('connect', () => {
      if (this.socket.encrypted) {
        // eslint-disable-next-line no-console
        console.log(`established encrypted (TLS) connection to ${this.host}:${this.port}.`);
      } else {
        // eslint-disable-next-line no-console
        console.log(`established insecure connection to ${this.host}:${this.port} (no TLS).`);
      }
      this.flush();
      this.emit('connect');
    });

    this.socket.on('close', () => {
      this.socket = null;
      this.emit('close');
    });
  }

  flush() {
    if (this.socket && this.socket.writable) {
      this.queue.forEach((line) => {
        this.socket.write(line, 'utf-8');
      });
      this.queue = [];
    }
  }

  write(rec) {
    const {
      hostname = HOSTNAME,
      level = 'info',
      timestamp,
      message,
      ow: {
        activationId: actId = 'xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
        actionName = 'unknown',
      },
      // ignored fields
      pid = 1,
      name,
      bunyanLevel,
      v,
      // additinal data
      ...data
    } = rec;
    const date = new Date(timestamp).toJSON();
    const l = (this.facility * 8) + SYSLOG_LEVELS[level];
    const m = [message];
    if (Object.keys(data).length > 0) {
      m.push(`data:${JSON.stringify(data, safeCycles())}`);
    }
    m.forEach((msg) => {
      this.queue.push(`<${l}>${date} ${hostname} ${actionName}[${pid}]:${actId.substring(0, 16)} ${level.toUpperCase()} ${msg}\n`);
    });
    this.flush();
  }

  close() {
    this.socket.end();
  }

  end(...args) {
    if (args.length > 0) {
      this.write.apply(this, ...args);
    }
    this.close();
  }

  toString() {
    let str = `[object SyslogStream<facility=${this.facility}`;
    if (this.host) {
      str += `, host=${this.host}`;
    }
    if (this.port) {
      str += `, port=${this.port}`;
    }
    str += '>]';
    return (str);
  }
}

module.exports = {
  SyslogStream,
  facility: SYSLOG_FACILITY,
};
