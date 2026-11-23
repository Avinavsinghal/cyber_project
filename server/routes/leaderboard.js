const express = require('express');
const router = express.Router();
const db = require('../utils/db');

router.get('/', (req, res) => {
  const user = db.getUser();
  const competitors = db.getCompetitors();
  const labs = db.getLabs();

  const allEntries = [
    ...competitors.map(c => ({
      name: c.name,
      score: c.score,
      flags: c.flags,
      badge: c.badge,
      status: c.status,
      isCurrentUser: false
    })),
    {
      name: user.displayName || user.username,
      score: user.score,
      flags: user.flagsCaptured.length,
      badge: 'Offensive Lead',
      status: user.vpnActive ? 'Active (tun0)' : 'Offline',
      isCurrentUser: true
    }
  ];

  // Sort descending by score
  allEntries.sort((a, b) => b.score - a.score);

  // Determine current user rank
  const userRank = allEntries.findIndex(e => e.isCurrentUser) + 1;

  res.json({
    success: true,
    rankings: allEntries,
    userRank,
    totalLabs: labs.length,
    podium: {
      first: allEntries[0] || null,
      second: allEntries[1] || null,
      third: allEntries[2] || null
    }
  });
});

module.exports = router;

