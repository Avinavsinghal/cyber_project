/**
 * CYBER_RANGE // Kali Attack Console (PwnBox Interactive CLI)
 */
const Terminal = {
  commandHistory: [],
  historyIndex: -1,

  init() {
    const input = document.getElementById('term-input');
    if (!input) return;

    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        const cmd = input.value.trim();
        if (cmd) {
          this.commandHistory.push(cmd);
          this.historyIndex = this.commandHistory.length;
          this.runCommand(cmd);
          input.value = '';
        }
      } else if (e.key === 'ArrowUp') {
        if (this.commandHistory.length > 0 && this.historyIndex > 0) {
          this.historyIndex--;
          input.value = this.commandHistory[this.historyIndex];
        }
      } else if (e.key === 'ArrowDown') {
        if (this.historyIndex < this.commandHistory.length - 1) {
          this.historyIndex++;
          input.value = this.commandHistory[this.historyIndex];
        } else {
          this.historyIndex = this.commandHistory.length;
          input.value = '';
        }
      } else if (e.key === 'Tab') {
        e.preventDefault();
        this.autocomplete();
      }
    });
  },

  async runCommand(rawCmd) {
    App.playSound('click');
    const output = document.getElementById('term-output');
    const promptLabel = document.getElementById('term-prompt-label')?.innerText || 'avinav@pwnbox:~$';

    this.printLine(`<span class="term-prompt">${promptLabel}</span> <span class="term-cmd">${this.escapeHtml(rawCmd)}</span>`);

    if (rawCmd.toLowerCase() === 'clear') {
      if (output) output.innerHTML = '';
      return;
    }

    try {
      const activeId = Labs.activeLabId || 1;
      const res = await API.executeCommand(rawCmd, activeId);

      if (res.ok && res.data) {
        if (res.data.clear) {
          if (output) output.innerHTML = '';
          return;
        }

        if (res.data.flagAccepted) {
          App.playSound('success');
          if (Auth.currentUser) Auth.currentUser.score = res.data.newScore;
          Labs.loadLabs();
          Leaderboard.render();
          TesterProfile.render();
        }

        if (res.data.newTarget) {
          Labs.selectTarget(res.data.newTarget.id, false);
        }

        const typeClass = res.data.success ? 'term-out' : 'term-out danger';
        this.printLine(`<div class="${typeClass}">${this.escapeHtml(res.data.output || '')}</div>`);
      } else {
        this.printLine(`<div class="term-out danger">[-] Server Error: Unable to execute command</div>`);
      }
    } catch (e) {
      this.printLine(`<div class="term-out danger">[-] Connection to Kali backend failed: ${e.message}</div>`);
    }
  },

  printLine(html) {
    const output = document.getElementById('term-output');
    if (!output) return;
    const line = document.createElement('div');
    line.className = 'term-line';
    line.innerHTML = html;
    output.appendChild(line);
    output.scrollTop = output.scrollHeight;
  },

  autocomplete() {
    const input = document.getElementById('term-input');
    if (!input) return;
    const current = input.value.toLowerCase().trim();
    const available = ['help', 'status', 'attribs', 'nmap', 'gobuster', 'exploit', 'cat flag.txt', 'clear', 'vpn', 'submit', 'targets', 'whoami', 'ping', 'curl'];
    const match = available.find(c => c.startsWith(current));
    if (match) {
      input.value = match;
    }
  },

  escapeHtml(str) {
    return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  }
};

