var express = require('express');
var router = express.Router();
var data = require('../data');

router.get('/', (req, res, next) => {
    res.json(data.sessions);
});

module.exports = router;
