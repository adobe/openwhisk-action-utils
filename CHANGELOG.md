# [2.5.0](https://github.com/adobe/openwhisk-action-utils/compare/v2.4.0...v2.5.0) (2019-11-12)


### Bug Fixes

* **wrap:** enable concurrent wrappers ([cdda6b7](https://github.com/adobe/openwhisk-action-utils/commit/cdda6b705374c3e301884b77c77845b970379825)), closes [/github.com/adobe/openwhisk-action-utils/pull/29#discussion_r343393239](https://github.com//github.com/adobe/openwhisk-action-utils/pull/29/issues/discussion_r343393239)


### Features

* **chain:** expose `chain` function in module root ([e8c9548](https://github.com/adobe/openwhisk-action-utils/commit/e8c9548a42cf776b795d23de17b61a6e115c1fad))
* **chain:** provide action chaining mechanism ([0ece0ee](https://github.com/adobe/openwhisk-action-utils/commit/0ece0ee863739e68f2c801ac9f8c0fee4a0c3240)), closes [#25](https://github.com/adobe/openwhisk-action-utils/issues/25)
* **wrap:** enable alternative syntax ([ee10906](https://github.com/adobe/openwhisk-action-utils/commit/ee10906b23951b1f426fc40a9016095d7f9f38fe))
* **wrap:** support rest args for wrappers ([ac3d806](https://github.com/adobe/openwhisk-action-utils/commit/ac3d806b8434acb572c83fd23212569db055d654)), closes [/github.com/adobe/openwhisk-action-utils/pull/29#discussion_r343392926](https://github.com//github.com/adobe/openwhisk-action-utils/pull/29/issues/discussion_r343392926)

# [2.4.0](https://github.com/adobe/openwhisk-action-utils/compare/v2.3.7...v2.4.0) (2019-11-11)


### Features

* **logger:** improve logging ([#32](https://github.com/adobe/openwhisk-action-utils/issues/32)) ([fa899a9](https://github.com/adobe/openwhisk-action-utils/commit/fa899a9da33393c5731921a35eb263f116835088)), closes [#31](https://github.com/adobe/openwhisk-action-utils/issues/31) [#26](https://github.com/adobe/openwhisk-action-utils/issues/26)

## [2.3.7](https://github.com/adobe/openwhisk-action-utils/compare/v2.3.6...v2.3.7) (2019-10-29)


### Bug Fixes

* **ci:** trigger release ([f253966](https://github.com/adobe/openwhisk-action-utils/commit/f2539666d4cd0167037477f15bda9b17fa705ba7))

## [2.3.6](https://github.com/adobe/openwhisk-action-utils/compare/v2.3.5...v2.3.6) (2019-10-29)


### Bug Fixes

* **deps:** update dependencies ([5a9b8cb](https://github.com/adobe/openwhisk-action-utils/commit/5a9b8cbbf0c198c6e50807133a260c6d5286313f))

## [2.3.5](https://github.com/adobe/openwhisk-action-utils/compare/v2.3.4...v2.3.5) (2019-10-17)


### Bug Fixes

* **log:** upgrade to helix-log 3.0.0 ([c553378](https://github.com/adobe/openwhisk-action-utils/commit/c553378))

## [2.3.4](https://github.com/adobe/openwhisk-action-utils/compare/v2.3.3...v2.3.4) (2019-09-30)


### Bug Fixes

* **log:** papertrail log level is not initialized correctly ([#19](https://github.com/adobe/openwhisk-action-utils/issues/19)) ([1647f2d](https://github.com/adobe/openwhisk-action-utils/commit/1647f2d))

## [2.3.3](https://github.com/adobe/openwhisk-action-utils/compare/v2.3.2...v2.3.3) (2019-09-30)


### Bug Fixes

* **logger:** external bunyan logger is not forwarded to helix-log ([9ee97fd](https://github.com/adobe/openwhisk-action-utils/commit/9ee97fd))

## [2.3.2](https://github.com/adobe/openwhisk-action-utils/compare/v2.3.1...v2.3.2) (2019-09-28)


### Bug Fixes

* **logger:** use latest helix-log ([#15](https://github.com/adobe/openwhisk-action-utils/issues/15)) ([03488e0](https://github.com/adobe/openwhisk-action-utils/commit/03488e0))

## [2.3.1](https://github.com/adobe/openwhisk-action-utils/compare/v2.3.0...v2.3.1) (2019-09-27)


### Bug Fixes

* **deps:** update helix-log ([7b7914c](https://github.com/adobe/openwhisk-action-utils/commit/7b7914c))

# [2.3.0](https://github.com/adobe/openwhisk-action-utils/compare/v2.2.0...v2.3.0) (2019-09-26)


### Features

* **logger:** convert papertrail stream to helix logger ([#14](https://github.com/adobe/openwhisk-action-utils/issues/14)) ([8fdc230](https://github.com/adobe/openwhisk-action-utils/commit/8fdc230)), closes [#13](https://github.com/adobe/openwhisk-action-utils/issues/13)

# [2.2.0](https://github.com/adobe/openwhisk-action-utils/compare/v2.1.0...v2.2.0) (2019-09-26)


### Features

* **log:** remove loggly logger ([#12](https://github.com/adobe/openwhisk-action-utils/issues/12)) ([03ec0a7](https://github.com/adobe/openwhisk-action-utils/commit/03ec0a7)), closes [#11](https://github.com/adobe/openwhisk-action-utils/issues/11)

# [2.1.0](https://github.com/adobe/openwhisk-action-utils/compare/v2.0.0...v2.1.0) (2019-09-26)


### Features

* **papertrail:** add TLS support ([#10](https://github.com/adobe/openwhisk-action-utils/issues/10)) ([b18a774](https://github.com/adobe/openwhisk-action-utils/commit/b18a774)), closes [#9](https://github.com/adobe/openwhisk-action-utils/issues/9)

# [2.0.0](https://github.com/adobe/openwhisk-action-utils/compare/v1.1.0...v2.0.0) (2019-09-25)


### Features

* **logger:** add support for coralogix and helix-log ([2e53653](https://github.com/adobe/openwhisk-action-utils/commit/2e53653)), closes [#6](https://github.com/adobe/openwhisk-action-utils/issues/6) [#7](https://github.com/adobe/openwhisk-action-utils/issues/7)
* **logger:** create wrap function that creates a __ow_logger ([9cf11b0](https://github.com/adobe/openwhisk-action-utils/commit/9cf11b0))


### BREAKING CHANGES

* **logger:** The exported `logger` is no longer a function but exports an object.

The exported object contains 2 function that explicitely deal with setting up helix-log
and/or bunyan logging to be used with openwhisk.

# [1.1.0](https://github.com/adobe/openwhisk-action-utils/compare/v1.0.0...v1.1.0) (2019-09-03)


### Features

* **expressify:** ensure empty or missing __ow_path defaults to '/' ([ed4f15e](https://github.com/adobe/openwhisk-action-utils/commit/ed4f15e))
* **utils:** add commonly needed middleware ([d593933](https://github.com/adobe/openwhisk-action-utils/commit/d593933))

# 1.0.0 (2019-08-19)


### Bug Fixes

* **express:** ensure req.body is a string ([c40897a](https://github.com/adobe/openwhisk-action-utils/commit/c40897a)), closes [#15](https://github.com/adobe/openwhisk-action-utils/issues/15)
* **expressify:** fallback to application/octet-stream if no content-type provided ([8d69dcc](https://github.com/adobe/openwhisk-action-utils/commit/8d69dcc))
* **expressify:** send body as raw data ([#17](https://github.com/adobe/openwhisk-action-utils/issues/17)) ([157e88c](https://github.com/adobe/openwhisk-action-utils/commit/157e88c)), closes [#16](https://github.com/adobe/openwhisk-action-utils/issues/16)
* **logging:** move log helpers to own export ([#12](https://github.com/adobe/openwhisk-action-utils/issues/12)) ([01a44b4](https://github.com/adobe/openwhisk-action-utils/commit/01a44b4))


### Features

* **utils:** create standalone library ([94030cd](https://github.com/adobe/openwhisk-action-utils/commit/94030cd))
* **api:** add new expressify helper to support serverless-http ([#14](https://github.com/adobe/openwhisk-action-utils/issues/14)) ([50dbae3](https://github.com/adobe/openwhisk-action-utils/commit/50dbae3)), closes [#13](https://github.com/adobe/openwhisk-action-utils/issues/13)
* **expressify:** set isBase64Encoded flag correctly to ensure proper decoding ([e555c6e](https://github.com/adobe/openwhisk-action-utils/commit/e555c6e))
* **logging:** Adding logging helpers ([#11](https://github.com/adobe/openwhisk-action-utils/issues/11)) ([c1e5d50](https://github.com/adobe/openwhisk-action-utils/commit/c1e5d50)), closes [#9](https://github.com/adobe/openwhisk-action-utils/issues/9)
* **openwhisk:** add new `--timeout` limit option ([936880d](https://github.com/adobe/openwhisk-action-utils/commit/936880d)), closes [#37](https://github.com/adobe/openwhisk-action-utils/issues/37)
