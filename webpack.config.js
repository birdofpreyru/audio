/* eslint-disable global-require, import/no-dynamic-require */

const LIB_NAME = '@dr.pogodin/audio';

module.exports = function buildConfig(env) {
  const config = require(`@dr.pogodin/react-utils/config/webpack/lib-${env}`)({
    context: __dirname,
    entry: './src',
    library: LIB_NAME,
  });
  return config;
};
