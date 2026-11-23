/**
 * CYBER_RANGE // Core Application Orchestrator & Audio Synthesizer
 */
const App = {
  audioEnabled: true,
  audioCtx: null,
  dashboardInitialized: false,

  init() {
    this.initMatrix();
    Auth.init();
    Terminal.init();
  },

  initDashboard() {
    if (this.dashboardInitialized) return;
    this.dashboardInitialized = true;

    Labs.init();
    Leaderboard.render();
    TesterProfile.render();
    this.syncVPN();
  },

  /* Web Audio API Sound Synthesizer */
  getAudioContext() {
    if (!this.audioCtx) {
      this.audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
    }
    return this.audioCtx;
  },

  playSound(type) {
    if (!this.audioEnabled) return;
    try {
      const ctx = this.getAudioContext();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);

      const now = ctx.currentTime;

      if (type === 'click') {
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(450, now);
        osc.frequency.exponentialRampToValueAtTime(150, now + 0.04);
        gain.gain.setValueAtTime(0.08, now);
        gain.gain.linearRampToValueAtTime(0, now + 0.04);
        osc.start(now);
        osc.stop(now + 0.04);
      } else if (type === 'success') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(523.25, now);
        osc.frequency.setValueAtTime(659.25, now + 0.08);
        osc.frequency.setValueAtTime(783.99, now + 0.16);
        osc.frequency.setValueAtTime(1046.50, now + 0.24);
        gain.gain.setValueAtTime(0.12, now);
        gain.gain.linearRampToValueAtTime(0, now + 0.45);
        osc.start(now);
        osc.stop(now + 0.45);
      } else if (type === 'error') {
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(180, now);
        osc.frequency.setValueAtTime(130, now + 0.1);
        gain.gain.setValueAtTime(0.15, now);
        gain.gain.linearRampToValueAtTime(0, now + 0.25);
        osc.start(now);
        osc.stop(now + 0.25);
      } else if (type === 'boot') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(220, now);
        osc.frequency.exponentialRampToValueAtTime(880, now + 0.3);
        gain.gain.setValueAtTime(0.08, now);
        gain.gain.linearRampToValueAtTime(0, now + 0.3);
        osc.start(now);
        osc.stop(now + 0.3);
      }
    } catch (e) {}
  },

  toggleAudio() {
    this.audioEnabled = !this.audioEnabled;
    const onIcon = document.getElementById('sound-icon-on');
    const offIcon = document.getElementById('sound-icon-off');
    if (onIcon) onIcon.style.display = this.audioEnabled ? 'block' : 'none';
    if (offIcon) offIcon.style.display = this.audioEnabled ? 'none' : 'block';

    this.showToast(this.audioEnabled ? "Audio Synthesizer: ENABLED" : "Audio Synthesizer: MUTED");
    if (this.audioEnabled) this.playSound('click');
  },

  /* Tab Switching */
  switchTab(tabId, btn) {
    this.playSound('click');
    document.querySelectorAll('.nav-tab').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.tab-pane').forEach(p => p.classList.remove('active'));

    btn.classList.add('active');
    const pane = document.getElementById(`pane-${tabId}`);
    if (pane) pane.classList.add('active');

    if (tabId === 'terminal') {
      setTimeout(() => document.getElementById('term-input')?.focus(), 100);
    } else if (tabId === 'attributes') {
      TesterProfile.render();
    } else if (tabId === 'leaderboard') {
      Leaderboard.render();
    }
  },

  /* VPN Synchronization */
  async syncVPN() {
    try {
      const res = await API.getVPNStatus();
      if (res.ok && res.data) {
        this.updateVPNUI(res.data.active, res.data.ip);
      }
    } catch (e) {}
  },

  async toggleVPN() {
    this.playSound('click');
    try {
      const res = await API.toggleVPN();
      if (res.ok && res.data) {
        this.updateVPNUI(res.data.active, res.data.ip);
        this.showToast(res.data.message);
      }
    } catch (e) {
      this.showToast("Failed to communicate with VPN gateway", true);
    }
  },

  updateVPNUI(active, ip) {
    const btn = document.getElementById('vpn-toggle-btn');
    const txt = document.getElementById('vpn-status-text');
    if (!btn || !txt) return;

    if (active) {
      btn.classList.remove('disconnected');
      txt.innerText = `${ip} [tun0]`;
    } else {
      btn.classList.add('disconnected');
      txt.innerText = "OFFLINE [Click to Connect]";
    }
  },

  /* Toast Notification */
  showToast(msg, isError = false) {
    const toast = document.getElementById('toast-notification');
    const text = document.getElementById('toast-message');
    if (!toast || !text) return;

    if (window.toastTimeout) clearTimeout(window.toastTimeout);

    text.innerText = msg;
    if (isError) {
      toast.style.borderColor = "var(--accent-red)";
      toast.style.boxShadow = "0 10px 30px rgba(0,0,0,0.8), 0 0 20px rgba(239, 68, 68, 0.4)";
    } else {
      toast.style.borderColor = "var(--neon-emerald)";
      toast.style.boxShadow = "0 10px 30px rgba(0,0,0,0.8), 0 0 20px var(--neon-glow)";
    }

    toast.classList.add('show');
    window.toastTimeout = setTimeout(() => {
      toast.classList.remove('show');
    }, 3500);
  },

  /* Matrix Rain Canvas */
  initMatrix() {
    const canvas = document.getElementById('matrix-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    function resize() {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    }
    window.addEventListener('resize', resize);
    resize();

    const chars = "01アイウエオカキクケコサシスセソタチツテトナニヌネハヒフヘホマミムメモヤユラリルレワヲンABCDEF<>{}/*+-~$#%";
    const fontSize = 14;
    let columns = Math.floor(canvas.width / fontSize);
    let drops = Array(columns).fill(1);

    function draw() {
      ctx.fillStyle = "rgba(5, 8, 17, 0.08)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = "#10b981";
      ctx.font = `${fontSize}px monospace`;

      for (let i = 0; i < drops.length; i++) {
        const char = chars[Math.floor(Math.random() * chars.length)];
        ctx.fillText(char, i * fontSize, drops[i] * fontSize);

        if (drops[i] * fontSize > canvas.height && Math.random() > 0.975) {
          drops[i] = 0;
        }
        drops[i]++;
      }
    }

    window.startMatrixAnimation = () => {
      if (window.matrixInterval) clearInterval(window.matrixInterval);
      window.matrixInterval = setInterval(draw, 33);
    };

    window.startMatrixAnimation();
  },

  generateAuditCertificate() {
    this.playSound('success');
    const win = window.open('', '_blank');
    const user = Auth.currentUser || { displayName: 'Avinav Singhal', username: 'Avinav Singhal' };
    win.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Penetration Testing Authorization Attestation</title>
        <style>
          body { font-family: monospace; padding: 40px; background: #0f172a; color: #f8fafc; line-height: 1.6; }
          .box { border: 2px solid #10b981; padding: 30px; border-radius: 8px; max-width: 800px; margin: 0 auto; box-shadow: 0 0 25px rgba(16,185,129,0.3); }
          h1 { color: #10b981; border-bottom: 1px solid #10b981; padding-bottom: 10px; margin-bottom: 20px; }
          .badge { background: rgba(16,185,129,0.2); padding: 4px 8px; border-radius: 4px; color: #34d399; }
        </style>
      </head>
      <body>
        <div class="box">
          <h1>CERTIFICATE OF AUTHORIZED PENTEST ENGAGEMENT</h1>
          <p><strong>SUBJECT:</strong> Academic Practical Cyber Security Lab Assessment</p>
          <p><strong>OPERATIVE IDENTITY:</strong> ${user.displayName || user.username} (Lead Penetration Tester)</p>
          <p><strong>ASSIGNED VPN LEASE:</strong> 10.10.14.33 (tun0 - Virtual Penetration Lab)</p>
          <p><strong>AUTHORIZED SCOPE:</strong> Subnet <code>10.10.110.0/24</code> (Machines 1 through 8)</p>
          <p><strong>ENGAGEMENT PROTOCOL:</strong> OWASP Top 10 • PTES Methodology • Ethical Hacking Rules of Engagement</p>
          <hr style="border-color:#1e293b; margin:20px 0;">
          <p><strong>STATUS:</strong> <span class="badge">FULLY AUTHORIZED & ACTIVE</span></p>
          <p><strong>CRYPTOGRAPHIC AUDIT SEAL:</strong> SHA256: 8a7c93e410b981df9882a17cb420f172a884</p>
          <br>
          <button onclick="window.print()" style="background:#10b981; color:#04140e; border:none; padding:10px 20px; font-weight:bold; cursor:pointer; border-radius:4px;">PRINT / SAVE PDF</button>
        </div>
      </body>
      </html>
    `);
    win.document.close();
  }
};

window.addEventListener('DOMContentLoaded', () => {
  App.init();
});

