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
const bodyParser = require('body-parser');
const { expressify } = require('../src/index.js');

describe('Expressify', () => {
  it('handles simple get', async () => {
    const app = express();
    app.get('/ping', (req, res) => {
      const dump = {
        query: req.query,
        test: req.owActionParams.__ow_path,
      };
      res.send(`${JSON.stringify(dump)}`);
    });

    const params = {
      __ow_path: '/ping',
      __ow_method: 'get',
      __ow_headers: {},
      __ow_query: 'a=1&a=2',
      foo: '42',
      SUPER_SECRET: 'foo',
    };

    const result = await expressify(app)(params);

    assert.deepEqual(result, {
      body: '{"query":{"foo":"42","a":["1","2"]},"test":"/ping"}',
      headers: {
        'content-length': '51',
        'content-type': 'text/html; charset=utf-8',
        etag: 'W/"33-zMD3V1aagE/Fph2VK4mzE96IU9s"',
        'x-powered-by': 'Express',
      },
      statusCode: 200,
    });
  });

  it('can handle non-web action invoke', async () => {
    const app = express();
    app.get('/', (req, res) => {
      const dump = {
        query: req.query,
        test: req.owActionParams.__ow_path,
      };
      res.send(`${JSON.stringify(dump)}`);
    });

    const params = {
      test: 'foo',
      SUPER_SECRET: 'foo',
    };

    const result = await expressify(app)(params);

    assert.deepEqual(result, {
      body: '{"query":{"test":"foo"}}',
      headers: {
        'content-length': '24',
        'content-type': 'text/html; charset=utf-8',
        etag: 'W/"18-09GhnpJ6FHPbIDuBFoh/nHnBcDU"',
        'x-powered-by': 'Express',
      },
      statusCode: 200,
    });
  });

  // eslint-disable-next-line no-restricted-syntax
  for (const __ow_path of [null, undefined, '', 'missing']) {
    it(`defaults to / for ${__ow_path === '' ? 'empty' : __ow_path} path`, async () => {
      const app = express();
      app.get('/', (req, res) => {
        res.send('ok');
      });
      const params = {
        __ow_path,
        __ow_method: 'get',
        __ow_headers: {},
      };
      if (__ow_path === 'missing') {
        delete params.__ow_path;
      }

      // eslint-disable-next-line no-await-in-loop
      const result = await expressify(app)(params);
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
    });
  }

  it('handles text/plain POST body', async () => {
    const app = express();
    app.use(bodyParser.text());
    app.post('/data', (req, res) => {
      assert.equal(req.body, 'foobar');
      res.send('ok');
    });

    const params = {
      __ow_path: '/data',
      __ow_method: 'post',
      __ow_headers: {
        'content-type': 'text/plain',
      },
      __ow_body: 'foobar',
    };

    const result = await expressify(app)(params);

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
  });

  it('handles application/json POST body', async () => {
    const testContent = {
      title: 'foo',
      primes: [2, 3, 5, 7],
    };

    const app = express();
    app.use(express.json());
    app.post('/data', (req, res) => {
      assert.deepEqual(req.body, testContent);
      res.send('ok');
    });

    const params = {
      __ow_path: '/data',
      __ow_method: 'post',
      __ow_headers: {
        'content-type': 'application/json',
      },
      __ow_body: Buffer.from(JSON.stringify(testContent)).toString('base64'),
    };

    const result = await expressify(app)(params);

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
  });

  it('handles POST body with no content type', async () => {
    const app = express();
    app.use(bodyParser.raw({ type: () => true }));
    app.post('/data', (req, res) => {
      assert.equal(req.body.toString('utf8'), 'foo');
      res.send('ok');
    });

    const params = {
      __ow_path: '/data',
      __ow_method: 'post',
      __ow_body: Buffer.from('foo').toString('base64'),
    };

    const result = await expressify(app)(params);

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
  });

  it('handles POST body with unknown type', async () => {
    const app = express();
    app.use(bodyParser.raw({ type: () => true }));
    app.post('/data', (req, res) => {
      assert.equal(req.body.toString('utf8'), 'foo');
      res.send('ok');
    });

    const params = {
      __ow_path: '/data',
      __ow_method: 'post',
      __ow_headers: {
        'content-type': 'text/unknown',
      },
      __ow_body: 'foo',
    };

    const result = await expressify(app)(params);

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
  });
});
