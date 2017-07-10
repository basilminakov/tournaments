'use strict';

var db = require('../models/databaseModel');
var Tournament = require('../models/tournamentModel');

exports.announceTournament = (req, res, next) => {
  let id = req.query.tournamentId;
  let deposit = req.query.deposit;
  return db.createTournament(id, deposit)
    .then(result => {
      res.status(200);
      res.end();
    })
    .catch(err => {
      res.status(500);
      res.end();
    })
}

exports.joinTournament = (req, res, next) => {
  let params = req.query;
  let playerId = params.playerId;
  let tournamentId = params.tournamentId;
  let backers = params.backerId;
  let tournament = new Tournament(tournamentId);
  tournament.loadFromDB()
    .then(() => {
      if (tournament.isClosed()) {
        res.status(500).end();
        return;
      }
      tournament.addPlayers(playerId, backers)
        .then(status => {
          res.status(status || 200).end()
        });
    })
    .catch(err => {
      res.status(500).end();
    })
}

exports.resultTournament = (req, res, next) => {
  let tournamentId = req.body.tournamentId;
  let winners = req.body.winners;
  let tournament = new Tournament(tournamentId);
  tournament.loadFromDB()
    .then(() => {
      if (tournament.isClosed()) {
        res.status(500);
        res.end();
        return;
      }
      tournament.processWinners(winners)
        .then(() => {
          res.status(200);
          res.end();
        })
    })
    .catch(err => {
      res.status(500);
      res.end();
    });
}
