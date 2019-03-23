const sqlite3 = require("sqlite3").verbose();


const dbs = {};

module.exports = function(dburl) {
  return dbs[dburl] || (dbs[dburl] = new DB(dburl));
};


class DB extends sqlite3.Database {

  constructor(filename, mode, callback) {
    super(filename, mode, callback);
  }

  runAsync() {
    return new Promise((resolve, reject) => {
      this.run(...arguments, function(err, data) {
        err ? reject(err) : resolve(this);
      });
    }).catch(err => {
      throw err;
    });
  }

  allAsync() {
    return new Promise(resolve => {
      this.all(...arguments, buildCallback(resolve));
    });
  }

  getAsync() {
    return new Promise(resolve => {
      this.get(...arguments, buildCallback(resolve));
    });
  }
  
}

function buildCallback(resolve) {
  return (err, data) => {
    if (err) {
      throw err;
    }
    resolve(data);
  }
}
