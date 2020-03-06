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

/* eslint-env mocha */
/* eslint-disable no-underscore-dangle,camelcase */

const assert = require('assert');
const express = require('express');
const bunyan = require('bunyan');
const expressify = require('../src/expressify.js');
const {
  errorHandler, cacheControl, asyncHandler, logRequest, hideHeaders,
} = require('../src/middleware.js');

describe('Middleware', () => {
  let ringbuffer;
  let log;

  beforeEach(() => {
    ringbuffer = new bunyan.RingBuffer({ limit: 100 });
    log = bunyan.createLogger({
      name: 'testlogger',
      streams: [
        // {
        //   level: 'trace',
        //   stream: process.stdout,
        // },
        {
          level: 'trace',
          type: 'raw',
          stream: ringbuffer,
        },
      ],
    });
  });

  it('logRequest installs logger', async () => {
    const app = express();
    app.use(logRequest(log));
    app.get('/', (req, res) => {
      req.log.info('hello, world');
      res.send('ok');
    });
    const params = {
      __ow_path: '/',
      __ow_method: 'get',
      __ow_headers: {},
    };
    const result = await expressify(app)(params);
    assert.ok(result.headers['x-request-id']);
    delete result.headers['x-request-id'];
    assert.deepEqual(result, {
      body: 'ok',
      headers: {
        'content-length': '2',
        'content-type': 'text/html; charset=utf-8',
        etag: 'W/"2-eoX0dku9ba8cNUXvu/DyeabcC+s"',
        'x-powered-by': 'Express',
      },
      statusCode: 200,
    });
    assert.equal(ringbuffer.records[0].msg, 'GET /');
    assert.equal(ringbuffer.records[1].msg, 'hello, world');
  });

  it('logRequest uses debug level by default', async () => {
    const app = express();
    app.use(logRequest(log));
    app.get('/', (req, res) => {
      res.send('ok');
    });
    const params = {
      __ow_path: '/',
      __ow_method: 'get',
      __ow_headers: {},
    };
    await expressify(app)(params);
    assert.equal(ringbuffer.records[0].msg, 'GET /');
    assert.equal(ringbuffer.records[0].level, 20);
  });

  it('logRequest takes log level argument', async () => {
    const app = express();
    app.use(logRequest(log, 'info'));
    app.get('/', (req, res) => {
      res.send('ok');
    });
    const params = {
      __ow_path: '/',
      __ow_method: 'get',
      __ow_headers: {},
    };
    await expressify(app)(params);
    assert.equal(ringbuffer.records[0].msg, 'GET /');
    assert.equal(ringbuffer.records[0].level, 30);
  });

  it('logRequest rejects illegal log level', async () => {
    assert.throws(() => {
      logRequest(log, 'foobar');
    });
  });

  it('logRequest does not crash if logger vanishes', async () => {
    const app = express();
    app.use(logRequest(log));
    app.get('/', (req, res) => {
      req.log.info('hello, world');
      delete req.log;
      res.send('ok');
    });
    const params = {
      __ow_path: '/',
      __ow_method: 'get',
      __ow_headers: {},
    };
    const result = await expressify(app)(params);
    assert.ok(result.headers['x-request-id']);
    delete result.headers['x-request-id'];
    assert.deepEqual(result, {
      body: 'ok',
      headers: {
        'content-length': '2',
        'content-type': 'text/html; charset=utf-8',
        etag: 'W/"2-eoX0dku9ba8cNUXvu/DyeabcC+s"',
        'x-powered-by': 'Express',
      },
      statusCode: 200,
    });
    assert.equal(ringbuffer.records[0].msg, 'GET /');
    assert.equal(ringbuffer.records[1].msg, 'hello, world');
  });

  it('logRequest reuses external x-request-id ', async () => {
    const app = express();
    app.use(logRequest(log));
    app.get('/', (req, res) => {
      req.log.info('hello, world');
      res.send('ok');
    });
    const params = {
      __ow_path: '/',
      __ow_method: 'get',
      __ow_headers: {
        'x-request-id': 'foo',
      },
    };
    const result = await expressify(app)(params);
    assert.deepEqual(result, {
      body: 'ok',
      headers: {
        'content-length': '2',
        'content-type': 'text/html; charset=utf-8',
        etag: 'W/"2-eoX0dku9ba8cNUXvu/DyeabcC+s"',
        'x-powered-by': 'Express',
        'x-request-id': 'foo',
      },
      statusCode: 200,
    });
    assert.equal(ringbuffer.records[0].msg, 'GET /');
    assert.equal(ringbuffer.records[1].msg, 'hello, world');
  });

  it('logRequest reuses external x-github-delivery', async () => {
    const app = express();
    app.use(logRequest(log));
    app.get('/', (req, res) => {
      req.log.info('hello, world');
      res.send('ok');
    });
    const params = {
      __ow_path: '/',
      __ow_method: 'get',
      __ow_headers: {
        'x-github-delivery': 'foo',
      },
    };
    const result = await expressify(app)(params);
    assert.deepEqual(result, {
      body: 'ok',
      headers: {
        'content-length': '2',
        'content-type': 'text/html; charset=utf-8',
        etag: 'W/"2-eoX0dku9ba8cNUXvu/DyeabcC+s"',
        'x-powered-by': 'Express',
        'x-request-id': 'foo',
      },
      statusCode: 200,
    });
    assert.equal(ringbuffer.records[0].msg, 'GET /');
    assert.equal(ringbuffer.records[1].msg, 'hello, world');
  });

  it('Error handler works', async () => {
    const app = express();
    app.get('/', () => {
      throw new Error('my error');
    });
    app.use(errorHandler(log));

    const params = {
      __ow_path: '/',
      __ow_method: 'get',
      __ow_headers: {},
    };
    const result = await expressify(app)(params);
    assert.deepEqual(result, {
      body: '',
      headers: {
        'x-powered-by': 'Express',
      },
      statusCode: 500,
    });
    assert.equal(ringbuffer.records[0].msg, 'my error');
    assert.ok(ringbuffer.records[1].msg.indexOf('at app.get') > 0);
  });

  it('Error handler does not log stack trace on info', async () => {
    log.level(40);
    const app = express();
    app.get('/', () => {
      throw new Error('my error');
    });
    app.use(errorHandler(log));

    const params = {
      __ow_path: '/',
      __ow_method: 'get',
      __ow_headers: {},
    };
    const result = await expressify(app)(params);
    assert.deepEqual(result, {
      body: '',
      headers: {
        'x-powered-by': 'Express',
      },
      statusCode: 500,
    });
    assert.equal(ringbuffer.records[0].msg, 'my error');
    assert.equal(ringbuffer.records.length, 1);
  });

  it('Error handler does not interfere with existing errors', async () => {
    const app = express();
    app.get('/', (req, res) => {
      res.sendStatus(404);
      throw new Error('my error');
    });
    app.use(errorHandler(log));

    const params = {
      __ow_path: '/',
      __ow_method: 'get',
      __ow_headers: {},
    };
    const result = await expressify(app)(params);
    assert.deepEqual(result, {
      body: 'Not Found',
      headers: {
        'content-length': '9',
        'content-type': 'text/plain; charset=utf-8',
        etag: 'W/"9-0gXL1ngzMqISxa6S1zx3F4wtLyg"',
        'x-powered-by': 'Express',
      },
      statusCode: 404,
    });
  });

  it('Async handler guards from errors', async () => {
    const app = express();
    app.get('/', asyncHandler(async () => {
      throw new Error('my error');
    }));
    app.use(errorHandler(log));

    const params = {
      __ow_path: '/',
      __ow_method: 'get',
      __ow_headers: {},
    };
    const result = await expressify(app)(params);
    assert.deepEqual(result, {
      body: '',
      headers: {
        'x-powered-by': 'Express',
      },
      statusCode: 500,
    });
    assert.equal(ringbuffer.records[0].msg, 'my error');
  });

  it('Async handler can pass in params', async () => {
    const app = express();
    app.get('/', asyncHandler(async (req, res) => {
      res.send(`result is ${req.query.result}`);
    }));
    const params = {
      __ow_path: '/',
      __ow_method: 'get',
      __ow_headers: {},
      result: 42,
    };
    const result = await expressify(app)(params);
    assert.deepEqual(result, {
      body: 'result is 42',
      headers: {
        'content-length': '12',
        'content-type': 'text/html; charset=utf-8',
        etag: 'W/"c-zVW6mCMMOmyhlrH7Nz3q/ZDekg0"',
        'x-powered-by': 'Express',
      },
      statusCode: 200,
    });
  });

  it('Cache control works with default value', async () => {
    const app = express();
    app.use(cacheControl());
    app.get('/', (req, res) => {
      res.send('ok');
    });

    const params = {
      __ow_path: '/',
      __ow_method: 'get',
      __ow_headers: {},
    };
    const result = await expressify(app)(params);
    assert.deepEqual(result, {
      body: 'ok',
      headers: {
        'cache-control': 'no-store, private, must-revalidate',
        'content-length': '2',
        'content-type': 'text/html; charset=utf-8',
        'x-powered-by': 'Express',
        etag: 'W/"2-eoX0dku9ba8cNUXvu/DyeabcC+s"',
      },
      statusCode: 200,
    });
  });

  it('Cache control works with custom value', async () => {
    const app = express();
    app.use(cacheControl('private'));
    app.get('/', (req, res) => {
      res.send('ok');
    });

    const params = {
      __ow_path: '/',
      __ow_method: 'get',
      __ow_headers: {},
    };
    const result = await expressify(app)(params);
    assert.deepEqual(result, {
      body: 'ok',
      headers: {
        'cache-control': 'private',
        'content-length': '2',
        'content-type': 'text/html; charset=utf-8',
        'x-powered-by': 'Express',
        etag: 'W/"2-eoX0dku9ba8cNUXvu/DyeabcC+s"',
      },
      statusCode: 200,
    });
  });

  it('Cache control does not override existing header', async () => {
    const app = express();
    app.use((req, res, next) => {
      res.set('cache-control', 'private');
      next();
    });
    app.use(cacheControl());
    app.get('/', (req, res) => {
      res.send('ok');
    });

    const params = {
      __ow_path: '/',
      __ow_method: 'get',
      __ow_headers: {},
    };
    const result = await expressify(app)(params);
    assert.deepEqual(result, {
      body: 'ok',
      headers: {
        'cache-control': 'private',
        'content-length': '2',
        'content-type': 'text/html; charset=utf-8',
        'x-powered-by': 'Express',
        etag: 'W/"2-eoX0dku9ba8cNUXvu/DyeabcC+s"',
      },
      statusCode: 200,
    });
  });

  it('hideHeaders works', async () => {
    const app = express();
    const capturedHeaders = {};
    app.use(hideHeaders(['x-token', 'authenticate', 'foo']));
    app.use((req, res, next) => {
      Object.entries(req.headers).forEach(([key, value]) => {
        capturedHeaders[key] = value;
      });
      next();
    });
    app.get('/', (req, res) => {
      res.send('ok');
    });

    const params = {
      __ow_path: '/',
      __ow_method: 'get',
      __ow_headers: {
        authenticate: 'Basic 1234',
        'X-Token': 'secret',
        'content-type': 'text/plain',
      },
    };
    await expressify(app)(params);
    assert.deepEqual(capturedHeaders, {
      'content-length': 0,
      'content-type': 'text/plain',
      'x-request-id': undefined,
    });
  });
});
