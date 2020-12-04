/*
 * Copyright 2020 Adobe. All rights reserved.
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
/* eslint-disable no-underscore-dangle */

const assert = require('assert');
const VersionLock = require('../src/version-lock.js');

function openwhisk() {
  const invokes = [];
  const client = {
    params: async () => ({
      headers: {
        'user-agent': 'helix-test',
      },
    }),
  };
  return {
    get invokes() {
      return invokes;
    },
    actions: {
      get client() {
        return client;
      },
      invoke: async (params) => {
        invokes.push(params);
        return client.params();
      },
    },
  };
}

describe('Version Lock Tests', () => {
  beforeEach(() => {
    process.env.__OW_NAMESPACE = 'test-namespace';
    delete process.env.__OW_API_HOST;
  });

  afterEach(() => {
    delete process.env.__OW_NAMESPACE;
  });

  it('accepts empty options', async () => {
    const lock = new VersionLock();
    assert.equal(lock.getLockedActionName('foo'), 'foo');
  });

  it('accepts missing headers options', async () => {
    const lock = new VersionLock({});
    assert.equal(lock.getLockedActionName('foo'), 'foo');
  });

  it('accepts missing lock header options', async () => {
    const lock = new VersionLock({
      __ow_headers: {
        host: 'foo.com',
      },
    });
    assert.equal(lock.getLockedActionName('foo'), 'foo');
  });

  it('accepts empty lock header options', async () => {
    const lock = new VersionLock({
      __ow_headers: {
        'x-ow-version-lock': '',
      },
    });
    assert.equal(lock.getLockedActionName('foo'), 'foo');
  });

  it('can handle single lock', async () => {
    const lock = new VersionLock({
      __ow_headers: {
        'x-ow-version-lock': 'foo=bar',
      },
    });
    assert.equal(lock.getLockedActionName('foo'), 'bar');
  });

  it('can handle single lock via lock param', async () => {
    const lock = new VersionLock({
      X_OW_VERSION_LOCK: 'foo=bar',
    });
    assert.equal(lock.getLockedActionName('foo'), 'bar');
  });

  it('can handle multi locks', async () => {
    const lock = new VersionLock({
      __ow_headers: {
        'x-ow-version-lock': 'foo=bar&a@v1=a@1.2.3',
      },
    });
    assert.equal(lock.getLockedActionName('foo'), 'bar');
    assert.equal(lock.getLockedActionName('a@v1'), 'a@1.2.3');
  });

  it('supports generic names without version', async () => {
    const lock = new VersionLock({
      __ow_headers: {
        'x-ow-version-lock': 'foo=foo@1.2',
      },
    });
    assert.equal(lock.getLockedActionName('foo@v1.0'), 'foo@1.2');
  });

  it('automatically prefixes action name for versions', async () => {
    const lock = new VersionLock({
      __ow_headers: {
        'x-ow-version-lock': 'foo=v4',
      },
    });
    assert.equal(lock.getLockedActionName('foo@v1.0'), 'foo@v4');
  });

  it('can create url with only name', async () => {
    const lock = new VersionLock({
      __ow_headers: {
        'x-ow-version-lock': 'foo=bar&a@v1=a@1.2.3',
      },
    });
    assert.equal(lock.createActionURL({
      name: 'a@v1',
    }), 'https://adobeioruntime.net/api/v1/web/test-namespace/a@1.2.3');
  });

  it('requires namespace', async () => {
    delete process.env.__OW_NAMESPACE;

    const lock = new VersionLock({
      __ow_headers: {
        'x-ow-version-lock': 'foo=bar&a@v1=a@1.2.3',
      },
    });
    assert.throws(() => lock.createActionURL({
      name: 'a@v1',
    }), new Error('namespace missing.'));
  });

  it('requires name', async () => {
    const lock = new VersionLock({
      __ow_headers: {
        'x-ow-version-lock': 'foo=bar&a@v1=a@1.2.3',
      },
    });
    assert.throws(() => lock.createActionURL({}), new Error('action name missing.'));
  });

  it('create url can specify package name', async () => {
    const lock = new VersionLock({
      __ow_headers: {
        'x-ow-version-lock': 'foo=bar&a@v1=a@1.2.3',
      },
    });
    assert.equal(lock.createActionURL({
      name: 'a@v1',
      packageName: 'testing',
    }), 'https://adobeioruntime.net/api/v1/web/test-namespace/testing/a@1.2.3');
  });

  it('create url can specify namespace', async () => {
    const lock = new VersionLock({
      __ow_headers: {
        'x-ow-version-lock': 'foo=bar&a@v1=a@1.2.3',
      },
    });
    assert.equal(lock.createActionURL({
      name: 'a@v1',
      namespace: 'testing',
    }), 'https://adobeioruntime.net/api/v1/web/testing/a@1.2.3');
  });

  it('create url honors api host from environment', async () => {
    process.env.__OW_API_HOST = 'https://test.apihost.com';
    const lock = new VersionLock({
      __ow_headers: {
        'x-ow-version-lock': 'foo=bar&a@v1=a@1.2.3',
      },
    });
    assert.equal(lock.createActionURL({
      name: 'a@v1',
      namespace: 'testing',
    }), 'https://test.apihost.com/api/v1/web/testing/a@1.2.3');
  });

  it('can create url with only name, given defaults', async () => {
    const lock = new VersionLock({
      __ow_headers: {
        'x-ow-version-lock': 'foo=bar&a@v1=a@1.2.3',
      },
    }, {
      namespace: 'my-namespace',
      packageName: 'my-package',
      api: 'https://example.com/my-api',
    });
    assert.equal(lock.createActionURL({
      name: 'a@v1',
    }), 'https://example.com/my-api/web/my-namespace/my-package/a@1.2.3');
  });

  it('can create url can specify package name, given defaults', async () => {
    const lock = new VersionLock({
      __ow_headers: {
        'x-ow-version-lock': 'foo=bar&a@v1=a@1.2.3',
      },
    }, {
      namespace: 'my-namespace',
      packageName: 'my-package',
      api: 'https://example.com/my-api',
    });
    assert.equal(lock.createActionURL({
      name: 'a@v1',
      packageName: 'testing',
    }), 'https://example.com/my-api/web/my-namespace/testing/a@1.2.3');
  });

  it('can create url can specify namespace, given defaults', async () => {
    const lock = new VersionLock({
      __ow_headers: {
        'x-ow-version-lock': 'foo=bar&a@v1=a@1.2.3',
      },
    }, {
      namespace: 'my-namespace',
      packageName: 'my-package',
      api: 'https://example.com/my-api',
    });
    assert.equal(lock.createActionURL({
      name: 'a@v1',
      namespace: 'testing',
    }), 'https://example.com/my-api/web/testing/my-package/a@1.2.3');
  });

  it('can wrap an openwhisk client', async () => {
    const lock = new VersionLock({
      __ow_headers: {
        'x-ow-version-lock': 'foo=bar&a@v1=a@1.2.3',
      },
    });
    const originalOpenwhisk = openwhisk();
    const ow = lock.wrapOpenwhisk(originalOpenwhisk);
    const ret = await ow.actions.invoke({
      namespace: 'my-namespace',
      name: 'a@v1',
    });
    assert.deepEqual(originalOpenwhisk.invokes, [{
      name: 'a@1.2.3',
      namespace: 'my-namespace',
    }]);
    assert.deepEqual(ret, {
      headers: {
        'user-agent': 'helix-test',
        'x-ow-version-lock': 'foo=bar&a@v1=a@1.2.3',
      },
    });
  });

  it('understands packages in action invokes', async () => {
    const lock = new VersionLock({
      __ow_headers: {
        'x-ow-version-lock': 'foo=bar&a@v1=a@1.2.3',
      },
    });
    const originalOpenwhisk = openwhisk();
    const ow = lock.wrapOpenwhisk(originalOpenwhisk);
    const ret = await ow.actions.invoke({
      namespace: 'my-namespace',
      name: 'helix-services/a@v1',
    });
    assert.deepEqual(originalOpenwhisk.invokes, [{
      namespace: 'my-namespace',
      name: 'helix-services/a@1.2.3',
    }]);
    assert.deepEqual(ret, {
      headers: {
        'user-agent': 'helix-test',
        'x-ow-version-lock': 'foo=bar&a@v1=a@1.2.3',
      },
    });
  });

  it('wrap returns original openwhisk client if no locks', async () => {
    const lock = new VersionLock();
    const originalOpenwhisk = openwhisk();
    const ow = lock.wrapOpenwhisk(originalOpenwhisk);
    assert.equal(ow, originalOpenwhisk);
  });

  it('can transform url with default api', async () => {
    const lock = new VersionLock({
      __ow_headers: {
        'x-ow-version-lock': 'foo=bar&a@v1=a@1.2.3',
      },
    });
    assert.equal(
      lock.transformActionURL('https://adobeioruntime.net/api/v1/web/helix/helix-services/a@v1'),
      'https://adobeioruntime.net/api/v1/web/helix/helix-services/a@1.2.3',
    );
  });

  it('does not transform url if name is not known', async () => {
    const lock = new VersionLock({
      __ow_headers: {
        'x-ow-version-lock': 'foo=bar&a@v1=a@1.2.3',
      },
    });
    assert.equal(
      lock.transformActionURL('https://adobeioruntime.net/api/v1/web/helix/helix-services/static@v1'),
      'https://adobeioruntime.net/api/v1/web/helix/helix-services/static@v1',
    );
  });

  it('does not transform non default api', async () => {
    const lock = new VersionLock({
      __ow_headers: {
        'x-ow-version-lock': 'foo=bar&a@v1=a@1.2.3',
      },
    });
    assert.equal(
      lock.transformActionURL('https://my-adobeioruntime.net/api/v1/web/helix/helix-services/a@v1'),
      'https://my-adobeioruntime.net/api/v1/web/helix/helix-services/a@v1',
    );
  });
});
