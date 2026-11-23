const express = require('express');
const router = express.Router();
const db = require('../utils/db');

// Get all labs
router.get('/', (req, res) => {
  const user = db.getUser();
  const labs = db.getLabs();

  const enrichedLabs = labs.map(lab => ({
    id: lab.id,
    name: lab.name,
    category: lab.category,
    type: lab.type,
    difficulty: lab.difficulty,
    points: lab.points,
    ip: lab.ip,
    ports: lab.ports,
    desc: lab.desc,
    hint: lab.hint,
    url: lab.url,
    cve: lab.cve,
    mitreTactic: lab.mitreTactic,
    solved: user.flagsCaptured.includes(lab.flag)
  }));

  res.json({ success: true, labs: enrichedLabs });
});

// Get single lab
router.get('/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const user = db.getUser();
  const lab = db.getLabs().find(l => l.id === id);

  if (!lab) {
    return res.status(404).json({ success: false, message: 'Lab target not found' });
  }

  res.json({
    success: true,
    lab: {
      ...lab,
      solved: user.flagsCaptured.includes(lab.flag)
    }
  });
});

// LAB 1: SQL Injection
router.post('/1/sqli', (req, res) => {
  const { username = '', password = '' } = req.body || {};
  const u = username.trim();
  const p = password.trim();

  const isBypass = (
    u.includes("' OR '1'='1'") ||
    u.includes("' OR 1=1") ||
    u.includes("admin' --") ||
    u.includes("admin' /*") ||
    u.includes("' OR '") ||
    u.includes("1=1")
  );

  if (isBypass) {
    return res.json({
      success: true,
      statusCode: 200,
      authenticated: true,
      user: 'SUPER_ADMIN',
      query: `SELECT * FROM intranet_users WHERE username = '${u}' AND password = '${p}' LIMIT 1;`,
      flag: 'FLAG{sql_1nj3ct10n_byp4ss_m4st3r_2026}',
      message: '[+] SQL BYPASS SUCCESS! Intranet access granted as SUPER_ADMIN.'
    });
  }

  return res.json({
    success: false,
    statusCode: 401,
    authenticated: false,
    query: `SELECT * FROM intranet_users WHERE username = '${u}' AND password = '${p}' LIMIT 1;`,
    error: '[-] 401 Unauthorized: Invalid username or password in MariaDB staff record.'
  });
});

// LAB 2: Command Injection (RCE)
router.post('/2/rce', (req, res) => {
  const { ip = '' } = req.body || {};
  const cmd = ip.trim();

  if (cmd.includes(';') || cmd.includes('&&') || cmd.includes('|') || cmd.includes('`') || cmd.includes('$(')) {
    return res.json({
      success: true,
      output: `PING 8.8.8.8 (8.8.8.8) 56(84) bytes of data.\n64 bytes from 8.8.8.8: icmp_seq=1 ttl=117 time=14.2 ms\n64 bytes from 8.8.8.8: icmp_seq=2 ttl=117 time=13.8 ms\n\n--- INJECTED COMMAND STREAM EXECUTION ---\nuid=0(root) gid=0(root) groups=0(root)\nLinux gateway-pwn 5.15.0-89-generic #99-Ubuntu SMP\nFLAG{rce_c0mm4nd_1nj3ct10n_pwn3d_882}`,
      flag: 'FLAG{rce_c0mm4nd_1nj3ct10n_pwn3d_882}'
    });
  }

  return res.json({
    success: true,
    output: `PING ${cmd} (${cmd}) 56(84) bytes of data.\n64 bytes: icmp_seq=1 ttl=64 time=12.1 ms\n\n--- ${cmd} ping statistics ---\n1 packets transmitted, 1 received, 0% packet loss`
  });
});

// LAB 3: Stored / Reflected XSS
router.post('/3/xss', (req, res) => {
  const { payload = '' } = req.body || {};
  const isXSS = payload.toLowerCase().includes('<script>') ||
                payload.toLowerCase().includes('<img') ||
                payload.toLowerCase().includes('onerror=') ||
                payload.toLowerCase().includes('javascript:') ||
                payload.toLowerCase().includes('alert(');

  if (isXSS) {
    return res.json({
      success: true,
      xssTriggered: true,
      alertMessage: '[XSS DETECTED] Script executed in simulated client browser context.',
      stolenCookie: 'session_token=FLAG{st0r3d_xss_c00k13_h1j4ck_9011}; path=/; HttpOnly=false',
      flag: 'FLAG{st0r3d_xss_c00k13_h1j4ck_9011}',
      renderedRaw: payload
    });
  }

  return res.json({
    success: true,
    xssTriggered: false,
    message: 'Submitted safe comment to public guestbook feed.',
    renderedRaw: payload.replace(/</g, '&lt;').replace(/>/g, '&gt;')
  });
});

