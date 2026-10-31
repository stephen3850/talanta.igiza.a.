// Notification & Communication Delivery Service
// ST-Tech ICT Consultants - Talanta Stadium Infrastructure

import { maskPhoneNumber } from './payments.js';
import { logAuditEvent } from './audit.js';

// In-Memory Notification Store (backed by DB when connected)
export const initialNotifications = [
  {
    id: 'NOTIF-101',
    userEmail: 'patron@example.com',
    type: 'PAYMENT_CONFIRMATION',
    channel: 'EMAIL_AND_SMS',
    category: 'TICKETING',
    title: 'M-PESA Ticket Payment Confirmed',
    message: 'Your payment of KES 2,000 for Harambee Stars vs Nigeria was confirmed. M-PESA Ref: SJK849102X.',
    read: false,
    deliveryStatus: 'SIMULATED_NOT_SENT',
    createdAt: '2026-10-29T14:32:00.000Z',
  },
  {
    id: 'NOTIF-102',
    userEmail: 'patron@example.com',
    type: 'TICKET_ISSUANCE',
    channel: 'IN_APP',
    category: 'TICKETING',
    title: 'Digital Passes Ready in Wallet',
    message: '2 digital passes (TKT-9841-01, TKT-9841-02) have been deposited in your ticket wallet.',
    read: true,
    deliveryStatus: 'SIMULATED_NOT_SENT',
    createdAt: '2026-10-29T14:32:05.000Z',
  },
  {
    id: 'NOTIF-103',
    userEmail: 'admin@sttech.co.ke',
    type: 'SYSTEM_ALERT',
    channel: 'EMAIL',
    category: 'SECURITY',
    title: 'Duplicate Gate Scan Spike Detected',
    message: 'Multiple duplicate entry attempts detected at GATE-B-04. Security stewards alerted.',
    read: false,
    deliveryStatus: 'SIMULATED_NOT_SENT',
    createdAt: '2026-10-30T10:00:18.000Z',
  },
];

/**
 * Render Branded HTML Email Template for Ticket Confirmation
 */
export function renderTicketConfirmationEmail({ userName, eventTitle, orderRef, mpesaReceipt, amount }) {
  return `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: 'Segoe UI', Arial, sans-serif; background-color: #060B1E; color: #ffffff; margin: 0; padding: 20px; }
    .container { max-width: 600px; margin: 0 auto; background-color: #0B132B; border: 1px solid #10B981; border-radius: 16px; padding: 30px; }
    .header { text-align: center; border-bottom: 1px solid #1e293b; padding-bottom: 20px; }
    .logo { color: #10B981; font-weight: 900; font-size: 20px; text-transform: uppercase; }
    .title { font-size: 18px; font-weight: bold; margin-top: 15px; color: #ffffff; }
    .details { background-color: #060B1E; border: 1px solid #1e293b; border-radius: 12px; padding: 15px; margin: 20px 0; font-size: 13px; line-height: 1.6; }
    .btn { display: inline-block; background-color: #10B981; color: #060B1E; font-weight: bold; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-size: 13px; }
    .footer { text-align: center; font-size: 11px; color: #64748b; margin-top: 25px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="logo">Talanta Sports City</div>
      <div class="title">Payment Confirmed & Digital Pass Issued</div>
    </div>

    <p>Dear ${userName || 'Patron'},</p>
    <p>Thank you for booking with Talanta Stadium. Your Safaricom M-PESA payment has been successfully processed and verified.</p>

    <div class="details">
      <strong>Matchday Event:</strong> ${eventTitle}<br>
      <strong>Booking Reference:</strong> ${orderRef}<br>
      <strong>M-PESA Receipt:</strong> ${mpesaReceipt}<br>
      <strong>Amount Paid:</strong> KES ${amount?.toLocaleString()}
    </div>

    <div style="text-align: center; margin: 25px 0;">
      <a href="https://talanta.sttech.co.ke/account/tickets" class="btn">View Digital Passes in Wallet</a>
    </div>

    <div class="footer">
      This is an automated communication from ST-Tech ICT Consultants on behalf of Ministry of Sports / Talanta Stadium.
    </div>
  </div>
</body>
</html>
  `;
}

/**
 * Dispatch Multi-Channel Notification (In-App, Email, SMS)
 */
export async function dispatchNotification({
  userEmail,
  phoneNumber,
  type,
  category = 'GENERAL',
  title,
  message,
  payload = {},
}) {
  const notifId = `NOTIF-${Date.now()}`;

  // Idempotency check: prevent duplicate notifications within 1 minute
  const existingRecent = initialNotifications.find(
    (n) => n.userEmail === userEmail && n.title === title && Date.now() - new Date(n.createdAt).getTime() < 60000
  );

  if (existingRecent) {
    console.log('[Notification Idempotency Skip] Duplicate simulated notification suppressed.');
    return existingRecent;
  }

  const notification = {
    id: notifId,
    userEmail,
    phoneNumber: phoneNumber ? maskPhoneNumber(phoneNumber) : null,
    type,
    category,
    title,
    message,
    read: false,
    deliveryStatus: 'SIMULATED_NOT_SENT',
    createdAt: new Date().toISOString(),
  };

  initialNotifications.unshift(notification);

  await logAuditEvent({
    userEmail,
    action: 'NOTIFICATION_DISPATCHED',
    entityType: 'NOTIFICATION',
    entityId: notifId,
    details: `Created simulated ${type} notification record (${title}); no provider delivery occurred.`,
  });

  return notification;
}
