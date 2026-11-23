const express = require('express');
const router = express.Router();
const db = require('../utils/db');

router.post('/submit', (req, res) => {
  const { flag = '' } = req.body || {};
  const cleanFlag = flag.trim();

  if (!cleanFlag) {
    return res.status(400).json({ success: false, message: 'Flag parameter required in format FLAG{...}' });
  }

  const user = db.getUser();
  const labs = db.getLabs();
  const matchedLab = labs.find(l => l.flag === cleanFlag);

  if (!matchedLab) {
    return res.status(400).json({
      success: false,
      message: 'Invalid Flag: Cryptographic hash mismatch or incorrect solution.'
    });
  }

  if (user.flagsCaptured.includes(cleanFlag)) {
    return res.json({
      success: false,
      alreadySolved: true,
      message: `Flag already recorded previously for target: ${matchedLab.name}`
    });
  }

  // Record flag & update score
  db.updateUser(u => {
    u.flagsCaptured.push(cleanFlag);
    u.score += matchedLab.points;
    u.auditLogs.unshift({
      timestamp: new Date().toISOString(),
      action: 'Target Compromised',
      detail: `Successfully submitted flag for [${matchedLab.name}] (+${matchedLab.points} PTS)`
    });
  });

  const updatedUser = db.getUser();

  res.json({
    success: true,
    message: `Target PWNED! +${matchedLab.points} Points awarded for ${matchedLab.name}.`,
    pointsEarned: matchedLab.points,
    newTotalScore: updatedUser.score,
    totalFlagsSolved: updatedUser.flagsCaptured.length,
    labId: matchedLab.id,
    labName: matchedLab.name
  });
});

module.exports = router;

