const express = require('express');
const router = express.Router();
const db = require('../utils/db');

router.post('/execute', (req, res) => {
  const { command = '', activeTargetId = 1 } = req.body || {};
  const rawCmd = (command || '').trim();

  if (!rawCmd) {
    return res.json({ success: true, output: '' });
  }

  const user = db.getUser();
  const labs = db.getLabs();
  const activeLab = labs.find(l => l.id === Number(activeTargetId)) || labs[0];

  const args = rawCmd.split(/\s+/);
  const mainCmd = args[0].toLowerCase();

  // If VPN is down and command is network-dependent
  const netCommands = ['nmap', 'gobuster', 'curl', 'ping', 'sqli', 'exploit'];
  if (!user.vpnActive && netCommands.includes(mainCmd)) {
    return res.json({
      success: false,
      output: `[ERROR]: VPN tunnel interface tun0 is DOWN!\nCannot route packets to target subnet 10.10.110.0/24.\nRun 'vpn connect' or click the header VPN indicator.`
    });
  }

  switch(mainCmd) {
    case 'help':
      return res.json({
        success: true,
        output: `OFFENSIVE SECURITY PWNBOX // KALI ATTACK SUITE
Available CLI Commands:
• help                   : Display this command reference manual
• status                 : View current auditor score, VPN interface, and target state
• attribs                : Display penetration tester profile and attributes
• targets / labs         : Enumerate all 8 vulnerable target machines in subnet
• target <1-8>           : Switch active attack target machine (e.g. 'target 2')
• nmap [ip]              : Execute SYN port scan and service banner enumeration
• gobuster [ip]          : Fast directory and sensitive endpoint enumeration
• curl <url>             : Perform HTTP request against target web service
• ping [ip]              : Send ICMP echo requests to target host
• sqli <payload>         : Execute automated SQL injection probe on target
• cat <file>             : Inspect target system file (e.g. 'cat flag.txt')
• exploit                : Run weaponized exploit chain against current active target
• submit <FLAG{...}>     : Submit captured flag to backend verification engine
• vpn <connect|disconnect> : Toggle virtual penetration lab tunnel (tun0)
• whoami                 : Print active operative privileges
• clear                  : Reset terminal buffer`
      });

    case 'whoami':
      return res.json({
        success: true,
        output: `${user.username.toLowerCase().replace(/\s+/g, '_')}@kali-pwnbox (uid=1000 gid=1000 [sudo, offensive-sec, certified-pentester])`
      });

    case 'status':
      return res.json({
        success: true,
        output: `[+] Auditor Identity : ${user.displayName} (${user.callsign})
[+] Current Score    : ${user.score.toLocaleString()} PTS
[+] Captured Flags   : ${user.flagsCaptured.length} / ${labs.length}
[+] VPN Tunnel       : ${user.vpnActive ? `ACTIVE (${user.vpnIp} tun0)` : 'DISCONNECTED'}
[+] Active Target    : [ID: ${activeLab.id}] ${activeLab.name} (${activeLab.ip})
[+] Clearance Level  : ${user.clearance}`
      });

    case 'attribs':
      return res.json({
        success: true,
        output: `OPERATIVE ATTRIBUTES & SKILL PROFILE:
• Web Application Security      : ${user.attributes.webSecurity}% [Expert]
• Linux / Windows PrivEsc       : ${user.attributes.privilegeEscalation}% [Advanced]
• Cloud Security & AWS S3       : ${user.attributes.cloudPentesting}% [Advanced]
• Network Reconnaissance & Port : ${user.attributes.networkEnumeration}% [Expert]
• API / JWT / SSRF Exploitation : ${user.attributes.apiSecurity}% [Advanced]
• Binary Exploitation / SUID    : ${user.attributes.binaryExploitation}% [Proficient]`
      });

    case 'targets':
    case 'labs':
      let table = `AVAILABLE TARGET MACHINES (10.10.110.0/24):\n`;
      labs.forEach(l => {
        const isSolved = user.flagsCaptured.includes(l.flag);
        const isCurr = activeLab.id === l.id;
        table += `[${l.id}] ${isCurr ? '👉 ' : '   '}${l.name.padEnd(28)} | ${l.ip.padEnd(14)} | ${l.difficulty.toUpperCase().padEnd(7)} | ${isSolved ? '✅ PWNED' : '🔒 ACTIVE'}\n`;
      });
      table += `Switch active target with: target <id>`;
      return res.json({ success: true, output: table });

    case 'target':
      const newId = parseInt(args[1]);
      const found = labs.find(l => l.id === newId);
      if (found) {
        return res.json({
          success: true,
          output: `[+] Active target successfully switched to: [${found.id}] ${found.name} (${found.ip})`,
          newTarget: found
        });
      }
      return res.json({
        success: false,
        output: `[-] Target ID not recognized. Enter a number between 1 and ${labs.length}.`
      });

    case 'ping':
      const pingHost = args[1] || activeLab.ip;
      return res.json({
        success: true,
        output: `PING ${pingHost} (${pingHost}) 56(84) bytes of data.
64 bytes from ${pingHost}: icmp_seq=1 ttl=64 time=1.45 ms
64 bytes from ${pingHost}: icmp_seq=2 ttl=64 time=1.28 ms
64 bytes from ${pingHost}: icmp_seq=3 ttl=64 time=1.52 ms
--- ${pingHost} ping statistics ---
3 packets transmitted, 3 received, 0% packet loss, time 2004ms`
      });

    case 'nmap':
      const targetHost = args[1] || activeLab.ip;
      return res.json({
        success: true,
        output: `Starting Nmap 7.94 ( https://nmap.org ) at 2026-10-30 22:00 IST
Nmap scan report for ${targetHost} (${activeLab.name})
Host is up (0.0018s latency).
Not shown: 998 closed tcp ports (reset)
PORT     STATE SERVICE     VERSION
${getNmapOutput(activeLab)}
Service Info: OS: Linux; CPE: cpe:/o:linux:linux_kernel

Nmap done: 1 IP address (1 host up) scanned in 1.34 seconds`
      });

    case 'gobuster':
      return res.json({
        success: true,
        output: `===============================================================
Gobuster v3.6 - Dir brute forcing mode
[+] Target URL:  http://${activeLab.ip}/
[+] Wordlist:    /usr/share/wordlists/dirb/common.txt
[+] Threads:     25
===============================================================
${getGobusterOutput(activeLab)}
===============================================================
Progress: 4614 / 4614 (100.00%)`
      });

    case 'curl':
      const url = args[1] || `http://${activeLab.ip}/`;
      return res.json({
        success: true,
        output: `HTTP/1.1 200 OK
Server: Apache/2.4.52 (Ubuntu)
Content-Type: text/html; charset=UTF-8
Connection: keep-alive

<!-- Target Host: ${activeLab.name} -->
<h1>Authorized Target: ${activeLab.name}</h1>
<p>Category: ${activeLab.category}</p>
<p>Endpoint active on ${activeLab.ip}</p>`
      });

    case 'sqli':
      if (activeLab.id === 1) {
        return res.json({
          success: true,
          output: `[+] VULNERABILITY CONFIRMED: Boolean-based blind & Auth Bypass on ${activeLab.ip}
[+] Database: MariaDB 10.6.12-intranet
[+] Injected Query: SELECT * FROM staff WHERE user='' OR '1'='1'--'
[+] DUMPED ARTIFACT: ${activeLab.flag}
[+] Claim points with: submit ${activeLab.flag}`,
          flag: activeLab.flag
        });
      }
      return res.json({
        success: true,
        output: `[-] Target ${activeLab.name} returned HTTP 200 with no SQL syntax errors. Target is not vulnerable to simple SQLi.`
      });

    case 'cat':
      const file = args[1] || 'flag.txt';
      if (file.toLowerCase().includes('flag')) {
        return res.json({
          success: true,
          output: `[+] EXPLOITED SYSTEM FILE /root/flag.txt:\n${activeLab.flag}\n\nSubmit this flag with: submit ${activeLab.flag}`,
          flag: activeLab.flag
        });
      } else if (file.includes('passwd')) {
        return res.json({
          success: true,
          output: `root:x:0:0:root:/root:/bin/bash\ndaemon:x:1:1:daemon:/usr/sbin:/usr/sbin/nologin\nwww-data:x:33:33:www-data:/var/www:/usr/sbin/nologin\navinav:x:1000:1000:Avinav Singhal:/home/avinav:/bin/bash`
        });
      }
      return res.json({
        success: true,
        output: `cat: ${file}: Permission denied or file not found`
      });

    case 'exploit':
      return res.json({
        success: true,
        output: `[+] Initiating automated offensive exploit payload against ${activeLab.name} (${activeLab.ip})...
[+] Target verified: ${activeLab.category}
[+] Payload delivery: STAGED & EXECUTED
[+] Privilege boundary crossed: ROOT/ADMIN ACCESS CONFIRMED!
---------------------------------------------------------------
${activeLab.flag}
---------------------------------------------------------------
[+] Claim points by running: submit ${activeLab.flag}`,
        flag: activeLab.flag
      });

    case 'submit':
      const flagVal = args[1];
      if (!flagVal) {
        return res.json({ success: false, output: `[-] Usage: submit FLAG{...}` });
      }
      // Delegate to internal flag logic
      const targetFlag = labs.find(l => l.flag === flagVal);
      if (!targetFlag) {
        return res.json({ success: false, output: `[-] Flag verification failed: Authentication Hash Mismatch.` });
      }
      if (user.flagsCaptured.includes(flagVal)) {
        return res.json({ success: false, output: `[!] Flag already claimed previously for ${targetFlag.name}!` });
      }

      db.updateUser(u => {
        u.flagsCaptured.push(flagVal);
        u.score += targetFlag.points;
        u.auditLogs.unshift({
          timestamp: new Date().toISOString(),
          action: 'Flag Pwned',
          detail: `Captured ${targetFlag.name} (+${targetFlag.points} PTS)`
        });
      });

      return res.json({
        success: true,
        output: `[+] FLAG ACCEPTED FOR TARGET [${targetFlag.name}]!
[+] +${targetFlag.points} POINTS CREDITED TO OPERATIVE AVINAV SINGHAL
[+] CURRENT SCORE: ${db.getUser().score.toLocaleString()} PTS`,
        newScore: db.getUser().score,
        flagAccepted: true
      });

    case 'vpn':
      const sub = (args[1] || '').toLowerCase();
      if (sub === 'connect') {
        db.updateUser(u => { u.vpnActive = true; });
        return res.json({ success: true, output: `[+] Interface tun0 initialized. Assigned IP: 10.10.14.33` });
      } else if (sub === 'disconnect') {
        db.updateUser(u => { u.vpnActive = false; });
        return res.json({ success: true, output: `[!] Interface tun0 brought DOWN. Virtual VPN disconnected.` });
      }
      return res.json({ success: true, output: `Usage: vpn <connect|disconnect>. Current status: ${user.vpnActive ? 'ACTIVE (10.10.14.33)' : 'OFFLINE'}` });

    case 'clear':
      return res.json({ success: true, clear: true, output: '' });

    default:
      return res.json({
        success: false,
        output: `bash: ${mainCmd}: command not found. Type 'help' for available commands.`
      });
  }
});

