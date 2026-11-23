const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const path = require('path');
const config = require('./config');

const app = express();

// Middlewares
app.use(cors({ origin: true, credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Static Files
app.use(express.static(config.PUBLIC_DIR));
app.use(express.static(path.join(__dirname, '..'))); // Also serve root directory

// API Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/tester', require('./routes/tester'));
app.use('/api/labs', require('./routes/labs'));
app.use('/api/terminal', require('./routes/terminal'));
app.use('/api/flags', require('./routes/flags'));
app.use('/api/leaderboard', require('./routes/leaderboard'));
app.use('/api/vpn', require('./routes/vpn'));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ONLINE',
    service: 'Cyber Range Penetration Testing Platform',
    version: '4.2 PRO',
    timestamp: new Date().toISOString()
  });
});

// Fallback to index.html for SPA-like navigation
app.use((req, res) => {
  res.sendFile(path.join(config.PUBLIC_DIR, 'index.html'));
});

// Error Handler
app.use((err, req, res, next) => {
  console.error('[SERVER ERROR]:', err);
  res.status(500).json({
    error: 'Internal Server Error',
    message: err.message
  });
});

const server = app.listen(config.PORT, () => {
  console.log(`=======================================================`);
  console.log(`[+] CYBER_RANGE PENETRATION TESTER PLATFORM ACTIVE`);
  console.log(`[+] Server running at: http://localhost:${config.PORT}`);
  console.log(`[+] Lead Penetration Tester: Avinav Singhal`);
  console.log(`[+] Lab Subnet: 10.10.110.0/24 (8 Target Machines)`);
  console.log(`=======================================================`);
});

module.exports = { app, server };
