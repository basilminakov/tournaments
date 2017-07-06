var express = require('express');
var path = require('path');
var logger = require('morgan');
var bodyParser = require('body-parser');
var cors = require('cors');

var tournaments = require('./server/tournament');
var users = require('./server/user');
var db = require('./server/db');

var app = express();

const port = process.env.PORT || 3000;
const address = 'http://127.0.0.1:port/'.replace(/(?:)port/, port);

app.use(cors());

app.use(function(req, res, next) {
  req.url = req.url.replace(/(&|\?)[?a-zA-Z]+=/g, '\/');
  if (req.url.indexOf('balance') > 0) {
    req.url = req.url.replace('balance', 'users/balance');
  }
  else if (req.url.indexOf('reset') > 0) {
    req.url = '/db' + req.url;
  } 
  else if (req.url.indexOf('fund') > 0) {
    req.url = req.url.replace('fund', 'users/fund');
  }
  else if (req.url.indexOf('take') > 0) {
    req.url = req.url.replace('take', 'users/take');
  }
  else if (req.url.indexOf('announceTournament') > 0) {
    req.url = req.url.replace('announceTournament', 'tournaments/announceTournament');
  }
  else if (req.url.indexOf('joinTournament') > 0) {
    req.url = req.url.replace('joinTournament', 'tournaments/joinTournament') + '/';
  }
  else if  (req.url.indexOf('resultTournament') > 0) {
    req.url = req.url.replace('resultTournament', 'tournaments/resultTournament');
  }
  console.log(req.url);
  next();
});

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.use('/users', users);
app.use('/tournaments', tournaments);
app.use('/db', db);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  res.status(404).end();
});

app.listen(port, appStartMessage);

function appStartMessage() {
  console.log('Server runs on ', address);
}

module.exports = app;
