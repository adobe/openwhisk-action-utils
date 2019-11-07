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
const { wrap } = require('../src/wrap');

describe('Wrapper Tests', () => {
  it('wrap leaves initial function unchanged', () => {
    const fn = () => 'bar';
    assert.equal(wrap().run(fn)(), 'bar');
  });

  it('wrap wraps once', () => {
    const original = (name) => `hello ${name}`;

    const wrapper = (fn, lastname) => (firstname) => fn(`${firstname} ${lastname}`);

    const wrapped = wrap()
      .with(wrapper, 'Paul')
      .run(original);

    assert.equal(wrapped('John'), 'hello John Paul');
  });

  it('wrap wraps async', async () => {
    const original = (name) => Promise.resolve(`hello ${name}`);

    const wrapper = (fn, lastname) => (firstname) => fn(`${firstname} ${lastname}`);

    const wrapped = wrap()
      .with(wrapper, 'Paul')
      .run(original);

    const result = await wrapped('John');
    assert.equal(result, 'hello John Paul');
  });

  it('wrap wraps multiple times', () => {
    const original = (name) => `hello ${name}`;

    const wrapper = (fn, lastname) => (firstname) => fn(`${firstname} ${lastname}`);

    const wrapped = wrap()
      .with(wrapper, 'Jones')
      .with(wrapper, 'Paul')
      .run(original);

    assert.equal(wrapped('John'), 'hello John Paul Jones');
  });
});
