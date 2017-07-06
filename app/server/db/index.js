'use strict';
var router = require('express').Router();
var db = require('./class');

router.get('/reset', (req, res, next) => {
  db.resetDB()
    .then(() => {
      db.createTables()
        .then(() => {
          res.status(200).end();
        })
    })
    .catch(err => {
      res.status(500).end();
    })
});

module.exports = router;
