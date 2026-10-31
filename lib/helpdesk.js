import crypto from 'crypto';
import { canonicalRole } from './auth.js';
import { authorizeManagedUser } from './iam.js';
import { getRequestedFacilityId } from './facilities.js';
import facilityPolicy from './facilityPolicy.cjs';
import { dispatchNotification } from './notifications.js';
import { prisma } from './prisma.js';

const READ_ROLES = [
  'SYSTEM_ADMIN',
  'STADIUM_ADMINISTRATOR',
  'HELPDESK_AGENT',
  'TECHNICIAN',
  'OPERATIONS_MANAGER',
  'VENUE_MANAGER',
  'STAFF',
  'PATRON',
];

const WRITE_ROLES = [
  'SYSTEM_ADMIN',
  'STADIUM_ADMINISTRATOR',
  'HELPDESK_AGENT',
  'TECHNICIAN',
  'OPERATIONS_MANAGER',
  'VENUE_MANAGER',
  'STAFF',
];

const HELPDESK_CATEGORIES = new Set([
  'TICKETING',
  'PAYMENTS',
  'QR_SCANNING',
  'USER_ACCOUNTS',
  'NETWORK_CONNECTIVITY',
  'CCTV_INTEGRATIONS',
  'IOT_DEVICES',
  'DIGITAL_SIGNAGE',
  'ACCESS_CONTROL',
  'HARDWARE_FAULTS',
  'STADIUM_OPERATIONS',
]);

const HELPDESK_STATUSES = new Set([
  'NEW',
  'ASSIGNED',
  'IN_PROGRESS',
  'WAITING_FOR_INFO',
  'ESCALATED',
  'RESOLVED',
  'CLOSED',
]);

const DEFAULT_SLA_TARGETS = {
  CRITICAL: { responseTargetHours: 1, resolutionTargetHours: 4 },
  HIGH: { responseTargetHours: 2, resolutionTargetHours: 8 },
  MEDIUM: { responseTargetHours: 4, resolutionTargetHours: 24 },
  LOW: { responseTargetHours: 8, resolutionTargetHours: 48 },
};

export class HelpdeskError extends Error {
  constructor(message, status = 400) {
    super(message);
    this.name = 'HelpdeskError';
    this.status = status;
  }
}

function requireModels(...models) {
  if (!process.env.DATABASE_URL || models.some((model) => !prisma?.[model])) {
    throw new HelpdeskError('Helpdesk database schema is unavailable; run prisma generate and apply migrations.', 503);
  }
}

export async function authorizeHelpdeskRequest(req, { write = false, facilityId = null } = {}) {
  const allowedRoles = write ? WRITE_ROLES : READ_ROLES;
  const auth = await authorizeManagedUser(req, allowedRoles);
  if (!auth.authorized) return auth;

  const role = canonicalRole(auth.user.role);
  if (role === 'SYSTEM_ADMIN' && !facilityId) {
    return { ...auth, facilityId: null, isEnterpriseAdmin: true };
  }

  const requestedFacilityId = facilityId || getRequestedFacilityId(req);
  if (role === 'SYSTEM_ADMIN') {
    try {
      const facility = await prisma.facility.findUnique({ where: { id: requestedFacilityId }, select: { id: true } });
      return facility
        ? { ...auth, facilityId: requestedFacilityId, isEnterpriseAdmin: true }
        : { authorized: false, status: 404, reason: 'FACILITY_NOT_FOUND' };
    } catch (error) {
      console.error('[Helpdesk facility lookup failed]', error);
      return { authorized: false, status: 503, reason: 'FACILITY_AUTHORIZATION_UNAVAILABLE' };
    }
  }

  if (!process.env.DATABASE_URL || !prisma?.facilityMembership) {
    return { authorized: false, status: 503, reason: 'FACILITY_AUTHORIZATION_UNAVAILABLE' };
  }

  try {
    const membership = await prisma.facilityMembership.findUnique({
      where: { facilityId_userId: { facilityId: requestedFacilityId, userId: auth.user.id } },
      select: { facilityId: true, userId: true, role: true, isActive: true },
    });

    const membershipRoles = ['HELPDESK_AGENT', 'TECHNICIAN', 'VENUE_MANAGER', 'STADIUM_ADMINISTRATOR', 'OPERATIONS_MANAGER', 'STAFF'];
    if (!facilityPolicy.membershipAllowsFacility({ membership, userId: auth.user.id, facilityId: requestedFacilityId, allowedRoles: membershipRoles })) {
      return { authorized: false, status: 403, reason: 'FORBIDDEN_FACILITY_ACCESS' };
    }
    return { ...auth, facilityId: requestedFacilityId, isEnterpriseAdmin: false };
  } catch (error) {
    console.error('[Helpdesk facility authorization failed]', error);
    return { authorized: false, status: 503, reason: 'FACILITY_AUTHORIZATION_UNAVAILABLE' };
  }
}

