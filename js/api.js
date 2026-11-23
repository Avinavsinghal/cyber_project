/**
 * CYBER_RANGE // Client-Side REST API Client
 */
const API = {
  baseUrl: (typeof window !== 'undefined' && window.location.protocol === 'file:') ? 'http://localhost:3000' : '',

  async request(endpoint, options = {}) {
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...(options.headers || {})
      },
      ...options
    };

    if (config.body && typeof config.body === 'object') {
      config.body = JSON.stringify(config.body);
    }

    try {
      const res = await fetch(`${this.baseUrl}${endpoint}`, config);
      const data = await res.json();
      return { ok: res.ok, status: res.status, data };
    } catch (err) {
      console.warn(`[API] Failed to reach ${endpoint}:`, err);
      return { ok: false, status: 0, error: err.message };
    }
  },

  // Auth endpoints
  async login(username, password) {
    return this.request('/api/auth/login', {
      method: 'POST',
      body: { username, password }
    });
  },

  async getSession() {
    return this.request('/api/auth/me', { method: 'GET' });
  },

  async logout() {
    return this.request('/api/auth/logout', { method: 'POST' });
  },

  // Tester Profile & Attributes
  async getTesterProfile() {
    return this.request('/api/tester/profile', { method: 'GET' });
  },

  async tuneAttribute(attribute, delta) {
    return this.request('/api/tester/attributes/tune', {
      method: 'POST',
      body: { attribute, delta }
    });
  },

  // Labs endpoints
  async getLabs() {
    return this.request('/api/labs', { method: 'GET' });
  },

  async getLab(id) {
    return this.request(`/api/labs/${id}`, { method: 'GET' });
  },

  async testLabExploit(labId, payload) {
    switch (labId) {
      case 1:
        return this.request('/api/labs/1/sqli', { method: 'POST', body: payload });
      case 2:
        return this.request('/api/labs/2/rce', { method: 'POST', body: payload });
      case 3:
        return this.request('/api/labs/3/xss', { method: 'POST', body: payload });
      case 4:
        return this.request('/api/labs/4/jwt', { method: 'POST', body: payload });
      case 5:
        return this.request(`/api/labs/5/s3?file=${encodeURIComponent(payload.file || '')}`, { method: 'GET' });
      case 6:
        return this.request('/api/labs/6/lfi', { method: 'POST', body: payload });
      case 7:
        return this.request('/api/labs/7/ssrf', { method: 'POST', body: payload });
      case 8:
        return this.request('/api/labs/8/suid', { method: 'POST', body: payload });
      default:
        return { ok: false, error: 'Unknown lab ID' };
    }
  },

  // Terminal Command Execution
  async executeCommand(command, activeTargetId) {
    return this.request('/api/terminal/execute', {
      method: 'POST',
      body: { command, activeTargetId }
    });
  },

  // Flag Submission
  async submitFlag(flag) {
    return this.request('/api/flags/submit', {
      method: 'POST',
      body: { flag }
    });
  },

  // Leaderboard
  async getLeaderboard() {
    return this.request('/api/leaderboard', { method: 'GET' });
  },

  // VPN
  async toggleVPN() {
    return this.request('/api/vpn/toggle', { method: 'POST' });
  },

  async getVPNStatus() {
    return this.request('/api/vpn/status', { method: 'GET' });
  }
};
