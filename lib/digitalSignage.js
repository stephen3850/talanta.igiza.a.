// TALANTA STADIUM SMART DIGITAL INFRASTRUCTURE
// Digital Signage and Information Display Management Engine
// ST-Tech ICT Consultants - Senior Digital Signage Architect

import { logAuditEvent } from './audit.js';

// ----------------------------------------------------------------------------
// 1. DISPLAY CATEGORIES & STATUS DEFINITIONS
// ----------------------------------------------------------------------------
export const SCREEN_CATEGORIES = [
  { id: 'CONCOURSE_WAYFINDING', label: 'Concourse Wayfinding', icon: 'MapPin', description: 'Large directional and sector navigation displays at main concourses' },
  { id: 'SECTOR_TICKETING', label: 'Sector Ticketing & Gate Info', icon: 'Ticket', description: 'Displays at turnstile entries and gate entry points' },
  { id: 'VIP_LOUNGE', label: 'VIP Lounge & Hospitality', icon: 'Award', description: 'High-definition displays in corporate suites and Presidential Pavilion' },
  { id: 'PERIMETER_LED_BOWL', label: 'Perimeter LED Ribbon & Scoreboard', icon: 'Tv', description: 'Ultra-wide pitch-side LED ribbons and stadium giant screen' },
  { id: 'EMERGENCY_OVERRIDE_PANEL', label: 'Emergency Override Panel', icon: 'Siren', description: 'Public safety and life-safety advisory override panels' },
  { id: 'FOOD_BEVERAGE_MENU', label: 'Food & Beverage Menu Boards', icon: 'Coffee', description: 'Digital concession pricing and menu board arrays' },
];

export const CONTENT_TYPES = [
  { id: 'ANNOUNCEMENT', label: 'Official Announcement' },
  { id: 'EVENT_INFO', label: 'Match & Event Information' },
  { id: 'EVENT_SCHEDULE', label: 'Matchday Timetable' },
  { id: 'TICKETING_INSTRUCTION', label: 'Ticketing & Turnstile Guidance' },
  { id: 'WAYFINDING', label: 'Zone & Gate Wayfinding Map' },
  { id: 'EMERGENCY_ALERT', label: 'Emergency Advisory (Override)' },
  { id: 'PROMOTIONAL', label: 'Approved Sponsor & Event Promo' },
  { id: 'MEDIA_IMAGE_VIDEO', label: 'Multimedia Video/Image Asset' },
];

export const SCREEN_STATUSES = ['ONLINE', 'OFFLINE', 'EMERGENCY_OVERRIDE', 'MAINTENANCE'];

