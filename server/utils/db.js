const fs = require('fs');
const config = require('../config');

let memoryDb = null;

function loadDb() {
  if (!memoryDb) {
    try {
      const raw = fs.readFileSync(config.DB_PATH, 'utf8');
      memoryDb = JSON.parse(raw);
    } catch (err) {
      console.error('Failed to read db.json, initializing fallback:', err);
      memoryDb = { user: {}, labs: [], competitors: [] };
    }
  }
  return memoryDb;
}

function saveDb() {
  try {
    fs.writeFileSync(config.DB_PATH, JSON.stringify(memoryDb, null, 2), 'utf8');
  } catch (err) {
    console.error('Failed to write db.json:', err);
  }
}

function getUser() {
  const db = loadDb();
  return db.user;
}

function updateUser(updater) {
  const db = loadDb();
  updater(db.user);
  saveDb();
  return db.user;
}

function getLabs() {
  const db = loadDb();
  return db.labs;
}

function getCompetitors() {
  const db = loadDb();
  return db.competitors;
}

module.exports = {
  loadDb,
  saveDb,
  getUser,
  updateUser,
  getLabs,
  getCompetitors
};

