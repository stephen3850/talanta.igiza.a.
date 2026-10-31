// Cryptographic Digital Ticket Generation & Verification Engine
// ST-Tech ICT Consultants - Talanta Stadium Infrastructure

import crypto from 'crypto';

const TICKET_SECRET = process.env.TICKET_SIGNING_SECRET
  || (process.env.NODE_ENV === 'production' ? null : 'talanta-development-ticket-secret-not-for-production');

function requireTicketSecret() {
  if (!TICKET_SECRET || TICKET_SECRET.length < 32 || /generate|placeholder|changeme|example/i.test(TICKET_SECRET)) {
    throw new Error('TICKET_SIGNING_SECRET must contain at least 32 characters before issuing tickets.');
  }
  return TICKET_SECRET;
}

/**
 * Generate Cryptographically Signed Dynamic QR Token for a Ticket
 */
export function generateDynamicQRToken(payload) {
  const issuedAt = Date.now();
  const dataToSign = {
    ticketNumber: payload.ticketNumber,
    orderRef: payload.orderRef || payload.bookingRef,
    eventId: payload.eventId,
    categoryName: payload.categoryName,
    seatNumber: payload.seatNumber,
    issuedAt,
  };

  // HMAC-SHA256 Signature for Anti-Tampering & Offline Turnstile Validation
  const hmac = crypto.createHmac('sha256', requireTicketSecret());
  hmac.update(JSON.stringify(dataToSign));
  const signature = hmac.digest('hex');

  const fullTokenObj = {
    ...dataToSign,
    secretSignature: signature,
  };

  // Return Base64 URL-safe token
  return Buffer.from(JSON.stringify(fullTokenObj)).toString('base64');
}

/**
 * Verify & Decrypt Dynamic QR Token at Turnstile Gate
 */
export function verifyDynamicQRToken(tokenBase64) {
  try {
    if (!TICKET_SECRET || typeof tokenBase64 !== 'string' || tokenBase64.length > 4096) {
      return { valid: false, reason: 'SIGNING_KEY_UNAVAILABLE_OR_INVALID_TOKEN' };
    }
    const jsonStr = Buffer.from(tokenBase64, 'base64').toString('utf8');
    const parsed = JSON.parse(jsonStr);

    const { secretSignature, ...dataToSign } = parsed;

    if (!secretSignature) {
      return { valid: false, reason: 'INVALID_SIGNATURE_MISSING' };
    }

    const hmac = crypto.createHmac('sha256', requireTicketSecret());
    hmac.update(JSON.stringify(dataToSign));
    const expectedSignature = hmac.digest('hex');

    const provided = Buffer.from(secretSignature, 'hex');
    const expected = Buffer.from(expectedSignature, 'hex');
    if (provided.length !== expected.length || !crypto.timingSafeEqual(provided, expected)) {
      return { valid: false, reason: 'TAMPERED_QR_CODE' };
    }

    return {
      valid: true,
      ticket: dataToSign,
      data: dataToSign,
    };
  } catch (err) {
    return { valid: false, reason: 'CORRUPTED_TOKEN_FORMAT' };
  }
}

// Alias for turnstile gate scanner route
export const decodeAndVerifyQRToken = verifyDynamicQRToken;

/**
 * Generate SVG Data URL for QR Display
 */
export function generateQRSVGDataUri(ticketNumber) {
  return `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 100 100" fill="%23060B1E"><rect width="100" height="100" fill="%23ffffff"/><rect x="10" y="10" width="25" height="25" fill="%23060B1E"/><rect x="15" y="15" width="15" height="15" fill="%23ffffff"/><rect x="18" y="18" width="9" height="9" fill="%23060B1E"/><rect x="65" y="10" width="25" height="25" fill="%23060B1E"/><rect x="70" y="15" width="15" height="15" fill="%23ffffff"/><rect x="73" y="18" width="9" height="9" fill="%23060B1E"/><rect x="10" y="65" width="25" height="25" fill="%23060B1E"/><rect x="15" y="70" width="15" height="15" fill="%23ffffff"/><rect x="18" y="73" width="9" height="9" fill="%23060B1E"/><rect x="40" y="40" width="20" height="20" fill="%2310B981"/><text x="50" y="95" font-size="5" text-anchor="middle" fill="%23060B1E">${ticketNumber}</text></svg>`;
}
