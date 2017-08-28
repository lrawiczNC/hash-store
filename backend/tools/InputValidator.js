var NodeRSA = require('node-rsa');

var InputValidator = {};

function hasProperty(object, property) {
  return typeof object[property] !== 'undefined';
}

function isValidUUID(id) {
  let res = typeof id === 'string' && id.length === 36;
  let regExp = /^[a-fA-F0-9]{8}-[a-fA-F0-9]{4}-[a-fA-F0-9]{4}-[a-fA-F0-9]{4}-[a-fA-F0-9]{12}/;
  res = res && regExp.test(id);
  return res;
}

function isBase64(str) {
  let regExp = /^([0-9a-zA-Z+/]{4})*(([0-9a-zA-Z+/]{2}==)|([0-9a-zA-Z+/]{3}=))?$/;
  return regExp.test(str);
}

InputValidator.hasProperties = function(object, properties) {
  let res = true;
  let len = properties.length;
  for (let i = 0; i < len && res; i++) {
    if (!hasProperty(object, properties[i])) {
      res = false;
    }
  }
  return res;
};

InputValidator.itsPropertiesAreIncludedIn = function(object, properties) {
  let res = true;
  let objectProperties = Object.keys(object);
  for (let i = 0; i < objectProperties.length && res; i++) {
    res = properties.indexOf(objectProperties[i]) > -1;
  }
  return res;
};

InputValidator.onlyPossibleProperties = function(object, properties) {
  let res = true;
  let objectProperties = Object.keys(object);
  for (let i = 0; i < objectProperties.length && res; i++) {
    res = properties.indexOf(objectProperties[i]) < 0;
  }
  return res;
};

InputValidator.hasOnlyProperties = function(object, properties) {
  return InputValidator.itsPropertiesAreIncludedIn(object, properties)
      && InputValidator.hasProperties(object, properties);
};

InputValidator.documentIDIsValid = function(id) {
  return isValidUUID(id);
};

InputValidator.APIKeyIsValid = function(APIKey) {
  return isValidUUID(APIKey);
};

InputValidator.publicKeyIsValid = function(publicKey) {
  let res = typeof publicKey === 'string' && publicKey.length < 300; // FIXME 300 for every type of keys?
  if (res) {
    let publicKeyParts = publicKey.split('\n');
    let publicKeyCore = "";
    for (let i = 1; i < publicKeyParts.length - 1; i++) {
      publicKeyCore = publicKeyCore + publicKeyParts[i];
    }
    res = publicKeyCore.length === 128 && isBase64(publicKeyCore);
  }
  return res;
};

InputValidator.hexIsValid = function (number, length) {
  let res = false;
  if (typeof number === 'string' && number.length === length) {
    let regExpString = '^([a-fA-F0-9]){' + length + '}$';
    let regExp = new RegExp(regExpString);
    res = regExp.test(number);
  }
  return res;
};

InputValidator.hashIsValid = function(hash) {
  return InputValidator.hexIsValid(hash, 64);
};

InputValidator.hashSignedIsValid = function(hashSigned, hash, publicKey) {
  let res = typeof hashSigned === 'string' && hashSigned.length === 88 && isBase64(hashSigned);
  if (res) {
    let key = new NodeRSA();
    key.importKey(publicKey, 'pkcs8-public');
    res = key.verify(hash, hashSigned, 'utf8', 'base64');
  }
  return res;
};

module.exports = InputValidator;