// LAB 4: JWT Vault
router.post('/4/jwt', (req, res) => {
  const { header = '', payload = '' } = req.body || {};
  let hdrObj = {};
  let payObj = {};

  try { hdrObj = JSON.parse(header); } catch(e) {}
  try { payObj = JSON.parse(payload); } catch(e) {}

  if ((hdrObj.alg === 'none' || hdrObj.alg === 'None') && (payObj.role === 'admin' || payObj.role === 'administrator')) {
    return res.json({
      success: true,
      status: 'AUTHORIZED',
      role: 'administrator',
      vault_flag: 'FLAG{jwt_4lg_n0n3_w34k_s1gn4tur3_v4ult}',
      flag: 'FLAG{jwt_4lg_n0n3_w34k_s1gn4tur3_v4ult}',
      message: 'Cryptographic signature verification bypassed via alg: none exploit!'
    });
  }

  return res.status(401).json({
    success: false,
    status: 'DENIED',
    error: '401 Unauthorized: Invalid signature verification or insufficient role privileges.'
  });
});

// LAB 5: AWS S3 Bucket Leak
router.get('/5/s3', (req, res) => {
  const file = req.query.file;

  if (file === 'env' || file === 'production_secrets.env') {
    return res.json({
      success: true,
      filename: 'production_secrets.env',
      content: `# AWS PRODUCTION CLUSTER ENVIRONMENT SECRETS\nAWS_ACCESS_KEY_ID=AKIAIOSFODNN7EXAMPLE\nAWS_SECRET_ACCESS_KEY=wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY\nAWS_DEFAULT_REGION=eu-west-1\nDATABASE_URL=postgres://app_admin:Sup3rS3cur3P4ss@prod-db.internal:5432/main\nPRODUCTION_ROOT_FLAG=FLAG{s3_0p3n_bu4ck3t_cl0ud_l34k_7719}`,
      flag: 'FLAG{s3_0p3n_bu4ck3t_cl0ud_l34k_7719}'
    });
  }

  return res.json({
    success: true,
    bucket: 's3://corp-backup-bucket/',
    files: [
      { name: 'database_dump_2026.sql', size: '45.2 MB', permissions: 'Public Read' },
      { name: 'production_secrets.env', size: '2.1 KB', permissions: 'Public Read' },
      { name: 'employee_payroll.csv', size: '1.1 MB', permissions: 'Public Read' }
    ]
  });
});

// LAB 6: LFI & Path Traversal
router.post('/6/lfi', (req, res) => {
  const { path = '' } = req.body || {};
  const cleaned = path.trim();

  if (cleaned.includes('..') && (cleaned.includes('passwd') || cleaned.includes('flag') || cleaned.includes('shadow'))) {
    return res.json({
      success: true,
      path: cleaned,
      content: `root:x:0:0:root:/root:/bin/bash\ndaemon:x:1:1:daemon:/usr/sbin:/usr/sbin/nologin\nbin:x:2:2:bin:/bin:/usr/sbin/nologin\nwww-data:x:33:33:www-data:/var/www:/usr/sbin/nologin\navinav:x:1000:1000:Avinav Singhal:/home/avinav:/bin/bash\n\n# HIDDEN AUDIT ARTIFACT IN /var/www/flag.txt:\nFLAG{lfi_p4th_tr4v3rs4l_l0g_p01s0n_4421}`,
      flag: 'FLAG{lfi_p4th_tr4v3rs4l_l0g_p01s0n_4421}'
    });
  }

  return res.json({
    success: false,
    error: `Error 404: File '${cleaned}' not found in /var/www/html/public/ directory.`
  });
});

// LAB 7: SSRF Relay Hub
router.post('/7/ssrf', (req, res) => {
  const { url = '' } = req.body || {};

  if (url.includes('169.254.169.254')) {
    return res.json({
      success: true,
      status: 200,
      metadata: {
        provider: 'EC2-Instance-Metadata',
        code: 'Success',
        lastUpdated: '2026-10-30T10:00:00Z',
        type: 'AWS-HMAC',
        accessKeyId: 'ASIAV4METADATAEXPOSED',
        secretAccessKey: 'FLAG{ssrf_cl0ud_m3t4d4t4_3xp0s3d_6623}',
        token: 'FQoGZXIvYXdzEJ//////////wEaDGV1LXdlc3QtMS...=='
      },
      flag: 'FLAG{ssrf_cl0ud_m3t4d4t4_3xp0s3d_6623}'
    });
  }

  return res.json({
    success: false,
    error: 'SSRF Fetch failed: Target connection refused or URL did not resolve to internal metadata endpoint.'
  });
});

// LAB 8: Linux SUID Privilege Escalation
router.post('/8/suid', (req, res) => {
  return res.json({
    success: true,
    binary: '/usr/local/bin/backup_mgr',
    effectiveUid: 0,
    user: 'root',
    output: `[+] Executing SUID binary: /usr/local/bin/backup_mgr\n[+] Dropping privilege check... Effective UID: 0 (root)\n# whoami\nroot\n# id\nuid=0(root) gid=0(root) groups=0(root),33(www-data)\n# cat /root/root_flag.txt\nFLAG{su1d_pr1v3sc_gtf0b1ns_r00t_0099}`,
    flag: 'FLAG{su1d_pr1v3sc_gtf0b1ns_r00t_0099}'
  });
});

module.exports = router;

