const express = require('express');

const DocumentController = require('../controllers/Document');
const Responses = require('../tools/Responses');

var DocumentRouter = express.Router();

DocumentRouter.post('/storeHash', function (req, res) {
  DocumentController.storeHash(req.body)
  .then(function() {
    console.log('Hash stored successfully');
    Responses.sendSuccessResponse(res);
  })
  .catch(function(error) {
    Responses.sendAndShowErrorResponse(res, error, 'Hash store failed');
  });
});

DocumentRouter.get('/audit', function (req, res) {
  DocumentController.audit(req.query)
  .then(function(auditData) {
    console.log('Document audited successfully');
    Responses.sendSuccessResponse(res, auditData);
  })
  .catch(function(error) {
    Responses.sendAndShowErrorResponse(res, error, 'Document audit failed');
  });
});

module.exports = DocumentRouter;