function getNmapOutput(lab) {
  if (lab.id === 1) return `80/tcp   open  http        Apache httpd 2.4.52 ((Ubuntu))\n3306/tcp open  mysql       MariaDB 10.6.12`;
  if (lab.id === 2) return `22/tcp   open  ssh         OpenSSH 8.9p1 Ubuntu\n80/tcp   open  http        nginx 1.18.0`;
  if (lab.id === 4) return `80/tcp   open  http        nginx 1.18.0\n8080/tcp open  http-proxy  Uvicorn/FastAPI (JWT Vault)`;
  if (lab.id === 8) return `22/tcp   open  ssh         OpenSSH 8.4p1 Debian\n80/tcp   open  http        Apache/2.4.41 (Web Console)`;
  return `80/tcp   open  http        Apache httpd 2.4.41 ((Ubuntu))\n443/tcp  open  ssl/http    OpenSSL 1.1.1f`;
}

function getGobusterOutput(lab) {
  if (lab.id === 1) return `--> /login.php            (Status: 200) [Size: 1540]\n--> /admin/               (Status: 301) [Size: 312]\n--> /config.php.bak       (Status: 200) [Size: 420]`;
  if (lab.id === 5) return `--> /production_secrets.env (Status: 200) [Size: 185]\n--> /database_dump.sql    (Status: 200) [Size: 4521098]\n--> /backup/              (Status: 301) [Size: 284]`;
  if (lab.id === 6) return `--> /view.php             (Status: 200) [Size: 980]\n--> /secret_flag.txt      (Status: 403) [Size: 274]`;
  return `--> /index.php            (Status: 200) [Size: 1240]\n--> /api/                 (Status: 301) [Size: 290]\n--> /robots.txt           (Status: 200) [Size: 48]`;
}

module.exports = router;

