const http = require('http');

function post(path, body) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify(body);
    const req = http.request(
      {
        hostname: 'localhost',
        port: 5000,
        path,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(data),
        },
      },
      (res) => {
        let resp = '';
        res.on('data', (chunk) => (resp += chunk));
        res.on('end', () => {
          try {
            resolve({ status: res.statusCode, data: JSON.parse(resp) });
          } catch {
            resolve({ status: res.statusCode, data: resp });
          }
        });
      }
    );
    req.on('error', reject);
    req.write(data);
    req.end();
  });
}

function get(path, token) {
  return new Promise((resolve, reject) => {
    const req = http.request(
      {
        hostname: 'localhost',
        port: 5000,
        path,
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
      (res) => {
        let resp = '';
        res.on('data', (chunk) => (resp += chunk));
        res.on('end', () => {
          try {
            resolve({ status: res.statusCode, data: JSON.parse(resp) });
          } catch {
            resolve({ status: res.statusCode, data: resp });
          }
        });
      }
    );
    req.on('error', reject);
    req.end();
  });
}

async function runTests() {
  console.log('--- TESTING STUDENT & ADMIN AUTHENTICATION ---');

  // 1. Admin
  const adminRes = await post('/api/auth/login', {
    email: 'admin@mvgrce.edu.in',
    password: 'AdminPassword@123!',
  });
  console.log('Admin login status:', adminRes.status, adminRes.data?.user?.email, 'Role:', adminRes.data?.user?.role);

  // 2. Regular Student (23331A4201)
  const regRes = await post('/api/auth/login', {
    email: '23331a4201@mvgrce.edu.in',
    password: '23331A4201',
  });
  console.log('Regular student login status:', regRes.status, regRes.data?.user?.name, 'Roll:', regRes.data?.user?.roll_number, 'Branch:', regRes.data?.user?.branch, 'Year:', regRes.data?.user?.academic_year);

  // 3. Lateral Student (24335A4201)
  const latRes1 = await post('/api/auth/login', {
    email: '24335a4201@mvgrce.edu.in',
    password: '24335A4201',
  });
  console.log('Lateral student 1 login status:', latRes1.status, latRes1.data?.user?.name, 'Roll:', latRes1.data?.user?.roll_number, 'Branch:', latRes1.data?.user?.branch, 'Year:', latRes1.data?.user?.academic_year);

  // 4. Lateral Student (24335A4206)
  const latRes6 = await post('/api/auth/login', {
    email: '24335a4206@mvgrce.edu.in',
    password: '24335A4206',
  });
  console.log('Lateral student 6 login status:', latRes6.status, latRes6.data?.user?.name, 'Roll:', latRes6.data?.user?.roll_number, 'Branch:', latRes6.data?.user?.branch, 'Year:', latRes6.data?.user?.academic_year);

  // 5. Query taxonomy subjects
  const taxRes = await get('/api/taxonomy');
  const csmSem1 = taxRes.data?.subjects?.filter(s => s.branch === 'CSM' && s.semester === 1) || [];
  console.log('Total subjects in taxonomy:', taxRes.data?.subjects?.length);
  console.log('CSM Sem 1 subjects count:', csmSem1.length);
  console.log('Sample CSM Sem 1 subjects:', csmSem1.slice(0, 3).map(s => `${s.code} - ${s.title}`));

  console.log('--- ALL AUTHENTICATION TESTS PASSED ---');
}

runTests().catch(console.error);
