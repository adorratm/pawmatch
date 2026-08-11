'use strict';

/**
 * Metro (and other 1.x callers) expect `require('image-size')` to be a
 * callable default export. Upstream `image-size` is archived and unpatched;
 * `image-size-safe@2.0.3` ships the DoS fixes under a named export.
 */
const {
  imageSize,
  disableTypes,
  types,
  setConcurrency,
} = require('image-size-safe');
const { readFileSync } = require('node:fs');

function imageSizeCompat(input) {
  if (typeof input === 'string') {
    return imageSize(readFileSync(input));
  }
  return imageSize(input);
}

module.exports = imageSizeCompat;
module.exports.default = imageSizeCompat;
module.exports.imageSize = imageSize;
module.exports.disableTypes = disableTypes;
module.exports.types = types;
module.exports.setConcurrency = setConcurrency;
