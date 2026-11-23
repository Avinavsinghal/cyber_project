const express = require('express');
const router = express.Router();
const db = require('../utils/db');

router.get('/status', (req, res) => {
  const user = db.getUser();
  res.json({
    active: user.vpnActive,
    ip: user.vpnIp,
    interface: 'tun0',
    gateway: '10.10.10.1',
    assignedSubnet: '10.10.110.0/24'
  });
});

router.post('/toggle', (req, res) => {
  const user = db.getUser();
  const newState = !user.vpnActive;

  db.updateUser(u => {
    u.vpnActive = newState;
    u.auditLogs.unshift({
      timestamp: new Date().toISOString(),
      action: newState ? 'VPN Tunnel Enabled' : 'VPN Tunnel Terminated',
      detail: newState ? `Interface tun0 bound to ${u.vpnIp}` : 'Interface tun0 brought DOWN'
    });
  });

  res.json({
    success: true,
    active: newState,
    ip: user.vpnIp,
    message: newState
      ? `VPN Tunnel Re-established: ${user.vpnIp} [tun0] ACTIVE`
      : 'VPN Tunnel Terminated. Targets unreachable until reconnected.'
  });
});

module.exports = router;

