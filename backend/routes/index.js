const express = require('express');

const DocumentRouter = require('./Document');

var router = express.Router();

router.use('/document', DocumentRouter);

module.exports = router;