const Web3 = require('web3');
const privateConfig = require('./privateConfig.json');

var config = {};

config.apiHost = 'localhost';
config.apiPort = '80';

config.databaseURI = 'mongodb://localhost/hash-store';

config.gethHost = privateConfig.gethHost;
config.gethPort = privateConfig.gethPort;
config.adminAddress = privateConfig.address;
config.adminPrivateKey = privateConfig.privateKey;
config.gasPrice = 20000000000;
config.gasLimit = 4700000;
config.hashesPerContract = 10000; // FIXME
config.delayBetweenTransactions = 60000; // 600000 === 10 minutes
config.delayToCheckPending = 60000; // 60000 === 1 minute

var web3 = new Web3();
web3.setProvider(new web3.providers.HttpProvider(config.gethHost + ':' + config.gethPort + ''));
config.txNonce = parseInt(web3.eth.getTransactionCount(config.adminAddress));
config.getAndIncrementNonce = function() {
  let res = config.txNonce;
  config.txNonce = config.txNonce + 1;
  return res;
};

module.exports = config;