var mysql = require('mysql');
var sleep = require('system-sleep');

var pool = mysql.createPool({
  host: process.env.MYSQL_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
  connectionLimit: 40,
  multipleStatements: true
});

var connection = null;
var isServerReady = false;

doPing = () => {
  return new Promise((resolve, reject) => {
    pool.getConnection((err, conn) => {
      if (conn) {
        connection = conn;
        connection.ping(err => {
          connection.destroy();
          if (err) {
            reject(false);
          }
          resolve(true);
        });
      }
    })
  });
}
  
while (isServerReady != true) {
  doPing()
    .then((value) => {
      isServerReady = isServerReady || value;
      console.log("MySQL is up:", isServerReady);
    })
    .catch(err => {
      console.error(err);
    });
    sleep(4000);
}

createTables = () => {
  var fs = require('fs');
  var sql = fs.readFileSync(__dirname + '/../../assets/sql/createTables.sql', 'utf8');
  return new Promise((resolve, reject) => {
    pool.getConnection((err, connection) => {
      if (err) {
        reject(err);
      }
      connection.query(sql, (err, result) => {
        connection.release();
        if (err) {
          reject(err);
        }
        resolve(result);
      })
    })
  })
};

createTables().then().catch(err => {
  console.error(err);
})

getPlayersInfo = (playersId) => {
  var sql = typeof playersId === 'string' ? 'select * from ' + process.env.DB_NAME + '.users where id=?;'
    : 'select * from ' + process.env.DB_NAME + '.users where id in (?);';
  var ids = typeof playersId === 'string' ? mysql.escape(playersId) : playersId.map(id => mysql.escape(id)).join(',');
  sql = sql.replace('?', ids);
  return new Promise((resolve, reject) => {
    pool.getConnection((err, connection) => {
      if (err) {
        reject(err);
      }

      connection.query(sql, [ids], (err, result) => {
        connection.release();
        if (err) {
          reject(err);
          return;
        }
        resolve(result);
      });
    });
  });
};

getTournamentInfo = (id) => {
  var sql = 'select * from ' + process.env.DB_NAME + '.tournaments where id=?;';
  return new Promise((resolve, reject) => {
    pool.getConnection((err, connection) => {
      if (err) {
        reject(err);
      }

      connection.query(sql, [+id], (err, result) => {
        connection.release();
        if (err) {
          reject(err);
          return;
        }
        resolve(result);
      });
    });
  });
};

createPlayer = (playerId, balance) => {
  var sql = 'insert into ' + process.env.DB_NAME + '.users (id, balance) values (?,?)';
  return new Promise((resolve, reject) => {
    pool.getConnection((err, connection) => {
      if (err) {
        reject(err);
      }
      connection.query(sql, [playerId, balance], (err, result) => {
        connection.release();
        if (err) {
          reject(err);
          return;
        }
        resolve(result);
      });
    });
  });
};

updatePlayer = (player) => {
  var sql = 'update ' + process.env.DB_NAME + '.users set balance=? where id=?;';
  return new Promise((resolve, reject) => {
    pool.getConnection((err, connection) => {
      if (err) {
        reject(err);
      }
      connection.query(sql, [player.getBalance(), player.getId()], (err, result) => {
        connection.release();
        if (err) {
          reject(err);
        }
        resolve(result);
      });
    })
  })
}

updatePlayers = (players) => {
  var sql = 'update ' + process.env.DB_NAME + '.users set balance=? where id=?;';
  var count = players.length;
  var savedCount = 0;
  var results = [];
  return new Promise((resolve, reject) => {
    pool.getConnection((err, connection) => {
      if (err) {
        reject(err);
      }
      players.forEach(player => {
        connection.query(sql, [player.getBalance(), player.getId()], (err, result) => {
          if (err) {
            reject(err);
          }
          savedCount++;
          results.push(result);
          if (savedCount == count) {
            connection.release();
            resolve(results);
          }
        })
      })
    });
  })
}

