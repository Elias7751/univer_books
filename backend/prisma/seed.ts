import { PrismaClient, Role, DocType, DocStatus } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting seed...');

  // 1. Create Users
  const adminPassword = await bcrypt.hash('admin123', 10);
  const admin = await prisma.user.upsert({
    where: { phone: '0000000000' },
    update: {},
    create: {
      name: 'System Admin',
      phone: '0000000000',
      password: adminPassword,
      role: Role.ADMIN,
    },
  });
  console.log(`Created Admin: ${admin.phone} (Password: admin123)`);

  const studentPassword = await bcrypt.hash('student123', 10);
  const student = await prisma.user.upsert({
    where: { phone: '1111111111' },
    update: {},
    create: {
      name: 'Ali Student',
      phone: '1111111111',
      password: studentPassword,
      role: Role.STUDENT,
    },
  });
  console.log(`Created Student: ${student.phone} (Password: student123)`);

  // 2. Create Academic Structure
  const university = await prisma.university.upsert({
    where: { name: 'National University' },
    update: {},
    create: {
      name: 'National University',
      colleges: {
        create: {
          name: 'College of Computer Science',
          departments: {
            create: {
              name: 'Information Technology',
              levels: {
                create: {
                  name: 'Level 3',
                  subjects: {
                    create: [
                      { name: 'Computer Networks' },
                      { name: 'Operating Systems' }
                    ]
                  }
                }
              }
            }
          }
        }
      }
    }
  });
  console.log(`Created University: ${university.name}`);

  // 3. Create a dummy document
  const subject = await prisma.subject.findFirst({ where: { name: 'Computer Networks' } });
  
  if (subject) {
    const doc = await prisma.document.create({
      data: {
        title: 'Introduction to Computer Networks',
        description: 'A comprehensive guide to networking basics.',
        type: DocType.BOOK,
        fileUrl: '/uploads/dummy.pdf', // We don't have a real file, but this is just for UI testing
        status: DocStatus.APPROVED,
        subjectId: subject.id,
        uploaderId: admin.id,
        reviewerId: admin.id,
      }
    });
    console.log(`Created dummy document: ${doc.title}`);
  }

  console.log('Seeding finished.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
