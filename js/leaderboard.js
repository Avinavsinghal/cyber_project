/**
 * CYBER_RANGE // Dynamic CTF Hall of Fame & Leaderboard
 */
const Leaderboard = {
  async render() {
    const podium = document.getElementById('podium-cards-container');
    const tbody = document.getElementById('leaderboard-body');
    if (!podium || !tbody) return;

    try {
      const res = await API.getLeaderboard();
      if (!res.ok || !res.data?.rankings) return;

      const rankings = res.data.rankings;
      const totalLabs = res.data.totalLabs || 8;

      // Render Top 3 Podium
      if (rankings.length >= 3) {
        podium.innerHTML = `
          <div class="podium-card second">
            <div class="podium-medal">🥈</div>
            <div class="podium-name">${rankings[1].name} ${rankings[1].isCurrentUser ? '<span class="user-badge-pill">YOU</span>' : ''}</div>
            <div class="podium-score">${rankings[1].score.toLocaleString()} PTS</div>
            <div style="font-size:0.75rem; color:var(--text-muted); font-family:var(--font-mono); margin-top:4px;">${rankings[1].badge}</div>
          </div>

          <div class="podium-card first">
            <div class="podium-medal">👑</div>
            <div class="podium-name">${rankings[0].name} ${rankings[0].isCurrentUser ? '<span class="user-badge-pill">YOU</span>' : ''}</div>
            <div class="podium-score">${rankings[0].score.toLocaleString()} PTS</div>
            <div style="font-size:0.75rem; color:#f59e0b; font-family:var(--font-mono); margin-top:4px;">${rankings[0].badge}</div>
          </div>

          <div class="podium-card third">
            <div class="podium-medal">🥉</div>
            <div class="podium-name">${rankings[2].name} ${rankings[2].isCurrentUser ? '<span class="user-badge-pill">YOU</span>' : ''}</div>
            <div class="podium-score">${rankings[2].score.toLocaleString()} PTS</div>
            <div style="font-size:0.75rem; color:var(--text-muted); font-family:var(--font-mono); margin-top:4px;">${rankings[2].badge}</div>
          </div>
        `;
      }

      // Render Full Table
      tbody.innerHTML = '';
      rankings.forEach((player, idx) => {
        const row = document.createElement('tr');
        if (player.isCurrentUser) row.className = 'user-row';

        const rankDisplay = idx === 0 ? '🥇 #1' : idx === 1 ? '🥈 #2' : idx === 2 ? '🥉 #3' : `#${idx + 1}`;

        row.innerHTML = `
          <td><span class="rank-cell">${rankDisplay}</span></td>
          <td><strong>${player.name}</strong> ${player.isCurrentUser ? '<span class="user-badge-pill">YOU</span>' : ''}</td>
          <td>${player.badge}</td>
          <td>${player.flags} / ${totalLabs} Flags</td>
          <td><span style="color:${player.isCurrentUser ? 'var(--neon-emerald)' : 'var(--text-dim)'}">● ${player.status}</span></td>
          <td style="text-align: right; font-weight: bold; color: var(--emerald-light);">${player.score.toLocaleString()} PTS</td>
        `;

        tbody.appendChild(row);
      });
    } catch (e) {
      console.error("Leaderboard render error:", e);
    }
  }
};

