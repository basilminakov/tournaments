var express = require('express');
var router = express.Router();

var tournamentsController = require('../controllers/tournamentController');
var playerController = require('../controllers/playerController');
var dbController = require('../controllers/dbController');

router.get('/reset', dbController.resetDB);

router.get('/take', playerController.take);
router.get('/fund', playerController.fund);
router.get('/balance', playerController.getBalance);

router.get('/announceTournament', tournamentsController.announceTournament);
router.get('/joinTournament', tournamentsController.joinTournament);
router.post('/resultTournament', tournamentsController.resultTournament);

module.exports = router;
