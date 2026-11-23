# CYBER_RANGE // Offensive Security & Penetration Testing Platform

A full-fledged, multi-tier Penetration Testing Platform built with a **Node.js / Express backend** and a **modular, responsive offensive cybersecurity frontend**.

---

## ⚡ Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Start the Backend Server
```bash
npm start
```
The server will boot on **`http://localhost:3000`** with full REST API endpoints, real-time command evaluator, persistent database, and session management.

---

## 🔑 Authentication Clearance
- **Operative Identity / Username**: `Avinav Singhal` (or click the quick-fill pill)
- **Access Clearance / Password**: `cyber123`
- Session tokens are issued via HTTP cookies and `Authorization: SEC-<token>` headers, verified on the backend via `/api/auth/me`.

---

## 🛡️ Penetration Tester Attributes & Metrics
The platform features a dedicated **Tester Attributes & Profile** suite:
- **Lead Auditor**: Avinav Singhal (`SPECTRE-01`)
- **Clearance Level**: `Tier 4 - Restricted OffSec`
- **Virtual VPN Lease**: `10.10.14.33` (`tun0`)
- **Technical Skills Matrix**:
  - Web Application Pentesting: `96%` [Expert]
  - Linux / Windows Privilege Escalation: `92%` [Advanced]
  - Cloud & AWS Security: `88%` [Advanced]
  - Network Recon & Port Enumeration: `94%` [Expert]
  - API / JWT / SSRF Exploitation: `90%` [Advanced]
  - Binary Exploitation & SUID Abuse: `82%` [Proficient]
- **Verified Certifications**:
  - **OSCP** - Offensive Security Certified Professional (OffSec)
  - **CEH** - Certified Ethical Hacker (Master) (EC-Council)
  - **CRTP** - Certified Red Team Professional (Altered Security)
  - **eWPTXv2** - Web Application Penetration Tester eXtreme (INE Security)
- **Tooling Rig**: Metasploit, Burp Suite, Nmap, Gobuster, SQLmap, Wireshark, Impacket, Ghidra

---

## 🎯 8 Target Vulnerability Labs (Subnet `10.10.110.0/24`)

| # | Machine | Category | Difficulty | Target IP | Points | Backend Flag |
|---|---------|----------|------------|-----------|--------|--------------|
| 1 | **SQL Fortress** | SQL Injection (Auth Bypass) | Easy | `10.10.110.11` | 250 PTS | `FLAG{sql_1nj3ct10n_byp4ss_m4st3r_2026}` |
| 2 | **Command Injection Gateway** | Remote Code Execution (RCE) | Medium | `10.10.110.22` | 350 PTS | `FLAG{rce_c0mm4nd_1nj3ct10n_pwn3d_882}` |
| 3 | **XSS Playground** | Stored / Reflected XSS | Easy | `10.10.110.33` | 250 PTS | `FLAG{st0r3d_xss_c00k13_h1j4ck_9011}` |
| 4 | **JWT Vault** | Broken Auth / Alg None | Medium | `10.10.110.44` | 400 PTS | `FLAG{jwt_4lg_n0n3_w34k_s1gn4tur3_v4ult}` |
| 5 | **Cloud S3 Bucket Leak** | AWS S3 Misconfiguration | Medium | `10.10.110.55` | 350 PTS | `FLAG{s3_0p3n_bu4ck3t_cl0ud_l34k_7719}` |
| 6 | **LFI & Path Traversal** | Local File Inclusion | Hard | `10.10.110.66` | 450 PTS | `FLAG{lfi_p4th_tr4v3rs4l_l0g_p01s0n_4421}` |
| 7 | **SSRF Relay Hub** | Cloud Metadata (169.254.169.254) | Hard | `10.10.110.77` | 450 PTS | `FLAG{ssrf_cl0ud_m3t4d4t4_3xp0s3d_6623}` |
| 8 | **SUID PrivEsc Fortress** | Linux Binary PrivEsc | Insane | `10.10.110.88` | 500 PTS | `FLAG{su1d_pr1v3sc_gtf0b1ns_r00t_0099}` |

---

## 💻 Kali Attack Console (Pwnbox) CLI
The Kali terminal connects directly to the `/api/terminal/execute` backend engine:
- `help` : View all CLI commands
- `status` : Print active score, VPN status, and target host
- `attribs` : Print operative skills matrix and certifications
- `targets` / `labs` : Enumerate subnet target machines
- `target <1-8>` : Synchronize active target machine
- `nmap [ip]` : Run SYN port scan and service banner enumeration
- `gobuster [ip]` : Fast directory & API endpoint brute-force
- `curl <url>` : Send HTTP request to target web service
- `ping [ip]` : ICMP diagnostic test
- `sqli <payload>` : Automated SQL injection probe
- `cat <file>` : Read target files (`flag.txt`, `/etc/passwd`)
- `exploit` : Run automated exploit suite on active target
- `submit FLAG{...}` : Submit flag to backend engine for points
- `vpn <connect|disconnect>` : Toggle virtual VPN tunnel (`tun0`)
- `clear` : Clear terminal screen

---

## 🏗️ Architecture & Project Structure

```
cyber_project/
├── package.json               # Node.js dependencies & scripts
├── README.md                  # Project manual & documentation
├── index.html                 # Canonical entry point
├── server/
│   ├── server.js              # Express application server & routes
│   ├── config.js              # Environment settings & constants
│   ├── data/
│   │   └── db.json            # Persistent JSON database (users, scores, logs)
│   ├── routes/
│   │   ├── auth.js            # Login, session verification & logout
│   │   ├── tester.js          # Penetration tester profile & attributes
│   │   ├── labs.js            # 8 Interactive target lab simulators
│   │   ├── terminal.js        # Kali terminal command execution engine
│   │   ├── flags.js           # Flag validation & score crediting
│   │   ├── leaderboard.js     # Real-time CTF leaderboard rankings
│   │   └── vpn.js             # VPN tunnel interface manager
│   └── utils/
│       └── db.js              # Thread-safe database synchronization
├── public/
│   ├── index.html             # Clean dashboard & login SPA
│   ├── css/
│   │   └── style.css          # Dark slate & emerald neon styling
│   └── js/
│       ├── api.js             # Central REST API client
│       ├── auth.js            # Working login & session controller
│       ├── testerProfile.js   # Penetration tester attributes view
│       ├── labs.js            # Lab workbench & exploitation modal
│       ├── terminal.js        # Interactive PwnBox terminal
│       ├── leaderboard.js     # Podium & rankings table
│       └── app.js             # Audio synth & app orchestrator
└── test/
    └── server.test.js         # Automated backend test suite (14/14 passing)
```

---

## 🏆 Dynamic Leaderboard & Scoring
- As flags are submitted and verified on the backend, scores update persistently in `server/data/db.json`.
- The lead operative dynamically overtakes competitors to claim **Rank #1 with 4,450 PTS** upon capturing all flags.
