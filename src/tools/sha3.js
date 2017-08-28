const CryptoJS = require('crypto-js');
const cryptoSha3 = require('crypto-js/sha3');

module.exports = function (data) {
  if (data.length > 2 && data.substr(0, 2) === '0x') {
    data = data.substr(2);
  }
  data = CryptoJS.enc.Hex.parse(data);
  return cryptoSha3(data, { outputLength: 256 }).toString();
};
