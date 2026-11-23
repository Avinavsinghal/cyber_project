const path = require('path');

module.exports = {
  PORT: process.env.PORT || 3000,
  HOST: process.env.HOST || 'localhost',
  JWT_SECRET: process.env.JWT_SECRET || 'cyber_range_secure_secret_token_2026',
  SESSION_COOKIE_NAME: 'cyber_auth_token',
  DB_PATH: path.join(__dirname, 'data', 'db.json'),
  PUBLIC_DIR: path.join(__dirname, '..', 'public')
};