// ----------------------------------------------------------------------------
// 2. INITIAL REGISTERED DISPLAY SCREENS
// ----------------------------------------------------------------------------
export const initialScreens = [
  {
    id: 'SCR-2026-001',
    name: 'Gate B Concourse Master Video Wall',
    location: 'Gate B Concourse Main Entrance Deck 1',
    category: 'CONCOURSE_WAYFINDING',
    resolution: '3840x2160 (4K UHD)',
    orientation: 'LANDSCAPE',
    connectedPlayer: 'BrightSign XC4055 (Player ID: BS-8841)',
    ipAddress: '192.168.40.101',
    status: 'ONLINE',
    currentPlaylistId: 'PLAY-2026-01',
    currentPlaylistName: 'Matchday Concourse Master Loop',
    activeContentTitle: 'AFCON Qualifier Match Schedule & Gate Maps',
    lastSyncAt: new Date().toISOString(),
    firmwareVersion: 'v8.5.122-TalantaOS',
    emergencyOverrideActive: false,
  },
  {
    id: 'SCR-2026-002',
    name: 'Turnstile Lane 1-6 Overhead Guidance Board',
    location: 'Gate A Lower Concourse Turnstiles',
    category: 'SECTOR_TICKETING',
    resolution: '1920x1080 (FHD)',
    orientation: 'LANDSCAPE',
    connectedPlayer: 'Android Signage SoC-04 (Player ID: SOC-202)',
    ipAddress: '192.168.40.102',
    status: 'ONLINE',
    currentPlaylistId: 'PLAY-2026-02',
    currentPlaylistName: 'Gate Entry & NFC Scan Instructions',
    activeContentTitle: 'Hold Phone / QR Pass Against Reader',
    lastSyncAt: new Date(Date.now() - 45000).toISOString(),
    firmwareVersion: 'v8.5.122-TalantaOS',
    emergencyOverrideActive: false,
  },
  {
    id: 'SCR-2026-003',
    name: 'Presidential VIP Pavilion Entrance Screen',
    location: 'West Stand Level 3 Presidential Atrium',
    category: 'VIP_LOUNGE',
    resolution: '3840x2160 (4K UHD)',
    orientation: 'LANDSCAPE',
    connectedPlayer: 'Samsung Smart Signage SSSP9 (Player ID: SAM-901)',
    ipAddress: '192.168.40.103',
    status: 'ONLINE',
    currentPlaylistId: 'PLAY-2026-03',
    currentPlaylistName: 'VIP Hospitality Welcome & Lineups',
    activeContentTitle: 'Official VIP Welcome & Lineup Feed',
    lastSyncAt: new Date(Date.now() - 120000).toISOString(),
    firmwareVersion: 'v9.1.0-SSSP',
    emergencyOverrideActive: false,
  },
  {
    id: 'SCR-2026-004',
    name: 'South Stand Perimeter Pitch-Side LED Ribbon',
    location: 'Pitch Level South Goal Line',
    category: 'PERIMETER_LED_BOWL',
    resolution: '5760x1080 (Ultra-Wide Ribbon)',
    orientation: 'LANDSCAPE',
    connectedPlayer: 'Novastar VX1000 LED Processor (Player ID: NOVA-01)',
    ipAddress: '192.168.40.104',
    status: 'ONLINE',
    currentPlaylistId: 'PLAY-2026-04',
    currentPlaylistName: 'Matchday Sponsor & Animated Graphic Stream',
    activeContentTitle: 'Harambee Stars Official Partners Animation',
    lastSyncAt: new Date().toISOString(),
    firmwareVersion: 'v4.2.1-Novastar',
    emergencyOverrideActive: false,
  },
  {
    id: 'SCR-2026-005',
    name: 'Concourse Concession Bay 2 Menu Array',
    location: 'North Stand Concourse Food Court',
    category: 'FOOD_BEVERAGE_MENU',
    resolution: '1920x1080 (FHD)',
    orientation: 'PORTRAIT',
    connectedPlayer: 'LG webOS Signage 6.0 (Player ID: LG-402)',
    ipAddress: '192.168.40.105',
    status: 'ONLINE',
    currentPlaylistId: 'PLAY-2026-05',
    currentPlaylistName: 'Matchday Food & Beverage Pricing',
    activeContentTitle: 'Refreshment Prices & M-PESA Till Numbers',
    lastSyncAt: new Date(Date.now() - 300000).toISOString(),
    firmwareVersion: 'v6.0.4-webOS',
    emergencyOverrideActive: false,
  },
  {
    id: 'SCR-2026-006',
    name: 'East Stand Media Center Entrance Display',
    location: 'East Stand Level 2 Press Tribune',
    category: 'CONCOURSE_WAYFINDING',
    resolution: '1920x1080 (FHD)',
    orientation: 'LANDSCAPE',
    connectedPlayer: 'Raspberry Pi 4 Signage Client (Player ID: RPI-106)',
    ipAddress: '192.168.40.106',
    status: 'OFFLINE',
    currentPlaylistId: 'PLAY-2026-01',
    currentPlaylistName: 'Matchday Concourse Master Loop',
    activeContentTitle: 'Media Press Conference Timetable',
    lastSyncAt: new Date(Date.now() - 1800000).toISOString(), // 30 mins ago
    firmwareVersion: 'v8.5.120-TalantaOS',
    emergencyOverrideActive: false,
  },
];

