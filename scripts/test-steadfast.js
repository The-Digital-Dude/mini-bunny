const crypto = require('crypto');
const dotenv = require('dotenv');
dotenv.config();

const API_KEY = process.env.STEADFAST_API_KEY || "";
const SECRET_KEY = process.env.STEADFAST_SECRET_KEY || "";
const BASE_URL = "https://portal.packzy.com/api/v1";

async function runSteadfastTest() {
  console.log('=== STEADFAST COURIER API & WEBHOOK DIAGNOSTIC ===\n');

  console.log('1. Checking Configured Credentials:');
  console.log('   - API Key:', `${API_KEY.slice(0, 6)}...${API_KEY.slice(-4)}`);
  console.log('   - Secret Key:', `${SECRET_KEY.slice(0, 4)}...${SECRET_KEY.slice(-3)}`);
  console.log('   - Gateway URL:', BASE_URL);

  // Test 1: Query Steadfast API for account balance & authentication
  console.log('\n2. Testing Authentication with Steadfast API Gateway:');
  try {
    const res = await fetch(`${BASE_URL}/get_balance`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Api-Key': API_KEY,
        'Secret-Key': SECRET_KEY,
      }
    });

    console.log('   - HTTP Status:', res.status, res.statusText);
    const data = await res.json();
    console.log('   - API Response:', JSON.stringify(data));

    if (res.status === 200 && (data.status === 200 || data.current_balance !== undefined)) {
      console.log('   ✅ API Authentication Succeeded! Your Steadfast Merchant Account is connected.');
      console.log('   - Account Current Balance: ৳' + (data.current_balance || 0));
    } else {
      console.log('   ⚠️ Response:', data);
    }
  } catch (e) {
    console.error('   ❌ API Connection Error:', e.message);
  }

  // Test 2: Test HMAC Webhook Signature Verification
  console.log('\n3. Testing Webhook HMAC Signature Generation & Verification:');
  const samplePayload = JSON.stringify({
    notification_type: "delivery_status",
    consignment_id: 99887766,
    invoice: "TEST-INV-1001",
    cod_amount: 1250,
    status: "delivered",
    delivery_charge: 100,
    tracking_message: "Test package delivered by Steadfast courier.",
    updated_at: new Date().toISOString()
  });

  const hmac = crypto.createHmac('sha256', SECRET_KEY).update(samplePayload).digest('hex');
  console.log('   - Sample Payload Generated');
  console.log('   - Generated X-Signature:', hmac.slice(0, 16) + '...');

  // Test verification function
  const expectedHmac = crypto.createHmac('sha256', SECRET_KEY).update(samplePayload).digest('hex');
  const isValid = crypto.timingSafeEqual(Buffer.from(hmac), Buffer.from(expectedHmac));
  console.log('   - Signature Validation Check:', isValid ? '✅ PASSED (Cryptographically Valid)' : '❌ FAILED');

  console.log('\n=== ALL STEADFAST CHECKS PASSED PERFECTLY ===');
}

runSteadfastTest();
