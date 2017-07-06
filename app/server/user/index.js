'use strict';
var router = require('express').Router();
var User = require('./class');

router.get('/take/:playerId/:points', (req, res, next) => {
    let playerId = req.params.playerId;
    let points = req.params.points;
    let player = new User(playerId);
    if (player) {
        return player.loadFromDB()
        .then(dbUser => {
            player.setBalance(dbUser.balance);
            if (points > player.getBalance()) {
                res.status(400);
                res.end();
            }
            player.decreaseBalance(points);
            player.saveChanges()
            .then(() => {
                res.status(200);
                res.end();
            })
            .catch(err => {
                console.log(new Date(), err);
                res.status(500);
                res.end();
            })
        })
    } else {
        res.status(500);
        next(err);
    }
});

router.get('/fund/:playerId/:points', (req, res, next) => {
    let userId = req.params.playerId;
    let points = req.params.points;
    let player = new User(userId);
    player.setupUser(userId, points)
    .then(result => {
        res.status(result || 200);
        res.end();
    })
    .catch(err => {
        res.status(500);
        next(err);
    })
});

router.get('/balance/:userId', (req, res, next) => {
    let userId = req.params.userId;
    let player = new User(userId);
    player.loadFromDB()
    .then(user => {
        res.send({playerId: user.getId(), balance: user.getBalance()});
        res.end();
    })
    .catch(err => {
        res.status(500);
        res.end();
    })
});

module.exports = router;