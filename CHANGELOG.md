# 1.0.0 (2019-08-19)


### Bug Fixes

* **build:** instruct webpack to use correct __dirname ([#47](https://github.com/adobe/openwhisk-action-utils/issues/47)) ([36d9242](https://github.com/adobe/openwhisk-action-utils/commit/36d9242)), closes [#39](https://github.com/adobe/openwhisk-action-utils/issues/39)
* **builder:** fix error when linking with [@ci](https://github.com/ci) ([02a47a5](https://github.com/adobe/openwhisk-action-utils/commit/02a47a5))
* **builder:** remove externals that are not really present ([61bbaa8](https://github.com/adobe/openwhisk-action-utils/commit/61bbaa8))
* **builder:** set process.exitCode on failure ([35c7dbd](https://github.com/adobe/openwhisk-action-utils/commit/35c7dbd)), closes [#34](https://github.com/adobe/openwhisk-action-utils/issues/34)
* **builder:** signal error during sequence updates ([d239066](https://github.com/adobe/openwhisk-action-utils/commit/d239066)), closes [#53](https://github.com/adobe/openwhisk-action-utils/issues/53)
* **cli:** correct usage of yargs ([53195be](https://github.com/adobe/openwhisk-action-utils/commit/53195be))
* **cli:** default to nodejs:10 container ([19a0c3d](https://github.com/adobe/openwhisk-action-utils/commit/19a0c3d)), closes [#18](https://github.com/adobe/openwhisk-action-utils/issues/18)
* **cli:** prefer process.env over .wskprops ([#46](https://github.com/adobe/openwhisk-action-utils/issues/46)) ([c9eb849](https://github.com/adobe/openwhisk-action-utils/commit/c9eb849)), closes [#42](https://github.com/adobe/openwhisk-action-utils/issues/42)
* **dep:** update dependencies ([53878a0](https://github.com/adobe/openwhisk-action-utils/commit/53878a0))
* **express:** ensure req.body is a string ([c40897a](https://github.com/adobe/openwhisk-action-utils/commit/c40897a)), closes [#15](https://github.com/adobe/openwhisk-action-utils/issues/15)
* **expressify:** fallback to application/octet-stream if no content-type provided ([8d69dcc](https://github.com/adobe/openwhisk-action-utils/commit/8d69dcc))
* **expressify:** send body as raw data ([#17](https://github.com/adobe/openwhisk-action-utils/issues/17)) ([157e88c](https://github.com/adobe/openwhisk-action-utils/commit/157e88c)), closes [#16](https://github.com/adobe/openwhisk-action-utils/issues/16)
* **external:** declare all openwhisk files as external ([2271598](https://github.com/adobe/openwhisk-action-utils/commit/2271598)), closes [#54](https://github.com/adobe/openwhisk-action-utils/issues/54)
* **logging:** move log helpers to own export ([#12](https://github.com/adobe/openwhisk-action-utils/issues/12)) ([01a44b4](https://github.com/adobe/openwhisk-action-utils/commit/01a44b4))
* **package:** update fs-extra to version 8.0.0 ([fd2869d](https://github.com/adobe/openwhisk-action-utils/commit/fd2869d))


### Features

* **api:** add new expressify helper to support serverless-http ([#14](https://github.com/adobe/openwhisk-action-utils/issues/14)) ([50dbae3](https://github.com/adobe/openwhisk-action-utils/commit/50dbae3)), closes [#13](https://github.com/adobe/openwhisk-action-utils/issues/13)
* **builder:** add option to generate link to [@ci](https://github.com/ci) ([#56](https://github.com/adobe/openwhisk-action-utils/issues/56)) ([8d1ae73](https://github.com/adobe/openwhisk-action-utils/commit/8d1ae73))
* **builder:** add possibility to specify test url ([e450a85](https://github.com/adobe/openwhisk-action-utils/commit/e450a85)), closes [#51](https://github.com/adobe/openwhisk-action-utils/issues/51)
* **builder:** allow extension of webpack config ([0e03766](https://github.com/adobe/openwhisk-action-utils/commit/0e03766)), closes [#30](https://github.com/adobe/openwhisk-action-utils/issues/30)
* **builder:** create option to create symlinks ([fbf37e4](https://github.com/adobe/openwhisk-action-utils/commit/fbf37e4)), closes [#48](https://github.com/adobe/openwhisk-action-utils/issues/48)
* **builder:** use version from package json in action name ([3717eca](https://github.com/adobe/openwhisk-action-utils/commit/3717eca)), closes [#49](https://github.com/adobe/openwhisk-action-utils/issues/49)
* **cli:** add default externals for node:10 container ([#28](https://github.com/adobe/openwhisk-action-utils/issues/28)) ([28daad1](https://github.com/adobe/openwhisk-action-utils/commit/28daad1)), closes [#27](https://github.com/adobe/openwhisk-action-utils/issues/27)
* **cli:** allow to create or update openwhisk package ([721b590](https://github.com/adobe/openwhisk-action-utils/commit/721b590)), closes [#23](https://github.com/adobe/openwhisk-action-utils/issues/23)
* **cli:** bundled package.json should have version set to host package version ([dccaf27](https://github.com/adobe/openwhisk-action-utils/commit/dccaf27)), closes [#5](https://github.com/adobe/openwhisk-action-utils/issues/5)
* **config:** support to specify file content in env variables ([#25](https://github.com/adobe/openwhisk-action-utils/issues/25)) ([e47f0e2](https://github.com/adobe/openwhisk-action-utils/commit/e47f0e2)), closes [#22](https://github.com/adobe/openwhisk-action-utils/issues/22)
* **expressify:** set isBase64Encoded flag correctly to ensure proper decoding ([e555c6e](https://github.com/adobe/openwhisk-action-utils/commit/e555c6e))
* **logging:** Adding logging helpers ([#11](https://github.com/adobe/openwhisk-action-utils/issues/11)) ([c1e5d50](https://github.com/adobe/openwhisk-action-utils/commit/c1e5d50)), closes [#9](https://github.com/adobe/openwhisk-action-utils/issues/9)
* **openwhisk:** add new `--timeout` limit option ([936880d](https://github.com/adobe/openwhisk-action-utils/commit/936880d)), closes [#37](https://github.com/adobe/openwhisk-action-utils/issues/37)
* **utils:** create standalone library ([94030cd](https://github.com/adobe/openwhisk-action-utils/commit/94030cd))


### BREAKING CHANGES

* **expressify:** the __ow_body doesn't need to be decoded manually anymore

## [1.0.1](https://github.com/adobe/openwhisk-action-utils/compare/v1.0.0...v1.0.1) (2019-05-09)


### Bug Fixes

* **expressify:** fallback to application/octet-stream if no content-type provided ([8d69dcc](https://github.com/adobe/openwhisk-action-utils/commit/8d69dcc))

# [1.0.0](https://github.com/adobe/openwhisk-action-utils/compare/v0.9.0...v1.0.0) (2019-05-09)


### Features

* **expressify:** set isBase64Encoded flag correctly to ensure proper decoding ([e555c6e](https://github.com/adobe/openwhisk-action-utils/commit/e555c6e))


### BREAKING CHANGES

* **expressify:** the __ow_body doesn't need to be decoded manually anymore

## [0.5.2](https://github.com/adobe/openwhisk-action-utils/compare/v0.5.1...v0.5.2) (2019-04-01)


### Bug Fixes

* **expressify:** send body as raw data ([#17](https://github.com/adobe/openwhisk-action-utils/issues/17)) ([157e88c](https://github.com/adobe/openwhisk-action-utils/commit/157e88c)), closes [#16](https://github.com/adobe/openwhisk-action-utils/issues/16)

## [0.5.1](https://github.com/adobe/openwhisk-action-utils/compare/v0.5.0...v0.5.1) (2019-03-25)


### Bug Fixes

* **express:** ensure req.body is a string ([c40897a](https://github.com/adobe/openwhisk-action-utils/commit/c40897a)), closes [#15](https://github.com/adobe/openwhisk-action-utils/issues/15)

# [0.5.0](https://github.com/adobe/openwhisk-action-utils/compare/v0.4.1...v0.5.0) (2019-03-25)


### Features

* **api:** add new expressify helper to support serverless-http ([#14](https://github.com/adobe/openwhisk-action-utils/issues/14)) ([50dbae3](https://github.com/adobe/openwhisk-action-utils/commit/50dbae3)), closes [#13](https://github.com/adobe/openwhisk-action-utils/issues/13)

## [0.4.1](https://github.com/adobe/openwhisk-action-utils/compare/v0.4.0...v0.4.1) (2019-03-22)


### Bug Fixes

* **logging:** move log helpers to own export ([#12](https://github.com/adobe/openwhisk-action-utils/issues/12)) ([01a44b4](https://github.com/adobe/openwhisk-action-utils/commit/01a44b4))

# [0.4.0](https://github.com/adobe/openwhisk-action-utils/compare/v0.3.0...v0.4.0) (2019-03-22)


### Features

* **logging:** Adding logging helpers ([#11](https://github.com/adobe/openwhisk-action-utils/issues/11)) ([c1e5d50](https://github.com/adobe/openwhisk-action-utils/commit/c1e5d50)), closes [#9](https://github.com/adobe/openwhisk-action-utils/issues/9)