export async function recordHelpdeskAudit(tx, { actorId, facilityId, action, entityType, entityId, details }) {
  await tx.helpdeskAuditLog.create({
    data: {
      actorId,
      facilityId: facilityId || null,
      action,
      entityType,
      entityId: entityId || null,
      details: details || null,
    },
  });
}

function requiredText(value, label, maxLength = 500) {
  if (typeof value !== 'string' || !value.trim() || value.trim().length > maxLength) {
    throw new HelpdeskError(`${label} is required and must be at most ${maxLength} characters.`);
  }
  return value.trim();
}

// ---------------------------------------------------------------------------
// 1. TICKET CREATION & MANAGEMENT
// ---------------------------------------------------------------------------

export async function createSupportTicket(body, actorId, facilityId) {
  requireModels('helpdeskTicket', 'helpdeskAuditLog');
  const category = requiredText(body.category, 'Ticket category', 50).toUpperCase();
  if (!HELPDESK_CATEGORIES.has(category)) {
    throw new HelpdeskError('Select a valid support category.');
  }

  const title = requiredText(body.title, 'Ticket title', 150);
  const description = requiredText(body.description, 'Ticket description', 2000);
  const priority = requiredText(body.priority || 'MEDIUM', 'Priority', 20).toUpperCase();
  if (!['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'].includes(priority)) {
    throw new HelpdeskError('Priority must be LOW, MEDIUM, HIGH, or CRITICAL.');
  }

  const department = body.department ? requiredText(body.department, 'Department', 80) : null;
  const equipmentInvolved = body.equipmentInvolved ? requiredText(body.equipmentInvolved, 'Equipment involved', 120) : null;
  const creatorEmail = body.creatorEmail ? requiredText(body.creatorEmail, 'Creator email', 120) : null;

  const slaTargets = DEFAULT_SLA_TARGETS[priority] || DEFAULT_SLA_TARGETS.MEDIUM;
  const ticketNumber = `HDK-${crypto.randomBytes(4).toString('hex').toUpperCase()}`;

  return prisma.$transaction(async (tx) => {
    const ticket = await tx.helpdeskTicket.create({
      data: {
        ticketNumber,
        category,
        title,
        description,
        priority,
        facilityId,
        department,
        status: 'NEW',
        createdById: actorId,
        creatorEmail,
        equipmentInvolved,
        responseTargetHours: slaTargets.responseTargetHours,
        resolutionTargetHours: slaTargets.resolutionTargetHours,
      },
      include: { facility: true },
    });

    await recordHelpdeskAudit(tx, {
      actorId,
      facilityId,
      action: 'HELPDESK_TICKET_CREATED',
      entityType: 'HELPDESK_TICKET',
      entityId: ticket.id,
      details: `Created support ticket ${ticketNumber} (${category}) with priority ${priority}.`,
    });

    // Dispatch notification to Helpdesk team via notification service
    try {
      await dispatchNotification({
        userEmail: creatorEmail || 'helpdesk@talanta.sttech.co.ke',
        type: 'HELPDESK_TICKET_SUBMITTED',
        category: 'SUPPORT',
        title: `Helpdesk Ticket ${ticketNumber} Logged`,
        message: `Your support request for ${category} (${title}) was submitted successfully. Priority: ${priority}.`,
      });
    } catch (err) {
      console.error('[Helpdesk notification error]', err);
    }

    return ticket;
  });
}

