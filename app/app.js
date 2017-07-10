var express = require('express');
var path = require('path');
var bodyParser = require('body-parser');
var cors = require('cors');

var router = require('./server/routing/index.js');
var dbModel = require('./server/models/databaseModel.js');

var app = express();

const port = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.all('*', (req, res, next) => {
	res.setHeader('Cache-Control', 'no-cache');
	res.setHeader('Content-Type', 'application/json');
	next();
});

app.use('/', router);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  res.status(404).send('Required page not found: ' + req.originalUrl).end();
});

dbModel.checkHealth();

dbModel.createTables().then(
  app.listen(port, appStartMessage)
).catch(err => {
  console.error(err);
})

function appStartMessage() {
  console.log('Server is running');
}

module.exports = app;
