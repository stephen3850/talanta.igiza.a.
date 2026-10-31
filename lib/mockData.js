// Baseline Mock System State & Smart Parking Store
// ST-Tech ICT Consultants - Talanta Stadium Infrastructure

export const initialEvents = [
  {
    id: 'EVT-001',
    eventCode: 'EVT-2026-AFCON-01',
    title: 'Harambee Stars vs Nigeria (Super Eagles)',
    slug: 'harambee-stars-vs-nigeria-afcon-qualifier-2026',
    description: 'Official Africa Cup of Nations Qualifier match at Talanta Sports City Main Bowl.',
    category: 'Football',
    venue: 'Main Bowl',
    organizer: 'Football Kenya Federation (FKF) / Ministry of Sports',
    contactInfo: 'tickets@fkf.or.ke • +254 20 2212345',
    image: 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?q=80&w=1200&auto=format&fit=crop',
    bannerUrl: 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?q=80&w=1200&auto=format&fit=crop',
    startDate: '2026-11-15T16:00:00.000Z',
    endDate: '2026-11-15T19:00:00.000Z',
    startTime: '2026-11-15T16:00:00.000Z',
    endTime: '2026-11-15T19:00:00.000Z',
    ticketSalesStart: '2026-10-01T08:00:00.000Z',
    ticketSalesEnd: '2026-11-15T14:00:00.000Z',
    status: 'PUBLISHED',
    featured: true,
    isFeatured: true,
    createdAt: '2026-10-01T08:00:00.000Z',
    categories: [
      { id: 'CAT-101', name: 'General Admission - Upper Deck', price: 1000, capacity: 45000, available: 32400 },
      { id: 'CAT-102', name: 'VIP Lower Canopy', price: 3500, capacity: 10000, available: 4120 },
      { id: 'CAT-103', name: 'VVIP Presidential Suite', price: 10000, capacity: 3500, available: 890 },
      { id: 'CAT-104', name: 'Accessible / Wheelchair Bay', price: 800, capacity: 1500, available: 940 },
    ]
  },
  {
    id: 'EVT-002',
    eventCode: 'EVT-2026-KPL-DERBY',
    title: 'Gor Mahia vs AFC Leopards (Mashemeji Derby)',
    slug: 'gor-mahia-vs-afc-leopards-mashemeji-derby-2026',
    description: 'Premier League Showdown at Kenya\'s Ultra-Modern Smart Stadium.',
    category: 'Football',
    venue: 'Main Bowl',
    organizer: 'Kenyan Premier League / FKF',
    contactInfo: 'info@kpl.co.ke • +254 20 3345678',
    image: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?q=80&w=1200&auto=format&fit=crop',
    bannerUrl: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?q=80&w=1200&auto=format&fit=crop',
    startDate: '2026-11-22T15:00:00.000Z',
    endDate: '2026-11-22T18:00:00.000Z',
    startTime: '2026-11-22T15:00:00.000Z',
    endTime: '2026-11-22T18:00:00.000Z',
    ticketSalesStart: '2026-10-10T08:00:00.000Z',
    ticketSalesEnd: '2026-11-22T13:00:00.000Z',
    status: 'PUBLISHED',
    featured: true,
    isFeatured: true,
    createdAt: '2026-10-10T08:00:00.000Z',
    categories: [
      { id: 'CAT-201', name: 'General Admission', price: 500, capacity: 50000, available: 21000 },
      { id: 'CAT-202', name: 'VIP Pavilion', price: 2000, capacity: 8000, available: 1450 },
      { id: 'CAT-203', name: 'VVIP Executive', price: 5000, capacity: 2000, available: 410 },
    ]
  }
];

