import crypto from 'crypto';
import { canonicalRole } from './auth.js';
import { authorizeManagedUser } from './iam.js';
import { getRequestedFacilityId } from './facilities.js';
import facilityPolicy from './facilityPolicy.cjs';
import { prisma } from './prisma.js';

const READ_ROLES = [
  'SYSTEM_ADMIN',
  'PROCUREMENT_OFFICER',
  'FINANCE_OFFICER',
  'VENUE_MANAGER',
  'STADIUM_ADMINISTRATOR',
  'OPERATIONS_MANAGER',
  'REPORT_VIEWER',
];

const WRITE_ROLES = [
  'SYSTEM_ADMIN',
  'PROCUREMENT_OFFICER',
  'FINANCE_OFFICER',
  'VENUE_MANAGER',
  'OPERATIONS_MANAGER',
];

const BUSINESS_CATEGORIES = new Set([
  'HARDWARE_EQUIPMENT',
  'NETWORK_INFRASTRUCTURE',
  'CCTV_SECURITY',
  'MAINTENANCE_SERVICES',
  'CATERING_CONCESSIONS',
  'GENERAL_SUPPLIES',
  'PROFESSIONAL_SERVICES',
  'OTHER',
]);

const APPROVAL_STAGES = ['DEPARTMENT_HEAD', 'FINANCE_REVIEW', 'ENTERPRISE_APPROVAL', 'COMPLETED'];

export class ProcurementError extends Error {
  constructor(message, status = 400) {
    super(message);
    this.name = 'ProcurementError';
    this.status = status;
  }
}

function requireModels(...models) {
  if (!process.env.DATABASE_URL || models.some((model) => !prisma?.[model])) {
    throw new ProcurementError('Procurement database schema is unavailable; run prisma generate and apply migrations.', 503);
  }
}

export async function authorizeProcurementRequest(req, { write = false, facilityId = null } = {}) {
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
      console.error('[Procurement facility lookup failed]', error);
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

    const membershipRoles = ['PROCUREMENT_OFFICER', 'FINANCE_OFFICER', 'VENUE_MANAGER', 'STADIUM_ADMINISTRATOR', 'OPERATIONS_MANAGER'];
    if (!facilityPolicy.membershipAllowsFacility({ membership, userId: auth.user.id, facilityId: requestedFacilityId, allowedRoles: membershipRoles })) {
      return { authorized: false, status: 403, reason: 'FORBIDDEN_FACILITY_ACCESS' };
    }
    return { ...auth, facilityId: requestedFacilityId, isEnterpriseAdmin: false };
  } catch (error) {
    console.error('[Procurement facility authorization failed]', error);
    return { authorized: false, status: 503, reason: 'FACILITY_AUTHORIZATION_UNAVAILABLE' };
  }
}

export async function recordProcurementAudit(tx, { actorId, facilityId, action, entityType, entityId, details }) {
  await tx.procurementAuditLog.create({
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
    throw new ProcurementError(`${label} is required and must be at most ${maxLength} characters.`);
  }
  return value.trim();
}

function positiveNumber(value, label) {
  const num = Number(value);
  if (!Number.isFinite(num) || num <= 0) {
    throw new ProcurementError(`${label} must be a positive number.`);
  }
  return num;
}

function dateValue(value, label) {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) throw new ProcurementError(`${label} must be a valid date.`);
  return date;
}

// ---------------------------------------------------------------------------
// 1. SUPPLIER MANAGEMENT
// ---------------------------------------------------------------------------

