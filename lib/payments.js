// Safaricom M-PESA Daraja Payment Integration Service
// ST-Tech ICT Consultants - Talanta Stadium Infrastructure

const MPESA_ENV = process.env.MPESA_ENVIRONMENT || 'sandbox';
const DARAJA_BASE_URL = MPESA_ENV === 'production'
  ? 'https://api.safaricom.co.ke'
  : 'https://sandbox.safaricom.co.ke';

const CONSUMER_KEY = process.env.MPESA_CONSUMER_KEY;
const CONSUMER_SECRET = process.env.MPESA_CONSUMER_SECRET;
const SHORTCODE = process.env.MPESA_SHORTCODE;
const PASSKEY = process.env.MPESA_PASSKEY;
const CALLBACK_URL = process.env.MPESA_CALLBACK_URL;

function assertMpesaConfiguration() {
  const values = [CONSUMER_KEY, CONSUMER_SECRET, SHORTCODE, PASSKEY, CALLBACK_URL];
  if (values.some((value) => !value || value.startsWith('your_'))) {
    throw new Error('M-PESA integration is disconnected: configure approved Daraja credentials and callback URL.');
  }
  if (process.env.MPESA_ENVIRONMENT === 'production' && !CALLBACK_URL.startsWith('https://')) {
    throw new Error('Production M-PESA callbacks must use HTTPS.');
  }
}

/**
 * Mask sensitive phone number for privacy logs (DPA 2019 compliance)
 */
export function maskPhoneNumber(phone) {
  if (!phone || phone.length < 8) return '2547****0000';
  return phone.slice(0, 4) + '****' + phone.slice(-4);
}

/**
 * Format Kenya phone number to 254XXXXXXXXX standard
 */
export function formatKenyaPhone(phone) {
  if (typeof phone !== 'string' || !phone.trim()) return '';
  let cleaned = phone.replace(/[^0-9]/g, '');
  if (cleaned.startsWith('0')) {
    cleaned = '254' + cleaned.substring(1);
  } else if (cleaned.startsWith('7') || cleaned.startsWith('1')) {
    cleaned = '254' + cleaned;
  } else if (cleaned.startsWith('254')) {
    // already formatted
  } else if (cleaned.length === 9) {
    cleaned = '254' + cleaned;
  }
  return /^254(?:7|1)\d{8}$/.test(cleaned) ? cleaned : '';
}

/**
 * Fetch OAuth Bearer Token from Safaricom Daraja API
 */
export async function getMpesaOAuthToken() {
  assertMpesaConfiguration();
  const authHeader = Buffer.from(`${CONSUMER_KEY}:${CONSUMER_SECRET}`).toString('base64');
  const tokenUrl = `${DARAJA_BASE_URL}/oauth/v1/generate?grant_type=client_credentials`;

  try {
    const response = await fetch(tokenUrl, {
      method: 'GET',
      headers: {
        Authorization: `Basic ${authHeader}`,
      },
    });

    if (!response.ok) throw new Error(`Daraja OAuth request failed with status ${response.status}.`);

    const data = await response.json();
    if (!data.access_token) throw new Error('Daraja OAuth response did not contain an access token.');
    return data.access_token;
  } catch (err) {
    throw new Error(`Daraja OAuth is unavailable: ${err.message}`);
  }
}

/**
 * Initiate LIPA NA M-PESA STK Push (CustomerPayBillOnline)
 */
export async function initiateMpesaSTKPush({ phoneNumber, amount, accountReference, orderRef }) {
  const formattedPhone = formatKenyaPhone(phoneNumber);
  if (!formattedPhone) return { success: false, message: 'Enter a valid Kenyan M-PESA phone number.' };
  if (!Number.isFinite(Number(amount)) || Number(amount) < 1) return { success: false, message: 'Payment amount is invalid.' };
  try { assertMpesaConfiguration(); }
  catch (err) { return { success: false, simulated: process.env.NODE_ENV !== 'production', message: err.message }; }
  const now = new Date();
  const timestamp = now.toISOString().replace(/[^0-9]/g, '').slice(0, 14);
  const password = Buffer.from(`${SHORTCODE}${PASSKEY}${timestamp}`).toString('base64');

  const stkPayload = {
    BusinessShortCode: SHORTCODE,
    Password: password,
    Timestamp: timestamp,
    TransactionType: 'CustomerPayBillOnline',
    Amount: Math.round(amount),
    PartyA: formattedPhone,
    PartyB: SHORTCODE,
    PhoneNumber: formattedPhone,
    CallBackURL: CALLBACK_URL,
    AccountReference: accountReference || 'TALANTA_TICKET',
    TransactionDesc: `Talanta Stadium Ticket Booking ${orderRef || ''}`,
  };

  try {
    const accessToken = await getMpesaOAuthToken();
    const stkUrl = `${DARAJA_BASE_URL}/mpesa/stkpush/v1/processrequest`;

    const darajaRes = await fetch(stkUrl, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(stkPayload),
    });

    const darajaData = await darajaRes.json();

    if (darajaRes.ok && darajaData.ResponseCode === '0' && darajaData.CheckoutRequestID && darajaData.MerchantRequestID) {
      return {
        success: true,
        merchantRequestId: darajaData.MerchantRequestID,
        checkoutRequestId: darajaData.CheckoutRequestID,
        responseCode: darajaData.ResponseCode,
        responseDescription: darajaData.ResponseDescription || 'Payment request accepted.',
        customerMessage: darajaData.CustomerMessage || `M-PESA payment request sent to ${maskPhoneNumber(formattedPhone)}.`,
      };
    } else {
      return { success: false, message: darajaData.CustomerMessage || darajaData.errorMessage || 'M-PESA did not accept the payment request.' };
    }
  } catch (err) {
    console.error('[M-PESA STK Push failed]', err.message);
    return { success: false, message: 'M-PESA payment initiation failed. No payment has been recorded.' };
  }
}

/**
 * Query STK Push Payment Status from Daraja API
 */
export async function queryMpesaSTKStatus({ checkoutRequestId }) {
  assertMpesaConfiguration();
  if (typeof checkoutRequestId !== 'string' || !checkoutRequestId.trim()) throw new Error('A checkout request reference is required.');
  const now = new Date();
  const timestamp = now.toISOString().replace(/[^0-9]/g, '').slice(0, 14);
  const password = Buffer.from(`${SHORTCODE}${PASSKEY}${timestamp}`).toString('base64');

  const queryPayload = {
    BusinessShortCode: SHORTCODE,
    Password: password,
    Timestamp: timestamp,
    CheckoutRequestID: checkoutRequestId,
  };

  try {
    const accessToken = await getMpesaOAuthToken();
    const queryUrl = `${DARAJA_BASE_URL}/mpesa/stkpushquery/v1/query`;

    const res = await fetch(queryUrl, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(queryPayload),
    });

    const data = await res.json();
    if (!res.ok) throw new Error(`Daraja payment status query failed with status ${res.status}.`);
    return data;
  } catch (err) {
    throw new Error(`Unable to verify payment with Daraja: ${err.message}`);
  }
}
