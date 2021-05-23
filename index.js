/**
 * Entry point of the library.
 *
 * Depending on NODE_ENV variable, it proxies production or development build of
 * the library.
 */
/* eslint-disable global-require, import/no-dynamic-require,
  import/no-unresolved, no-eval */
/* global window */

const IS_NODE = typeof window === 'undefined' || !window.TRU_FRONT_END;

if (process.env.NODE_ENV === 'production') {
  module.exports = IS_NODE ? eval('require')('./build/production')
    : require('./build/production/web.bundle');
} else {
  module.exports = IS_NODE ? eval('require')('./build/development')
    : require('./build/development/web.bundle');
}
