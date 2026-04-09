const baseUrl = 'http://localhost:5000/api/auth';

async function test() {
  console.log('Testing Register...');
  const regRes = await fetch(`${baseUrl}/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      username: 'testu_123',
      email: 'testu_123@example.com',
      password: 'password123'
    })
  });
  const regData = await regRes.json();
  console.log('Register Status:', regRes.status);
  console.log('Register Response:', regData);

  console.log('\nTesting Login...');
  const loginRes = await fetch(`${baseUrl}/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      identifier: 'testu_123',
      password: 'password123'
    })
  });
  const loginData = await loginRes.json();
  console.log('Login Status:', loginRes.status);
  console.log('Login Response:', loginData);
}

test();
