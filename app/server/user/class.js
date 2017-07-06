'use strict';

var db = require('../db/class');
const USER_ID_SIZE = 7;

class User {

    constructor(id, balance) {
        this.DEFAULT_BALANCE = 0;
        this.balance = balance || this.DEFAULT_BALANCE;
        if (id && id.length > USER_ID_SIZE) {
            id = id.substr(0, USER_ID_SIZE);
        }
        this.id = id;
    }

    getBalance() {
        return this.balance;
    }

    setId(id) {
        this.id = id;
    }
    
    getId() {
        return this.id;
    }

    increaseBalance(value) {
        this.balance += +value;
    }

    decreaseBalance(value) {
        value = +value;
        if (this.balance - value < 0) {
            console.error( new Date(), 'Not enough points balance:', value);
        }
        this.balance -= value;
    }

    setBalance(value) {
        this.balance = +value;
    }

    saveChanges() {
        if (this.getId()) {
            return db.updatePlayer(this)
            .then(result => {
                return 200;
            })
            .catch(err => {
                console.log(new Date(), err);
                return 500;
            }) 
        }
    }

    setupUser(id, balance) {
        return new Promise((resolve, reject) => {
            if (!id) {
                return reject('No ID provided for new user!');
            }
            if (id.length > USER_ID_SIZE) {
                id = id.substr(0, USER_ID_SIZE);
            }
            return db.getPlayersInfo(id)
            .then(result => {
                if (!this.getId()) {
                    this.setId(id);
                }
                if (result.length == 0) {
                    return db.createPlayer(id, +balance)
                    .then(result => resolve(200));
                } else {
                    this.setBalance(+result[0].balance || this.DEFAULT_BALANCE);
                    this.increaseBalance(balance);
                    return this.saveChanges().then(() => resolve(200));
                }
            })
            .catch(err => {
                console.log(new Date(), err);
                return reject(err);
            });
        });
    }

    loadFromDB() {
        return new Promise((resolve, reject) => {
            if (!this.getId()) {
                return reject('User is not created!');
            }             
            db.getPlayersInfo(this.getId())
            .then(result => {
                if (!result[0]) {
                    return reject('No user found with ID', this.getId());
                }
                this.balance = result[0].balance || this.DEFAULT_BALANCE;
                return resolve(this);
            })
            .catch(err => {
                console.log(new Date(), err);
                return reject(err);
            })
        }) 
    }
}

module.exports = User;