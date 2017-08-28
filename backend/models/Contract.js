const mongoose = require('mongoose');

const Responses = require('../tools/Responses');

mongoose.Promise = global.Promise;

const ContractSchema = new mongoose.Schema({
  transactionHash: { type: String, required: true, unique: true, index: true },
  status: { type: Number, default: 0 }, // 0 mining, 1 mined
  address: { type: String },
  dateMined: { type: Date }
});

ContractSchema.index({ status: 1, dateMined: 1 });

var ContractModel = {};

ContractModel.DB = mongoose.model('Contract', ContractSchema);

ContractModel.contractSent = function(hash) {
  console.log('Saving new contract creation');
  return new Promise(function (resolve, reject) {
    ContractModel.DB.create({transactionHash: hash})
    .then(function(newContract) {
      resolve();
    })
    .catch(function(error) {
      reject({code: Responses.E_DATABASE, message: error.message, stack: error.stack});
    });
  });
};

ContractModel.transactionMined = function(hash, address) {
  console.log('Saving new contract mined');
  return new Promise(function (resolve, reject) {
    ContractModel.DB.update({transactionHash: hash}, {$set: {status: 1, address: address, dateMined: Date.now()}})
    .then(function() {
      resolve();
    })
    .catch(function(error) {
      reject({code: Responses.E_DATABASE, message: error.message, stack: error.stack});
    });
  });
};

ContractModel.numPending = function() {
  return new Promise(function (resolve, reject) {
    ContractModel.DB.count({status: 0})
    .then(function(count) {
      resolve(count);
    })
    .catch(function(error) {
      reject({code: Responses.E_DATABASE, message: error.message, stack: error.stack});
    });
  });
};

ContractModel.latestContractCreated = function() {
  return new Promise(function (resolve, reject) {
    ContractModel.DB.find({status: 1}).sort({dateMined: -1}).limit(1)
    .then(function(latestContractArr) {
      if (latestContractArr.length > 0 ) {
        resolve(latestContractArr[0].address);
      } else {
        resolve(null); // FIXME
      }
    })
    .catch(function(error) {
      reject({code: Responses.E_DATABASE, message: error.message, stack: error.stack});
    });
  });
};

module.exports = ContractModel;