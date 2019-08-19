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