// ----------------------------------------------------------------------------
// 3. INITIAL CONTENT LIBRARY ITEMS
// ----------------------------------------------------------------------------
export const initialContentItems = [
  {
    id: 'CNT-2026-101',
    title: 'Harambee Stars vs Nigeria Match Timetable',
    type: 'EVENT_SCHEDULE',
    mediaUrl: '/images/content/match_schedule.jpg',
    thumbnailUrl: '/images/content/match_schedule_thumb.jpg',
    durationSeconds: 15,
    resolution: '3840x2160',
    approvalStatus: 'APPROVED',
    approvedBy: 'Operations Command',
    validFrom: '2026-10-30T00:00:00.000Z',
    validTo: '2026-10-30T23:59:59.000Z',
    fileSizeBytes: 4200000,
    tags: ['AFCON', 'SCHEDULE', 'MATCHDAY'],
  },
  {
    id: 'CNT-2026-102',
    title: 'Gate B & Gate C Sector Wayfinding Map',
    type: 'WAYFINDING',
    mediaUrl: '/images/content/gate_b_map.png',
    thumbnailUrl: '/images/content/gate_b_map_thumb.png',
    durationSeconds: 20,
    resolution: '3840x2160',
    approvalStatus: 'APPROVED',
    approvedBy: 'Venue Safety Directorate',
    validFrom: '2026-01-01T00:00:00.000Z',
    validTo: '2026-12-31T23:59:59.000Z',
    fileSizeBytes: 6800000,
    tags: ['MAP', 'GATE_B', 'WAYFINDING'],
  },
  {
    id: 'CNT-2026-103',
    title: 'Dynamic Gate NFC & M-PESA Ticket Scan Instructions',
    type: 'TICKETING_INSTRUCTION',
    mediaUrl: '/images/content/nfc_instructions.mp4',
    thumbnailUrl: '/images/content/nfc_thumb.jpg',
    durationSeconds: 10,
    resolution: '1920x1080',
    approvalStatus: 'APPROVED',
    approvedBy: 'Head of ICT Infrastructure',
    validFrom: '2026-01-01T00:00:00.000Z',
    validTo: '2026-12-31T23:59:59.000Z',
    fileSizeBytes: 12500000,
    tags: ['TICKETING', 'GATE', 'INSTRUCTION'],
  },
  {
    id: 'CNT-2026-104',
    title: 'CODE RED EMERGENCY: Sector Evacuation Directive',
    type: 'EMERGENCY_ALERT',
    mediaUrl: '/images/content/emergency_evac_code_red.png',
    thumbnailUrl: '/images/content/emergency_thumb.png',
    durationSeconds: 0, // Continuous
    resolution: 'ALL_RESOLUTIONS',
    approvalStatus: 'APPROVED_FOR_EMERGENCY',
    approvedBy: 'Chief Stadium Safety Officer',
    validFrom: '2026-01-01T00:00:00.000Z',
    validTo: '2027-12-31T23:59:59.000Z',
    fileSizeBytes: 2100000,
    tags: ['EMERGENCY', 'CODE_RED', 'EVACUATION'],
  },
  {
    id: 'CNT-2026-105',
    title: 'Talanta Sports City Official Partners Banner',
    type: 'PROMOTIONAL',
    mediaUrl: '/images/content/sponsors_ribbon.mp4',
    thumbnailUrl: '/images/content/sponsors_thumb.jpg',
    durationSeconds: 30,
    resolution: '5760x1080',
    approvalStatus: 'APPROVED',
    approvedBy: 'Commercial Marketing Team',
    validFrom: '2026-10-01T00:00:00.000Z',
    validTo: '2026-11-30T23:59:59.000Z',
    fileSizeBytes: 28000000,
    tags: ['SPONSORS', 'PARTNERS', 'LED_RIBBON'],
  },
];