export async function updateTicketStatus({ ticketId, status, assignedTechnicianId, assignedTechnicianName, resolutionNotes, resolutionArticleId, escalationReason }, actorId, facilityId) {
  requireModels('helpdeskTicket', 'helpdeskAuditLog');

  return prisma.$transaction(async (tx) => {
    const ticket = await tx.helpdeskTicket.findFirst({
      where: { id: ticketId, ...(facilityId ? { facilityId } : {}) },
    });

    if (!ticket) throw new HelpdeskError('Support ticket not found in authorized facility.', 404);

    const updateData = { updatedAt: new Date() };

    if (assignedTechnicianId !== undefined) {
      updateData.assignedTechnicianId = assignedTechnicianId;
      updateData.assignedTechnicianName = assignedTechnicianName || `Technician (${assignedTechnicianId})`;
      if (ticket.status === 'NEW') updateData.status = 'ASSIGNED';
      if (!ticket.firstRespondedAt) updateData.firstRespondedAt = new Date();
    }

    if (status) {
      const normStatus = requiredText(status, 'Status', 30).toUpperCase();
      if (!HELPDESK_STATUSES.has(normStatus)) throw new HelpdeskError('Invalid ticket status.');
      updateData.status = normStatus;

      if (normStatus === 'RESOLVED') {
        updateData.resolutionNotes = requiredText(resolutionNotes, 'Resolution notes', 2000);
        updateData.resolutionArticleId = resolutionArticleId || null;
        updateData.resolvedAt = new Date();
      } else if (normStatus === 'CLOSED') {
        updateData.closedAt = new Date();
      } else if (normStatus === 'ESCALATED') {
        updateData.isEscalated = true;
        updateData.escalationReason = requiredText(escalationReason, 'Escalation reason', 1000);
      }
    }

    const updated = await tx.helpdeskTicket.update({
      where: { id: ticketId },
      data: updateData,
      include: { facility: true, workLogs: true, knowledgeArticle: true },
    });

    await recordHelpdeskAudit(tx, {
      actorId,
      facilityId: ticket.facilityId,
      action: `HELPDESK_TICKET_${updated.status}`,
      entityType: 'HELPDESK_TICKET',
      entityId: ticketId,
      details: `Ticket ${ticket.ticketNumber} updated to status ${updated.status}. Technician: ${updated.assignedTechnicianName || 'None'}`,
    });

    // Dispatch update notification
    if (updated.creatorEmail) {
      try {
        await dispatchNotification({
          userEmail: updated.creatorEmail,
          type: 'HELPDESK_TICKET_UPDATED',
          category: 'SUPPORT',
          title: `Ticket ${ticket.ticketNumber} Updated: ${updated.status}`,
          message: `Your ticket for ${ticket.category} was updated to status ${updated.status}. ${resolutionNotes ? `Resolution Notes: ${resolutionNotes}` : ''}`,
        });
      } catch (err) {
        console.error('[Helpdesk notification error]', err);
      }
    }

    return updated;
  });
}

export async function getSupportTickets({ facilityId = null, category = null, priority = null, status = null, assignedTechnicianId = null, createdById = null, search = null } = {}) {
  requireModels('helpdeskTicket');
  const where = {
    ...(facilityId ? { facilityId } : {}),
    ...(category ? { category } : {}),
    ...(priority ? { priority } : {}),
    ...(status ? { status } : {}),
    ...(assignedTechnicianId ? { assignedTechnicianId } : {}),
    ...(createdById ? { createdById } : {}),
  };

  if (search && search.trim()) {
    const term = search.trim();
    where.OR = [
      { ticketNumber: { contains: term } },
      { title: { contains: term } },
      { description: { contains: term } },
      { equipmentInvolved: { contains: term } },
    ];
  }

  const tickets = await prisma.helpdeskTicket.findMany({
    where,
    include: { facility: true, workLogs: true, knowledgeArticle: true },
    orderBy: { createdAt: 'desc' },
    take: 200,
  });

  const now = new Date();

  return tickets.map((t) => {
    const responseDeadline = new Date(t.createdAt.getTime() + t.responseTargetHours * 3600000);
    const resolutionDeadline = new Date(t.createdAt.getTime() + t.resolutionTargetHours * 3600000);

    const isResponseOverdue = !t.firstRespondedAt && now > responseDeadline && !['RESOLVED', 'CLOSED'].includes(t.status);
    const isResolutionOverdue = !t.resolvedAt && now > resolutionDeadline && !['RESOLVED', 'CLOSED'].includes(t.status);

    return {
      ...t,
      isResponseOverdue,
      isResolutionOverdue,
      isOverdue: isResponseOverdue || isResolutionOverdue,
      hoursRemainingToResolve: Math.round((resolutionDeadline.getTime() - now.getTime()) / 3600000),
    };
  });
}

// ---------------------------------------------------------------------------
// 2. TECHNICIAN WORK LOGS
// ---------------------------------------------------------------------------

