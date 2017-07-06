'use strict';
var router = require('express').Router();
var db = require('../db/class');

var Tournament = require('./class');

router.get('/announceTournament/:tournamentId/:deposit', (req, res, next)=> {
    let id = req.params.tournamentId;
    let deposit = req.params.deposit;
    return db.createTournament(id, deposit)
    .then(result => {
        res.status(200);
        res.end();
    })
    .catch(err => {
        res.status(500);
        res.end();
    })
});

router.get('/joinTournament/:tournamentId/:playerId/*', (req, res, next) => {
    let params = req.params;
    let playerId = params.playerId;
    let tournamentId = params.tournamentId;
    let backers = [];
    if (params[0]) {
        backers = params[0].split('\/').filter(value => {
            if (value) {
                return value;
            }
        });
    }
    let tournament = new Tournament(tournamentId);
    tournament.loadFromDB()
    .then(() => {
        if (tournament.isCosed()) {
            res.status(500).end();
            return;
        }
        tournament.addPlayers(playerId, backers)
        .then(status =>  {
            res.status(status || 200).end()
        });
    })
    .catch(err => {
        res.status(500).end();
    })
});

router.post('/resultTournament', (req, res, next) => {
    let tournamentId = req.body.tournamentId;
    let winners = req.body.winners;
    let tournament = new Tournament(tournamentId);
    tournament.loadFromDB()
    .then(() => {
        if (tournament.isCosed()) {
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
});

module.exports = router;