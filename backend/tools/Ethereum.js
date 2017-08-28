const Web3 = require('web3');
const Tx = require('ethereumjs-tx');

const config = require('../config.js');
const Responses = require('./Responses');

var web3 = new Web3();
web3.setProvider(new web3.providers.HttpProvider(config.gethHost + ':' + config.gethPort + ''));

const adminPrivKey = config.adminPrivateKey;

const HashStoreCompiled = require('../contracts/HashStore.json').contracts['backend/contracts/HashStore.sol:HashStore'];
const HashStoreContract = web3.eth.contract(JSON.parse(HashStoreCompiled.abi));

var Ethereum = {};

function signTX(tx, pvKey) {
  tx.sign(new Buffer(pvKey, 'hex'));
  let serializedTx = '0x' + tx.serialize().toString('hex');
  return serializedTx;
}

function sendTransaction(resolve, reject, data, contractAddress) {
  let rawTX = {
    nonce: web3.toHex(config.getAndIncrementNonce()),
    gasLimit: web3.toHex(config.gasLimit),
    gasPrice: web3.toHex(config.gasPrice),
    value: web3.toHex(0),
    data: data,
    chainId: 3
  };
  if (typeof contractAddress !== 'undefined') {
    rawTX.to = contractAddress;
  }
  let TX = new Tx(rawTX);
  let signedTX = signTX(TX, adminPrivKey);
  web3.eth.sendRawTransaction(signedTX, function(error, hash) {
    if (error) {
      reject({code: Responses.E_BLOCKCHAIN, message: error.message, stack: error.stack});
    } else {
      resolve(hash);
    }
  });
}

Ethereum.isTXMined = function(tx){
  // FIXME
  try{
    if (!web3.eth.getTransaction(tx))
      return 0;
    let txBlock = web3.eth.getTransaction(tx).blockNumber;
    if ((txBlock !== null) && (parseInt(txBlock) <= web3.eth.getBlock('latest').number))
      return txBlock;
    else
      return 0;
  } catch(e){
    return 0;
  }
};

Ethereum.getTransactionReceipt = function(hash) {
  return web3.eth.getTransactionReceipt(hash);
};

Ethereum.deployHashStoreContract = function() {
  return new Promise(function (resolve, reject) {
    let contractData = HashStoreContract.new.getData({data: '0x' + HashStoreCompiled.bin});
    sendTransaction(resolve, reject, contractData);
  });
};

Ethereum.storeHashes = function (contractAddress, documentIDs, newHashes) {
  return new Promise(function(resolve, reject) {
    let documentIDsLen = documentIDs.length;
    for (let i = 0; i < documentIDsLen; i++) {
      let newID = documentIDs[i].split('-').join('');
      documentIDs[i] = newID;
    }
    let contractInstance = HashStoreContract.at(contractAddress);
    let callData = contractInstance.storeHashes.getData(documentIDs, newHashes);
    sendTransaction(resolve, reject, callData, contractAddress);
  });
};

module.exports = Ethereum;