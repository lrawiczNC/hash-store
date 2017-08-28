const DocumentModel = require('../models/Document');
const Responses = require('../tools/Responses');
const InputValidator = require('../tools/InputValidator');

var DocumentController = {};

DocumentController.storeHash = function(reqBody) {
  return new Promise(function (resolve, reject) {
    console.log('Validating input to store a hash');
    if (!InputValidator.hasOnlyProperties(reqBody, ['apiKey', 'publicKey', 'documentID', 'hash', 'hashSigned', 'hashToStore'])) {
      reject({code: Responses.E_INVALID_PARAM});
    } else if (!InputValidator.APIKeyIsValid(reqBody.apiKey)) {
      reject({code: Responses.E_INVALID_API_KEY});
    } else if (!InputValidator.publicKeyIsValid(reqBody.publicKey)) {
      reject({code: Responses.E_INVALID_PUBLIC_KEY});
    } else if (!InputValidator.documentIDIsValid(reqBody.documentID)) {
      reject({code: Responses.E_INVALID_DOCUMENT_ID});
    } else if (!InputValidator.hashIsValid(reqBody.hash) || !InputValidator.hashIsValid(reqBody.hashToStore)) {
      reject({code: Responses.E_INVALID_HASH})
    } else if (!InputValidator.hashSignedIsValid(reqBody.hashSigned, reqBody.hash, reqBody.publicKey)) {
      reject({code: Responses.E_INVALID_HASH_SIGNED});
    } else {
      console.log('Input is valid to store a hash');
      reqBody.documentID = reqBody.documentID.toLowerCase();
      DocumentModel.storeHash(reqBody)
      .then(function() {
        resolve();
      })
      .catch(function(error) {
        reject(error);
      })
    }
  });
};

DocumentController.audit = function(reqQuery) {
  return new Promise(function (resolve, reject) {
    console.log('Validating input to audit a document');
    if (!InputValidator.hasOnlyProperties(reqQuery, ['apiKey', 'documentID'])) {
      reject({code: Responses.E_INVALID_PARAM});
    } else if (!InputValidator.APIKeyIsValid(reqQuery.apiKey)) {
      reject({code: Responses.E_INVALID_API_KEY});
    } else if (!InputValidator.documentIDIsValid(reqQuery.documentID)) {
      reject({code: Responses.E_INVALID_DOCUMENT_ID});
    } else {
      console.log('Input is valid to audit a document');
      reqQuery.documentID = reqQuery.documentID.toLowerCase();
      DocumentModel.audit(reqQuery.apiKey, reqQuery.documentID)
      .then(function(auditData) {
        resolve(auditData);
      })
      .catch(function(error) {
        reject(error);
      })
    }
  });
};

module.exports = DocumentController;