export async function createSupplier(body, actorId) {
  requireModels('supplier', 'procurementAuditLog');
  const name = requiredText(body.name, 'Supplier name', 150);
  const email = requiredText(body.email, 'Supplier email', 120);
  const contactName = body.contactName ? requiredText(body.contactName, 'Contact name', 100) : null;
  const phone = body.phone ? requiredText(body.phone, 'Supplier phone', 30) : null;
  const businessCategory = requiredText(body.businessCategory, 'Business category', 50).toUpperCase();
  if (!BUSINESS_CATEGORIES.has(businessCategory)) {
    throw new ProcurementError('Select a valid supplier business category.');
  }
  const registrationNumber = body.registrationNumber ? requiredText(body.registrationNumber, 'Registration number', 60) : null;
  const taxId = body.taxId ? requiredText(body.taxId, 'Tax ID / KRA PIN', 60) : null;

  const supplierCode = `SUP-${crypto.randomBytes(4).toString('hex').toUpperCase()}`;

  return prisma.$transaction(async (tx) => {
    const supplier = await tx.supplier.create({
      data: {
        supplierCode,
        name,
        contactName,
        email,
        phone,
        businessCategory,
        registrationNumber,
        taxId,
        verificationStatus: body.verificationStatus === 'VERIFIED' ? 'VERIFIED' : 'PENDING_VERIFICATION',
        verificationNotes: body.verificationNotes ? requiredText(body.verificationNotes, 'Notes', 1000) : null,
        createdById: actorId,
      },
    });

    await recordProcurementAudit(tx, {
      actorId,
      facilityId: null,
      action: 'SUPPLIER_REGISTERED',
      entityType: 'SUPPLIER',
      entityId: supplier.id,
      details: `Registered supplier ${name} (${supplierCode}) in category ${businessCategory}.`,
    });

    return supplier;
  });
}

export async function verifySupplier(supplierId, { verificationStatus, verificationNotes }, actorId) {
  requireModels('supplier', 'procurementAuditLog');
  const status = requiredText(verificationStatus, 'Verification status', 30).toUpperCase();
  if (!['VERIFIED', 'REJECTED', 'SUSPENDED', 'PENDING_VERIFICATION'].includes(status)) {
    throw new ProcurementError('Invalid verification status choice.');
  }

  return prisma.$transaction(async (tx) => {
    const supplier = await tx.supplier.findUnique({ where: { id: supplierId } });
    if (!supplier) throw new ProcurementError('Supplier not found.', 404);

    const updated = await tx.supplier.update({
      where: { id: supplierId },
      data: {
        verificationStatus: status,
        verificationNotes: verificationNotes ? requiredText(verificationNotes, 'Verification notes', 2000) : null,
        verifiedById: actorId,
        verifiedAt: new Date(),
        status: status === 'SUSPENDED' ? 'SUSPENDED' : status === 'REJECTED' ? 'INACTIVE' : 'ACTIVE',
      },
    });

    await recordProcurementAudit(tx, {
      actorId,
      facilityId: null,
      action: `SUPPLIER_${status}`,
      entityType: 'SUPPLIER',
      entityId: supplierId,
      details: `Supplier ${supplier.name} verification status changed to ${status}. Notes: ${verificationNotes || 'None'}`,
    });

    return updated;
  });
}

export async function getSuppliers({ category = null, status = null, verificationStatus = null } = {}) {
  requireModels('supplier');
  const where = {
    ...(category ? { businessCategory: category } : {}),
    ...(status ? { status } : {}),
    ...(verificationStatus ? { verificationStatus } : {}),
  };

  return prisma.supplier.findMany({
    where,
    orderBy: { name: 'asc' },
    include: {
      _count: { select: { contracts: true, purchaseOrders: true, hardwareAssets: true } },
    },
  });
}

// ---------------------------------------------------------------------------
// 2. PROCUREMENT REQUESTS & APPROVAL WORKFLOW
// ---------------------------------------------------------------------------