export const initialOrders = [
  {
    id: 'ORD-9841',
    orderRef: 'TLN-9841-A2',
    userEmail: 'patron@example.com',
    userName: 'David Omondi',
    eventTitle: 'Harambee Stars vs Nigeria (Super Eagles)',
    eventId: 'EVT-001',
    categoryName: 'General Admission - Upper Deck',
    quantity: 2,
    totalAmount: 2000,
    paymentStatus: 'PAID',
    mpesaReceipt: 'SJK849102X',
    createdAt: '2026-10-29T14:32:00.000Z',
    tickets: [
      {
        ticketNumber: 'TKT-9841-01',
        seatNumber: 'GATE A - SEC 104 - SEAT 42',
        status: 'ISSUED',
        qrToken: 'eyJ0aWNrZXROdW1iZXIiOiJUS1QtOTg0MS0wMSIsIm9yZGVyUmVmIjoiVExOLTk4NDEtQTIiLCJldmVudElkIjoiRVZULTAwMSIsImNhdGVnb3J5TmFtZSI6IkdlbmVyYWwgQWRtaXNzaW9uIiwic2VhdE51bWJlciI6IEdBVEUgQSAtIFNFQyAxMDQiLCJpc3N1ZWRBdCI6MTcyOTk0MDAwMDAwMCwic2VjcmV0U2lnbmF0dXJlIjoidGFsYW50YS1zdGFkaXVtLWRpZ2l0YWwtdGlja2V0LXNpZ25pbmctc2VjcmV0LTIwMjYtVEtULTk4NDEtMDEifQ==',
      },
      {
        ticketNumber: 'TKT-9841-02',
        seatNumber: 'GATE A - SEC 104 - SEAT 43',
        status: 'ISSUED',
        qrToken: 'eyJ0aWNrZXROdW1iZXIiOiJUS1QtOTg0MS0wMiIsIm9yZGVyUmVmIjoiVExOLTk4NDEtQTIiLCJldmVudElkIjoiRVZULTAwMSIsImNhdGVnb3J5TmFtZSI6IkdlbmVyYWwgQWRtaXNzaW9uIiwic2VhdE51bWJlciI6IEdBVEUgQSAtIFNFQyAxMDQiLCJpc3N1ZWRBdCI6MTcyOTk0MDAwMDAwMCwic2VjcmV0U2lnbmF0dXJlIjoidGFsYW50YS1zdGFkaXVtLWRpZ2l0YWwtdGlja2V0LXNpZ25pbmctc2VjcmV0LTIwMjYtVEtULTk4NDEtMDIifQ==',
      }
    ]
  }
];

export const initialStaffAccreditation = [
  {
    id: 'ACC-001',
    accreditationNo: 'TAL-STF-2026-081',
    fullName: 'Capt. James Mwangi',
    idNumber: '28491029',
    organisation: 'Venue Operations Team',
    roleTitle: 'Chief Gate Operations Lead',
    zonePermissions: 'Zone A, Zone B, VIP, Control Room, Pitch Side',
    validFrom: '2026-01-01',
    validUntil: '2026-12-31',
    status: 'ACTIVE',
  }
];

export const mockCommandMetrics = {
  activeEvent: 'Harambee Stars vs Nigeria (Super Eagles)',
  totalCapacity: 60000,
  ticketsSold: 42150,
  stadiumOccupancy: 38920,
  occupancyPercentage: 64.8,
  gatesActive: 24,
  turnstileScanRateMin: 480,
  averageScanTimeSec: 1.8,
  gateHealth: 'OPTIONAL_99.8%',
  totalRevenueKes: 48950000,
  mpesaSuccessRate: '99.4%',
  recentGateScans: [
    { gate: 'GATE-A-01', result: 'APPROVED', ticketNo: 'TKT-9841-01', time: '10:00:12' },
    { gate: 'GATE-A-02', result: 'APPROVED', ticketNo: 'TKT-9841-02', time: '10:00:14' },
    { gate: 'GATE-B-04', result: 'REJECTED_ALREADY_USED', ticketNo: 'TKT-7712-09', time: '10:00:18' },
    { gate: 'GATE-C-01', result: 'APPROVED', ticketNo: 'TKT-1049-03', time: '10:00:22' },
  ]
};

export const initialParkingZones = [
  {
    id: 'PRK-ZONE-VIP',
    name: 'VIP Parking Zone Alpha',
    category: 'VIP',
    location: 'West Stand Presidential Entry',
    capacity: 500,
    reserved: 380,
    parkedInside: 310,
    priceKes: 1500,
    status: 'ACTIVE',
  },
  {
    id: 'PRK-ZONE-GA-LOT1',
    name: 'General Spectator Parking Lot 1',
    category: 'GENERAL',
    location: 'Outer North Perimeter',
    capacity: 8000,
    reserved: 5400,
    parkedInside: 4890,
    priceKes: 500,
    status: 'ACTIVE',
  },
  {
    id: 'PRK-ZONE-ACCESSIBLE',
    name: 'Accessible Wheelchair Parking Bay',
    category: 'ACCESSIBLE',
    location: 'Ramp Precinct West',
    capacity: 800,
    reserved: 320,
    parkedInside: 280,
    priceKes: 300,
    status: 'ACTIVE',
  },
  {
    id: 'PRK-ZONE-STAFF',
    name: 'Staff & Contractor Parking Lot',
    category: 'STAFF',
    location: 'South Precinct Bay',
    capacity: 1500,
    reserved: 980,
    parkedInside: 820,
    priceKes: 0,
    status: 'ACTIVE',
  },
];

