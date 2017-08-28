var Responses = {};

Responses.S_SUCCESS = 0;

Responses.E_INVALID_PARAM = 300;
Responses.E_INVALID_DOCUMENT_ID = 301;
Responses.E_INVALID_HASH_SIGNED = 302;
Responses.E_INVALID_API_KEY = 303;
Responses.E_INVALID_PUBLIC_KEY = 304;
Responses.E_INVALID_HASH = 305;

Responses.E_NETWORK_ERROR = 400;

Responses.E_DATABASE = 500;
Responses.E_DOCUMENT_ID_TAKEN = 501;
Responses.E_DOCUMENT_NOT_FOUND = 502;
Responses.E_USER_NOT_FOUND = 503;

Responses.E_INTERNAL = 600;

Responses.E_BLOCKCHAIN = 700;

Responses.E_UNKNOWN = 999;


var errorMessages = {};

errorMessages[Responses.S_SUCCESS] = 'Success';

errorMessages[Responses.E_INVALID_PARAM] = 'Invalid parameter.';
errorMessages[Responses.E_INVALID_DOCUMENT_ID] = 'Invalid document ID.';
errorMessages[Responses.E_INVALID_HASH_SIGNED] = 'Invalid signed hash.';
errorMessages[Responses.E_INVALID_API_KEY] = 'Invalid API key.';
errorMessages[Responses.E_INVALID_PUBLIC_KEY] = 'Invalid public key.';
errorMessages[Responses.E_INVALID_HASH] = 'Invalid hash.';

errorMessages[Responses.E_NETWORK_ERROR] = 'Network error.';

errorMessages[Responses.E_DATABASE] = 'Unknown error.';
errorMessages[Responses.E_DOCUMENT_ID_TAKEN] = 'Document ID taken.';
errorMessages[Responses.E_DOCUMENT_NOT_FOUND] = 'Document not found.';
errorMessages[Responses.E_USER_NOT_FOUND] = 'User not found.';

errorMessages[Responses.E_INTERNAL] = 'Unknown error.';

errorMessages[Responses.E_BLOCKCHAIN] = 'Unknown error.';

errorMessages[Responses.E_UNKNOWN] = 'Unknown error.';


Responses.sendResponse = function(code, res, result) {
  if (code === Responses.S_SUCCESS) {
    Responses.sendSuccessResponse(res, result);
  } else {
    Responses.sendErrorResponse(code, res, result);
  }
};

Responses.sendSuccessResponse = function(res, result) {
  let response = (result !== undefined) ? result : { message: Responses.getSuccessMessage() };
  res.status(200);
  res.json(response);
};

Responses.sendAndShowErrorResponse = function(res, error, message) {
  console.log(message, '\n', error, '\n', 'Error code message: ' + Responses.getErrorMessage(error.code));
  Responses.sendErrorResponse(error.code || Responses.E_UNKNOWN, res);
};

Responses.sendErrorResponse = function(code, res) {
  res.status(400);
  res.json({
    subCode: code,
    message: Responses.getErrorMessage(code)
  });
};

Responses.getSuccessMessage = function() {
  return errorMessages[Responses.S_SUCCESS];
};

Responses.getErrorMessage = function(code) {
  let ret = errorMessages[code];
  if (typeof ret === 'undefined') {
    ret = errorMessages[Responses.E_UNKNOWN];
  }
  return ret;
};

module.exports = Responses;