export async function createProcurementRequest(body, actorId, facilityId) {
  requireModels('procurementRequest', 'procurementItem', 'procurementAuditLog');
  const department = requiredText(body.department, 'Department', 80).toUpperCase();
  const title = requiredText(body.title, 'Request title', 150);
  const description = requiredText(body.description, 'Request description', 2000);

  if (!Array.isArray(body.items) || body.items.length === 0) {
    throw new ProcurementError('Provide at least one requested item.');
  }

  const itemsData = body.items.map((item, idx) => {
    const itemName = requiredText(item.itemName, `Item ${idx + 1} name`, 120);
    const category = requiredText(item.category || 'HARDWARE', `Item ${idx + 1} category`, 50).toUpperCase();
    const quantity = Math.floor(positiveNumber(item.quantity, `Item ${idx + 1} quantity`));
    const unitPrice = positiveNumber(item.unitPrice, `Item ${idx + 1} unit price`);
    const estimatedCost = Math.round(quantity * unitPrice * 100) / 100;
    const specifications = item.specifications ? requiredText(item.specifications, `Item ${idx + 1} specifications`, 1000) : null;
    return { itemName, category, quantity, unitPrice, estimatedCost, specifications };
  });

  const totalEstimatedCost = itemsData.reduce((sum, i) => sum + i.estimatedCost, 0);
  const requestRef = `PRQ-${crypto.randomBytes(4).toString('hex').toUpperCase()}`;

  return prisma.$transaction(async (tx) => {
    const reqRecord = await tx.procurementRequest.create({
      data: {
        requestRef,
        facilityId,
        department,
        title,
        description,
        totalEstimatedCost,
        currency: 'KES',
        status: 'PENDING_APPROVAL',
        currentStage: 'DEPARTMENT_HEAD',
        requestedById: actorId,
        items: {
          create: itemsData,
        },
      },
      include: { items: true },
    });

    await recordProcurementAudit(tx, {
      actorId,
      facilityId,
      action: 'PROCUREMENT_REQUEST_CREATED',
      entityType: 'PROCUREMENT_REQUEST',
      entityId: reqRecord.id,
      details: `Created procurement request ${requestRef} for department ${department} with estimated cost KES ${totalEstimatedCost}.`,
    });

    return reqRecord;
  });
}

export async function reviewProcurementRequest({ requestId, action, comments, nextStage }, actorId, facilityId) {
  requireModels('procurementRequest', 'procurementApprovalLog', 'procurementAuditLog');
  const reviewAction = requiredText(action, 'Action', 20).toUpperCase();
  if (!['APPROVE', 'REJECT', 'CANCEL'].includes(reviewAction)) {
    throw new ProcurementError('Action must be APPROVE, REJECT, or CANCEL.');
  }

  if (reviewAction === 'REJECT' && (!comments || !comments.trim())) {
    throw new ProcurementError('Comments are required when rejecting a procurement request.');
  }

  return prisma.$transaction(async (tx) => {
    const reqRecord = await tx.procurementRequest.findFirst({
      where: { id: requestId, ...(facilityId ? { facilityId } : {}) },
      include: { items: true },
    });

    if (!reqRecord) throw new ProcurementError('Procurement request not found in authorized facility.', 404);
    if (['APPROVED', 'REJECTED', 'CANCELLED'].includes(reqRecord.status)) {
      throw new ProcurementError('Finalized procurement requests cannot be reviewed.', 409);
    }

    let newStatus = reqRecord.status;
    let newStage = reqRecord.currentStage;

    if (reviewAction === 'REJECT') {
      newStatus = 'REJECTED';
    } else if (reviewAction === 'CANCEL') {
      newStatus = 'CANCELLED';
    } else if (reviewAction === 'APPROVE') {
      // Determine next approval stage
      if (reqRecord.currentStage === 'DEPARTMENT_HEAD') {
        newStage = 'FINANCE_REVIEW';
      } else if (reqRecord.currentStage === 'FINANCE_REVIEW') {
        newStage = 'ENTERPRISE_APPROVAL';
      } else if (reqRecord.currentStage === 'ENTERPRISE_APPROVAL') {
        newStage = 'COMPLETED';
        newStatus = 'APPROVED';
      }
      if (nextStage && APPROVAL_STAGES.includes(nextStage)) {
        newStage = nextStage;
        if (nextStage === 'COMPLETED') newStatus = 'APPROVED';
      }
    }

    const updated = await tx.procurementRequest.update({
      where: { id: requestId },
      data: {
        status: newStatus,
        currentStage: newStage,
      },
      include: { items: true, approvalLogs: true },
    });

    await tx.procurementApprovalLog.create({
      data: {
        requestId,
        stage: reqRecord.currentStage,
        approverId: actorId,
        action: reviewAction,
        comments: comments ? comments.trim() : null,
      },
    });

    await recordProcurementAudit(tx, {
      actorId,
      facilityId: reqRecord.facilityId,
      action: `PROCUREMENT_REQUEST_${reviewAction}D`,
      entityType: 'PROCUREMENT_REQUEST',
      entityId: requestId,
      details: `Request ${reqRecord.requestRef} ${reviewAction.toLowerCase()}d at stage ${reqRecord.currentStage}. Status: ${newStatus}, Next Stage: ${newStage}. Comments: ${comments || 'None'}`,
    });

    return updated;
  });
}

