const mongoose = require('mongoose');

const Responses = require('../tools/Responses');

mongoose.Promise = global.Promise;

const UserSchema = new mongoose.Schema({
  apiKey: { type: String, required: true, unique: true, index: true}
});

var UserModel = {};

UserModel.DB = mongoose.model('User', UserSchema);

UserModel.isUser = function(apiKey) {
  return new Promise(function (resolve, reject) {
    UserModel.DB.count({apiKey: apiKey})
    .then(function(count) {
      if (count <= 0) {
        reject({code: Responses.E_USER_NOT_FOUND});
      } else {
        resolve();
      }
    })
    .catch(function(error) {
      reject({code: Responses.E_DATABASE, message: error.message, stack: error.stack});
    });
  });
};

module.exports = UserModel;