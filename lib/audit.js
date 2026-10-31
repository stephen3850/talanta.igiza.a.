// Audit Log Recording Engine
// ST-Tech ICT Consultants
import { prisma } from './prisma.js';
import { initialAuditLogs } from './mockData.js';

export async function logAuditEvent({ userId, userEmail, action, entityType, entityId, details, ipAddress, userAgent }) {
  const auditEntry = {
    id: `AUD-${Date.now()}`,
    userId: userId || 'SYSTEM',
    userEmail: userEmail || 'system@sttech.co.ke',
    action,
    entityType,
    entityId: entityId || 'N/A',
    details: typeof details === 'object' ? JSON.stringify(details) : details,
    ipAddress: ipAddress || '127.0.0.1',
    userAgent: userAgent || 'TalantaServer/1.0',
    createdAt: new Date().toISOString(),
  };

  try {
    if (process.env.DATABASE_URL) {
      await prisma.auditLog.create({
        data: {
          userId,
          userEmail,
          action,
          entityType,
          entityId,
          details: auditEntry.details,
          ipAddress,
          userAgent,
        },
      });
    }
  } catch (err) {
    console.warn('[Audit Log Fallback] Database log failed, pushing to mock store:', err.message);
  }

  // Always keep mock audit store populated for UI
  initialAuditLogs.unshift(auditEntry);
  return auditEntry;
}