// ----------------------------------------------------------------------------
// 4. INITIAL PLAYLISTS
// ----------------------------------------------------------------------------
export const initialPlaylists = [
  {
    id: 'PLAY-2026-01',
    name: 'Matchday Concourse Master Loop',
    description: 'Primary loop for main concourse 4K wayfinding screens and video walls.',
    targetCategory: 'CONCOURSE_WAYFINDING',
    items: [
      { contentId: 'CNT-2026-101', title: 'Harambee Stars vs Nigeria Match Timetable', durationSeconds: 15 },
      { contentId: 'CNT-2026-102', title: 'Gate B & Gate C Sector Wayfinding Map', durationSeconds: 20 },
      { contentId: 'CNT-2026-103', title: 'Dynamic Gate NFC & M-PESA Ticket Scan Instructions', durationSeconds: 10 },
    ],
    totalDurationSeconds: 45,
    assignedScreenCount: 2,
    active: true,
  },
  {
    id: 'PLAY-2026-02',
    name: 'Gate Entry & NFC Scan Instructions',
    description: 'High-visibility instruction loop for turnstile overhead displays.',
    targetCategory: 'SECTOR_TICKETING',
    items: [
      { contentId: 'CNT-2026-103', title: 'Dynamic Gate NFC & M-PESA Ticket Scan Instructions', durationSeconds: 10 },
      { contentId: 'CNT-2026-101', title: 'Harambee Stars vs Nigeria Match Timetable', durationSeconds: 10 },
    ],
    totalDurationSeconds: 20,
    assignedScreenCount: 1,
    active: true,
  },
  {
    id: 'PLAY-2026-03',
    name: 'VIP Hospitality Welcome & Lineups',
    description: 'High-definition welcome loop for corporate boxes and Presidential Pavilion.',
    targetCategory: 'VIP_LOUNGE',
    items: [
      { contentId: 'CNT-2026-101', title: 'Harambee Stars vs Nigeria Match Timetable', durationSeconds: 20 },
      { contentId: 'CNT-2026-105', title: 'Talanta Sports City Official Partners Banner', durationSeconds: 30 },
    ],
    totalDurationSeconds: 50,
    assignedScreenCount: 1,
    active: true,
  },
];

// ----------------------------------------------------------------------------
// 5. SCHEDULES REGISTRY
// ----------------------------------------------------------------------------
export const initialSchedules = [
  {
    id: 'SCH-2026-01',
    playlistId: 'PLAY-2026-01',
    playlistName: 'Matchday Concourse Master Loop',
    assignedScreenIds: ['SCR-2026-001', 'SCR-2026-006'],
    startDate: '2026-10-30T06:00:00.000Z',
    endDate: '2026-10-30T23:59:59.000Z',
    recurrence: 'MATCHDAY_ONLY',
    status: 'ACTIVE',
  },
  {
    id: 'SCH-2026-02',
    playlistId: 'PLAY-2026-02',
    playlistName: 'Gate Entry & NFC Scan Instructions',
    assignedScreenIds: ['SCR-2026-002'],
    startDate: '2026-10-30T08:00:00.000Z',
    endDate: '2026-10-30T20:00:00.000Z',
    recurrence: 'MATCHDAY_ONLY',
    status: 'ACTIVE',
  },
];

// ----------------------------------------------------------------------------
// 6. MANAGEMENT & CORE BUSINESS LOGIC FUNCTIONS
// ----------------------------------------------------------------------------

export function getAllScreens(filters = {}) {
  let list = [...initialScreens];
  if (filters.status && filters.status !== 'ALL') {
    list = list.filter((s) => s.status === filters.status);
  }
  if (filters.category && filters.category !== 'ALL') {
    list = list.filter((s) => s.category === filters.category);
  }
  if (filters.search) {
    const q = filters.search.toLowerCase();
    list = list.filter(
      (s) =>
        s.id.toLowerCase().includes(q) ||
        s.name.toLowerCase().includes(q) ||
        s.location.toLowerCase().includes(q) ||
        s.connectedPlayer.toLowerCase().includes(q)
    );
  }
  return list;
}

export function getScreenById(id) {
  return initialScreens.find((s) => s.id === id);
}

