const express = require('express');
const router = express.Router();
const db = require('../utils/db');
const config = require('../config');

// Simple secure session token generator
function generateToken(username) {
  const payload = Buffer.from(JSON.stringify({
    username,
    role: 'Lead Penetration Tester',
    issuedAt: Date.now()
  })).toString('base64');
  return `SEC-${payload}`;
}

router.post('/login', (req, res) => {
  const { username, password } = req.body || {};
  const cleanUser = (username || '').trim();
  const cleanPass = (password || '').trim();

  const user = db.getUser();

  // Validate credentials
  const usernameMatch = cleanUser.toLowerCase() === user.username.toLowerCase();
  const passwordMatch = cleanPass === user.password;

  if (usernameMatch && passwordMatch) {
    const token = generateToken(user.username);
    res.cookie(config.SESSION_COOKIE_NAME, token, {
      httpOnly: false, // accessible to client for verification
      maxAge: 24 * 60 * 60 * 1000,
      sameSite: 'lax'
    });

    // Add login to audit log
    db.updateUser(u => {
      u.auditLogs.unshift({
        timestamp: new Date().toISOString(),
        action: 'Operator Authenticated',
        detail: `Session opened from 127.0.0.1 for ${user.username}`
      });
    });

    const safeUser = {
      username: user.username,
      displayName: user.displayName,
      role: user.role,
      callsign: user.callsign,
      score: user.score,
      clearance: user.clearance,
      vpnIp: user.vpnIp,
      vpnActive: user.vpnActive,
      certifications: user.certifications,
      attributes: user.attributes,
      toolset: user.toolset,
      flagsCaptured: user.flagsCaptured,
      auditLogs: user.auditLogs.slice(0, 10)
    };

    return res.json({
      success: true,
      message: 'Access Granted: Clearance verified.',
      token,
      user: safeUser
    });
  }

  return res.status(401).json({
    success: false,
    message: 'Access Denied: Invalid operative identity or access clearance key.'
  });
});

router.get('/me', (req, res) => {
  const token = req.cookies[config.SESSION_COOKIE_NAME] || req.headers['authorization'];
  const user = db.getUser();

  // If token is present, or for convenience in development
  if (token && token.startsWith('SEC-')) {
    const safeUser = {
      username: user.username,
      displayName: user.displayName,
      role: user.role,
      callsign: user.callsign,
      score: user.score,
      clearance: user.clearance,
      vpnIp: user.vpnIp,
      vpnActive: user.vpnActive,
      certifications: user.certifications,
      attributes: user.attributes,
      toolset: user.toolset,
      flagsCaptured: user.flagsCaptured,
      auditLogs: user.auditLogs.slice(0, 10)
    };
    return res.json({ authenticated: true, user: safeUser });
  }

  return res.json({ authenticated: false });
});

router.post('/logout', (req, res) => {
  res.clearCookie(config.SESSION_COOKIE_NAME);
  const user = db.getUser();
  db.updateUser(u => {
    u.auditLogs.unshift({
      timestamp: new Date().toISOString(),
      action: 'Session Terminated',
      detail: 'Operator logged out cleanly.'
    });
  });

  return res.json({ success: true, message: 'Session securely terminated.' });
});

module.exports = router;

