import { PrismaClient, DocType, DocStatus } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const subject = await prisma.subject.findFirst();
  const uploader = await prisma.user.findFirst();

  if (!subject || !uploader) {
    console.log('No subject or user found. Please run seed first.');
    return;
  }

  await prisma.document.createMany({
    data: [
      {
        title: 'أساسيات شبكات الحاسوب',
        description: 'كتاب شامل عن أساسيات الشبكات',
        fileUrl: '/uploads/dummy.pdf',
        type: DocType.BOOK,
        status: DocStatus.APPROVED,
        subjectId: subject.id,
        uploaderId: uploader.id,
      },
      {
        title: 'أنظمة قواعد البيانات الحديثة',
        description: 'بحث عن قواعد البيانات',
        fileUrl: '/uploads/dummy.pdf',
        type: DocType.RESEARCH,
        status: DocStatus.APPROVED,
        subjectId: subject.id,
        uploaderId: uploader.id,
      },
      {
        title: 'مدخل إلى البرمجة الحديثة',
        description: 'محاضرة في البرمجة',
        fileUrl: '/uploads/dummy.pdf',
        type: DocType.SUMMARY,
        status: DocStatus.APPROVED,
        subjectId: subject.id,
        uploaderId: uploader.id,
      }
    ]
  });

  console.log('Dummy documents added!');
}

main()
  .catch(e => console.error(e))
  .finally(async () => {
    await prisma.$disconnect();
  });