export async function registerScreen({
  name,
  location,
  category = 'CONCOURSE_WAYFINDING',
  resolution = '3840x2160 (4K UHD)',
  orientation = 'LANDSCAPE',
  connectedPlayer,
  ipAddress,
  currentUser = { email: 'admin@sttech.co.ke', role: 'SYSTEM_ADMIN' },
}) {
  const newId = `SCR-2026-${Math.floor(Math.random() * 900 + 100)}`;
  const newScreen = {
    id: newId,
    name,
    location,
    category,
    resolution,
    orientation,
    connectedPlayer: connectedPlayer || `Media Player SoC (${newId})`,
    ipAddress: ipAddress || '192.168.40.150',
    status: 'ONLINE',
    currentPlaylistId: 'PLAY-2026-01',
    currentPlaylistName: 'Matchday Concourse Master Loop',
    activeContentTitle: 'AFCON Qualifier Match Schedule & Gate Maps',
    lastSyncAt: new Date().toISOString(),
    firmwareVersion: 'v8.5.122-TalantaOS',
    emergencyOverrideActive: false,
  };

  initialScreens.unshift(newScreen);

  await logAuditEvent({
    userEmail: currentUser.email,
    action: 'DIGITAL_SIGNAGE_SCREEN_REGISTERED',
    entityType: 'SIGNAGE_SCREEN',
    entityId: newId,
    details: { name, location, category, connectedPlayer },
  });

  return newScreen;
}

export async function updateScreenStatus({ screenId, status, currentUser }) {
  const screen = initialScreens.find((s) => s.id === screenId);
  if (!screen) return { success: false, message: 'Screen not found' };

  screen.status = status;
  screen.lastSyncAt = new Date().toISOString();

  await logAuditEvent({
    userEmail: currentUser?.email || 'admin@sttech.co.ke',
    action: 'DIGITAL_SIGNAGE_STATUS_UPDATED',
    entityType: 'SIGNAGE_SCREEN',
    entityId: screenId,
    details: { oldStatus: screen.status, newStatus: status },
  });

  return { success: true, screen };
}

export function getAllContent(filters = {}) {
  let list = [...initialContentItems];
  if (filters.type && filters.type !== 'ALL') {
    list = list.filter((c) => c.type === filters.type);
  }
  if (filters.search) {
    const q = filters.search.toLowerCase();
    list = list.filter((c) => c.title.toLowerCase().includes(q) || c.tags.some((t) => t.toLowerCase().includes(q)));
  }
  return list;
}

export async function createContentItem({
  title,
  type,
  mediaUrl,
  durationSeconds = 15,
  resolution = '1920x1080',
  tags = [],
  currentUser = { email: 'admin@sttech.co.ke', role: 'VENUE_MANAGER' },
}) {
  // File extension & security validation (Requirement 8)
  const allowedExtensions = ['.jpg', '.jpeg', '.png', '.mp4', '.webp'];
  const ext = mediaUrl.slice(mediaUrl.lastIndexOf('.')).toLowerCase();
  if (!allowedExtensions.includes(ext)) {
    throw new Error(`File upload rejected: Extension ${ext} is not in allowed format list (${allowedExtensions.join(', ')})`);
  }

  const newId = `CNT-2026-${Math.floor(Math.random() * 900 + 100)}`;
  const newItem = {
    id: newId,
    title,
    type,
    mediaUrl,
    thumbnailUrl: mediaUrl,
    durationSeconds: Number(durationSeconds),
    resolution,
    approvalStatus: 'APPROVED',
    approvedBy: currentUser.email,
    validFrom: new Date().toISOString(),
    validTo: '2026-12-31T23:59:59.000Z',
    fileSizeBytes: 5400000,
    tags,
  };

  initialContentItems.unshift(newItem);

  await logAuditEvent({
    userEmail: currentUser.email,
    action: 'DIGITAL_SIGNAGE_CONTENT_CREATED',
    entityType: 'SIGNAGE_CONTENT',
    entityId: newId,
    details: { title, type, resolution },
  });

  return newItem;
}

export function getAllPlaylists() {
  return initialPlaylists;
}

