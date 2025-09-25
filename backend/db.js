const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('controller.db');

db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS aps (
    id TEXT PRIMARY KEY,
    name TEXT,
    ip TEXT,
    vlan INTEGER,
    status TEXT
  )`);
  db.run(`CREATE TABLE IF NOT EXISTS clients (
    mac TEXT PRIMARY KEY,
    name TEXT,
    ip TEXT,
    ap TEXT
  )`);
});

module.exports = db;