createTournament = (id, deposit) => {
  var sql = 'insert into ' + process.env.DB_NAME + '.tournaments (id, deposit) values(?, ?);';
  return new Promise((resolve, reject) => {
    pool.getConnection((err, connection) => {
      if (err) {
        reject(err);
      }
      connection.query(sql, [id, +deposit], (err, result) => {
        connection.release();
        if (err) {
          reject(err);
          return;
        }
        resolve(result);
      })
    })
  })
}

joinPlayers = (player, backers, id) => {
  let sqlLines = [];
  let playerId = mysql.escape(player);
  let tournamentId = mysql.escape(id);
  sqlLines.push('insert into ' + process.env.DB_NAME + '.players (playerId, tournamentId) values (' + playerId + ',' + tournamentId + ');');
  backers.forEach(backer => {
    sqlLines.push('insert into ' + process.env.DB_NAME + '.players (playerId, isBacker, tournamentId, backerFor) values (' + 
      mysql.escape(backer) + ', 1, ' + tournamentId + ', ' + playerId + ');');
  })
  var sql = sqlLines.join('');
  return new Promise((resolve, reject) => {
    pool.getConnection((err, connection) => {
      if (err) {
        reject(err);
      }
      connection.query(sql, (err, result) => {
        connection.release();
        if (err) {
          reject(err);
          return;
        }
        resolve(result);
      })
    })
  });
}

registerWinners = (items, id) => {
  let count = items.length;
  let sql = 'insert into ' + process.env.DB_NAME + '.winners (userId, prize, tournamentId) values (?, ?, ?)';
  var savedCount = 0;
  var results = [];
  return new Promise((resolve, reject) => {
    pool.getConnection((err, connection) => {
      if (err) {
        reject(err);
      }
      items.forEach(winner => {
        connection.query(sql, [winner.playerId, winner.prize, id, id], (err, result) => {
          if (err) {
            reject(err);  
          }
          savedCount++;
          results.push(result);
          if (savedCount == count) {
            sql = 'update ' + process.env.DB_NAME + '.tournaments set closed=? where id = ? limit 1;';
            connection.query(sql, [1, id], (err, result) => {
              if (err) {
                reject(err);
              }
              connection.release();
              resolve(results);
            });
          }
        })
      })
    });
  })
}

getWinners = (groupLeaderId, tournamentId) => {
  let sql = 'select id, balance from ' + process.env.DB_NAME + '.users left join ' + process.env.DB_NAME + '.players on (users.id = players.playerId) where (isBacker = 1 and tournamentId = ? and backerFor = ?) or (playerId = ?)';
  return new Promise((resolve, reject) => {
    pool.getConnection((err, connection) => {
      if (err) {
        reject(err);
      }

      connection.query(sql, [tournamentId, groupLeaderId, groupLeaderId], (err, result) => {
        connection.release();
        if (err) {
          reject(err);
        }
        resolve(result);
      })
    })
  });
}

resetDB = () => {
  var fs = require('fs');
  var sql = fs.readFileSync(__dirname + '/../../assets/sql/dropTables.sql', 'utf8');
  return new Promise((resolve, reject) => {
    pool.getConnection((err, connection) => {
      if (err) {
        reject(err);
      }
      connection.query(sql, (err, result) => {
        connection.release();
        if (err) {
          reject(err);
        }
        resolve(result);
      })
    })
  })
}

module.exports = {
  resetDB: resetDB,
  createTables: createTables,
  getPlayersInfo: getPlayersInfo,
  getTournamentInfo: getTournamentInfo,
  createPlayer: createPlayer,
  updatePlayer: updatePlayer,
  updatePlayers: updatePlayers,
  createTournament: createTournament,
  joinPlayers: joinPlayers,
  registerWinners: registerWinners,
  getWinners: getWinners
};
