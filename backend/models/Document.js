const mongoose = require('mongoose');

const TransactionModel = require('./Transaction');
const ContractModel = require('./Contract');
const UserModel = require('./User');
const Ethereum = require('../tools/Ethereum');
const Responses = require('../tools/Responses');
const config = require('../config');

mongoose.Promise = global.Promise;

const DocumentSchema = new mongoose.Schema({
  documentID: { type: String, required: true, unique: true, index: true },
  apiKey: { type: String, required: true },
  publicKey: {type: String, required: true },
  hash: { type: String, required: true }, // hash(document)
  hashSigned: { type: String, required: true },  // sign(hash(document))
  hashStored: { type: String, required: true }, // hash(sign(hash(document)))
  status: { type: Number, default: 0 }, // 0 pending, 1 sent to contract (in Transaction collection we can check if its mined)
  contractUsed: { type: String }, // address of the contract where this hash is stored
  transactionHash: { type: String },
  dateAdded: { type: Date, default: Date.now }
});

DocumentSchema.index({ apiKey: 1, status: 1, contractUsed: 1, dateAdded: 1, hashStored: 1 });

var DocumentModel = {};

DocumentModel.DB = mongoose.model('Document', DocumentSchema);

function deployNewContract() {
  console.log('A new HashStore contract might be needed');
  return new Promise(function (resolve, reject) {
    ContractModel.numPending()
    .then(function(numPending) {
      if (numPending > 0) {
        console.log('Waiting for pending HashStore contract to be mined');
        resolve();
      } else {
        console.log('Deploying new HashStore contract');
        Ethereum.deployHashStoreContract()
        .then(function(hash) {
          Promise.all([
            TransactionModel.transactionSent(hash),
            ContractModel.contractSent(hash)
          ])
          .then(function() {
            resolve();
          })
          .catch(function(error) {
            reject(error);
          });
        })
        .catch(function(error) {
          reject(error);
        });
      }
    })
    .catch(function(error) {
      reject(error);
    });
  });
}

function sendPendingInternal(contractToUse, pending, amountToSend) {
  console.log('Storing pending hashes on HashStore contract');
  return new Promise(function (resolve, reject) {
    let documentIDs = [];
    let pendingHashes = [];
    for (let i = 0; i < amountToSend; i++) {
      documentIDs.push(pending[i].documentID);
      pendingHashes.push(pending[i].hashStored);
    }
    Ethereum.storeHashes(contractToUse, documentIDs, pendingHashes)
    .then(function(hash) {
      TransactionModel.transactionSent(hash)
      .then(function() {
        DocumentModel.DB.updateMany({hashStored: {$in: pendingHashes}}, {$set: {status: 1, transactionHash: hash, contractUsed: contractToUse}})
        .then(function() {
          resolve();
        })
        .catch(function(error) {
          reject({code: Responses.E_DATABASE, message: error.message, stack: error.stack});
        });
      })
      .catch(function(error) {
        reject(error);
      });
    })
    .catch(function(error) {
      reject(error);
    });
  });
}

DocumentModel.storeHash = function(data) {
  return new Promise(function (resolve, reject) {
    console.log('Checking if API key corresponds to valid user');
    UserModel.isUser(data.apiKey)
    .then(function() {
      console.log('Checking if the document ID has already been used');
      DocumentModel.DB.count({documentID: data.documentID})
      .then(function(count) {
        if (count > 0) {
          reject({code: Responses.E_DOCUMENT_ID_TAKEN});
        } else {
          console.log('Storing new hash');
          let newEntry = {
            documentID: data.documentID,
            apiKey: data.apiKey,
            publicKey: data.publicKey,
            hash: data.hash,
            hashSigned: data.hashSigned,
            hashStored: data.hashToStore
          };
          DocumentModel.DB.create(newEntry)
          .then(function() {
            resolve();
          })
          .catch(function(error) {
            reject({code: Responses.E_DATABASE, message: error.message, stack: error.stack});
          });
        }
      })
      .catch(function(error) {
        reject({code: Responses.E_DATABASE, message: error.message, stack: error.stack});
      });
    })
    .catch(function(error) {
      reject(error);
    });
  });
};

DocumentModel.sendPending = function() {
  return new Promise(function (resolve, reject) {
    console.log('Searching for pending hashes to store');
    DocumentModel.DB.find({status: 0})
    .then(function(pending) {
      if (pending.length === 0) {
        console.log('No pending hashes');
        resolve();
      } else {
        console.log('Searching for latest contract created');
        ContractModel.latestContractCreated()
        .then(function (latestContractAddress) {
          if (latestContractAddress !== null) {
            console.log('Checking if a new HashStore contract must be deployed');
            DocumentModel.DB.count({contractUsed: latestContractAddress})
            .then(function(count) {
              if (count + pending.length <= config.hashesPerContract) {
                console.log('Send transaction to latest contract used');
                sendPendingInternal(latestContractAddress, pending, pending.length)
                .then(function() {
                  resolve()
                })
                .catch(function(error) {
                  reject(error);
                });
              } else {
                console.log('Latest HashStore contract is not enough');
                Promise.all([
                  deployNewContract(),
                  sendPendingInternal(latestContractAddress, pending, config.hashesPerContract - count)
                ])
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
          } else {
            console.log('Mined HashStore contracts not found');
            deployNewContract()
            .then(function() {
              resolve();
            })
            .catch(function(error) {
              reject(error);
            })
          }
        })
        .catch(function (error) {
          reject({code: Responses.E_DATABASE, message: error.message, stack: error.stack});
        });
      }
    })
    .catch(function(error) {
      reject({code: Responses.E_DATABASE, message: error.message, stack: error.stack});
    })
  });
};

DocumentModel.audit = function(apiKey, documentID) {
  return new Promise(function (resolve, reject) {
    DocumentModel.DB.findOne({documentID: documentID, apiKey: apiKey})
    .then(function(docInfo) {
      if (docInfo === null) {
        reject({code: Responses.E_DOCUMENT_NOT_FOUND});
      } else {
        let auditData = {
          transactionHash: docInfo.transactionHash,
          contractAddress: docInfo.contractUsed,
          publicKey:  docInfo.publicKey,
          hashSigned: docInfo.hashSigned
        };
        resolve(auditData);
      }
    })
    .catch(function(error) {
      reject({code: Responses.E_DATABASE, message: error.message, stack: error.stack});
    });
  });
};

module.exports = DocumentModel;