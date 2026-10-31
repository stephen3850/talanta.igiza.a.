// TALANTA STADIUM BASELINE SEEDING SCRIPT
// ST-Tech ICT Consultants

const { PrismaClient } = require('@prisma/client');
const crypto = require('crypto');
const prisma = new PrismaClient();

function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString('hex');
  const iterations = 310000;
  const hash = crypto.pbkdf2Sync(password, salt, iterations, 64, 'sha512').toString('hex');
  return `pbkdf2$sha512$${iterations}$${salt}$${hash}`;
}

async function main() {
  if (!process.env.INITIAL_ADMIN_PASSWORD || process.env.INITIAL_ADMIN_PASSWORD.length < 12) {
    throw new Error('Set INITIAL_ADMIN_PASSWORD to a unique password of at least 12 characters before seeding.');
  }
  console.log('Seeding Talanta Stadium Baseline System Data...');

  // Create System Admin
  const admin = await prisma.user.upsert({
    where: { email: 'admin@sttech.co.ke' },
    update: { passwordHash: hashPassword(process.env.INITIAL_ADMIN_PASSWORD), isActive: true, role: 'SYSTEM_ADMIN' },
    create: {
      email: 'admin@sttech.co.ke',
      fullName: 'ST-Tech Lead Administrator',
      passwordHash: hashPassword(process.env.INITIAL_ADMIN_PASSWORD),
      phoneNumber: '+254700000000',
      role: 'SYSTEM_ADMIN',
    },
  });

  const facility = await prisma.facility.upsert({
    where: { facilityCode: 'TALANTA-STADIUM' },
    update: {},
    create: {
      id: 'FACILITY-TALANTA-STADIUM',
      facilityCode: 'TALANTA-STADIUM',
      name: 'Talanta Stadium',
      type: 'STADIUM',
      timezone: 'Africa/Nairobi',
    },
  });

  await prisma.facilityMembership.upsert({
    where: { facilityId_userId: { facilityId: facility.id, userId: admin.id } },
    update: { role: 'SYSTEM_ADMIN', isActive: true },
    create: { facilityId: facility.id, userId: admin.id, role: 'SYSTEM_ADMIN', isActive: true },
  });

  // Create Sample Featured Event
  const event = await prisma.event.upsert({
    where: { eventCode: 'EVT-2026-AFCON-01' },
    update: {},
    create: {
      eventCode: 'EVT-2026-AFCON-01',
      title: 'Harambee Stars vs Nigeria - AFCON 2027 Qualifier',
      slug: 'harambee-stars-vs-nigeria-afcon-2027-qualifier',
      description: 'Official International Qualifier Match at Talanta Sports City Main Bowl.',
      category: 'Football',
      startDate: new Date('2026-11-15T16:00:00Z'),
      endDate: new Date('2026-11-15T19:00:00Z'),
      venue: 'Main Bowl',
      status: 'DRAFT',
      featured: true,
      facilityId: facility.id,
    },
  });

  // Create Ticket Categories
  const categories = [
    { name: 'General Admission', price: 1000, capacity: 45000 },
    { name: 'VIP Lower Deck', price: 3500, capacity: 10000 },
    { name: 'VVIP Presidential Suite', price: 10000, capacity: 3500 },
    { name: 'Accessible / Wheelchair', price: 800, capacity: 1500 },
  ];

  for (const cat of categories) {
    await prisma.ticketCategory.create({
      data: {
        eventId: event.id,
        categoryName: cat.name,
        price: cat.price,
        totalCapacity: cat.capacity,
        availableSeats: cat.capacity,
      },
    });
  }

  console.log('Seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
