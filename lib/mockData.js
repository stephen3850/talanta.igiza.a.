// Baseline Mock System State & Smart Parking Store
// ST-Tech ICT Consultants - Talanta Stadium Infrastructure

export const initialEvents = [
  // 1. EVENT 1 (2027 INAUGURAL TEST MATCH)
  {
    id: 'EVT-2027-001',
    eventCode: 'EVT-2027-BAY-AJX',
    title: 'BAYERN MUNICH VS. AJAX',
    slug: 'bayern-munich-vs-ajax-inaugural-test-match-2027',
    displayDate: 'TUE., JAN. 5, 2027 / 6 PM EAT',
    startDate: '2027-01-05T18:00:00.000Z',
    endDate: '2027-01-05T21:00:00.000Z',
    startTime: '2027-01-05T18:00:00.000Z',
    endTime: '2027-01-05T21:00:00.000Z',
    competition: 'Official Inaugural Test Match',
    category: 'Soccer',
    venue: 'Raila Odinga International Stadium, Talanta Sports City, Nairobi',
    venueZone: 'Raila Odinga Int\'l Stadium',
    organizer: 'Talanta Sports City Steering Committee / FKF',
    contactInfo: 'events@talanta.go.ke • +254 20 2212345',
    image: 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?q=80&w=1200&auto=format&fit=crop',
    bannerUrl: 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?q=80&w=1200&auto=format&fit=crop',
    description: 'A proposed inaugural test match intended to test stadium systems, including ticketing, security and broadcasting.',
    status: 'PROPOSED',
    provisionalStatusLabel: 'Awaiting Official Confirmation',
    ticketApproved: false,
    featured: true,
    isFeatured: true,
    createdAt: '2026-10-31T12:00:00.000Z',
    teams: {
      home: { name: 'Bayern Munich', flag: '🇩🇪' },
      away: { name: 'Ajax', flag: '🇳🇱' }
    },
    referenceLinks: [
      { label: 'Bayern Munich Reference', url: 'https://www.google.com/search?kgmid=%2Fm%2F0175rc&q=Bayern+Munich' },
      { label: 'Ajax Reference', url: 'https://www.google.com/search?kgmid=%2Fm%2F0y54&q=Ajax' },
      { label: 'Venue Reference', url: 'https://www.google.com/search?kgmid=%2Fg%2F11yfckp3x4' }
    ],
    categories: []
  },

  // 2. EVENT 2 (2027 AFCON QUALIFIERS MATCHDAY 5/6)
  {
    id: 'EVT-2027-002',
    eventCode: 'EVT-2027-AFCON-Q56',
    title: 'KENYA VS. FINAL QUALIFIER OPPONENT',
    slug: 'kenya-vs-final-qualifier-opponent-afcon-2027-qualifiers',
    displayDate: 'MARCH 22–30, 2027 / MATCHDAY 5/6',
    startDate: '2027-03-22T16:00:00.000Z',
    endDate: '2027-03-30T19:00:00.000Z',
    startTime: '2027-03-22T16:00:00.000Z',
    endTime: '2027-03-30T19:00:00.000Z',
    competition: 'AFCON 2027 Qualifiers',
    category: 'Football',
    venue: 'Moi International Sports Centre, Kasarani, Nairobi',
    venueZone: 'MISC Kasarani, Nairobi',
    organizer: 'Confederation of African Football (CAF) / FKF',
    contactInfo: 'tickets@fkf.or.ke • +254 20 3345678',
    image: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?q=80&w=1200&auto=format&fit=crop',
    bannerUrl: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?q=80&w=1200&auto=format&fit=crop',
    description: 'AFCON qualification fixtures featuring Kenya and the final qualifier opponent.',
    status: 'AWAITING_CONFIRMATION',
    provisionalStatusLabel: 'Awaiting Official Confirmation',
    ticketApproved: false,
    featured: false,
    isFeatured: false,
    createdAt: '2026-10-31T12:00:00.000Z',
    teams: {
      home: { name: 'Kenya', flag: '🇰🇪' },
      away: { name: 'Final Qualifier Opponent', flag: '⚽' }
    },
    referenceLinks: [
      { label: 'AFCON 2027 Qualifiers Reference', url: 'https://www.google.com/search?kgmid=%2Fm%2F08ls4_' }
    ],
    categories: []
  },

  // 3. EVENT 3 (AFCON 2027 GROUP STAGE MATCHES)
  {
    id: 'EVT-2027-003',
    eventCode: 'EVT-2027-AFCON-GROUP',
    title: 'AFCON 2027 GROUP STAGE MATCHES',
    slug: 'afcon-2027-group-stage-matches',
    displayDate: 'JUNE 19 – JULY 17, 2027',
    startDate: '2027-06-19T14:00:00.000Z',
    endDate: '2027-07-17T22:00:00.000Z',
    startTime: '2027-06-19T14:00:00.000Z',
    endTime: '2027-07-17T22:00:00.000Z',
    competition: 'AFCON 2027',
    category: 'Football',
    venue: 'Raila Odinga International Stadium & MISC Kasarani, Nairobi',
    venueZone: 'Talanta Sports City & Kasarani',
    organizer: 'Confederation of African Football (CAF) / LOC',
    contactInfo: 'afcon2027@cafonline.com',
    image: 'https://images.unsplash.com/photo-1522778119026-d647f0596c20?q=80&w=1200&auto=format&fit=crop',
    bannerUrl: 'https://images.unsplash.com/photo-1522778119026-d647f0596c20?q=80&w=1200&auto=format&fit=crop',
    description: 'Multiple group-stage fixtures featuring Kenya and other African nations.',
    status: 'PROPOSED',
    provisionalStatusLabel: 'Proposed Host Venues',
    ticketApproved: false,
    featured: true,
    isFeatured: true,
    createdAt: '2026-10-31T12:00:00.000Z',
    teams: {
      home: { name: 'Kenya & Group Contenders', flag: '🇰🇪' },
      away: { name: 'CAF Qualified Nations', flag: '🏆' }
    },
    referenceLinks: [
      { label: 'CAF AFCON 2027 Official Info', url: 'https://www.google.com/search?kgmid=%2Fm%2F08ls4_' }
    ],
    categories: []
  },

  // 4. EVENT 4 (AFCON 2027 KNOCKOUT STAGES)
  {
    id: 'EVT-2027-004',
    eventCode: 'EVT-2027-AFCON-KNOCKOUT',
    title: 'AFCON 2027 KNOCKOUT STAGES',
    slug: 'afcon-2027-knockout-stages',
    displayDate: 'JULY 2027 / QUARTER & SEMI-FINALS',
    startDate: '2027-07-01T15:00:00.000Z',
    endDate: '2027-07-25T22:00:00.000Z',
    startTime: '2027-07-01T15:00:00.000Z',
    endTime: '2027-07-25T22:00:00.000Z',
    competition: 'AFCON 2027',
    category: 'Football',
    venue: 'Moi International Sports Centre, Kasarani, Nairobi',
    venueZone: 'MISC Kasarani, Nairobi',
    organizer: 'Confederation of African Football (CAF)',
    contactInfo: 'afcon2027@cafonline.com',
    image: 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?q=80&w=1200&auto=format&fit=crop',
    bannerUrl: 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?q=80&w=1200&auto=format&fit=crop',
    description: 'Quarter-final and semi-final matches listed in the supplied event information as candidate venue fixtures.',
    status: 'CANDIDATE_VENUE',
    provisionalStatusLabel: 'Candidate Venue',
    ticketApproved: false,
    featured: false,
    isFeatured: false,
    createdAt: '2026-10-31T12:00:00.000Z',
    teams: {
      home: { name: 'AFCON Quarter-Finalists', flag: '🏆' },
      away: { name: 'AFCON Semi-Finalists', flag: '🏆' }
    },
    referenceLinks: [
      { label: 'CAF AFCON Reference', url: 'https://www.google.com/search?kgmid=%2Fm%2F08ls4_' }
    ],
    categories: []
  },

  // 5. EXISTING EVENT: KENYA VS MOROCCO
  {
    id: 'EVT-001',
    eventCode: 'EVT-2026-AFCON-01',
    title: 'KENYA VS. MOROCCO',
    slug: 'kenya-vs-morocco-afcon-2027-qualifier',
    displayDate: 'SAT., MAR. 14, 2026 / 7 PM',
    startDate: '2026-03-14T19:00:00.000Z',
    endDate: '2026-03-14T22:00:00.000Z',
    startTime: '2026-03-14T19:00:00.000Z',
    endTime: '2026-03-14T22:00:00.000Z',
    competition: 'AFCON 2027 Qualifier',
    category: 'Football',
    venue: 'Raila Odinga International Stadium, Talanta Sports City',
    venueZone: 'Main Bowl',
    organizer: 'Football Kenya Federation (FKF) / Ministry of Sports',
    contactInfo: 'tickets@fkf.or.ke • +254 20 2212345',
    image: 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?q=80&w=1200&auto=format&fit=crop',
    bannerUrl: 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?q=80&w=1200&auto=format&fit=crop',
    description: 'Official Africa Cup of Nations Qualifier match at Talanta Sports City Main Bowl.',
    status: 'CONFIRMED',
    provisionalStatusLabel: 'Confirmed Matchday',
    ticketApproved: true,
    featured: true,
    isFeatured: true,
    createdAt: '2026-10-01T08:00:00.000Z',
    teams: {
      home: { name: 'Kenya', flag: '🇰🇪' },
      away: { name: 'Morocco', flag: '🇲🇦' }
    },
    categories: [
      { id: 'CAT-101', name: 'General Admission - Upper Deck', price: 1000, capacity: 45000, available: 32400 },
      { id: 'CAT-102', name: 'VIP Lower Canopy', price: 3500, capacity: 10000, available: 4120 },
      { id: 'CAT-103', name: 'VVIP Presidential Suite', price: 10000, capacity: 3500, available: 890 },
      { id: 'CAT-104', name: 'Accessible / Wheelchair Bay', price: 800, capacity: 1500, available: 940 },
    ]
  },

  // 6. EXISTING EVENT: SAUTI SOL HOMECOMING
  {
    id: 'EVT-003',
    eventCode: 'EVT-2026-SAUTISOL',
    title: 'SAUTI SOL, HOMECOMING',
    slug: 'sauti-sol-homecoming-nairobi-live-album-tour',
    displayDate: 'FRI., APR. 10, 2026 / 8 PM',
    startDate: '2026-04-10T20:00:00.000Z',
    endDate: '2026-04-11T02:00:00.000Z',
    startTime: '2026-04-10T20:00:00.000Z',
    endTime: '2026-04-11T02:00:00.000Z',
    competition: 'The Nairobi Live Album Tour',
    category: 'Concerts',
    venue: 'Main Bowl & East Lawn, Talanta Sports City',
    venueZone: 'Main Bowl',
    organizer: 'Sol Generation / ST-Tech Entertainment',
    contactInfo: 'concerts@solgeneration.com',
    image: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?q=80&w=1200&auto=format&fit=crop',
    bannerUrl: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?q=80&w=1200&auto=format&fit=crop',
    description: 'Sauti Sol returns for a landmark homecoming concert live at Talanta Sports City.',
    status: 'CONFIRMED',
    provisionalStatusLabel: 'Confirmed Concert',
    ticketApproved: true,
    featured: true,
    isFeatured: true,
    createdAt: '2026-10-05T08:00:00.000Z',
    categories: [
      { id: 'CAT-301', name: 'Regular Arena', price: 2500, capacity: 30000, available: 12000 },
      { id: 'CAT-302', name: 'Golden Circle VIP', price: 7500, capacity: 5000, available: 1200 },
      { id: 'CAT-303', name: 'VVIP Lounge & Hospitality', price: 20000, capacity: 1000, available: 180 },
    ]
  },

  // 7. EXISTING EVENT: TALANTA STADIUM TOURS
  {
    id: 'EVT-004',
    eventCode: 'EVT-2026-TOURS',
    title: 'TALANTA STADIUM TOURS',
    slug: 'talanta-stadium-guided-behind-the-scenes-tours',
    displayDate: 'DAILY · TUE–SUN',
    startDate: '2026-01-01T09:00:00.000Z',
    endDate: '2026-12-31T17:00:00.000Z',
    startTime: '2026-01-01T09:00:00.000Z',
    endTime: '2026-12-31T17:00:00.000Z',
    competition: 'Behind-the-scenes guided experience',
    category: 'Tours',
    venue: 'Player Tunnel, Control Room & Presidential Suite',
    venueZone: 'All Zones',
    organizer: 'Talanta Stadium Visitor Center',
    contactInfo: 'tours@talanta.go.ke',
    image: 'https://images.unsplash.com/photo-1541252260730-0412e8e2108e?q=80&w=1200&auto=format&fit=crop',
    bannerUrl: 'https://images.unsplash.com/photo-1541252260730-0412e8e2108e?q=80&w=1200&auto=format&fit=crop',
    description: 'Behind-the-scenes guided tour through player changerooms, pitch side, and control room.',
    status: 'CONFIRMED',
    provisionalStatusLabel: 'Ongoing Daily Experience',
    ticketApproved: true,
    featured: false,
    isFeatured: false,
    createdAt: '2026-01-01T08:00:00.000Z',
    categories: [
      { id: 'CAT-401', name: 'Adult Standard Tour', price: 1500, capacity: 1000, available: 850 },
      { id: 'CAT-402', name: 'Student & Youth Tour', price: 500, capacity: 1000, available: 920 },
      { id: 'CAT-403', name: 'VIP Private Family Tour', price: 10000, capacity: 50, available: 35 },
    ]
  },

  // 8. EXISTING EVENT: CHAN 2025 FINAL
  {
    id: 'EVT-005',
    eventCode: 'EVT-2026-CHAN-FINAL',
    title: 'CHAN 2025 FINAL',
    slug: 'chan-2025-final-african-nations-championship',
    displayDate: 'SUN., AUG. 30, 2026 / 6 PM',
    startDate: '2026-08-30T18:00:00.000Z',
    endDate: '2026-08-30T21:00:00.000Z',
    startTime: '2026-08-30T18:00:00.000Z',
    endTime: '2026-08-30T21:00:00.000Z',
    competition: 'African Nations Championship',
    category: 'Football',
    venue: 'Raila Odinga International Stadium, Talanta Sports City',
    venueZone: 'Main Bowl',
    organizer: 'CAF / FKF / Ministry of Sports',
    contactInfo: 'chan@cafonline.com',
    image: 'https://images.unsplash.com/photo-1518091043644-c1d4457512c6?q=80&w=1200&auto=format&fit=crop',
    bannerUrl: 'https://images.unsplash.com/photo-1518091043644-c1d4457512c6?q=80&w=1200&auto=format&fit=crop',
    description: 'Championship final of the African Nations Championship at Kenya\'s flagship stadium.',
    status: 'CONFIRMED',
    provisionalStatusLabel: 'Confirmed Final',
    ticketApproved: true,
    featured: true,
    isFeatured: true,
    createdAt: '2026-05-01T08:00:00.000Z',
    teams: {
      home: { name: 'Finalist 1', flag: '🇰🇪' },
      away: { name: 'Finalist 2', flag: '🏆' }
    },
    categories: [
      { id: 'CAT-501', name: 'General Admission', price: 1500, capacity: 50000, available: 18000 },
      { id: 'CAT-502', name: 'VIP Terrace', price: 5000, capacity: 8000, available: 2100 },
    ]
  },

  // 9. EXISTING EVENT: GOR MAHIA VS AFC LEOPARDS
  {
    id: 'EVT-002',
    eventCode: 'EVT-2026-KPL-DERBY',
    title: 'GOR MAHIA VS. AFC LEOPARDS',
    slug: 'gor-mahia-vs-afc-leopards-mashemeji-derby-2026',
    displayDate: 'SAT., MAY 16, 2026 / 4 PM',
    startDate: '2026-05-16T16:00:00.000Z',
    endDate: '2026-05-16T19:00:00.000Z',
    startTime: '2026-05-16T16:00:00.000Z',
    endTime: '2026-05-16T19:00:00.000Z',
    competition: 'Mashemeji Derby',
    category: 'Football',
    venue: 'Raila Odinga International Stadium, Talanta Sports City',
    venueZone: 'Main Bowl',
    organizer: 'Kenyan Premier League / FKF',
    contactInfo: 'info@kpl.co.ke • +254 20 3345678',
    image: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?q=80&w=1200&auto=format&fit=crop',
    bannerUrl: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?q=80&w=1200&auto=format&fit=crop',
    description: 'Premier League Showdown at Kenya\'s Ultra-Modern Smart Stadium.',
    status: 'CONFIRMED',
    provisionalStatusLabel: 'Confirmed KPL Derby',
    ticketApproved: true,
    featured: true,
    isFeatured: true,
    createdAt: '2026-02-10T08:00:00.000Z',
    teams: {
      home: { name: 'Gor Mahia', flag: '🟢' },
      away: { name: 'AFC Leopards', flag: '🔵' }
    },
    categories: [
      { id: 'CAT-201', name: 'General Admission', price: 500, capacity: 50000, available: 21000 },
      { id: 'CAT-202', name: 'VIP Pavilion', price: 2000, capacity: 8000, available: 1450 },
      { id: 'CAT-203', name: 'VVIP Executive', price: 5000, capacity: 2000, available: 410 },
    ]
  },

  // 10. EXISTING EVENT: BURNA BOY
  {
    id: 'EVT-006',
    eventCode: 'EVT-2026-BURNA',
    title: 'BURNA BOY',
    slug: 'burna-boy-african-giant-world-tour-nairobi',
    displayDate: 'SAT., JUNE 6, 2026 / 8 PM',
    startDate: '2026-06-06T20:00:00.000Z',
    endDate: '2026-06-07T03:00:00.000Z',
    startTime: '2026-06-06T20:00:00.000Z',
    endTime: '2026-06-07T03:00:00.000Z',
    competition: 'African Giant World Tour',
    category: 'Concerts',
    venue: 'Talanta Main Bowl & Concert Arena',
    venueZone: 'Main Bowl',
    organizer: 'Spaceship Entertainment / ST-Tech',
    contactInfo: 'burnaboy@sttech.co.ke',
    image: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?q=80&w=1200&auto=format&fit=crop',
    bannerUrl: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?q=80&w=1200&auto=format&fit=crop',
    description: 'Burna Boy brings the African Giant World Tour live to Talanta Stadium.',
    status: 'CONFIRMED',
    provisionalStatusLabel: 'Confirmed World Tour',
    ticketApproved: true,
    featured: false,
    isFeatured: false,
    createdAt: '2026-03-01T08:00:00.000Z',
    categories: [
      { id: 'CAT-601', name: 'General Arena', price: 3000, capacity: 35000, available: 14000 },
      { id: 'CAT-602', name: 'VIP Front Stage', price: 10000, capacity: 5000, available: 890 },
    ]
  },

  // 11. EXISTING EVENT: DIAMOND PLATNUMZ
  {
    id: 'EVT-007',
    eventCode: 'EVT-2026-DIAMOND',
    title: 'DIAMOND PLATNUMZ',
    slug: 'diamond-platnumz-wasafi-live-in-nairobi',
    displayDate: 'FRI., JULY 3, 2026 / 8 PM',
    startDate: '2026-07-03T20:00:00.000Z',
    endDate: '2026-07-04T02:00:00.000Z',
    startTime: '2026-07-03T20:00:00.000Z',
    endTime: '2026-07-04T02:00:00.000Z',
    competition: 'Wasafi Live in Nairobi',
    category: 'Concerts',
    venue: 'Talanta Main Arena',
    venueZone: 'Main Bowl',
    organizer: 'WCB Wasafi / ST-Tech Entertainment',
    contactInfo: 'wasafi@sttech.co.ke',
    image: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?q=80&w=1200&auto=format&fit=crop',
    bannerUrl: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?q=80&w=1200&auto=format&fit=crop',
    description: 'Bongo Flava sensation Diamond Platnumz performs live at Talanta Sports City.',
    status: 'CONFIRMED',
    provisionalStatusLabel: 'Confirmed Concert',
    ticketApproved: true,
    featured: false,
    isFeatured: false,
    createdAt: '2026-04-01T08:00:00.000Z',
    categories: [
      { id: 'CAT-701', name: 'Regular Gate', price: 2000, capacity: 25000, available: 9500 },
      { id: 'CAT-702', name: 'VIP Circle', price: 6000, capacity: 4000, available: 620 },
    ]
  },

  // 12. EXISTING EVENT: KENYA SEVENS SAFARI SEVENS
  {
    id: 'EVT-008',
    eventCode: 'EVT-2026-RUGBY-7S',
    title: 'KENYA SEVENS, SAFARI SEVENS',
    slug: 'kenya-sevens-safari-sevens-world-series-2026',
    displayDate: 'SAT., SEP. 12, 2026 / 12 PM',
    startDate: '2026-09-12T12:00:00.000Z',
    endDate: '2026-09-13T19:00:00.000Z',
    startTime: '2026-09-12T12:00:00.000Z',
    endTime: '2026-09-13T19:00:00.000Z',
    competition: 'World Rugby Sevens Series',
    category: 'Rugby',
    venue: 'Raila Odinga International Stadium',
    venueZone: 'Main Bowl',
    organizer: 'Kenya Rugby Union (KRU) / World Rugby',
    contactInfo: 'tickets@kru.co.ke',
    image: 'https://images.unsplash.com/photo-1569517282132-25d22f4573e6?q=80&w=1200&auto=format&fit=crop',
    bannerUrl: 'https://images.unsplash.com/photo-1569517282132-25d22f4573e6?q=80&w=1200&auto=format&fit=crop',
    description: 'Premier international rugby sevens tournament hosted at Talanta Stadium.',
    status: 'CONFIRMED',
    provisionalStatusLabel: 'Confirmed Rugby Tournament',
    ticketApproved: true,
    featured: false,
    isFeatured: false,
    createdAt: '2026-05-15T08:00:00.000Z',
    categories: [
      { id: 'CAT-801', name: '2-Day Tournament Pass', price: 1800, capacity: 40000, available: 16500 },
      { id: 'CAT-802', name: 'VIP Village Terrace', price: 5000, capacity: 6000, available: 1100 },
    ]
  },

  // 13. EXISTING EVENT: ATHLETICS KENYA CLASSIC
  {
    id: 'EVT-009',
    eventCode: 'EVT-2026-ATHLETICS',
    title: 'ATHLETICS KENYA CLASSIC',
    slug: 'athletics-kenya-classic-continental-tour-gold-meeting',
    displayDate: 'SAT., OCT. 17, 2026 / 3 PM',
    startDate: '2026-10-17T15:00:00.000Z',
    endDate: '2026-10-17T19:00:00.000Z',
    startTime: '2026-10-17T15:00:00.000Z',
    endTime: '2026-10-17T19:00:00.000Z',
    competition: 'Continental Tour Gold Meeting',
    category: 'Athletics',
    venue: 'Talanta Main Olympic Track',
    venueZone: 'Main Track',
    organizer: 'Athletics Kenya / World Athletics',
    contactInfo: 'info@athleticskenya.or.ke',
    image: 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?q=80&w=1200&auto=format&fit=crop',
    bannerUrl: 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?q=80&w=1200&auto=format&fit=crop',
    description: 'World Athletics Continental Tour Gold track & field championship meeting.',
    status: 'CONFIRMED',
    provisionalStatusLabel: 'Confirmed World Athletics Event',
    ticketApproved: true,
    featured: false,
    isFeatured: false,
    createdAt: '2026-06-01T08:00:00.000Z',
    categories: [
      { id: 'CAT-901', name: 'Grandstand General', price: 800, capacity: 35000, available: 19000 },
      { id: 'CAT-902', name: 'VIP Finish Line Pavilion', price: 3000, capacity: 5000, available: 1400 },
    ]
  },

  // 14. EXISTING EVENT: FALLY IPUPA
  {
    id: 'EVT-010',
    eventCode: 'EVT-2026-FALLY',
    title: 'FALLY IPUPA',
    slug: 'fally-ipupa-tokooos-live-experience-nairobi',
    displayDate: 'SAT., NOV. 7, 2026 / 8 PM',
    startDate: '2026-11-07T20:00:00.000Z',
    endDate: '2026-11-08T03:00:00.000Z',
    startTime: '2026-11-07T20:00:00.000Z',
    endTime: '2026-11-08T03:00:00.000Z',
    competition: 'Tokooos Live Experience',
    category: 'Concerts',
    venue: 'Talanta Sports City Arena',
    venueZone: 'Main Bowl',
    organizer: 'Electrafrique / ST-Tech Entertainment',
    contactInfo: 'fally@sttech.co.ke',
    image: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?q=80&w=1200&auto=format&fit=crop',
    bannerUrl: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?q=80&w=1200&auto=format&fit=crop',
    description: 'Rumba king Fally Ipupa delivers the Tokooos Live Experience in Nairobi.',
    status: 'CONFIRMED',
    provisionalStatusLabel: 'Confirmed Concert',
    ticketApproved: true,
    featured: false,
    isFeatured: false,
    createdAt: '2026-07-01T08:00:00.000Z',
    categories: [
      { id: 'CAT-1001', name: 'Arena General Entry', price: 2500, capacity: 25000, available: 11000 },
      { id: 'CAT-1002', name: 'VIP Golden Circle', price: 8000, capacity: 3000, available: 450 },
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