export async function addTechnicianWorkLog({ ticketId, workSummary, equipmentAction, timeSpentMinutes }, actorId, facilityId) {
  requireModels('helpdeskTicket', 'helpdeskWorkLog', 'helpdeskAuditLog');
  const summary = requiredText(workSummary, 'Work summary', 2000);
  const eqAction = equipmentAction ? requiredText(equipmentAction, 'Equipment action', 300) : null;
  const mins = Math.max(5, Math.floor(Number(timeSpentMinutes || 15)));

  return prisma.$transaction(async (tx) => {
    const ticket = await tx.helpdeskTicket.findFirst({
      where: { id: ticketId, ...(facilityId ? { facilityId } : {}) },
    });

    if (!ticket) throw new HelpdeskError('Support ticket not found in facility.', 404);

    const workLog = await tx.helpdeskWorkLog.create({
      data: {
        ticketId,
        technicianId: actorId,
        technicianName: `Technician (${actorId})`,
        workSummary: summary,
        equipmentAction: eqAction,
        timeSpentMinutes: mins,
      },
    });

    // Auto update status to IN_PROGRESS if currently ASSIGNED
    if (['NEW', 'ASSIGNED'].includes(ticket.status)) {
      await tx.helpdeskTicket.update({
        where: { id: ticketId },
        data: { status: 'IN_PROGRESS', firstRespondedAt: ticket.firstRespondedAt || new Date() },
      });
    }

    await recordHelpdeskAudit(tx, {
      actorId,
      facilityId: ticket.facilityId,
      action: 'HELPDESK_WORKLOG_ADDED',
      entityType: 'HELPDESK_TICKET',
      entityId: ticketId,
      details: `Logged ${mins} mins work on ticket ${ticket.ticketNumber}. Equipment Action: ${eqAction || 'None'}`,
    });

    return workLog;
  });
}

// ---------------------------------------------------------------------------
// 3. KNOWLEDGE BASE ARTICLES
// ---------------------------------------------------------------------------

export async function createKnowledgeArticle(body, actorId) {
  requireModels('helpdeskKnowledgeArticle', 'helpdeskAuditLog');
  const category = requiredText(body.category, 'Article category', 50).toUpperCase();
  const title = requiredText(body.title, 'Article title', 150);
  const summary = requiredText(body.summary, 'Article summary', 500);
  const solutionBody = requiredText(body.solutionBody, 'Solution body', 5000);
  const tags = body.tags ? requiredText(body.tags, 'Tags', 200) : null;

  const articleRef = `KBA-${crypto.randomBytes(4).toString('hex').toUpperCase()}`;

  return prisma.$transaction(async (tx) => {
    const article = await tx.helpdeskKnowledgeArticle.create({
      data: {
        articleRef,
        title,
        category,
        summary,
        solutionBody,
        tags,
        authorId: actorId,
        isPublished: body.isPublished !== false,
      },
    });

    await recordHelpdeskAudit(tx, {
      actorId,
      facilityId: null,
      action: 'KNOWLEDGE_ARTICLE_CREATED',
      entityType: 'KNOWLEDGE_ARTICLE',
      entityId: article.id,
      details: `Created knowledge base solution ${articleRef} (${title}) in category ${category}.`,
    });

    return article;
  });
}

export async function searchKnowledgeArticles({ category = null, query = null } = {}) {
  requireModels('helpdeskKnowledgeArticle');
  const where = {
    isPublished: true,
    ...(category ? { category } : {}),
  };

  if (query && query.trim()) {
    const term = query.trim();
    where.OR = [
      { title: { contains: term } },
      { summary: { contains: term } },
      { solutionBody: { contains: term } },
      { tags: { contains: term } },
    ];
  }

  return prisma.helpdeskKnowledgeArticle.findMany({
    where,
    orderBy: { viewCount: 'desc' },
    take: 50,
  });
}

// ---------------------------------------------------------------------------
// 4. SLA CONFIGURATION & ESCALATION MONITOR
// ---------------------------------------------------------------------------

export async function configureSlaTargets({ priority, responseTargetHours, resolutionTargetHours }, actorId) {
  requireModels('helpdeskSlaConfig', 'helpdeskAuditLog');
  const normPriority = requiredText(priority, 'Priority', 20).toUpperCase();
  const respHours = Math.max(1, Math.floor(Number(responseTargetHours)));
  const resHours = Math.max(1, Math.floor(Number(resolutionTargetHours)));

  return prisma.$transaction(async (tx) => {
    const config = await tx.helpdeskSlaConfig.upsert({
      where: { priority: normPriority },
      update: { responseTargetHours: respHours, resolutionTargetHours: resHours, updatedById: actorId },
      create: { priority: normPriority, responseTargetHours: respHours, resolutionTargetHours: resHours, updatedById: actorId },
    });

    await recordHelpdeskAudit(tx, {
      actorId,
      facilityId: null,
      action: 'HELPDESK_SLA_CONFIGURED',
      entityType: 'HELPDESK_SLA_CONFIG',
      entityId: config.id,
      details: `Updated SLA target for priority ${normPriority}: Response=${respHours}h, Resolution=${resHours}h.`,
    });

    return config;
  });
}

