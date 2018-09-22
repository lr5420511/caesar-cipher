'use strict';

const Cipher = require('./lib/cipher');

const cipher = new Cipher(1, 5);

const encodeStr = (str, shift) => cipher.encode(str, shift);

const decode = ar => cipher.decode(ar);

module.exports = { encodeStr, decode };