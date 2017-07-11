'use strict';
var Player = require('../models/playerModel');
var ResponseType = require('../utils/responseType');
var ResponseProducer = require('../utils/responseProducer');

exports.take = (req, res, next) => {
	let playerId = req.query.playerId;
	let points = req.query.points;
	if (!playerId || points == null) {
		ResponseProducer.buildResponse(res, (new ResponseType()).Error(), 'Not enough data provided');
		return;
	}
	if (points <= 0) {
		ResponseProducer.buildResponse(res, (new ResponseType()).Error(), 'Points should be a positive value');
		return;
	}
	let player = new Player(playerId);
	return player.loadFromDB()
		.then(dbUser => {
			player.setBalance(dbUser.balance);
			if (points > player.getBalance()) {
				ResponseProducer.buildResponse(res, (new ResponseType()).Error(), 'Not enough points');
				return;
			}
			player.decreaseBalance(points);
			player.saveChanges()
				.then(() => {
					res.status(200);
					res.end();
				})
				.catch(err => {
					ResponseProducer.buildResponse(res, (new ResponseType()).Exception(), 'Unable to save Player changes');
				})
		})
		.catch(err => {
			ResponseProducer.buildResponse(res, (new ResponseType()).Exception(), err);
		})
}

exports.fund = (req, res, next) => {
	let playerId = req.query.playerId;
	let points = req.query.points;
	if (!playerId) {
		ResponseProducer.buildResponse(res, (new ResponseType()).Error(), 'Player is not specified');
		return;
	}
	if (points <= 0) {
		ResponseProducer.buildResponse(res, (new ResponseType()).Error(), 'Points should be a positive number');
		return;
	}

	let player = new Player(playerId);
	player.initPlayer(playerId, points)
		.then(result => {
			res.status(result || 200);
			res.end();
		})
		.catch(err => {
			ResponseProducer.buildResponse(res, ResponseType.Exception(), err);
		})
}

exports.getBalance = (req, res, next) => {
	let userId = req.query.userId;
	let player = new Player(userId);
	db.
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