// ---------------------------------------------------------------------------
// 3. PURCHASE ORDERS
// ---------------------------------------------------------------------------

export async function createPurchaseOrder(body, actorId, facilityId) {
  requireModels('purchaseOrder', 'supplier', 'procurementAuditLog');
  const supplierId = requiredText(body.supplierId, 'Supplier ID', 100);
  const totalAmount = positiveNumber(body.totalAmount, 'Total amount');
  const expectedDeliveryDate = body.expectedDeliveryDate ? dateValue(body.expectedDeliveryDate, 'Expected delivery date') : null;
  const notes = body.notes ? requiredText(body.notes, 'Notes', 1000) : null;
  const requestId = body.requestId ? requiredText(body.requestId, 'Procurement Request ID', 100) : null;

  return prisma.$transaction(async (tx) => {
    const supplier = await tx.supplier.findUnique({ where: { id: supplierId } });
    if (!supplier) throw new ProcurementError('Supplier not found.', 404);
    if (supplier.status !== 'ACTIVE' || supplier.verificationStatus !== 'VERIFIED') {
      throw new ProcurementError('Purchase orders can only be issued to verified, active suppliers.');
    }

    if (requestId) {
      const pRequest = await tx.procurementRequest.findFirst({ where: { id: requestId, facilityId } });
      if (!pRequest) throw new ProcurementError('Linked procurement request not found in facility.', 404);
      if (pRequest.status !== 'APPROVED') {
        throw new ProcurementError('Purchase orders can only be created for approved procurement requests.');
      }
    }

    const poNumber = `PO-${crypto.randomBytes(4).toString('hex').toUpperCase()}`;

    const po = await tx.purchaseOrder.create({
      data: {
        poNumber,
        supplierId,
        facilityId,
        requestId,
        totalAmount,
        currency: 'KES',
        status: 'ISSUED',
        expectedDeliveryDate,
        notes,
        createdById: actorId,
      },
      include: { supplier: true, procurementRequest: true },
    });

    await recordProcurementAudit(tx, {
      actorId,
      facilityId,
      action: 'PURCHASE_ORDER_ISSUED',
      entityType: 'PURCHASE_ORDER',
      entityId: po.id,
      details: `Issued Purchase Order ${poNumber} to supplier ${supplier.name} for KES ${totalAmount}.`,
    });

    return po;
  });
}

export async function exportPurchaseOrderDocument(poId, facilityId) {
  requireModels('purchaseOrder');
  const po = await prisma.purchaseOrder.findFirst({
    where: { id: poId, ...(facilityId ? { facilityId } : {}) },
    include: {
      supplier: true,
      procurementRequest: { include: { items: true } },
      facility: true,
    },
  });

  if (!po) throw new ProcurementError('Purchase order document not found.', 404);

  const documentText = [
    `================================================================================`,
    `TALANTA STADIUM SMART DIGITAL INFRASTRUCTURE - OFFICIAL PURCHASE ORDER`,
    `================================================================================`,
    `PO Number         : ${po.poNumber}`,
    `Date Issued       : ${po.createdAt.toISOString().slice(0, 10)}`,
    `Facility          : ${po.facility?.name || 'Talanta Stadium Infrastructure'}`,
    `Status            : ${po.status}`,
    `--------------------------------------------------------------------------------`,
    `SUPPLIER DETAILS`,
    `Name              : ${po.supplier.name}`,
    `Category          : ${po.supplier.businessCategory}`,
    `Registration No   : ${po.supplier.registrationNumber || 'N/A'}`,
    `Tax ID / KRA PIN  : ${po.supplier.taxId || 'N/A'}`,
    `Email             : ${po.supplier.email}`,
    `Phone             : ${po.supplier.phone || 'N/A'}`,
    `--------------------------------------------------------------------------------`,
    `ORDER SUMMARY`,
    `Procurement Ref   : ${po.procurementRequest?.requestRef || 'N/A'}`,
    `Department        : ${po.procurementRequest?.department || 'GENERAL'}`,
    `Title             : ${po.procurementRequest?.title || 'Direct Procurement Order'}`,
    `Expected Delivery : ${po.expectedDeliveryDate ? po.expectedDeliveryDate.toISOString().slice(0, 10) : 'Standard 14 Days'}`,
    `--------------------------------------------------------------------------------`,
    `ORDERED ITEMS`,
    ...(po.procurementRequest?.items || []).map(
      (item, idx) =>
        `  ${idx + 1}. ${item.itemName} | Qty: ${item.quantity} | Unit: KES ${item.unitPrice.toLocaleString()} | Total: KES ${item.estimatedCost.toLocaleString()}`
    ),
    ...(po.procurementRequest?.items?.length ? [] : [`  1. Procurement Service Order | Qty: 1 | Total: KES ${po.totalAmount.toLocaleString()}`]),
    `--------------------------------------------------------------------------------`,
    `TOTAL ORDER VALUE : ${po.currency} ${po.totalAmount.toLocaleString()}`,
    `--------------------------------------------------------------------------------`,
    `TERMS & CONDITIONS:`,
    `1. Equipment and services must strictly pass inspection upon delivery.`,
    `2. Invoices must reference PO Number ${po.poNumber}.`,
    `3. Hardware assets will be commissioned into the Talanta BMS Inventory upon sign-off.`,
    `================================================================================`,
  ].join('\n');

  return { po, documentText };
}

