import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting academic data seed...');

  // ==========================================
  // 1. جامعة العلوم والتكنولوجيا
  // ==========================================
  const ust = await prisma.university.upsert({
    where: { name: 'جامعة العلوم والتكنولوجيا' },
    update: {},
    create: {
      name: 'جامعة العلوم والتكنولوجيا',
      name_en: 'University of Science and Technology',
      status: 'verified',
    },
  });

  // Source
  await prisma.academicSource.create({
    data: {
      universityId: ust.id,
      title: 'الموقع الرسمي لجامعة العلوم والتكنولوجيا',
      url: 'https://ust.edu.ye',
      source_type: 'الموقع الرسمي للجامعة',
      verification_status: 'verified',
    }
  });

  // --- كلية الحاسبات وتكنولوجيا المعلومات ---
  const ustFcit = await prisma.college.create({
    data: {
      name: 'كلية الحاسبات وتكنولوجيا المعلومات',
      name_en: 'Faculty of Computing and Information Technology',
      universityId: ust.id,
      status: 'verified',
    }
  });

  // قسم علوم الحاسوب
  const ustCsDept = await prisma.department.create({
    data: { name: 'قسم علوم الحاسوب', collegeId: ustFcit.id, status: 'verified' }
  });

  const ustCsMajors = ['علوم الحاسوب', 'هندسة البرمجيات', 'الأمن السيبراني والشبكات', 'الذكاء الاصطناعي'];
  for (const majorName of ustCsMajors) {
    const major = await prisma.major.create({
      data: { name: majorName, departmentId: ustCsDept.id, status: 'verified' }
    });

    // إضافة المستويات لتخصص الأمن السيبراني كمثال
    if (majorName === 'الأمن السيبراني والشبكات') {
      const levels = ['المستوى الأول', 'المستوى الثاني', 'المستوى الثالث', 'المستوى الرابع'];
      for (const levelName of levels) {
        const level = await prisma.level.create({
          data: { name: levelName, majorId: major.id, status: 'verified' }
        });

        // إضافة مواد للمستوى الثالث - الفصل الأول كمثال
        if (levelName === 'المستوى الثالث') {
          await prisma.subject.createMany({
            data: [
              { name: 'أمن الشبكات', name_en: 'Network Security', semester: 1, levelId: level.id, status: 'verified' },
              { name: 'التشفير', name_en: 'Cryptography', semester: 1, levelId: level.id, status: 'verified' },
              { name: 'القرصنة الأخلاقية', name_en: 'Ethical Hacking', semester: 2, levelId: level.id, status: 'needs_verification' },
            ]
          });
        }
      }
    }
  }

  // قسم تقنية المعلومات
  const ustItDept = await prisma.department.create({
    data: { name: 'قسم تقنية المعلومات', collegeId: ustFcit.id, status: 'verified' }
  });
  await prisma.major.createMany({
    data: [
      { name: 'تقنية المعلومات', departmentId: ustItDept.id, status: 'verified' },
      { name: 'تقنية المعلومات باللغة الإنجليزية', departmentId: ustItDept.id, status: 'verified' },
      { name: 'التصميم الجرافيكي والوسائط المتعددة', departmentId: ustItDept.id, status: 'verified' },
    ]
  });

  // قسم نظم المعلومات
  const ustIsDept = await prisma.department.create({
    data: { name: 'قسم نظم المعلومات', collegeId: ustFcit.id, status: 'verified' }
  });
  await prisma.major.createMany({
    data: [
      { name: 'نظم المعلومات الإدارية', departmentId: ustIsDept.id, status: 'verified' },
      { name: 'نظم المعلومات المحاسبية', departmentId: ustIsDept.id, status: 'verified' },
      { name: 'التجارة الإلكترونية', departmentId: ustIsDept.id, status: 'verified' },
    ]
  });

  // --- كلية الهندسة ---
  const ustEng = await prisma.college.create({
    data: { name: 'كلية الهندسة', universityId: ust.id, status: 'verified' }
  });
  
  const engArch = await prisma.department.create({ data: { name: 'قسم الهندسة المعمارية', collegeId: ustEng.id, status: 'verified' }});
  await prisma.major.createMany({ data: [{ name: 'الهندسة المعمارية', departmentId: engArch.id }, { name: 'هندسة التصميم الداخلي', departmentId: engArch.id }]});

  const engElec = await prisma.department.create({ data: { name: 'قسم الهندسة الإلكترونية', collegeId: ustEng.id, status: 'verified' }});
  await prisma.major.createMany({ data: [
    { name: 'هندسة الاتصالات والمعلوماتية', departmentId: engElec.id },
    { name: 'هندسة الحاسوب ونظم التحكم', departmentId: engElec.id },
    { name: 'هندسة الإلكترونيات الصناعية والتحكم الآلي', departmentId: engElec.id },
    { name: 'هندسة الميكاترونكس', departmentId: engElec.id }
  ]});

  const engCivil = await prisma.department.create({ data: { name: 'قسم الهندسة المدنية', collegeId: ustEng.id, status: 'verified' }});
  await prisma.major.create({ data: { name: 'الهندسة المدنية', departmentId: engCivil.id }});

  const engBio = await prisma.department.create({ data: { name: 'قسم الهندسة الطبية الحيوية', collegeId: ustEng.id, status: 'verified' }});
  await prisma.major.create({ data: { name: 'الهندسة الطبية الحيوية', departmentId: engBio.id }});

  // --- كلية العلوم الإدارية ---
  const ustAdmin = await prisma.college.create({
    data: { name: 'كلية العلوم الإدارية', universityId: ust.id, status: 'verified' }
  });
  const adminAcc = await prisma.department.create({ data: { name: 'قسم المحاسبة والتمويل', collegeId: ustAdmin.id, status: 'verified' }});
  await prisma.major.createMany({ data: [
    { name: 'المحاسبة', departmentId: adminAcc.id, status: 'verified' },
    { name: 'العلوم المالية والمصرفية', departmentId: adminAcc.id, status: 'verified' }
  ]});
  const adminBus = await prisma.department.create({ data: { name: 'قسم إدارة الأعمال', collegeId: ustAdmin.id, status: 'verified' }});
  await prisma.major.createMany({ data: [
    { name: 'إدارة الأعمال', departmentId: adminBus.id, status: 'verified' },
    { name: 'إدارة الأعمال الدولية', departmentId: adminBus.id, status: 'verified' },
    { name: 'إدارة الأعمال باللغة الإنجليزية', departmentId: adminBus.id, status: 'verified' },
    { name: 'إدارة الأعمال الدولية باللغة الإنجليزية', departmentId: adminBus.id, status: 'verified' },
    { name: 'التسويق الرقمي', departmentId: adminBus.id, status: 'verified' }
  ]});

  // --- كلية العلوم الإنسانية والاجتماعية ---
  const ustHuman = await prisma.college.create({
    data: { name: 'كلية العلوم الإنسانية والاجتماعية', universityId: ust.id, status: 'verified' }
  });
  const humLaw = await prisma.department.create({ data: { name: 'قسم الشريعة والقانون', collegeId: ustHuman.id, status: 'verified' }});
  await prisma.major.createMany({ data: [
    { name: 'الشريعة والقانون', departmentId: humLaw.id, status: 'verified' },
    { name: 'الدراسات الإسلامية', departmentId: humLaw.id, status: 'verified' },
    { name: 'اللغة العربية', departmentId: humLaw.id, status: 'verified' },
    { name: 'علوم القرآن', departmentId: humLaw.id, status: 'verified' }
  ]});
  const humSoc = await prisma.department.create({ data: { name: 'قسم العلوم الاجتماعية', collegeId: ustHuman.id, status: 'verified' }});
  await prisma.major.createMany({ data: [
    { name: 'العلاقات العامة والإعلان', departmentId: humSoc.id, status: 'verified' },
    { name: 'الإذعة والتلفزيون', departmentId: humSoc.id, status: 'verified' },
    { name: 'رياض الأطفال', departmentId: humSoc.id, status: 'verified' },
    { name: 'علم النفس والإرشاد', departmentId: humSoc.id, status: 'verified' }
  ]});
  const humEng = await prisma.department.create({ data: { name: 'قسم اللغة الإنجليزية', collegeId: ustHuman.id, status: 'verified' }});
  await prisma.major.createMany({ data: [
    { name: 'الترجمة', departmentId: humEng.id, status: 'verified' },
    { name: 'اللغويات التطبيقية', departmentId: humEng.id, status: 'verified' }
  ]});

  // --- الكليات الطبية ---
  const ustMed = await prisma.college.create({ data: { name: 'كلية الطب والعلوم الصحية', universityId: ust.id, status: 'verified' }});
  const medDept = await prisma.department.create({ data: { name: 'الطب والعلوم الصحية', collegeId: ustMed.id, status: 'needs_verification' }});
  await prisma.major.create({ data: { name: 'الطب والجراحة', departmentId: medDept.id, status: 'needs_verification' }});

  const ustDent = await prisma.college.create({ data: { name: 'كلية طب الأسنان', universityId: ust.id, status: 'verified' }});
  const dentDept = await prisma.department.create({ data: { name: 'طب الأسنان', collegeId: ustDent.id, status: 'needs_verification' }});
  await prisma.major.create({ data: { name: 'طب وجراحة الفم والأسنان', departmentId: dentDept.id, status: 'needs_verification' }});

  const ustPharm = await prisma.college.create({ data: { name: 'كلية الصيدلة', universityId: ust.id, status: 'verified' }});
  const pharmDept = await prisma.department.create({ data: { name: 'الصيدلة', collegeId: ustPharm.id, status: 'needs_verification' }});
  await prisma.major.createMany({ data: [
    { name: 'دكتور صيدلة', departmentId: pharmDept.id, status: 'needs_verification' },
    { name: 'الصيدلة', departmentId: pharmDept.id, status: 'needs_verification' }
  ]});


  // ==========================================
  // 2. جامعة اليمن والخليج للعلوم والتكنولوجيا
  // ==========================================
  const yg = await prisma.university.upsert({
    where: { name: 'جامعة اليمن والخليج للعلوم والتكنولوجيا' },
    update: {},
    create: {
      name: 'جامعة اليمن والخليج للعلوم والتكنولوجيا',
      name_en: 'Yemen and Gulf University of Science and Technology',
      status: 'verified',
    },
  });

  await prisma.academicSource.create({
    data: {
      universityId: yg.id,
      title: 'الموقع الرسمي لجامعة اليمن والخليج',
      url: 'https://ygust.edu.ye',
      source_type: 'الموقع الرسمي للجامعة',
      verification_status: 'verified',
    }
  });

  // كلية العلوم الطبية
  const ygMed = await prisma.college.create({
    data: { name: 'كلية العلوم الطبية', universityId: yg.id, status: 'verified' }
  });
  const ygMedDept = await prisma.department.create({ data: { name: 'العلوم الطبية', collegeId: ygMed.id, status: 'needs_verification' }});
  await prisma.major.createMany({ data: [
    { name: 'طب الأسنان', departmentId: ygMedDept.id, status: 'verified' },
    { name: 'المختبرات الطبية', departmentId: ygMedDept.id, status: 'verified' },
    { name: 'التمريض', departmentId: ygMedDept.id, status: 'verified' }
  ]});

  // كلية الهندسة وتقنية المعلومات
  const ygEng = await prisma.college.create({
    data: { name: 'كلية الهندسة وتقنية المعلومات', universityId: yg.id, status: 'verified' }
  });
  const ygEngDept = await prisma.department.create({ data: { name: 'الهندسة وتقنية المعلومات', collegeId: ygEng.id, status: 'needs_verification' }});
  await prisma.major.createMany({ data: [
    { name: 'تكنولوجيا المعلومات', departmentId: ygEngDept.id, status: 'verified' },
    { name: 'الأمن السيبراني والشبكات', departmentId: ygEngDept.id, status: 'verified' },
    { name: 'هندسة الاتصالات والإلكترونيات', departmentId: ygEngDept.id, status: 'verified' },
    { name: 'هندسة الحاسوب', departmentId: ygEngDept.id, status: 'verified' }
  ]});

  // كلية الاقتصاد والعلوم الإدارية والإنسانية
  const ygEcon = await prisma.college.create({
    data: { name: 'كلية الاقتصاد والعلوم الإدارية والإنسانية', universityId: yg.id, status: 'verified' }
  });
  const ygEconDept = await prisma.department.create({ data: { name: 'الاقتصاد والعلوم الإدارية والإنسانية', collegeId: ygEcon.id, status: 'needs_verification' }});
  await prisma.major.createMany({ data: [
    { name: 'نظم المعلومات الإدارية', departmentId: ygEconDept.id, status: 'verified' },
    { name: 'إدارة المستشفيات والمراكز الصحية', departmentId: ygEconDept.id, status: 'verified' },
    { name: 'العلوم المالية والمصرفية', departmentId: ygEconDept.id, status: 'verified' },
    { name: 'المحاسبة', departmentId: ygEconDept.id, status: 'verified' },
    { name: 'التسويق', departmentId: ygEconDept.id, status: 'verified' },
    { name: 'العلوم السياسية', departmentId: ygEconDept.id, status: 'verified' },
    { name: 'الشريعة والقانون', departmentId: ygEconDept.id, status: 'verified' },
    { name: 'الترجمة', departmentId: ygEconDept.id, status: 'verified' },
    { name: 'اللغة الإنجليزية', departmentId: ygEconDept.id, status: 'verified' },
    { name: 'اللغة العربية', departmentId: ygEconDept.id, status: 'verified' }
  ]});

  console.log('Academic data seeded successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
