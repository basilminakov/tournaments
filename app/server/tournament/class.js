'use strict';

var db = require('../db/class');
var Player = require('../user/class');

class Tournament {
    constructor(id, deposit) {
        this.id = id;
        if (deposit) {
            this.deposit = deposit;
        }
        this.closed = 0;
    }

    getId() {
        return this.id;
    }

    getDeposit() {
        return this.deposit;
    }

    isCosed() {
        return this.closed;
    }

    addPlayers (playerId, backers) {
        let players = [playerId];
        if (backers.length > 0) {
            players = players.concat(backers);
        }
        return db.getPlayersInfo(players.length == 1 ? playerId : players)
        .then(pls => {
            var players = pls;
            let count = backers.length + 1;
            let fee = +(this.getDeposit() / count).toFixed(0);
            let isEnoughPoints = pls.find(p => p.balance < fee) === undefined;
            if (!isEnoughPoints) {
                return 400;
            }            
            
            return db.joinPlayers(playerId, backers, this.getId())
            .then(status => {
                let updatedPlayers = players.map(player => {
                    let pl = new Player(player.id, player.balance);
                    pl.decreaseBalance(fee);
                    return pl;
                })
                db.updatePlayers(updatedPlayers).then(() => 200);
            });
        })
        .catch(err => {
            return 500;
        })
    }

    processWinners(winners) {
        return new Promise((resolve, reject) => {
            db.registerWinners(winners, this.getId())
            .then(() => {
                var promises = [];
                winners.forEach(winner => {
                    let prize = winner.prize;
                    promises.push(
                        db.getWinners(winner.playerId, this.getId())
                        .then(users => {
                            let amount = users.length;
                            if (amount == 0) {
                                reject('No winners found.');
                            }
                            let bonus = +((prize / amount).toFixed(0));
                            let updatedUsers = users.map(user => {
                                let player = new Player(user.id, user.balance);
                                player.increaseBalance(bonus);
                                return player;
                            });
                            db.updatePlayers(updatedUsers).then(() => 200);
                        })
                    )
                });
                return Promise.all(promises)
                .then(() => resolve());
            })
            .catch(err => {
                reject(err);
            });
        });
    } 

    loadFromDB() {
        return new Promise((resolve, reject) => {
            if (!this.getId()) {
                return reject('Tournament ' + this.id + ' is not created!');
            }             
            db.getTournamentInfo(this.getId())
            .then(result => {
                if (!result[0]) {
                    return reject('No tournament found with ID', this.getId());
                }
                this.deposit = result[0].deposit || 0;
                this.closed = result[0].closed;
                return resolve();
            })
            .catch(err => {
                console.log(new Date(), err);
                return reject(err);
            })
        })
    }
}

module.exports = Tournament;