// ---------------------------------------------------------------------------
// 4. CONTRACT MANAGEMENT & EXPIRY REMINDERS
// ---------------------------------------------------------------------------

export async function createSupplierContract(body, actorId, facilityId) {
  requireModels('supplierContract', 'supplier', 'procurementAuditLog');
  const supplierId = requiredText(body.supplierId, 'Supplier ID', 100);
  const title = requiredText(body.title, 'Contract title', 150);
  const description = body.description ? requiredText(body.description, 'Description', 2000) : null;
  const contractValue = positiveNumber(body.contractValue, 'Contract value');
  const startDate = dateValue(body.startDate, 'Contract start date');
  const expiryDate = dateValue(body.expiryDate, 'Contract expiry date');
  if (startDate >= expiryDate) {
    throw new ProcurementError('Contract start date must be before expiry date.');
  }

  const renewalDate = body.renewalDate ? dateValue(body.renewalDate, 'Renewal date') : null;
  const noticePeriodDays = body.noticePeriodDays ? Math.max(1, Math.floor(Number(body.noticePeriodDays))) : 30;
  const documentUrl = body.documentUrl ? requiredText(body.documentUrl, 'Document URL', 500) : null;
  const documentName = body.documentName ? requiredText(body.documentName, 'Document name', 150) : null;

  const contractNumber = `CTR-${crypto.randomBytes(4).toString('hex').toUpperCase()}`;

  return prisma.$transaction(async (tx) => {
    const supplier = await tx.supplier.findUnique({ where: { id: supplierId } });
    if (!supplier) throw new ProcurementError('Supplier not found.', 404);

    const contract = await tx.supplierContract.create({
      data: {
        contractNumber,
        supplierId,
        facilityId: facilityId || null,
        title,
        description,
        contractValue,
        currency: 'KES',
        startDate,
        expiryDate,
        renewalDate,
        noticePeriodDays,
        status: 'ACTIVE',
        documentUrl,
        documentName,
        createdById: actorId,
      },
      include: { supplier: true },
    });

    await recordProcurementAudit(tx, {
      actorId,
      facilityId,
      action: 'CONTRACT_REGISTERED',
      entityType: 'SUPPLIER_CONTRACT',
      entityId: contract.id,
      details: `Registered contract ${contractNumber} (${title}) with supplier ${supplier.name} for KES ${contractValue}.`,
    });

    return contract;
  });
}

