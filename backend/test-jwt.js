const baseUrl = 'http://localhost:5000/api/auth';

async function test() {
  try {
    console.log('Testing Login to get Tokens...');
    const loginRes = await fetch(`${baseUrl}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        identifier: 'testu_123',
        password: 'password123'
      })
    });
    
    const loginData = await loginRes.json();
    console.log('Access Token received:', !!loginData.accessToken);
    
    // In fetch, Set-Cookie can be read from headers
    const cookies = loginRes.headers.get('set-cookie');
    console.log('Set-Cookie Header received:', !!cookies);

    console.log('\nTesting /refresh with Cookie...');
    const refreshRes = await fetch(`${baseUrl}/refresh`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': cookies ? cookies.split(';')[0] : '' // Extract just the cookie value for the new request
      }
    });

    const refreshData = await refreshRes.json();
    console.log('Refresh Status:', refreshRes.status);
    console.log('New Access Token received:', !!refreshData.accessToken);
    
  } catch(e) {
    console.error('Error in test script:', e);
  }
}

test();
