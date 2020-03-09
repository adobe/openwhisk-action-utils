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
/**
 * Helper to turn a OpenWhisk web action into a express request which can be handled with normal
 * express handlers.
 *
 * Expressify maps the query and most of action params to `req.query`.
 * The original action params are available under `req.owActionParams`.
 *
 * **Usage:**
 *
 * ```js
 * const { expressify, errorHandler } = require('@adobe/openwhisk-action-utils');
 *
 * async function main(params) {
 *   const app = express();
 *   app.use(cookieParser());
 *   app.use(express.static('static'));
 *   app.get('/', homepageHandler);
 *   app.get('/ping', pingHandler);
 *   app.use(errorHandler(log));
 *
 *   return expressify(app)(params);
 * }
 * ```
 * @module expressify
 */

const querystring = require('querystring');
const serverless = require('serverless-http');

/**
 * Creates an OpenWhisk action function that uses the express framework to handle the invocation.
 *
 * @see https://expressjs.com/en/4x/api.html#app
 * @param {ExpressApp} app The express application
 * @returns {module:wrap~ActionFunction} An action function.
 */
function expressify(app) {
  return async (params) => {
    const requestBodyAdapter = async (req, res, next) => {
      // `serverless-http` converts the request.body by default to a buffer,
      // which not all express apps can deal with. so emulate data again.
      if (req.body && Buffer.isBuffer(req.body)) {
        const data = req.body;
        delete req.body;
        req.emit('data', data);
        req.emit('end');
      }
      // also inject the action params to the request
      Object.defineProperty(req, 'owActionParams', {
        value: params,
        enumerable: false,
      });

      return app(req, res, next);
    };

    const handler = serverless(requestBodyAdapter, {
      // eslint-disable-next-line no-use-before-define
      binary: BINARY_MEDIA_TYPES,
    });

    // check content type:
    const contentType = (params.__ow_headers ? params.__ow_headers['content-type'] : '') || 'application/octet-stream';

    // eslint-disable-next-line no-use-before-define
    const isBase64Encoded = BINARY_CONTENT_TYPES.find((pat) => pat.test(contentType));

    // copy all params that do now start with __ow or are all upper case as query params
    const query = {};
    Object.entries(params).forEach(([key, value]) => {
      if (key.startsWith('__ow') || key.match(/^[A-Z0-9_]+$/)) {
        return;
      }
      query[key] = value;
    });
    // also check for a `__ow_query` in case of raw http actions
    if (params.__ow_query) {
      Object.assign(query, querystring.parse(params.__ow_query || ''));
    }

    const event = {
      httpMethod: (params.__ow_method || 'POST').toUpperCase(),
      path: params.__ow_path || '/',
      body: params.__ow_body,
      headers: params.__ow_headers,
      isBase64Encoded,
      queryStringParameters: query,
    };
    const result = await handler(event, {});
    delete result.isBase64Encoded;
    return result;
  };
}

const BINARY_MEDIA_TYPES = [
  'audio/*',
  'image/*',
  'video/*',
  'application/base64',
  'application/excel',
  'application/font-woff',
  'application/gnutar',
  'application/java-archive',
  'application/lha',
  'application/lzx',
  'application/mspowerpoint',
  'application/msword',
  'application/octet-stream',
  'application/pdf',
  'application/postscript',
  'application/vnd.google-earth.kmz',
  'application/vnd.ms-fontobject',
  'application/vnd.oasis.opendocument.chart',
  'application/vnd.oasis.opendocument.database',
  'application/vnd.oasis.opendocument.formula',
  'application/vnd.oasis.opendocument.graphics',
  'application/vnd.oasis.opendocument.image',
  'application/vnd.oasis.opendocument.presentation',
  'application/vnd.oasis.opendocument.spreadsheet',
  'application/vnd.oasis.opendocument.text',
  'application/vnd.oasis.opendocument.text-master',
  'application/vnd.oasis.opendocument.text-web',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  'application/vnd.openxmlformats-officedocument.presentationml.slide',
  'application/vnd.openxmlformats-officedocument.presentationml.slideshow',
  'application/vnd.openxmlformats-officedocument.presentationml.template',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.template',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.template',
  'application/x-7z-compressed',
  'application/x-ace-compressed',
  'application/x-apple-diskimage',
  'application/x-arc-compressed',
  'application/x-bzip',
  'application/x-bzip2',
  'application/x-chrome-extension',
  'application/x-compress',
  'application/x-compressed',
  'application/x-debian-package',
  'application/x-dvi',
  'application/x-font-truetype',
  'application/x-font-opentype',
  'application/x-gtar',
  'application/x-gzip',
  'application/x-latex',
  'application/x-rar-compressed',
  'application/x-redhat-package-manager',
  'application/x-shockwave-flash',
  'application/x-tar',
  'application/x-tex',
  'application/x-texinfo',
  'application/x-x509-ca-cert',
  'application/x-xpinstall',
  'application/zip',
];

// __ow_body (type: string): the request body entity, as a base64 encoded string when content
// is binary or JSON object/array, or plain string otherwise.
const BINARY_CONTENT_TYPES = [
  '*/json',
  'multipart/*',
  ...BINARY_MEDIA_TYPES].map((glob) => new RegExp(glob.replace(/\./g, '\\.').replace(/\*/g, '.*')));

module.exports = expressify;