export async function getContracts({ facilityId = null, supplierId = null, status = null, expiringWithinDays = 60 } = {}) {
  requireModels('supplierContract');
  const now = new Date();
  const reminderThreshold = new Date(now.getTime() + Number(expiringWithinDays) * 86400000);

  const contracts = await prisma.supplierContract.findMany({
    where: {
      ...(facilityId ? { facilityId } : {}),
      ...(supplierId ? { supplierId } : {}),
      ...(status ? { status } : {}),
    },
    include: { supplier: true, facility: true },
    orderBy: { expiryDate: 'asc' },
  });

  return contracts.map((ctr) => {
    const isExpired = ctr.expiryDate < now;
    const isExpiringSoon = !isExpired && ctr.expiryDate <= reminderThreshold;
    const computedStatus = isExpired ? 'EXPIRED' : isExpiringSoon ? 'EXPIRING_SOON' : ctr.status;
    const daysUntilExpiry = Math.ceil((ctr.expiryDate.getTime() - now.getTime()) / 86400000);

    return {
      ...ctr,
      computedStatus,
      daysUntilExpiry,
      expiryAlert: isExpiringSoon ? `Expires in ${daysUntilExpiry} days` : isExpired ? `Expired ${Math.abs(daysUntilExpiry)} days ago` : null,
    };
  });
}

// ---------------------------------------------------------------------------
// 5. EQUIPMENT RECEIVING, INSPECTION & HARDWARE ASSET INTEGRATION
// ---------------------------------------------------------------------------

export async function receiveAndInspectEquipment(body, actorId, facilityId) {
  requireModels('equipmentReceivingRecord', 'purchaseOrder', 'hardwareAsset', 'procurementAuditLog');
  const purchaseOrderId = requiredText(body.purchaseOrderId, 'Purchase order ID', 100);
  const inspectionStatus = requiredText(body.inspectionStatus || 'PASSED', 'Inspection status', 30).toUpperCase();
  if (!['PASSED', 'FAILED_INSPECTION', 'PARTIAL_ACCEPTANCE'].includes(inspectionStatus)) {
    throw new ProcurementError('Inspection status must be PASSED, FAILED_INSPECTION, or PARTIAL_ACCEPTANCE.');
  }
  const inspectionNotes = requiredText(body.inspectionNotes, 'Inspection notes', 2000);

  const receivingRef = `RCV-${crypto.randomBytes(4).toString('hex').toUpperCase()}`;

  return prisma.$transaction(async (tx) => {
    const po = await tx.purchaseOrder.findFirst({
      where: { id: purchaseOrderId, ...(facilityId ? { facilityId } : {}) },
      include: { supplier: true, procurementRequest: { include: { items: true } } },
    });

    if (!po) throw new ProcurementError('Purchase order not found in authorized facility.', 404);

    const record = await tx.equipmentReceivingRecord.create({
      data: {
        receivingRef,
        purchaseOrderId,
        receivedById: actorId,
        inspectionStatus,
        inspectionNotes,
        receivedDate: new Date(),
      },
    });

    // Update Purchase Order delivery status
    const poStatus = inspectionStatus === 'PASSED' ? 'COMPLETED' : inspectionStatus === 'PARTIAL_ACCEPTANCE' ? 'PARTIALLY_DELIVERED' : 'ISSUED';
    await tx.purchaseOrder.update({
      where: { id: purchaseOrderId },
      data: { status: poStatus },
    });

    // ASSET INTEGRATION: Automatically register inspected hardware in hardware inventory if passed & assets supplied
    const createdAssets = [];
    if ((inspectionStatus === 'PASSED' || inspectionStatus === 'PARTIAL_ACCEPTANCE') && Array.isArray(body.assetsToRegister)) {
      for (const asset of body.assetsToRegister) {
        const name = requiredText(asset.name, 'Hardware asset name', 120);
        const category = requiredText(asset.category || 'HARDWARE_EQUIPMENT', 'Hardware category', 50);
        const assetId = `AST-PROC-${crypto.randomBytes(4).toString('hex').toUpperCase()}`;

        const createdHardware = await tx.hardwareAsset.create({
          data: {
            assetId,
            name,
            category,
            manufacturer: asset.manufacturer || po.supplier.name,
            model: asset.model || null,
            serialNumber: asset.serialNumber || `SN-${crypto.randomBytes(4).toString('hex').toUpperCase()}`,
            installationLocation: asset.installationLocation || 'Central Logistics & Receiving Bay',
            supplier: po.supplier.name,
            supplierId: po.supplierId,
            purchaseOrderId: po.id,
            receivingRecordId: record.id,
            commissioningStatus: 'NOT_STARTED',
            maintenanceStatus: 'OPERATIONAL',
            createdById: actorId,
            facilityId: po.facilityId,
          },
        });
        createdAssets.push(createdHardware);
      }
    }

    await recordProcurementAudit(tx, {
      actorId,
      facilityId: po.facilityId,
      action: 'EQUIPMENT_RECEIVED_AND_INSPECTED',
      entityType: 'EQUIPMENT_RECEIVING_RECORD',
      entityId: record.id,
      details: `Received equipment for PO ${po.poNumber}. Inspection: ${inspectionStatus}. Registered ${createdAssets.length} hardware assets. Notes: ${inspectionNotes}`,
    });

    return { record, poStatus, createdAssets };
  });
}