export const initialParkingReservations = [
  {
    id: 'PRK-REC-01',
    reservationRef: 'PRK-2026-9841',
    userEmail: 'patron@example.com',
    userName: 'David Omondi',
    vehiclePlate: 'KDA 891X',
    vehicleCategory: 'SUV_4X4',
    zoneId: 'PRK-ZONE-GA-LOT1',
    zoneName: 'General Spectator Parking Lot 1',
    eventTitle: 'Harambee Stars vs Nigeria (Super Eagles)',
    amountKes: 500,
    status: 'PARKED_INSIDE',
    qrPermitToken: 'eyJ2ZWhpY2xlUGxhdGUiOiJLREEgODkxWCIsInJlc2VydmF0aW9uUmVmIjoiUFJLLTIwMjYtOTg0MSJ9',
    createdAt: '2026-10-30T09:15:00.000Z',
    enteredAt: '2026-10-30T10:12:00.000Z',
    exitedAt: null,
  },
  {
    id: 'PRK-REC-02',
    reservationRef: 'PRK-2026-9842',
    userEmail: 'amina.m@example.co.ke',
    userName: 'Amina Mohamed',
    vehiclePlate: 'KCB 102Y',
    vehicleCategory: 'SALOON_CAR',
    zoneId: 'PRK-ZONE-VIP',
    zoneName: 'VIP Parking Zone Alpha',
    eventTitle: 'Harambee Stars vs Nigeria (Super Eagles)',
    amountKes: 1500,
    status: 'RESERVED',
    qrPermitToken: 'eyJ2ZWhpY2xlUGxhdGUiOiJLQ0IgMTAyWSIsInJlc2VydmF0aW9uUmVmIjoiUFJLLTIwMjYtOTg0MiJ9',
    createdAt: '2026-10-30T09:30:00.000Z',
    enteredAt: null,
    exitedAt: null,
  },
];

export const initialIoTDevices = [
  {
    id: 'IOT-001',
    deviceId: 'IOT-ENV-PITCH-01',
    name: 'Main Bowl Pitch Grass Sensor',
    category: 'ENVIRONMENTAL',
    manufacturer: 'Siemens / Schneider',
    model: 'Grass-Sense 5000',
    serialNumber: 'SN-PITCH-8821',
    zoneLocation: 'Main Bowl Pitch Surface',
    gatewayId: 'GW-MQTT-PITCH-01',
    protocol: 'MQTT',
    status: 'ONLINE',
    installedAt: '2026-01-15T08:00:00.000Z',
    lastSeenAt: '2026-10-30T13:00:00.000Z',
    latestReadings: {
      soilMoisture: 42,
      pitchTemp: 24.5,
    }
  }
];

export const initialIoTAlerts = [
  {
    id: 'IOT-ALT-01',
    deviceId: 'IOT-PWR-FLOODLIGHTS-01',
    severity: 'WARNING',
    title: 'High Energy Load Threshold',
    message: 'Main Bowl LED Floodlight power consumption exceeded 800 kW benchmark',
    thresholdValue: 800,
    actualValue: 850,
    acknowledged: false,
    createdAt: '2026-10-30T12:45:00.000Z',
  }
];

export const initialAuditLogs = [
  {
    id: 'AUD-1001',
    userId: 'USR-ADMIN-01',
    userEmail: 'admin@sttech.co.ke',
    action: 'EVENT_SCHEDULED',
    entityType: 'EVENT',
    entityId: 'EVT-001',
    details: 'Published fixture EVT-2026-AFCON-01 Harambee Stars vs Nigeria',
    ipAddress: '197.232.14.82',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
    createdAt: '2026-10-30T07:12:00.000Z',
  }
];