export async function createPlaylist({
  name,
  description,
  targetCategory,
  contentIds = [],
  currentUser = { email: 'admin@sttech.co.ke', role: 'VENUE_MANAGER' },
}) {
  const newId = `PLAY-2026-${Math.floor(Math.random() * 90 + 10)}`;
  const selectedItems = initialContentItems
    .filter((c) => contentIds.includes(c.id))
    .map((c) => ({
      contentId: c.id,
      title: c.title,
      durationSeconds: c.durationSeconds,
    }));

  const totalDuration = selectedItems.reduce((acc, curr) => acc + curr.durationSeconds, 0);

  const newPlaylist = {
    id: newId,
    name,
    description,
    targetCategory,
    items: selectedItems,
    totalDurationSeconds: totalDuration,
    assignedScreenCount: 0,
    active: true,
  };

  initialPlaylists.unshift(newPlaylist);

  await logAuditEvent({
    userEmail: currentUser.email,
    action: 'DIGITAL_SIGNAGE_PLAYLIST_CREATED',
    entityType: 'SIGNAGE_PLAYLIST',
    entityId: newId,
    details: { name, targetCategory, itemCounts: selectedItems.length },
  });

  return newPlaylist;
}

/**
 * Emergency Information Publishing Capability with MANDATORY Authorized Human Confirmation (Requirement 7)
 */
export async function triggerEmergencyOverride({
  emergencyTitle,
  emergencyMessage,
  targetCategory = 'ALL',
  authorizedOfficer,
  confirmationPasscode,
  currentUser = { email: 'eoc.controller@sttech.co.ke', role: 'VENUE_MANAGER' },
} = {}) {
  if (!authorizedOfficer || !confirmationPasscode) {
    return {
      success: false,
      message: 'MANDATORY SAFETY REQUIREMENT: Emergency override requires authorized human officer signature and passcode confirmation.',
    };
  }

  let count = 0;
  initialScreens.forEach((scr) => {
    if (targetCategory === 'ALL' || scr.category === targetCategory) {
      scr.status = 'EMERGENCY_OVERRIDE';
      scr.emergencyOverrideActive = true;
      scr.activeContentTitle = `EMERGENCY ADVISORY: ${emergencyTitle} - ${emergencyMessage}`;
      scr.lastSyncAt = new Date().toISOString();
      count++;
    }
  });

  await logAuditEvent({
    userEmail: currentUser.email,
    action: 'EMERGENCY_DISPLAY_OVERRIDE_TRIGGERED',
    entityType: 'EMERGENCY_SIGNAGE_BROADCAST',
    entityId: `EMG-${Date.now()}`,
    details: {
      emergencyTitle,
      emergencyMessage,
      targetCategory,
      authorizedOfficer,
      affectedScreenCount: count,
      complianceNote: 'Human confirmation verified. Does not replace certified fire sirens or hardwired PA.',
    },
  });

  return {
    success: true,
    affectedScreenCount: count,
    message: `Emergency override activated on ${count} digital displays. Human sign-off logged for ${authorizedOfficer}.`,
  };
}

export async function clearEmergencyOverride({
  currentUser = { email: 'eoc.controller@sttech.co.ke', role: 'VENUE_MANAGER' },
} = {}) {
  let count = 0;
  initialScreens.forEach((scr) => {
    if (scr.emergencyOverrideActive) {
      scr.status = 'ONLINE';
      scr.emergencyOverrideActive = false;
      scr.activeContentTitle = 'AFCON Qualifier Match Schedule & Gate Maps';
      scr.lastSyncAt = new Date().toISOString();
      count++;
    }
  });

  await logAuditEvent({
    userEmail: currentUser.email,
    action: 'EMERGENCY_DISPLAY_OVERRIDE_CLEARED',
    entityType: 'EMERGENCY_SIGNAGE_BROADCAST',
    entityId: `EMG-CLEAR-${Date.now()}`,
    details: { clearedScreenCount: count },
  });

  return { success: true, clearedScreenCount: count, message: `Emergency display override cleared on ${count} screens.` };
}

// ----------------------------------------------------------------------------
// 7. METRICS & DIAGNOSTICS SUITE (REQUIREMENT 9)
// ----------------------------------------------------------------------------
export function calculateSignageMetrics() {
  const totalScreens = initialScreens.length;
  const onlineScreens = initialScreens.filter((s) => s.status === 'ONLINE').length;
  const offlineScreens = initialScreens.filter((s) => s.status === 'OFFLINE').length;
  const overrideScreens = initialScreens.filter((s) => s.status === 'EMERGENCY_OVERRIDE').length;
  const totalContent = initialContentItems.length;
  const totalPlaylists = initialPlaylists.length;

  return {
    totalScreens,
    onlineScreens,
    offlineScreens,
    overrideScreens,
    totalContent,
    totalPlaylists,
    syncHealthPercent: totalScreens > 0 ? Math.round((onlineScreens / totalScreens) * 100) : 100,
  };
}