export async function evaluateOverdueAndEscalateTickets({ facilityId = null } = {}) {
  requireModels('helpdeskTicket', 'helpdeskAuditLog');
  const tickets = await getSupportTickets({ facilityId, status: null });
  const overdueTickets = tickets.filter((t) => t.isOverdue && !['RESOLVED', 'CLOSED', 'ESCALATED'].includes(t.status));

  const autoEscalated = [];
  for (const t of overdueTickets) {
    if (t.priority === 'CRITICAL' || t.priority === 'HIGH') {
      try {
        const escalated = await updateTicketStatus({
          ticketId: t.id,
          status: 'ESCALATED',
          escalationReason: `Automated SLA Escalation: Ticket exceeded ${t.resolutionTargetHours}h resolution SLA target.`,
        }, 'SYSTEM_ESCALATION_ENGINE', facilityId);
        autoEscalated.push(escalated);
      } catch (err) {
        console.error(`[SLA Escalation error for ticket ${t.ticketNumber}]`, err);
      }
    }
  }

  return { totalScanned: tickets.length, overdueCount: overdueTickets.length, autoEscalatedCount: autoEscalated.length, autoEscalated };
}

// ---------------------------------------------------------------------------
// 5. HELPDESK DASHBOARD AGGREGATOR
// ---------------------------------------------------------------------------

export async function getHelpdeskDashboard({ facilityId = null } = {}) {
  requireModels('helpdeskTicket', 'helpdeskKnowledgeArticle', 'helpdeskAuditLog');
  const facilityFilter = facilityId ? { facilityId } : {};

  const allTickets = await getSupportTickets({ facilityId });

  const openTickets = allTickets.filter((t) => !['RESOLVED', 'CLOSED'].includes(t.status));
  const overdueTickets = allTickets.filter((t) => t.isOverdue);
  const escalatedTickets = allTickets.filter((t) => t.status === 'ESCALATED' || t.isEscalated);
  const resolvedTickets = allTickets.filter((t) => ['RESOLVED', 'CLOSED'].includes(t.status));

  // Compute actual SLA compliance percentage
  const totalResolved = resolvedTickets.length;
  const resolvedWithinSla = resolvedTickets.filter((t) => !t.isResolutionOverdue).length;
  const slaCompliancePercent = totalResolved > 0 ? Math.round((resolvedWithinSla / totalResolved) * 100) : 100;

  // Grouping by status, priority, category
  const byStatus = {};
  const byPriority = {};
  const byCategory = {};
  const byTechnician = {};

  for (const t of allTickets) {
    byStatus[t.status] = (byStatus[t.status] || 0) + 1;
    byPriority[t.priority] = (byPriority[t.priority] || 0) + 1;
    byCategory[t.category] = (byCategory[t.category] || 0) + 1;
    if (t.assignedTechnicianName) {
      byTechnician[t.assignedTechnicianName] = (byTechnician[t.assignedTechnicianName] || 0) + 1;
    }
  }

  const [topArticles, auditLogs] = await Promise.all([
    prisma.helpdeskKnowledgeArticle.findMany({
      where: { isPublished: true },
      orderBy: { viewCount: 'desc' },
      take: 10,
    }),
    prisma.helpdeskAuditLog.findMany({
      where: facilityId ? { facilityId } : {},
      orderBy: { createdAt: 'desc' },
      take: 50,
    }),
  ]);

  return {
    generatedAt: new Date().toISOString(),
    facilityId,
    totals: {
      totalTickets: allTickets.length,
      openTickets: openTickets.length,
      overdueTickets: overdueTickets.length,
      escalatedTickets: escalatedTickets.length,
      resolvedTickets: totalResolved,
      slaCompliancePercent,
    },
    byStatus,
    byPriority,
    byCategory,
    byTechnician: Object.entries(byTechnician).map(([technician, count]) => ({ technician, count })),
    recentTickets: allTickets.slice(0, 25),
    overdueList: overdueTickets,
    topArticles,
    auditLogs,
  };
}
