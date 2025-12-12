import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Create super admin member with Supabase UID
  const admin = await prisma.member.upsert({
    where: { email: 'admin@test.com' },
    update: { role: 'super_admin' },
    create: {
      id: '348d130d-1674-4be1-97d1-807656f216d5', // Supabase UID
      email: 'admin@test.com',
      firstName: 'Admin',
      lastName: 'User',
      role: 'super_admin',
    },
  });
  console.log('✅ Created admin:', admin.email);

  // Create regular member with Supabase UID
  const member = await prisma.member.upsert({
    where: { email: 'user@test.com' },
    update: {},
    create: {
      id: 'ef5c44b1-78d4-4f36-8019-9df992937a06', // Supabase UID
      email: 'user@test.com',
      firstName: 'Test',
      lastName: 'Member',
      role: 'member',
    },
  });
  console.log('✅ Created member:', member.email);

  // Create some sample events
  const event1 = await prisma.event.create({
    data: {
      name: 'Resume Building Workshop',
      description: 'Learn how to build a professional resume',
      category: 'SOCIAL_AEX',
      semester: 'Fall 2024',
      location: 'Engineering Building Room 101',
      startTime: new Date('2024-12-20T18:00:00'),
      endTime: new Date('2024-12-20T20:00:00'),
      qrSecret: 'workshop-resume-2024',
      createdById: admin.id,
    },
  });
  console.log('✅ Created event:', event1.name);

  const event2 = await prisma.event.create({
    data: {
      name: 'December General Body Meeting',
      description: 'Monthly GBM - Pizza will be served!',
      category: 'GBM',
      semester: 'Fall 2024',
      location: 'Student Union Ballroom',
      startTime: new Date('2024-12-15T17:00:00'),
      endTime: new Date('2024-12-15T18:30:00'),
      qrSecret: 'gbm-december-2024',
      createdById: admin.id,
    },
  });
  console.log('✅ Created event:', event2.name);

  const event3 = await prisma.event.create({
    data: {
      name: 'Community Service: Food Drive',
      description: 'Help organize food donations for local families',
      category: 'COMMUNITY_SERVICE',
      semester: 'Fall 2024',
      location: 'Community Center',
      startTime: new Date('2024-12-18T14:00:00'),
      endTime: new Date('2024-12-18T17:00:00'),
      qrSecret: 'service-fooddrive-2024',
      createdById: admin.id,
    },
  });
  console.log('✅ Created event:', event3.name);

  // Create some attendance records
  await prisma.attendance.create({
    data: {
      memberId: member.id,
      eventId: event2.id,
      checkedInAt: new Date('2024-12-15T17:05:00'),
      checkInMethod: 'qr',
    },
  });
  console.log('✅ Created attendance record');

  console.log('🎉 Seeding completed!');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
