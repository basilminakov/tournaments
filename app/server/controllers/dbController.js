'use strict';
var dbModel = require('../models/databaseModel');

exports.resetDB = ('/reset', (req, res, next) => {
  dbModel.resetDB()
    .then(() => {
      dbModel.createTables()
        .then(() => {
          res.status(200).end();
        })
    })
    .catch(err => {
      res.status(500).end();
    })
});

