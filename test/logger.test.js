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
const nock = require('nock');
const net = require('net');
const {
  MultiLogger, MemLogger, SimpleInterface,
} = require('@adobe/helix-log');
const logger = require('../src/logger.js');


describe('Loggers', () => {
  let myRootLogger;
  let memLogger;

  beforeEach(() => {
    memLogger = new MemLogger({
      level: 'trace',
      filter: (fields) => ({
        ...fields,
        timestamp: '1970-01-01T00:00:00.000Z',
      }),
    });
    myRootLogger = new MultiLogger({});
    process.env.__OW_ACTIVATION_ID = 'test-my-activation-id';
    process.env.__OW_ACTION_NAME = 'test-my-action-name';
    process.env.__OW_TRANSACTION_ID = 'test-transaction-id';
    nock.disableNetConnect();
  });

  afterEach(() => {
    nock.cleanAll();
    nock.enableNetConnect();
  });

  it('init sets up openwhisk logging and keeps default unaffected', () => {
    logger.init({}, myRootLogger);
    myRootLogger.loggers.set('default', memLogger);
    const log = new SimpleInterface({ logger: myRootLogger });

    log.info('Hello, world');
    assert.deepEqual(memLogger.buf, [{
      level: 'info',
      message: ['Hello, world'],
      timestamp: '1970-01-01T00:00:00.000Z',
    }]);
  });

  it('openhwisk logging adds ow fields with defaults', () => {
    logger.init({}, myRootLogger);
    myRootLogger.loggers.get('OpenWhiskLogger').loggers.set('mylogger', memLogger);
    const log = new SimpleInterface({ logger: myRootLogger });

    delete process.env.__OW_ACTIVATION_ID;
    delete process.env.__OW_ACTION_NAME;
    delete process.env.__OW_TRANSACTION_ID;
    log.info('Hello, world');
    assert.deepEqual(memLogger.buf, [{
      level: 'info',
      message: ['Hello, world'],
      ow: {
        actionName: 'n/a',
        activationId: 'n/a',
        transactionId: 'n/a',
      },
      timestamp: '1970-01-01T00:00:00.000Z',
    }]);
  });

  it('openhwisk logging adds ow fields', () => {
    logger.init({}, myRootLogger);
    myRootLogger.loggers.get('OpenWhiskLogger').loggers.set('mylogger', memLogger);
    const log = new SimpleInterface({ logger: myRootLogger });

    log.info('Hello, world');
    assert.deepEqual(memLogger.buf, [{
      level: 'info',
      message: ['Hello, world'],
      ow: {
        actionName: 'test-my-action-name',
        activationId: 'test-my-activation-id',
        transactionId: 'test-transaction-id',
      },
      timestamp: '1970-01-01T00:00:00.000Z',
    }]);
  });

  it('openhwisk init returns bunyan logger', () => {
    const log = logger.init({}, myRootLogger);
    myRootLogger.loggers.get('OpenWhiskLogger').loggers.set('mylogger', memLogger);

    const child = log.child({ myId: 42 });
    child.info('Hello, world');
    assert.deepEqual(memLogger.buf, [{
      level: 'info',
      message: ['Hello, world'],
      myId: 42,
      ow: {
        actionName: 'test-my-action-name',
        activationId: 'test-my-activation-id',
        transactionId: 'test-transaction-id',
      },
      timestamp: '1970-01-01T00:00:00.000Z',
    }]);
  });

  it('wrap inits logging and traces params but no secrets', async () => {
    async function main(params) {
      const { __ow_logger: log } = params;
      log.info('Hello, world.');
      return {
        body: 'ok',
      };
    }
    myRootLogger.loggers.set('mylogger', memLogger);
    const result = await logger.wrap(main, { path: '/foo', SECRET_KEY: 'foobar' }, myRootLogger);

    assert.deepEqual(result, { body: 'ok' });

    assert.deepEqual(memLogger.buf, [{
      level: 'trace',
      message: ['before'],
      params: {
        path: '/foo',
      },
      timestamp: '1970-01-01T00:00:00.000Z',
    }, {
      level: 'info',
      message: ['Hello, world.'],
      timestamp: '1970-01-01T00:00:00.000Z',
    }, {
      level: 'trace',
      message: ['result'],
      result: {
        body: 'ok',
      },
      timestamp: '1970-01-01T00:00:00.000Z',
    }]);
  });

  it('openhwisk creates coralogix logger if needed', () => {
    const log = logger.init({
      CORALOGIX_API_KEY: '1234',
      CORALOGIX_APPLICATION_NAME: 'logger-test',
      CORALOGIX_SUBSYSTEM_NAME: 'test-1',
      CORALOGIX_LOG_LEVEL: 'info',
    }, myRootLogger);

    const reqs = [];
    nock('https://api.coralogix.com/api/v1/')
      .post('/logs')
      .reply((uri, requestBody) => {
        reqs.push(requestBody);
        return [200, 'ok'];
      });

    log.info({ myId: 42 }, 'Hello, world');
    assert.equal(reqs.length, 1);
    assert.equal(reqs[0].applicationName, 'logger-test');
    assert.equal(reqs[0].subsystemName, 'test-1');
    assert.equal(reqs[0].privateKey, '1234');
    assert.equal(reqs[0].logEntries.length, 1);


    const logEntry = JSON.parse(reqs[0].logEntries[0].text);
    delete logEntry.timestamp;
    assert.deepEqual(logEntry, {
      level: 'info',
      message: 'Hello, world',
      myId: 42,
      ow: {
        actionName: 'test-my-action-name',
        activationId: 'test-my-activation-id',
        transactionId: 'test-transaction-id',
      },
    });
  });

  it('openhwisk creates papertrail logger if needed', async () => {
    const reqs = [];
    let server;
    const srv = new Promise((resolve, reject) => {
      server = net.createServer((socket) => {
        socket.on('data', (data) => {
          reqs.push(...data.toString().trim().split('\n'));
          socket.end();
          server.close();
        }).on('close', resolve);
      })
        .on('error', (err) => {
          reject(err);
        });
    });

    const port = await new Promise((resolve) => {
      server.listen(() => {
        resolve(server.address().port);
      });
    });

    const log = logger.init({
      PAPERTRAIL_HOST: '127.0.0.1',
      PAPERTRAIL_PORT: port,
      PAPERTRAIL_TLS: 'false',
      PAPERTRAIL_LOG_LEVEL: 'info',
    }, myRootLogger);

    log.info({ myId: 42 }, 'Hello, world');

    await srv;

    assert.equal(reqs.length, 2);
    assert.ok(reqs[0].endsWith('test-my-action-name[1]:test-my-activati INFO Hello, world'));
    assert.ok(reqs[1].endsWith('test-my-action-name[1]:test-my-activati INFO data:{"myId":42}'));
  });
});
