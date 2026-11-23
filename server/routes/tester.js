const express = require('express');
const router = express.Router();
const db = require('../utils/db');

router.get('/profile', (req, res) => {
  const user = db.getUser();
  const labs = db.getLabs();

  const totalPossibleScore = 1500 + labs.reduce((acc, l) => acc + l.points, 0);
  const solvedCount = user.flagsCaptured.length;

  res.json({
    success: true,
    profile: {
      username: user.username,
      displayName: user.displayName,
      role: user.role,
      callsign: user.callsign,
      clearance: user.clearance,
      vpnIp: user.vpnIp,
      vpnActive: user.vpnActive,
      certifications: user.certifications,
      attributes: user.attributes,
      toolset: user.toolset,
      stats: {
        score: user.score,
        targetsCompromised: solvedCount,
        totalTargets: labs.length,
        completionPercentage: Math.round((solvedCount / labs.length) * 100),
        totalPossibleScore,
        engagementRank: user.score >= 4000 ? '#1 (Gold)' : user.score >= 2500 ? '#2 (Silver)' : '#5 (Active Contender)'
      },
      auditLogs: user.auditLogs.slice(0, 15)
    }
  });
});

router.post('/attributes/tune', (req, res) => {
  const { attribute, delta } = req.body || {};
  const user = db.getUser();

  if (attribute && user.attributes[attribute] !== undefined) {
    db.updateUser(u => {
      u.attributes[attribute] = Math.min(100, Math.max(10, u.attributes[attribute] + (Number(delta) || 1)));
      u.auditLogs.unshift({
        timestamp: new Date().toISOString(),
        action: 'Attribute Recalibration',
        detail: `Skill attribute ${attribute} adjusted to ${u.attributes[attribute]}%`
      });
    });
    return res.json({ success: true, attributes: db.getUser().attributes });
  }

  return res.status(400).json({ success: false, message: 'Invalid attribute parameter' });
});

module.exports = router;

