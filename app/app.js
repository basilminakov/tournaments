var express = require('express');
var path = require('path');
var bodyParser = require('body-parser');
var cors = require('cors');
var ResponseType = require('./server/utils/responseType');
var ResponseProducer = require('./server/utils/responseProducer');

var router = require('./server/routing/index.js');
var dbModel = require('./server/models/databaseModel.js');

var app = express();

const port = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

// app.all('*', (req, res, next) => {
// 	res.setHeader('Cache-Control', 'no-cache');
// 	res.setHeader('Content-Type', 'application/json');
// 	next();
// });

app.use('/', router);

app.use((req, res, next) => {
  console.log(req.originalUrl);
  next();
})

// catch 404
app.use((req, res, next) => {
  ResponseProducer.buildResponse(res, (new ResponseType()).NotFound(), 'Required page not found: ' + req.originalUrl);  
});

dbModel.checkHealth();

dbModel.createTables().then(
  app.listen(port, appStartMessage)
).catch(err => {
  ResponseProducer.buildResponse(null, (new ResponseType()).Exception(), err);
})

function appStartMessage() {
  console.log('Server is running');
}

module.exports = app;
