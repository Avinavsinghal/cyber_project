/**
 * CYBER_RANGE // Interactive Lab Targets & Sandbox Exploitation Engine
 */
const Labs = {
  currentLabs: [],
  activeLabId: 1,

  async init() {
    await this.loadLabs();
  },

  async loadLabs(filter = 'all') {
    try {
      const res = await API.getLabs();
      if (res.ok && res.data?.labs) {
        this.currentLabs = res.data.labs;
        this.renderCards(filter);
        this.updateStats();
      }
    } catch (e) {
      console.error("Failed to load labs:", e);
    }
  },

  renderCards(filter = 'all') {
    const container = document.getElementById('machines-container');
    if (!container) return;

    container.innerHTML = '';

    const filtered = this.currentLabs.filter(lab => {
      if (filter === 'all') return true;
      return lab.type === filter;
    });

    filtered.forEach(lab => {
      const isActive = this.activeLabId === lab.id;

      const card = document.createElement('div');
      card.className = `machine-card ${isActive ? 'active-target' : ''} ${lab.solved ? 'solved' : ''}`;
      card.id = `card-lab-${lab.id}`;

      card.innerHTML = `
        <div>
          <div class="card-top">
            <span class="diff-badge diff-${lab.difficulty}">${lab.difficulty} • ${lab.points} PTS</span>
            <span class="status-badge ${lab.solved ? 'pwned' : ''}">
              ${lab.solved ? '✓ PWNED' : '● READY'}
            </span>
          </div>

          <h3 class="machine-title">${lab.name}</h3>
          <div class="machine-cat">${lab.cve ? lab.cve + ' • ' : ''}${lab.category}</div>

          <p class="machine-desc">${lab.desc}</p>
        </div>

        <div class="card-footer">
          <span class="machine-ip-pill">${lab.ip}</span>
          <button class="btn-launch" onclick="Labs.openModal(${lab.id})">
            Launch Target →
          </button>
        </div>
      `;

      container.appendChild(card);
    });
  },

  selectTarget(id, notify = true) {
    this.activeLabId = id;
    const lab = this.currentLabs.find(l => l.id === id);
    if (!lab) return;

    document.querySelectorAll('.machine-card').forEach(c => c.classList.remove('active-target'));
    const activeCard = document.getElementById(`card-lab-${id}`);
    if (activeCard) activeCard.classList.add('active-target');

    const termTargetName = document.getElementById('term-active-target-name');
    const termTargetIp = document.getElementById('term-active-target-ip');
    if (termTargetName) termTargetName.innerText = lab.name;
    if (termTargetIp) termTargetIp.innerText = lab.ip;

    if (notify) {
      App.playSound('click');
      App.showToast(`Target Machine Synced: ${lab.name} (${lab.ip})`);
    }
  },

  filter(type, btn) {
    App.playSound('click');
    document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    this.renderCards(type);
  },

  updateStats() {
    const solved = this.currentLabs.filter(l => l.solved).length;
    const flagsCountEl = document.getElementById('header-flags');
    if (flagsCountEl) flagsCountEl.innerText = `${solved}/8`;

    if (Auth.currentUser) {
      const ptsEl = document.getElementById('header-points');
      if (ptsEl) ptsEl.innerText = Auth.currentUser.score.toLocaleString();
    }
  },

  openModal(labId) {
    App.playSound('click');
    this.selectTarget(labId, false);
    const lab = this.currentLabs.find(l => l.id === labId);
    if (!lab) return;

    document.getElementById('modal-machine-title').innerText = lab.name;
    document.getElementById('modal-machine-ip').innerText = `${lab.ip} • Ports: ${lab.ports}`;
    document.getElementById('modal-machine-desc').innerText = `${lab.desc} [Hint: ${lab.hint}]`;
    document.getElementById('modal-browser-url').innerText = lab.url;
    document.getElementById('modal-flag-input').value = '';

    this.renderInteractiveWorkspace(lab);
    document.getElementById('lab-modal').classList.add('active');
  },

  closeModal() {
    App.playSound('click');
    document.getElementById('lab-modal').classList.remove('active');
  },

  renderInteractiveWorkspace(lab) {
    const ws = document.getElementById('modal-interactive-workspace');

    switch(lab.id) {
      case 1: // SQL Injection
        ws.innerHTML = `
          <div style="max-width:380px; margin:0 auto; background:#0d121f; padding:1.25rem; border-radius:8px; border:1px solid var(--border-subtle);">
            <div style="font-family:var(--font-mono); font-size:0.75rem; color:var(--emerald-light); margin-bottom:1rem; text-align:center;">
              RESTRICTED INTRANET AUTHENTICATION
            </div>
            <div style="display:flex; flex-direction:column; gap:0.65rem;">
              <div>
                <label style="font-size:0.72rem; font-family:var(--font-mono); color:var(--text-dim);">USERNAME:</label>
                <input type="text" id="sqli-user" class="cyber-input" style="padding-left:0.75rem; padding-top:0.5rem; padding-bottom:0.5rem;" value="' OR '1'='1' --">
              </div>
              <div>
                <label style="font-size:0.72rem; font-family:var(--font-mono); color:var(--text-dim);">PASSWORD:</label>
                <input type="password" id="sqli-pass" class="cyber-input" style="padding-left:0.75rem; padding-top:0.5rem; padding-bottom:0.5rem;" value="anything">
              </div>
              <button class="btn-launch" style="justify-content:center; margin-top:0.35rem;" onclick="Labs.testSqli()">EXECUTE SQL INJECTION</button>
            </div>
            <div id="sqli-result" style="margin-top:0.85rem; font-family:var(--font-mono); font-size:0.75rem;"></div>
          </div>
        `;
        break;

      case 2: // Command Injection
        ws.innerHTML = `
          <div style="background:#0d121f; padding:1.25rem; border-radius:8px; border:1px solid var(--border-subtle);">
            <div style="font-family:var(--font-mono); font-size:0.75rem; color:var(--emerald-light); margin-bottom:0.75rem;">
              ROUTER ICMP HEALTH & DIAGNOSTIC GATEWAY
            </div>
            <div style="display:flex; gap:0.5rem;">
              <input type="text" id="rce-input" class="cyber-input" style="padding-left:0.75rem; padding-top:0.5rem; padding-bottom:0.5rem;" value="8.8.8.8; cat flag.txt">
              <button class="btn-launch" onclick="Labs.testRce()">EXECUTE</button>
            </div>
            <pre id="rce-output" style="margin-top:0.85rem; background:#060911; padding:0.75rem; border-radius:6px; font-family:var(--font-mono); font-size:0.75rem; color:#38bdf8; min-height:80px;"></pre>
          </div>
        `;
        break;

      case 3: // XSS
        ws.innerHTML = `
          <div style="background:#0d121f; padding:1.25rem; border-radius:8px; border:1px solid var(--border-subtle);">
            <div style="font-family:var(--font-mono); font-size:0.75rem; color:var(--emerald-light); margin-bottom:0.75rem;">
              COMMUNITY GUESTBOOK & SUPPORT FORUM
            </div>
            <div style="display:flex; gap:0.5rem; margin-bottom:0.75rem;">
              <input type="text" id="xss-input" class="cyber-input" style="padding-left:0.75rem; padding-top:0.5rem; padding-bottom:0.5rem;" value="<script>alert(document.cookie)</script>">
              <button class="btn-launch" onclick="Labs.testXss()">POST</button>
            </div>
            <div id="xss-feed" style="background:#060911; padding:0.75rem; border-radius:6px; font-size:0.78rem; min-height:60px;">
              <span style="color:var(--text-dim)">[SecOps Monitor]: Automated input stream filter active.</span>
            </div>
          </div>
        `;
        break;

      case 4: // JWT Vault
        ws.innerHTML = `
          <div style="background:#0d121f; padding:1.25rem; border-radius:8px; border:1px solid var(--border-subtle); font-family:var(--font-mono); font-size:0.75rem;">
            <div style="color:var(--emerald-light); margin-bottom:0.75rem; font-weight:bold;">
              JSON WEB TOKEN INSPECTION & SIGNATURE BYPASS
            </div>
            <div style="display:grid; grid-template-columns:1fr 1fr; gap:0.75rem; margin-bottom:0.75rem;">
              <div>
                <div style="color:var(--text-dim); margin-bottom:3px;">TOKEN HEADER:</div>
                <input type="text" id="jwt-hdr" class="cyber-input" style="padding:0.4rem 0.5rem; font-size:0.72rem;" value='{"alg":"none","typ":"JWT"}'>
              </div>
              <div>
                <div style="color:var(--text-dim); margin-bottom:3px;">TOKEN PAYLOAD:</div>
                <input type="text" id="jwt-payload" class="cyber-input" style="padding:0.4rem 0.5rem; font-size:0.72rem;" value='{"sub":"admin","role":"administrator"}'>
              </div>
            </div>
            <button class="btn-launch" onclick="Labs.testJwt()">TEST SIGNATURE AT /api/v1/vault</button>
            <div id="jwt-output" style="margin-top:0.75rem; background:#060911; padding:0.75rem; border-radius:6px; color:#38bdf8;"></div>
          </div>
        `;
        break;

      case 5: // AWS S3
        ws.innerHTML = `
          <div style="background:#0d121f; padding:1.25rem; border-radius:8px; border:1px solid var(--border-subtle); font-family:var(--font-mono);">
            <div style="color:var(--emerald-light); font-size:0.78rem; margin-bottom:0.5rem;">
              S3 BUCKET LISTING: <code>s3://corp-backup-bucket/</code>
            </div>
            <div style="display:flex; flex-direction:column; gap:0.4rem; font-size:0.75rem;">
              <div style="display:flex; justify-content:space-between; background:#060911; padding:0.45rem 0.75rem; border-radius:4px;">
                <span>database_dump_2026.sql</span>
                <span style="color:var(--text-dim)">45.2 MB</span>
              </div>
              <div style="display:flex; justify-content:space-between; align-items:center; background:#060911; padding:0.45rem 0.75rem; border-radius:4px;">
                <span>production_secrets.env</span>
                <button class="btn-launch" style="padding:2px 8px; font-size:0.68rem;" onclick="Labs.inspectS3File('env')">VIEW</button>
              </div>
              <div style="display:flex; justify-content:space-between; background:#060911; padding:0.45rem 0.75rem; border-radius:4px;">
                <span>employee_payroll.csv</span>
                <span style="color:var(--text-dim)">1.1 MB</span>
              </div>
            </div>
            <pre id="s3-content" style="margin-top:0.75rem; background:#060911; padding:0.75rem; border-radius:6px; font-size:0.72rem; color:#6ee7b7; display:none;"></pre>
          </div>
        `;
        break;

      case 6: // LFI
        ws.innerHTML = `
          <div style="background:#0d121f; padding:1.25rem; border-radius:8px; border:1px solid var(--border-subtle);">
            <div style="font-family:var(--font-mono); font-size:0.75rem; color:var(--emerald-light); margin-bottom:0.75rem;">
              DOCUMENT VIEWER (PARAMETER: ?file=)
            </div>
            <div style="display:flex; gap:0.5rem;">
              <input type="text" id="lfi-input" class="cyber-input" style="padding-left:0.75rem; padding-top:0.5rem; padding-bottom:0.5rem;" value="../../../../etc/passwd">
              <button class="btn-launch" onclick="Labs.testLfi()">READ FILE</button>
            </div>
            <pre id="lfi-output" style="margin-top:0.75rem; background:#060911; padding:0.75rem; border-radius:6px; font-family:var(--font-mono); font-size:0.75rem; color:#cbd5e1; max-height:160px; overflow-y:auto;"></pre>
          </div>
        `;
        break;

      case 7: // SSRF
        ws.innerHTML = `
          <div style="background:#0d121f; padding:1.25rem; border-radius:8px; border:1px solid var(--border-subtle);">
            <div style="font-family:var(--font-mono); font-size:0.75rem; color:var(--emerald-light); margin-bottom:0.75rem;">
              WEBHOOK URL PREVIEW FETCHER
            </div>
            <div style="display:flex; gap:0.5rem;">
              <input type="text" id="ssrf-input" class="cyber-input" style="padding-left:0.75rem; padding-top:0.5rem; padding-bottom:0.5rem;" value="http://169.254.169.254/latest/meta-data/iam/security-credentials/admin-role">
              <button class="btn-launch" onclick="Labs.testSsrf()">FETCH</button>
            </div>
            <pre id="ssrf-output" style="margin-top:0.75rem; background:#060911; padding:0.75rem; border-radius:6px; font-family:var(--font-mono); font-size:0.75rem; color:#38bdf8;"></pre>
          </div>
        `;
        break;

      case 8: // SUID
        ws.innerHTML = `
          <div style="background:#0d121f; padding:1.25rem; border-radius:8px; border:1px solid var(--border-subtle); font-family:var(--font-mono);">
            <div style="color:var(--emerald-light); font-size:0.75rem; margin-bottom:0.5rem;">
              LOW-PRIVILEGE SHELL (www-data@suid-box)
            </div>
            <div style="background:#060911; padding:0.75rem; border-radius:6px; font-size:0.72rem; color:#94a3b8; margin-bottom:0.75rem;">
              www-data@suid-box:~$ find / -perm -u=s -type f 2>/dev/null<br>
              /bin/su<br>
              <strong style="color:#f59e0b">/usr/local/bin/backup_mgr</strong> (SUID ROOT BINARY)
            </div>
            <button class="btn-launch" onclick="Labs.testSuid()">SPAWN ROOT SHELL</button>
            <pre id="suid-output" style="margin-top:0.75rem; background:#060911; padding:0.75rem; border-radius:6px; font-size:0.72rem; color:#34d399; display:none;"></pre>
          </div>
        `;
        break;
    }
  },

  async testSqli() {
    App.playSound('click');
    const u = document.getElementById('sqli-user').value;
    const p = document.getElementById('sqli-pass').value;
    const res = await API.testLabExploit(1, { username: u, password: p });
    const out = document.getElementById('sqli-result');

    if (res.data?.success) {
      App.playSound('success');
      out.innerHTML = `
        <div style="color:var(--emerald-primary); background:var(--emerald-dim); border:1px solid var(--border-accent); padding:0.6rem; border-radius:4px;">
          ${res.data.message}<br>
          [+] Token: <code style="color:#fff">${res.data.flag}</code>
        </div>
      `;
      document.getElementById('modal-flag-input').value = res.data.flag;
    } else {
      App.playSound('error');
      out.innerHTML = `<span style="color:var(--accent-red)">${res.data?.error || 'Invalid credentials'}</span>`;
    }
  },

  async testRce() {
    App.playSound('click');
    const input = document.getElementById('rce-input').value;
    const res = await API.testLabExploit(2, { ip: input });
    const out = document.getElementById('rce-output');

    if (res.data?.flag) {
      App.playSound('success');
      document.getElementById('modal-flag-input').value = res.data.flag;
    }
    out.innerText = res.data?.output || 'No output received';
  },

  async testXss() {
    App.playSound('click');
    const input = document.getElementById('xss-input').value;
    const res = await API.testLabExploit(3, { payload: input });
    const feed = document.getElementById('xss-feed');

    if (res.data?.xssTriggered) {
      App.playSound('success');
      feed.innerHTML = `
        <div style="color:#fbbf24; margin-bottom:4px;">${res.data.alertMessage}</div>
        <div style="background:var(--emerald-dim); border:1px solid var(--border-accent); padding:0.5rem; border-radius:4px; color:#34d399; font-family:var(--font-mono);">
          [COOKIE]: ${res.data.stolenCookie}
        </div>
      `;
      document.getElementById('modal-flag-input').value = res.data.flag;
    } else {
      feed.innerHTML = `<span style="color:#94a3b8">Submitted comment: "${res.data?.renderedRaw || input}"</span>`;
    }
  },

  async testJwt() {
    App.playSound('click');
    const hdr = document.getElementById('jwt-hdr').value;
    const payload = document.getElementById('jwt-payload').value;
    const res = await API.testLabExploit(4, { header: hdr, payload: payload });
    const out = document.getElementById('jwt-output');

    if (res.data?.success) {
      App.playSound('success');
      out.innerHTML = `
        HTTP/1.1 200 OK<br>
        {"status":"AUTHORIZED","welcome":"Administrator","vault_flag":"${res.data.flag}"}
      `;
      document.getElementById('modal-flag-input').value = res.data.flag;
    } else {
      App.playSound('error');
      out.innerHTML = `HTTP/1.1 401 Unauthorized: Signature check failed.`;
    }
  },

  async inspectS3File(type) {
    App.playSound('success');
    const res = await API.testLabExploit(5, { file: type });
    const c = document.getElementById('s3-content');
    c.style.display = 'block';
    c.innerText = res.data?.content || 'No content';
    if (res.data?.flag) {
      document.getElementById('modal-flag-input').value = res.data.flag;
    }
  },

  async testLfi() {
    App.playSound('click');
    const path = document.getElementById('lfi-input').value;
    const res = await API.testLabExploit(6, { path });
    const out = document.getElementById('lfi-output');

    if (res.data?.success) {
      App.playSound('success');
      out.innerText = res.data.content;
      if (res.data.flag) {
        document.getElementById('modal-flag-input').value = res.data.flag;
      }
    } else {
      App.playSound('error');
      out.innerText = res.data?.error || 'Path error';
    }
  },

  async testSsrf() {
    App.playSound('click');
    const url = document.getElementById('ssrf-input').value;
    const res = await API.testLabExploit(7, { url });
    const out = document.getElementById('ssrf-output');

    if (res.data?.success) {
      App.playSound('success');
      out.innerText = JSON.stringify(res.data.metadata, null, 2);
      if (res.data.flag) {
        document.getElementById('modal-flag-input').value = res.data.flag;
      }
    } else {
      App.playSound('error');
      out.innerText = res.data?.error || 'SSRF failed';
    }
  },

  async testSuid() {
    App.playSound('success');
    const res = await API.testLabExploit(8, {});
    const out = document.getElementById('suid-output');
    out.style.display = 'block';
    out.innerText = res.data?.output || 'Root spawned';
    if (res.data?.flag) {
      document.getElementById('modal-flag-input').value = res.data.flag;
    }
  },

  async submitModalFlag() {
    const val = document.getElementById('modal-flag-input').value.trim();
    if (!val) {
      App.showToast("Please enter a flag in format FLAG{...}");
      return;
    }
    await this.submitFlagValue(val);
  },

  async submitFlagValue(flag) {
    try {
      const res = await API.submitFlag(flag);
      if (res.ok && res.data?.success) {
        App.playSound('success');
        App.showToast(`🏆 ${res.data.message}`);

        const target = this.currentLabs.find(l => l.flag === flag);
        if (target) target.solved = true;

        if (Auth.currentUser) {
          Auth.currentUser.score = res.data.newTotalScore;
        }

        this.renderCards();
        this.updateStats();

        if (window.Leaderboard) Leaderboard.render();
        if (window.TesterProfile) TesterProfile.render();
        return true;
      } else {
        App.playSound('error');
        App.showToast(res.data?.message || '❌ Invalid Flag', true);
        return false;
      }
    } catch (e) {
      App.playSound('error');
      App.showToast("Network error submitting flag.", true);
      return false;
    }
  }
};