// ---------------------------------------------------------------------------
// 6. DASHBOARD AGGREGATOR
// ---------------------------------------------------------------------------

export async function getProcurementDashboard({ facilityId = null } = {}) {
  requireModels('supplier', 'procurementRequest', 'purchaseOrder', 'supplierContract', 'equipmentReceivingRecord', 'procurementAuditLog');
  const facilityFilter = facilityId ? { facilityId } : {};

  const [
    suppliersCount,
    verifiedSuppliersCount,
    pendingRequestsCount,
    activeOrdersCount,
    activeContracts,
    recentRequests,
    recentOrders,
    recentReceivingRecords,
    auditLogs,
  ] = await Promise.all([
    prisma.supplier.count(),
    prisma.supplier.count({ where: { verificationStatus: 'VERIFIED', status: 'ACTIVE' } }),
    prisma.procurementRequest.count({ where: { status: 'PENDING_APPROVAL', ...facilityFilter } }),
    prisma.purchaseOrder.count({ where: { status: 'ISSUED', ...facilityFilter } }),
    prisma.supplierContract.findMany({
      where: { status: 'ACTIVE', ...(facilityId ? { facilityId } : {}) },
      include: { supplier: true, facility: true },
      orderBy: { expiryDate: 'asc' },
    }),
    prisma.procurementRequest.findMany({
      where: facilityFilter,
      include: { facility: true, items: true, approvalLogs: true },
      orderBy: { createdAt: 'desc' },
      take: 25,
    }),
    prisma.purchaseOrder.findMany({
      where: facilityFilter,
      include: { supplier: true, procurementRequest: true, facility: true },
      orderBy: { createdAt: 'desc' },
      take: 25,
    }),
    prisma.equipmentReceivingRecord.findMany({
      where: { purchaseOrder: facilityFilter },
      include: { purchaseOrder: { include: { supplier: true } }, hardwareAssets: true },
      orderBy: { receivedDate: 'desc' },
      take: 20,
    }),
    prisma.procurementAuditLog.findMany({
      where: facilityId ? { facilityId } : {},
      orderBy: { createdAt: 'desc' },
      take: 50,
    }),
  ]);

  const now = new Date();
  const days60 = new Date(now.getTime() + 60 * 86400000);

  const expiryAlerts = activeContracts
    .map((ctr) => {
      const isExpired = ctr.expiryDate < now;
      const isExpiringSoon = !isExpired && ctr.expiryDate <= days60;
      const daysUntil = Math.ceil((ctr.expiryDate.getTime() - now.getTime()) / 86400000);
      return {
        ...ctr,
        isExpired,
        isExpiringSoon,
        daysUntil,
      };
    })
    .filter((ctr) => ctr.isExpired || ctr.isExpiringSoon);

  const totalEstimatedCostPending = recentRequests
    .filter((r) => r.status === 'PENDING_APPROVAL')
    .reduce((sum, r) => sum + r.totalEstimatedCost, 0);

  return {
    generatedAt: new Date().toISOString(),
    facilityId,
    totals: {
      totalSuppliers: suppliersCount,
      verifiedSuppliers: verifiedSuppliersCount,
      pendingRequests: pendingRequestsCount,
      pendingValueKes: totalEstimatedCostPending,
      activePurchaseOrders: activeOrdersCount,
      activeContractsCount: activeContracts.length,
      contractsExpiringSoonCount: expiryAlerts.length,
    },
    expiryAlerts,
    recentRequests,
    recentOrders,
    recentReceivingRecords,
    auditLogs,
  };
}