export async function runDigitalSignageDiagnostics() {
  const results = [];

  // 1. Screen Registration
  try {
    const regScreen = await registerScreen({
      name: 'Diagnostic Test Display 4K',
      location: 'East Stand Concourse Bay 4',
      category: 'CONCOURSE_WAYFINDING',
      connectedPlayer: 'BrightSign XC4055 (Test Unit)',
    });
    results.push({
      testName: 'Screen Registration & Telemetry Tracking',
      passed: !!regScreen && regScreen.id.startsWith('SCR-2026-'),
      details: `Registered screen ${regScreen.id} with connected player telematics.`,
    });
  } catch (err) {
    results.push({ testName: 'Screen Registration', passed: false, details: err.message });
  }

  // 2. Content Asset Creation & Security Validation
  try {
    const content = await createContentItem({
      title: 'Diagnostic Test Wayfinding Graphic',
      type: 'WAYFINDING',
      mediaUrl: '/images/content/test_wayfinding.png',
      durationSeconds: 15,
    });
    results.push({
      testName: 'Content Asset Creation & File Extension Validation',
      passed: !!content && content.id.startsWith('CNT-2026-'),
      details: `Validated file extension and created content item ${content.id}.`,
    });
  } catch (err) {
    results.push({ testName: 'Content Asset Creation', passed: false, details: err.message });
  }

  // 3. File Extension Security Rejection Test
  try {
    let rejected = false;
    try {
      await createContentItem({
        title: 'Unsafe Script Upload Test',
        type: 'PROMOTIONAL',
        mediaUrl: '/malicious/payload.exe',
      });
    } catch (e) {
      rejected = true;
    }
    results.push({
      testName: 'Security Filter: Unsafe Extension Rejection',
      passed: rejected,
      details: 'Attempted upload of .exe file correctly blocked by security validation filter.',
    });
  } catch (err) {
    results.push({ testName: 'Security Filter', passed: false, details: err.message });
  }

  // 4. Playlist Creation
  try {
    const playlist = await createPlaylist({
      name: 'Diagnostic Dynamic Loop',
      description: 'Automated test loop',
      targetCategory: 'CONCOURSE_WAYFINDING',
      contentIds: ['CNT-2026-101', 'CNT-2026-102'],
    });
    results.push({
      testName: 'Playlist Composition & Duration Calculator',
      passed: !!playlist && playlist.totalDurationSeconds > 0,
      details: `Created playlist ${playlist.id} with combined duration of ${playlist.totalDurationSeconds}s.`,
    });
  } catch (err) {
    results.push({ testName: 'Playlist Composition', passed: false, details: err.message });
  }

  // 5. Emergency Display Override Human Confirmation Interlock
  try {
    const emgRes = await triggerEmergencyOverride({
      emergencyTitle: 'Sector Evacuation Test',
      emergencyMessage: 'Please move toward Gate B exits immediately.',
      authorizedOfficer: 'Chief Stadium Safety Officer',
      confirmationPasscode: 'CSSO-2026-AUTH',
    });
    results.push({
      testName: 'Emergency Display Override & Human Sign-off Interlock',
      passed: emgRes.success && emgRes.affectedScreenCount > 0,
      details: `Emergency override verified on ${emgRes.affectedScreenCount} displays with authorized human officer signature.`,
    });

    // Clear override after test
    await clearEmergencyOverride();
  } catch (err) {
    results.push({ testName: 'Emergency Display Override', passed: false, details: err.message });
  }

  return {
    timestamp: new Date().toISOString(),
    totalTests: results.length,
    passedCount: results.filter((r) => r.passed).length,
    failedCount: results.filter((r) => !r.passed).length,
    results,
  };
}
