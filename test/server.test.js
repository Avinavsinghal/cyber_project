const http = require('http');
const { app, server } = require('../server/server');

const PORT = 3000;

function request(path, options = {}) {
  return new Promise((resolve, reject) => {
    const req = http.request(`http://localhost:${PORT}${path}`, {
      method: options.method || 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...(options.headers || {})
      }
    }, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try {
          const parsed = JSON.parse(body);
          resolve({ status: res.statusCode, headers: res.headers, body: parsed });
        } catch (e) {
          resolve({ status: res.statusCode, headers: res.headers, body });
        }
      });
    });

    req.on('error', reject);
    if (options.body) {
      req.write(typeof options.body === 'string' ? options.body : JSON.stringify(options.body));
    }
    req.end();
  });
}

async function runTests() {
  console.log('[+] Starting Full-Stack Penetration Testing Platform Verification Tests...\n');
  let passed = 0;
  let failed = 0;

  function assert(condition, testName) {
    if (condition) {
      console.log(`  ✓ PASS: ${testName}`);
      passed++;
    } else {
      console.error(`  ✗ FAIL: ${testName}`);
      failed++;
    }
  }

  try {
    // 1. Health check
    const health = await request('/api/health');
    assert(health.status === 200 && health.body.status === 'ONLINE', 'Health check returns 200 ONLINE');

    // 2. Auth: Invalid Login
    const invalidLogin = await request('/api/auth/login', {
      method: 'POST',
      body: { username: 'attacker', password: 'wrongpassword' }
    });
    assert(invalidLogin.status === 401 && invalidLogin.body.success === false, 'Invalid login credentials rejected with 401');

    // 3. Auth: Valid Login
    const validLogin = await request('/api/auth/login', {
      method: 'POST',
      body: { username: 'Avinav Singhal', password: 'cyber123' }
    });
    assert(validLogin.status === 200 && validLogin.body.success === true, 'Valid operative login returns 200');
    assert(validLogin.body.token && validLogin.body.user.role.includes('Penetration Tester'), 'Login provides secure token and role');
    const token = validLogin.body.token;

    // 4. Auth: Session check (/api/auth/me)
    const session = await request('/api/auth/me', {
      headers: { 'Authorization': token }
    });
    assert(session.body.authenticated === true && session.body.user.username === 'Avinav Singhal', 'Session /me verifies token');

    // 5. Penetration Tester Profile & Attributes
    const profile = await request('/api/tester/profile');
    assert(profile.status === 200 && profile.body.profile.attributes.webSecurity === 96, 'Tester profile returns attributes (Web 96%)');
    assert(profile.body.profile.certifications.length >= 4, 'Tester profile returns verified certifications (OSCP, CEH, etc.)');

    // 6. Labs Listing
    const labsRes = await request('/api/labs');
    assert(labsRes.status === 200 && labsRes.body.labs.length === 8, 'Labs endpoint returns all 8 target machines');

    // 7. Lab 1 SQLi exploit
    const sqli = await request('/api/labs/1/sqli', {
      method: 'POST',
      body: { username: "' OR '1'='1' --", password: "xyz" }
    });
    assert(sqli.body.success === true && sqli.body.flag.includes('FLAG{sql_'), 'SQLi backend simulation yields flag');

    // 8. Lab 2 RCE exploit
    const rce = await request('/api/labs/2/rce', {
      method: 'POST',
      body: { ip: "127.0.0.1; cat flag.txt" }
    });
    assert(rce.body.flag && rce.body.flag.includes('FLAG{rce_'), 'Command injection yields flag');

    // 9. Flag Submission Engine
    const flagSubmit = await request('/api/flags/submit', {
      method: 'POST',
      body: { flag: "FLAG{sql_1nj3ct10n_byp4ss_m4st3r_2026}" }
    });
    assert(flagSubmit.status === 200, 'Flag submission processed by backend');

    // 10. Terminal execution
    const term = await request('/api/terminal/execute', {
      method: 'POST',
      body: { command: 'attribs', activeTargetId: 1 }
    });
    assert(term.body.output.includes('OPERATIVE ATTRIBUTES'), 'Terminal executes attribs command');

    // 11. Leaderboard
    const lb = await request('/api/leaderboard');
    assert(lb.body.rankings && lb.body.rankings.length >= 5, 'Leaderboard calculates live rankings');

    // 12. VPN toggle
    const vpn = await request('/api/vpn/toggle', { method: 'POST' });
    assert(vpn.body.success === true, 'VPN toggle succeeds');

    console.log(`\n========================================`);
    console.log(`Results: ${passed} Passed, ${failed} Failed`);
    console.log(`========================================\n`);

  } catch (err) {
    console.error('Test execution error:', err);
  } finally {
    server.close();
    process.exit(failed > 0 ? 1 : 0);
  }
}

runTests();

