import { PrismaClient } from '@prisma/client';
const baseUrl = 'http://localhost:5000/api/auth';

async function test() {
  const prisma = new PrismaClient();
  try {
    console.log('Testing Login for MFA...');
    const loginRes = await fetch(`${baseUrl}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ identifier: 'testu_123', password: 'password123' })
    });
    
    const loginData = await loginRes.json();
    console.log('MFA Required:', loginData.mfaRequired);
    console.log('Email:', loginData.email);

    // Get OTP from DB since the email simulation is just logged to console
    const user = await prisma.usuario.findUnique({ where: { email: loginData.email }});
    const otpCode = user.otpCode;
    console.log('Extracted OTP Code from DB:', otpCode);

    console.log('\nTesting /verify-otp...');
    const verifyRes = await fetch(`${baseUrl}/verify-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: loginData.email, code: otpCode })
    });

    const verifyData = await verifyRes.json();
    console.log('Verify Status:', verifyRes.status);
    console.log('New Access Token received:', !!verifyData.accessToken);
    
  } catch(e) {
    console.error('Error in test script:', e);
  } finally {
    await prisma.$disconnect();
  }
}

test();
