/**
 * CYBER_RANGE // Penetration Tester Profile & Attributes View
 */
const TesterProfile = {
  async render() {
    const container = document.getElementById('tester-profile-content');
    if (!container) return;

    try {
      const res = await API.getTesterProfile();
      if (!res.ok || !res.data?.success) {
        container.innerHTML = `<div class="term-out danger">Failed to fetch penetration tester attributes.</div>`;
        return;
      }

      const p = res.data.profile;
      const attrs = p.attributes || {};

      container.innerHTML = `
        <div class="tester-dashboard-grid">
          <!-- Operative Sidebar Badge -->
          <div class="tester-sidebar-card">
            <div class="profile-avatar-wrap">
              <div class="profile-avatar-large">
                ${(p.displayName || p.username).split(' ').map(n => n[0]).join('').slice(0, 2)}
              </div>
              <div class="profile-name">${p.displayName || p.username}</div>
              <div class="profile-role">${p.role}</div>
              <div class="profile-tag">${p.clearance}</div>
            </div>

            <div class="info-list">
              <div class="info-item">
                <span class="info-label">CALLSIGN</span>
                <span class="info-val">${p.callsign || 'SPECTRE-01'}</span>
              </div>
              <div class="info-item">
                <span class="info-label">INTERFACE</span>
                <span class="info-val" style="color:var(--emerald-light)">${p.vpnIp} [tun0]</span>
              </div>
              <div class="info-item">
                <span class="info-label">TARGETS PWNED</span>
                <span class="info-val" style="color:var(--emerald-primary)">${p.stats.targetsCompromised} / ${p.stats.totalTargets}</span>
              </div>
              <div class="info-item">
                <span class="info-label">SCORE ACCUMULATED</span>
                <span class="info-val">${p.stats.score.toLocaleString()} PTS</span>
              </div>
              <div class="info-item">
                <span class="info-label">COMPLETION</span>
                <span class="info-val" style="color:var(--accent-amber)">${p.stats.completionPercentage}%</span>
              </div>
            </div>

            <div style="padding-top:1rem; border-top:1px solid var(--border-subtle)">
              <div style="font-family:var(--font-mono); font-size:0.7rem; color:var(--text-dim); text-transform:uppercase; margin-bottom:0.5rem">
                ACTIVE TOOLSET
              </div>
              <div class="toolset-chips">
                ${(p.toolset || []).map(t => `<span class="tool-chip">${t}</span>`).join('')}
              </div>
            </div>
          </div>

          <!-- Attributes, Certifications & Audit Trail -->
          <div style="display:flex; flex-direction:column; gap:1.25rem;">
            <!-- Core Attributes Matrix -->
            <div class="attribute-matrix-card">
              <div class="attribute-matrix-title">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--emerald-primary)" stroke-width="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline></svg>
                TECHNICAL ATTRIBUTES & PROFICIENCY MATRIX
              </div>

              <div class="attribute-grid">
                ${this.renderAttr('Web App Pentesting', attrs.webSecurity || 96)}
                ${this.renderAttr('Linux / Windows PrivEsc', attrs.privilegeEscalation || 92)}
                ${this.renderAttr('Cloud & AWS Security', attrs.cloudPentesting || 88)}
                ${this.renderAttr('Network Recon & Ports', attrs.networkEnumeration || 94)}
                ${this.renderAttr('API & JWT Exploitation', attrs.apiSecurity || 90)}
                ${this.renderAttr('Binary Exploitation & SUID', attrs.binaryExploitation || 82)}
              </div>
            </div>

            <!-- Verified Certifications -->
            <div class="attribute-matrix-card">
              <div class="attribute-matrix-title">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--emerald-primary)" stroke-width="2"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"></path></svg>
                VERIFIED PROFESSIONAL CREDENTIALS
              </div>

              <div class="cert-badges-grid">
                ${(p.certifications || []).map(c => `
                  <div class="cert-badge">
                    <div style="display:flex; justify-content:space-between; align-items:center;">
                      <span class="cert-code">${c.code}</span>
                      <span class="scope-badge-yes">${c.status}</span>
                    </div>
                    <div class="cert-name">${c.name}</div>
                    <div class="cert-issuer">${c.issuer}</div>
                  </div>
                `).join('')}
              </div>
            </div>

            <!-- Audit Trail -->
            <div class="attribute-matrix-card">
              <div class="attribute-matrix-title">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--emerald-primary)" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 14 14"></polyline></svg>
                SESSION ENGAGEMENT AUDIT TRAIL
              </div>

              <div style="display:flex; flex-direction:column; gap:0.4rem; max-height:160px; overflow-y:auto; font-family:var(--font-mono); font-size:0.75rem;">
                ${(p.auditLogs || []).map(log => `
                  <div style="display:flex; justify-content:space-between; padding:0.45rem 0.65rem; background:#080b12; border-radius:4px; border:1px solid var(--border-subtle)">
                    <div>
                      <span style="color:var(--emerald-light)">[${log.action}]</span>
                      <span style="color:#cbd5e1; margin-left:6px">${log.detail}</span>
                    </div>
                    <span style="color:var(--text-dim); font-size:0.68rem">${new Date(log.timestamp).toLocaleTimeString()}</span>
                  </div>
                `).join('')}
              </div>
            </div>
          </div>
        </div>
      `;
    } catch (e) {
      console.error("Profile error:", e);
    }
  },

  renderAttr(name, val) {
    return `
      <div class="attr-item">
        <div class="attr-header">
          <span class="attr-name">${name}</span>
          <span class="attr-val">${val}%</span>
        </div>
        <div class="attr-track">
          <div class="attr-fill" style="width: ${val}%;"></div>
        </div>
      </div>
    `;
  }
};
