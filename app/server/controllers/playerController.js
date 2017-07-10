'use strict';
var Player = require('../models/playerModel');

exports.take = (req, res, next) => {
	let playerId = req.query.playerId;
	let points = req.query.points;
	if (!playerId || points == null) {

	}
	let player = new Player(playerId);
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
			.catch(err => {
				console.log(new Date(), err);
				res.status(500).end();
			})
	} else {
		res.status(500).end();
	}
}

exports.fund = (req, res, next) => {
	let playerId = req.query.playerId;
	let points = req.query.points;

	let player = new Player(playerId);
	player.initPlayer(playerId, points)
		.then(result => {
			res.status(result || 200);
			res.end();
		})
		.catch(err => {
			res.status(500).end();
		})
}

exports.getBalance = (req, res, next) => {
	let userId = req.query.userId;
	let player = new Player(userId);
	player.loadFromDB()
		.then(playerInst => {
			res.send({ playerId: playerInst.getId(), balance: playerInst.getBalance() });
			res.end();
		})
		.catch(err => {
			res.status(500);
			res.end();
		})
}
