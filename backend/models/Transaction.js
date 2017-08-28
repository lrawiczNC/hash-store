const mongoose = require('mongoose');

const ContractModel = require('./Contract');
const Ethereum = require('../tools/Ethereum');
const Responses = require('../tools/Responses');

mongoose.Promise = global.Promise;

const TransactionSchema = new mongoose.Schema({
  hash: { type: String, required: true, unique: true, index: true},
  status : { type: Number, required: true, default: 0 }, // 0 mining, 1 mined
  dateSent: { type: Date, default: Date.now },
  dateMined: { type: Date }
});

var TransactionModel = {};

TransactionModel.DB = mongoose.model('Transaction', TransactionSchema);

TransactionModel.transactionSent = function(hash) {
  console.log('Saving new transaction');
  return new Promise(function (resolve, reject) {
    TransactionModel.DB.create({hash: hash})
    .then(function(newTX) {
      resolve();
    })
    .catch(function (error) {
      reject({code: Responses.E_DATABASE, message: error.message, stack: error.stack});
    });
  });
};

TransactionModel.transactionMined = function(hash) {
  console.log('Saving mined transaction');
  return new Promise(function (resolve, reject) {
    TransactionModel.DB.update({hash: hash}, {$set: {status: 1, dateMined: Date.now()}})
    .then(function() {
      resolve();
    })
    .catch(function(error) {
      reject({code: Responses.E_DATABASE, message: error.message, stack: error.stack});
    });
  });
};

TransactionModel.checkPending = function() {
  console.log('Checking pending transactions');
  return new Promise(function (resolve, reject) {
    TransactionModel.DB.find({status: 0})
    .lean()
    .exec()
    .then(function(toUpdate) {
      if (toUpdate.length === 0) {
        resolve();
      } else {
        Promise.all(
            toUpdate.map(function(tx, i) {
              return new Promise(function(resolve, reject) {
                let block = Ethereum.isTXMined(tx.hash);
                if (block > 0){
                  TransactionModel.transactionMined(tx.hash)
                  .then(function() {
                    let receipt = Ethereum.getTransactionReceipt(tx.hash);
                    if (receipt.contractAddress !== null) {
                      ContractModel.transactionMined(tx.hash, receipt.contractAddress)
                      .then(function() {
                        resolve();
                      })
                      .catch(function(error) {
                        reject(error);
                      })
                    } else {
                      resolve();
                    }
                  })
                  .catch(function(error) {
                    reject(error);
                  });
                } else {
                  resolve();
                }
              });
            })
        )
        .then(function() {
          resolve();
        })
        .catch(function(error) {
          reject(error);
        });
      }
    })
    .catch(function(error) {
      reject({code: Responses.E_DATABASE, message: error.message, stack: error.stack});
    });
  });
};

module.exports = TransactionModel;