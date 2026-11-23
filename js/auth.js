/**
 * CYBER_RANGE // Authentication & Session Management
 */
const Auth = {
  currentUser: null,

  init() {
    // Quick fill credentials handler
    const quickFillBtn = document.getElementById('quick-fill-btn');
    if (quickFillBtn) {
      quickFillBtn.addEventListener('click', () => {
        const u = document.getElementById('login-username');
        const p = document.getElementById('login-password');
        if (u) u.value = "Avinav Singhal";
        if (p) p.value = "cyber123";
        App.playSound('click');
        App.showToast("Credentials auto-filled: Ready to Authenticate");
      });
    }

    // Login form submit
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
      loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        this.handleLogin();
      });
    }

    // Always require login on page load so examiner sees login gateway first
    // To enable auto-login persistence: this.checkSession();
  },

  async checkSession() {
    try {
      const res = await API.getSession();
      if (res.ok && res.data && res.data.authenticated && res.data.user) {
        this.onLoginSuccess(res.data.user, false);
      }
    } catch (e) {
      console.warn("Session check fallback:", e);
    }
  },

  async handleLogin() {
    const uInput = document.getElementById('login-username');
    const pInput = document.getElementById('login-password');
    const errDiv = document.getElementById('login-error');
    const errMsg = document.getElementById('login-error-msg');
    const submitBtn = document.getElementById('login-submit-btn');

    const username = (uInput?.value || '').trim();
    const password = (pInput?.value || '').trim();

    if (!username || !password) {
      if (errDiv) errDiv.style.display = 'flex';
      if (errMsg) errMsg.innerText = 'Please provide both username and access clearance key.';
      App.playSound('error');
      return;
    }

    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.innerText = 'AUTHENTICATING...';
    }

    try {
      const res = await API.login(username, password);

      if (res.ok && res.data && res.data.success) {
        if (errDiv) errDiv.style.display = 'none';
        App.playSound('boot');
        this.onLoginSuccess(res.data.user, true);
      } else {
        App.playSound('error');
        if (errDiv) errDiv.style.display = 'flex';
        if (errMsg) errMsg.innerText = res.data?.message || 'Access Denied: Invalid Security Credentials.';
      }
    } catch (err) {
      App.playSound('error');
      if (errDiv) errDiv.style.display = 'flex';
      if (errMsg) errMsg.innerText = 'Connection error: Unable to reach backend authentication gateway.';
    } finally {
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.innerHTML = `
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"></path><polyline points="10 17 15 12 10 7"></polyline><line x1="15" y1="12" x2="3" y2="12"></line></svg>
          AUTHENTICATE SESSION
        `;
      }
    }
  },

  onLoginSuccess(user, isNewLogin = true) {
    this.currentUser = user;

    const authView = document.getElementById('auth-view');
    const dashView = document.getElementById('dashboard-view');

    if (authView) authView.style.display = 'none';
    if (dashView) dashView.style.display = 'flex';

    // Stop matrix rain animation to save CPU
    if (window.matrixInterval) {
      clearInterval(window.matrixInterval);
    }

    // Update header profile display
    const nameEl = document.getElementById('user-display-name');
    const avatarEl = document.getElementById('user-avatar-initials');
    if (nameEl) nameEl.innerText = user.displayName || user.username;
    if (avatarEl) {
      const initials = (user.displayName || user.username)
        .split(' ')
        .map(n => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);
      avatarEl.innerText = initials || 'AS';
    }

    // Initialize all app modules
    App.initDashboard();

    if (isNewLogin) {
      App.showToast(`Cleared for Access: Welcome operative ${user.displayName || user.username}`);
    }
  },

  async handleLogout() {
    App.playSound('click');
    if (confirm("Confirm Logout: Terminate active VPN tunnel and lock session?")) {
      try {
        await API.logout();
      } catch (e) {}

      this.currentUser = null;
      const dashView = document.getElementById('dashboard-view');
      const authView = document.getElementById('auth-view');

      if (dashView) dashView.style.display = 'none';
      if (authView) authView.style.display = 'flex';

      // Resume matrix animation
      if (typeof window.startMatrixAnimation === 'function') {
        window.startMatrixAnimation();
      }

      App.showToast("Session safely terminated. Cryptographic keys cleared.");
    }
  }
};

