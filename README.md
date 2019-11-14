# Openwhisk Action Utilities
> Utilities for OpenWhisk actions.

## Status
[![GitHub license](https://img.shields.io/github/license/adobe/openwhisk-action-utils.svg)](https://github.com/adobe/openwhisk-action-utils/blob/master/LICENSE.txt)
[![GitHub issues](https://img.shields.io/github/issues/adobe/openwhisk-action-utils.svg)](https://github.com/adobe/openwhisk-action-utils/issues)
[![CircleCI](https://img.shields.io/circleci/project/github/adobe/openwhisk-action-utils.svg)](https://circleci.com/gh/adobe/openwhisk-action-utils)
[![codecov](https://img.shields.io/codecov/c/github/adobe/openwhisk-action-utils.svg)](https://codecov.io/gh/adobe/openwhisk-action-utils)
[![Greenkeeper badge](https://badges.greenkeeper.io/adobe/openwhisk-action-utils.svg)](https://greenkeeper.io/)
[![LGTM Code Quality Grade: JavaScript](https://img.shields.io/lgtm/grade/javascript/g/adobe/openwhisk-action-utils.svg?logo=lgtm&logoWidth=18)](https://lgtm.com/projects/g/adobe/openwhisk-action-utils)

# API Reference
## Modules

<dl>
<dt><a href="#module_logger">logger</a></dt>
<dd><p>Wrap function that returns an OpenWhisk function that is enabled with logging.</p>
<p><strong>Usage:</strong></p>
<pre><code class="language-js">const { logger, wrap } = require(&#39;@adobe/openwhisk-action-utils&#39;};

async main(params) {
  //…my action code…
}

module.exports.main = wrap(main)
  .with(logger);</code></pre>
</dd>
<dt><a href="#module_wrap">wrap</a></dt>
<dd><p>Helper function to easily chain OpenWhisk actions.</p>
<p><strong>Usage:</strong></p>
<pre><code class="language-js">const { wrap } = require(&#39;@adobe/openwhisk-action-utils&#39;);

async main(params) {
  // …my action code…
}

module.exports.main = wrap(main)
  .with(epsagon)
  .with(status)
  .with(logger);</code></pre>
</dd>
</dl>

<a name="module_logger"></a>

## logger
Wrap function that returns an OpenWhisk function that is enabled with logging.

**Usage:**

```js
const { logger, wrap } = require('@adobe/openwhisk-action-utils'};

async main(params) {
  //…my action code…
}

module.exports.main = wrap(main)
  .with(logger);
```


* [logger](#module_logger)
    * [~init(params, [logger])](#module_logger..init) ⇒
    * [~wrap(fn, params, [logger])](#module_logger..wrap) ⇒ <code>\*</code>
    * [~logger(fn, [logger])](#module_logger..logger) ⇒ <code>ActionFunction</code>

<a name="module_logger..init"></a>

### logger~init(params, [logger]) ⇒
Initializes helix-log and sets up external loggers. It also creates a bunyan-logger
if not already present on `params.__ow_logger`.

**Kind**: inner method of [<code>logger</code>](#module_logger)  
**Returns**: BunyanLogger A bunyan logger.  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| params | <code>\*</code> |  | openwhisk action params. |
| [logger] | <code>MultiLogger</code> | <code>rootLogger</code> | a helix multi logger. defaults to the helix                                            `rootLogger`. |

<a name="module_logger..wrap"></a>

### logger~wrap(fn, params, [logger]) ⇒ <code>\*</code>
Takes a main OpenWhisk function and intitializes logging, by invoking [init](init).
It logs invocation details on `trace` level before and after the actual action invocation.
it also creates a bunyan logger and binds it to the `__ow_logger` params.

**Kind**: inner method of [<code>logger</code>](#module_logger)  
**Returns**: <code>\*</code> - the return value of the action  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| fn | <code>ActionFunction</code> |  | original OpenWhisk action main function |
| params | <code>\*</code> |  | OpenWhisk action params |
| [logger] | <code>MultiLogger</code> | <code>rootLogger</code> | a helix multi logger. defaults to the helix                                            `rootLogger`. |

<a name="module_logger..logger"></a>

### logger~logger(fn, [logger]) ⇒ <code>ActionFunction</code>
Wrap function that returns an OpenWhisk function that is enabled with logging.

**Kind**: inner method of [<code>logger</code>](#module_logger)  
**Returns**: <code>ActionFunction</code> - a new function with the same signature as your original main function  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| fn | <code>ActionFunction</code> |  | original OpenWhisk action main function |
| [logger] | <code>MultiLogger</code> | <code>rootLogger</code> | a helix multi logger. defaults to the helix                                            `rootLogger`. |

**Example**  

```js
const { logger, wrap } = require('@adobe/openwhisk-action-utils'};

async main(params) {
  //…my action code…
}

module.exports.main = wrap(main)
  .with(logger);
```
<a name="module_wrap"></a>

## wrap
Helper function to easily chain OpenWhisk actions.

**Usage:**

```js
const { wrap } = require('@adobe/openwhisk-action-utils');

async main(params) {
  // …my action code…
}

module.exports.main = wrap(main)
  .with(epsagon)
  .with(status)
  .with(logger);
```


* [wrap](#module_wrap)
    * [~wrap(main)](#module_wrap..wrap) ⇒ <code>WrappableActionFunction</code>
    * [~ActionFunction](#module_wrap..ActionFunction) ⇒ <code>object</code>
    * [~WrappableActionFunction](#module_wrap..WrappableActionFunction) ⇒ <code>object</code>
    * [~WrapFunction](#module_wrap..WrapFunction) ⇒ <code>ActionFunction</code>

<a name="module_wrap..wrap"></a>

### wrap~wrap(main) ⇒ <code>WrappableActionFunction</code>
A function that makes your action function (i.e. `main`) wrappable,
so that using `with` a number of wrappers can be applied. This allows
you to export the result as a new function.

**Kind**: inner method of [<code>wrap</code>](#module_wrap)  
**Returns**: <code>WrappableActionFunction</code> - the same main function, now including a `with` method  

| Param | Type | Description |
| --- | --- | --- |
| main | <code>ActionFunction</code> | the `main` function to prepare for wrapping |

**Example**  

```js
async main(params) {
  //…my action code…
}

module.exports.main = wrap(main)
.with(epsagon)
.with(status)
.with(logger);
```

Note: the execution order is that the last wrapper added will be executed first.
<a name="module_wrap..ActionFunction"></a>

### wrap~ActionFunction ⇒ <code>object</code>
The `main` function of an OpenWhisk action.

**Kind**: inner typedef of [<code>wrap</code>](#module_wrap)  
**Returns**: <code>object</code> - a result  

| Param | Type | Description |
| --- | --- | --- |
| params | <code>object</code> | the parameters of the action function |

<a name="module_wrap..WrappableActionFunction"></a>

### wrap~WrappableActionFunction ⇒ <code>object</code>
An `ActionFunction` that has been augmented to become wrappable using the `with` method.

**Kind**: inner typedef of [<code>wrap</code>](#module_wrap)  
**Returns**: <code>object</code> - a result  

| Param | Type | Description |
| --- | --- | --- |
| params | <code>object</code> | the parameters of the action function |

<a name="module_wrap..WrapFunction"></a>

### wrap~WrapFunction ⇒ <code>ActionFunction</code>
A function that wraps (and invokes your main function). It can be used
to decorate inputs or outputs, or to provide additional functionality
like logging, tracing, debugging, etc.

**Kind**: inner typedef of [<code>wrap</code>](#module_wrap)  
**Returns**: <code>ActionFunction</code> - a new function with the same signature as your original main function  

| Param | Type | Description |
| --- | --- | --- |
| main | <code>ActionFunction</code> | your main function |
| ...opts | <code>\*</code> | configuration options for the wrapping function |

**Example**  

```js
function tracer(fn, level) {
  return (params) => {
    log[level]('enter');
    const ret = fn(params);
    log[level]('exit');
    return ret;
  }
}
```
