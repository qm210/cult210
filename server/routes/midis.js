var express = require('express');
var router = express.Router();
var data = require('../data');
const fs = require("fs");

router.get('/', (req, res, next) => {
//    res.json(data.getMidisInTracks());
    res.json(data.midiStore);
});

// routes for /:label etc

// TODO: eventually, this will be done via ID
router.get('/:filename', (req, res) => {
    const path = data.path(req.params.filename);
    res.download(path, req.params.filename, err => {
        if (err) {
            console.error("ERROR", path, err);
        } else {
            console.log(path, "downloaded!");
        }
    });
});

module.exports = router;
