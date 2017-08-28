const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
const http = require('http');
const morgan = require('morgan');
const compression = require('compression');
const helmet = require('helmet');

const config = require('./backend/config');
const router = require('./backend/routes');
const DocumentModel = require('./backend/models/Document');
const TransactionModel = require('./backend/models/Transaction');

var api = express();

api.use(helmet());
api.use(compression());
api.use(bodyParser.json({limit: '50mb'}));
api.use(cors());
api.use(morgan('dev'));
api.use('/api/v1', router);

if (process.argv.indexOf('--dev') >= 0) {
  console.log('Using dev version');
  api.use('/', express.static(__dirname + '/public/'));
} else {
  console.log('Using prod version');
  api.use('/', express.static(__dirname + '/build/'));
}

mongoose.Promise = global.Promise;
mongoose.connect(config.databaseURI, {
  keepAlive: true,
  reconnectTries: Number.MAX_VALUE,
  useMongoClient: true
});

function startServer() {
  let server = http.createServer(api);
  server.listen(config.apiPort, function() {
    console.log('HashStore API listening at http://' + config.apiHost + ':' + config.apiPort);
  });
}

function sendTransactions() {
  DocumentModel.sendPending()
  .then(function() {
    setTimeout(sendTransactions, config.delayBetweenTransactions);
  })
  .catch(function(error) {
    console.log(error);
  })
}

function checkTransactions() {
  TransactionModel.checkPending()
  .then(function() {
    setTimeout(checkTransactions, config.delayToCheckPending);
  })
  .catch(function(error) {
    console.log(error);
  });
}

startServer();
sendTransactions();
checkTransactions();