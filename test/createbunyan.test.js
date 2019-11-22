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
const assert = require('assert');
const { MemLogger } = require('@adobe/helix-log');
const createBunyanLogger = require('../src/createBunyanLogger.js');

describe('Create Bunyan Logger', () => {
  let memLogger;

  beforeEach(() => {
    memLogger = new MemLogger({
      level: 'trace',
      filter: (fields) => ({
        ...fields,
        timestamp: '1970-01-01T00:00:00.000Z',
      }),
    });
  });

  it('openhwisk init returns bunyan logger', () => {
    const log = createBunyanLogger(memLogger);

    const res = {
      statusCode: 200,
      duration: 42,
      getHeaders: () => ({
        'content-type': 'text/plain',
      }),
    };

    const child = log.child({ myId: 42, res });
    child.info('Hello, world');
    assert.deepEqual(memLogger.buf, [{
      level: 'info',
      message: ['Hello, world'],
      myId: 42,
      timestamp: '1970-01-01T00:00:00.000Z',
      res: {
        duration: 42,
        headers: {
          'content-type': 'text/plain',
        },
        statusCode: 200,
      },
    }]);
  });
});
