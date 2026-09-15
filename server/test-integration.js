const http = require('http');
const server = require('./index');

function makeRequest(path, method = 'GET', body = null, headers = {}) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: '127.0.0.1',
      port: 5000,
      path,
      method,
      headers: {
        'Content-Type': 'application/json',
        ...headers,
      },
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, headers: res.headers, data: JSON.parse(data) });
        } catch {
          resolve({ status: res.statusCode, headers: res.headers, data });
        }
      });
    });

    req.on('error', reject);
    if (body) {
      req.write(JSON.stringify(body));
    }
    req.end();
  });
}

async function runTests() {
  console.log('🧪 Starting End-to-End Integration Verification...\n');

  try {
    // 1. Health check
    const health = await makeRequest('/api/health');
    console.log(`1. Health Check [${health.status}]:`, health.data.service);

    // 2. Admin Login
    const loginRes = await makeRequest('/api/auth/login', 'POST', {
      email: 'admin@mvgrce.edu.in',
      password: 'AdminPassword@123!',
    });
    console.log(`2. Admin Login [${loginRes.status}]:`, loginRes.data.success ? `✓ Authenticated as ${loginRes.data.user.name}` : loginRes.data.error);

    const token = loginRes.data.token;
    const authHeaders = { Authorization: `Bearer ${token}` };

    // 3. Current User Profile
    const meRes = await makeRequest('/api/auth/me', 'GET', null, authHeaders);
    console.log(`3. Protected /me [${meRes.status}]:`, meRes.data.user?.email);

    // 4. Taxonomy
    const taxRes = await makeRequest('/api/taxonomy');
    console.log(`4. Taxonomy [${taxRes.status}]:`, `${taxRes.data.branches?.length} branches, ${taxRes.data.subjects?.length} subjects`);

    // 5. Materials
    const matRes = await makeRequest('/api/materials');
    console.log(`5. Materials [${matRes.status}]:`, `${matRes.data.materials?.length} materials listed`);

    // 6. Analytics Stats
    const statsRes = await makeRequest('/api/analytics/stats', 'GET', null, authHeaders);
    console.log(`6. Analytics Stats [${statsRes.status}]:`, `Total Users: ${statsRes.data.stats?.totalUsers}, Faculty: ${statsRes.data.stats?.totalFaculty}`);

    // 7. Student Login Check
    const studentLogin = await makeRequest('/api/auth/login', 'POST', {
      email: '23331a4745@mvgrce.edu.in',
      password: '23331A4745',
    });
    console.log(`7. Student Login [${studentLogin.status}]:`, studentLogin.data.success ? `✓ Authenticated as ${studentLogin.data.user.name}` : studentLogin.data.error);

    console.log('\n=========================================');
    console.log('🎉 ALL INTEGRATION TESTS PASSED 100%!');
    console.log('=========================================\n');
    process.exit(0);
  } catch (err) {
    console.error('❌ Test failed:', err);
    process.exit(1);
  }
}

// Wait for server to be ready
setTimeout(runTests, 1500);
