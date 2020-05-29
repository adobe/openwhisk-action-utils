# Openwhisk Action Utilities
> Utilities for OpenWhisk actions.

## Status
[![GitHub license](https://img.shields.io/github/license/adobe/openwhisk-action-utils.svg)](https://github.com/adobe/openwhisk-action-utils/blob/master/LICENSE.txt)
[![GitHub issues](https://img.shields.io/github/issues/adobe/openwhisk-action-utils.svg)](https://github.com/adobe/openwhisk-action-utils/issues)
[![CircleCI](https://img.shields.io/circleci/project/github/adobe/openwhisk-action-utils.svg)](https://circleci.com/gh/adobe/openwhisk-action-utils)
[![codecov](https://img.shields.io/codecov/c/github/adobe/openwhisk-action-utils.svg)](https://codecov.io/gh/adobe/openwhisk-action-utils)

[![LGTM Code Quality Grade: JavaScript](https://img.shields.io/lgtm/grade/javascript/g/adobe/openwhisk-action-utils.svg?logo=lgtm&logoWidth=18)](https://lgtm.com/projects/g/adobe/openwhisk-action-utils)

# API Reference
## Modules

<dl>
<dt><a href="#module_expressify">expressify</a></dt>
<dd><p>Helper to turn a OpenWhisk web action into a express request which can be handled with normal
express handlers.</p>
<p>Expressify maps the query and most of action params to <code>req.query</code>.
The original action params are available under <code>req.owActionParams</code>.</p>
<p><strong>Usage:</strong></p>
<pre><code class="language-js">const { expressify, errorHandler } = require(&#39;@adobe/openwhisk-action-utils&#39;);

async function main(params) {
  const app = express();
  app.use(cookieParser());
  app.use(express.static(&#39;static&#39;));
  app.get(&#39;/&#39;, homepageHandler);
  app.get(&#39;/ping&#39;, pingHandler);
  app.use(errorHandler(log));

  return expressify(app)(params);
}</code></pre>
</dd>
<dt><a href="#module_middleware">middleware</a></dt>
<dd><p>Helper functions for expressified actions.</p>
<p><strong>Usage:</strong></p>
<pre><code class="language-js">const {
  expressify, logRequest, errorHandler, asyncHandler, cacheControl, createBunyanLogger,
} = require(&#39;@adobe/openwhisk-action-utils&#39;);

async function startHandler(params, req, res) {
   res.send(&#39;Hello, world.&#39;);
}
async function main(params) {
  const log = createBunyanLogger();
  const app = express();
  app.use(logRequest(log));
  app.use(cacheControl());
  app.get(&#39;/&#39;, asyncHandler(startHandler));
  app.get(&#39;/ping&#39;, asyncHandler(pingHandler));
  app.use(errorHandler(log));

  return expressify(app)(params);
}</code></pre>
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

## Functions

<dl>
<dt><a href="#createBunyanLogger">createBunyanLogger([logger])</a> ⇒ <code>BunyanLogger</code></dt>
<dd><p>Sets up a bunyan logger suitable to use with an openwhisk action. The bunyan logger will
stream to the given helix logger.</p>
</dd>
</dl>

<a name="module_expressify"></a>

## expressify
Helper to turn a OpenWhisk web action into a express request which can be handled with normal
express handlers.

Expressify maps the query and most of action params to `req.query`.
The original action params are available under `req.owActionParams`.

**Usage:**

```js
const { expressify, errorHandler } = require('@adobe/openwhisk-action-utils');

async function main(params) {
  const app = express();
  app.use(cookieParser());
  app.use(express.static('static'));
  app.get('/', homepageHandler);
  app.get('/ping', pingHandler);
  app.use(errorHandler(log));

  return expressify(app)(params);
}
```

<a name="module_expressify..expressify"></a>

### expressify~expressify(app) ⇒ [<code>ActionFunction</code>](#module_wrap..ActionFunction)
Creates an OpenWhisk action function that uses the express framework to handle the invocation.

**Kind**: inner method of [<code>expressify</code>](#module_expressify)  
**Returns**: [<code>ActionFunction</code>](#module_wrap..ActionFunction) - An action function.  
**See**: https://expressjs.com/en/4x/api.html#app  

| Param | Type | Description |
| --- | --- | --- |
| app | <code>ExpressApp</code> | The express application |

<a name="module_middleware"></a>

## middleware
Helper functions for expressified actions.

**Usage:**

```js
const {
  expressify, logRequest, errorHandler, asyncHandler, cacheControl, createBunyanLogger,
} = require('@adobe/openwhisk-action-utils');

async function startHandler(params, req, res) {
   res.send('Hello, world.');
}
async function main(params) {
  const log = createBunyanLogger();
  const app = express();
  app.use(logRequest(log));
  app.use(cacheControl());
  app.get('/', asyncHandler(startHandler));
  app.get('/ping', asyncHandler(pingHandler));
  app.use(errorHandler(log));

  return expressify(app)(params);
}
```


* [middleware](#module_middleware)
    * [~errorHandler(log)](#module_middleware..errorHandler) ⇒ <code>ExpressMiddleware</code>
    * [~cacheControl([value])](#module_middleware..cacheControl) ⇒ <code>ExpressMiddleware</code>
    * [~hideHeaders(headerNames)](#module_middleware..hideHeaders) ⇒ <code>ExpressMiddleware</code>
    * [~logRequest(logger, [level])](#module_middleware..logRequest) ⇒ <code>ExpressMiddleware</code>
    * [~asyncHandler(fn)](#module_middleware..asyncHandler) ⇒ <code>ExpressMiddleware</code>
    * [~ActionMiddlewareFunction](#module_middleware..ActionMiddlewareFunction) : <code>function</code>

<a name="module_middleware..errorHandler"></a>

### middleware~errorHandler(log) ⇒ <code>ExpressMiddleware</code>
Error handler. Reports errors that happen during the request processing and responds
with a `500` if not already set.

**Kind**: inner method of [<code>middleware</code>](#module_middleware)  
**Returns**: <code>ExpressMiddleware</code> - an express middleware function.  

| Param | Type | Description |
| --- | --- | --- |
| log | <code>BunyanLogger</code> | The logger to use for reporting errors. |

**Example**  

```js
// install last
app.use(errorHandler(log));
```
<a name="module_middleware..cacheControl"></a>

### middleware~cacheControl([value]) ⇒ <code>ExpressMiddleware</code>
Ensures cache control. Sets cache control headers.

**Kind**: inner method of [<code>middleware</code>](#module_middleware)  
**Returns**: <code>ExpressMiddleware</code> - an express middleware function.  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| [value] | <code>string</code> | <code>&quot;no-store, private, must-revalidate&quot;</code> | Cache control header value. |

**Example**  

```
app.use(cacheControl());
```
<a name="module_middleware..hideHeaders"></a>

### middleware~hideHeaders(headerNames) ⇒ <code>ExpressMiddleware</code>
Hides headers from enumeration.

**Kind**: inner method of [<code>middleware</code>](#module_middleware)  
**Returns**: <code>ExpressMiddleware</code> - an express middleware function.  

| Param | Type | Description |
| --- | --- | --- |
| headerNames | <code>Array.&lt;string&gt;</code> | Names of headers to make un-enumerable |

**Example**  

```js
// install first
app.use(hideHeaders(['x-token', 'authentication'));
app.use(logRequest(log));
```
<a name="module_middleware..logRequest"></a>

### middleware~logRequest(logger, [level]) ⇒ <code>ExpressMiddleware</code>
Creates a bunyan child logger for the request and adds it to the request. This ensures that
important header values, like `x-request-id` are included in every log entry. It also
logs the request and response lines.

**Kind**: inner method of [<code>middleware</code>](#module_middleware)  
**Returns**: <code>ExpressMiddleware</code> - an express middleware function.  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| logger | <code>BunyanLogger</code> |  | the bunyan logger |
| [level] | <code>string</code> | <code>&quot;debug&quot;</code> | the log level to use for logging the request information. |

**Example**  

```js
// install first
app.use(logRequest(log));
```
<a name="module_middleware..asyncHandler"></a>

### middleware~asyncHandler(fn) ⇒ <code>ExpressMiddleware</code>
Wraps the route middleware so it can catch potential promise rejections
during the async invocation.

**Kind**: inner method of [<code>middleware</code>](#module_middleware)  
**Returns**: <code>ExpressMiddleware</code> - an express middleware function.  

| Param | Type | Description |
| --- | --- | --- |
| fn | <code>ExpressMiddleware</code> | an extended express middleware function |

<a name="module_middleware..ActionMiddlewareFunction"></a>

### middleware~ActionMiddlewareFunction : <code>function</code>
Extended middleware function to be use with the [asyncHandler](#module_middleware..asyncHandler).

**Kind**: inner typedef of [<code>middleware</code>](#module_middleware)  
**See**: https://expressjs.com/en/4x/api.html#middleware-callback-function-examples  

| Param | Type | Description |
| --- | --- | --- |
| params | <code>\*</code> | The action params |
| req | <code>ExpressRequest</code> | The express request |
| res | <code>ExpressResponse</code> | The express response |
| next | <code>ExpressMiddleware</code> | The next handler in chain. |

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
<a name="createBunyanLogger"></a>

## createBunyanLogger([logger]) ⇒ <code>BunyanLogger</code>
Sets up a bunyan logger suitable to use with an openwhisk action. The bunyan logger will
stream to the given helix logger.

**Kind**: global function  
**Returns**: <code>BunyanLogger</code> - A bunyan logger  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| [logger] | <code>Logger</code> | <code>rootLogger</code> | a helix multi logger. defaults to the helix `rootLogger`. |

