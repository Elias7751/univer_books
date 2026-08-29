require('dotenv').config();
const TelegramBot = require('node-telegram-bot-api');
import prisma from '../utils/prisma';

const token = process.env.TELEGRAM_BOT_TOKEN || '';

// Initialize bot only if token is provided
export const bot = token ? new TelegramBot(token, { polling: true }) : null;

if (bot) {
  console.log('🤖 Telegram Bot is running...');

  // State management for file uploads
  const uploadState: Record<number, {
    step: string;
    fileId?: string;
    fileName?: string;
    title?: string;
    type?: string;
    subjectId?: number;
    uploaderId?: number;
  }> = {};

  // Main Menu Keyboard
  const mainMenuKeyboard = {
    reply_markup: {
      keyboard: [
        [{ text: '📚 تصفح المواد الدراسية' }, { text: '🌍 المكتبة العامة' }],
        [{ text: '🔎 بحث' }, { text: '⭐ المحفوظات' }],
        [{ text: '👤 حسابي' }]
      ],
      resize_keyboard: true
    }
  };

  // Handle /start command
  bot.onText(/\/start/, async (msg: any) => {
    const chatId = msg.chat.id;
    const firstName = msg.from?.first_name || 'طالبنا العزيز';

    const welcomeMessage = `مرحباً بك يا ${firstName} في بوت مكتبتي الجامعية! 🎓\n\nأنا هنا لمساعدتك في الوصول إلى المراجع، الكتب، والملخصات الجامعية بكل سهولة.\n\nاختر من القائمة أدناه للبدء:`;

    bot.sendMessage(chatId, welcomeMessage, mainMenuKeyboard);
  });

  // Handle /link command
  bot.onText(/\/link/, async (msg: any) => {
    const chatId = msg.chat.id;
    
    const linkKeyboard = {
      reply_markup: {
        keyboard: [
          [{ text: '📱 مشاركة رقم الهاتف للربط', request_contact: true }],
          [{ text: '❌ إلغاء' }]
        ],
        resize_keyboard: true,
        one_time_keyboard: true
      }
    };

    bot.sendMessage(chatId, 'لربط حسابك في المنصة بالتيليجرام، يرجى مشاركة رقم هاتفك بالضغط على الزر أدناه:', linkKeyboard);
  });

  // Handle contact sharing
  bot.on('contact', async (msg: any) => {
    const chatId = msg.chat.id;
    const contact = msg.contact;

    if (contact.user_id !== msg.from.id) {
      bot.sendMessage(chatId, 'عذراً، يجب مشاركة رقم هاتفك الخاص بك.', mainMenuKeyboard);
      return;
    }

    let phone = contact.phone_number;
    if (!phone.startsWith('+')) {
      phone = '+' + phone;
    }

    try {
      const user = await prisma.user.findUnique({ where: { phone } });
      
      if (!user) {
        bot.sendMessage(chatId, 'عذراً، لم أتمكن من العثور على حساب بهذا الرقم في المنصة. تأكد من تسجيل الدخول في الموقع بنفس الرقم.', mainMenuKeyboard);
        return;
      }

      await prisma.user.update({
        where: { id: user.id },
        data: { telegramId: chatId.toString() }
      });

      bot.sendMessage(chatId, `تم ربط حسابك بنجاح يا ${user.name}! 🎉\nالآن يمكنك استخدام ميزة "موادي" للوصول السريع لملفاتك.`, mainMenuKeyboard);
    } catch (error) {
      console.error('Error linking account:', error);
      bot.sendMessage(chatId, 'حدث خطأ أثناء ربط الحساب.', mainMenuKeyboard);
    }
  });

  // Handle document uploads
  bot.on('document', async (msg: any) => {
    const chatId = msg.chat.id;
    
    try {
      const user = await prisma.user.findFirst({ where: { telegramId: chatId.toString() } });
      
      if (!user) {
        bot.sendMessage(chatId, 'عذراً، يجب ربط حسابك أولاً لتتمكن من رفع الملفات. أرسل /link للربط.', mainMenuKeyboard);
        return;
      }

      if (user.role === 'STUDENT') {
        bot.sendMessage(chatId, 'عذراً، صلاحية رفع الملفات متاحة للمناديب والمشرفين فقط.', mainMenuKeyboard);
        return;
      }

      const fileId = msg.document.file_id;
      const fileName = msg.document.file_name;

      uploadState[chatId] = {
        step: 'WAITING_FOR_TITLE',
        fileId,
        fileName,
        uploaderId: user.id
      };

      bot.sendMessage(chatId, `تم استلام الملف: *${fileName}*\n\nالرجاء إرسال **عنوان الملف** (مثلاً: ملخص الفصل الأول):`, {
        parse_mode: 'Markdown',
        reply_markup: {
          force_reply: true
        }
      });

    } catch (error) {
      console.error(error);
      bot.sendMessage(chatId, 'حدث خطأ أثناء معالجة الملف.');
    }
  });

  // Handle text messages
  bot.on('message', async (msg: any) => {
    const chatId = msg.chat.id;
    const text = msg.text;

    if (!text || text.startsWith('/') || msg.contact) return;

    // Handle upload state
    if (uploadState[chatId] && uploadState[chatId].step === 'WAITING_FOR_TITLE') {
      uploadState[chatId].title = text;
      uploadState[chatId].step = 'WAITING_FOR_TYPE';

      const typeKeyboard = {
        inline_keyboard: [
          [{ text: '📚 كتاب', callback_data: 'type_BOOK' }, { text: '📝 ملخص', callback_data: 'type_SUMMARY' }],
          [{ text: '🔍 بحث', callback_data: 'type_RESEARCH' }, { text: '📄 نماذج اختبارات', callback_data: 'type_EXAM' }]
        ]
      };

      bot.sendMessage(chatId, `تم حفظ العنوان: *${text}*\n\nالرجاء اختيار **نوع الملف**:`, {
        parse_mode: 'Markdown',
        reply_markup: typeKeyboard
      });
      return;
    }

    switch (text) {
      case '📚 تصفح المواد الدراسية':
        try {
          const universities = await prisma.university.findMany();
          if (universities.length === 0) {
            bot.sendMessage(chatId, 'عذراً، لا توجد جامعات مسجلة حالياً.', mainMenuKeyboard);
            return;
          }

          const inlineKeyboard = universities.map(uni => ([{
            text: uni.name,
            callback_data: `uni_${uni.id}`
          }]));

          bot.sendMessage(chatId, 'اختر الجامعة:', {
            reply_markup: {
              inline_keyboard: inlineKeyboard
            }
          });
        } catch (error) {
          console.error(error);
          bot.sendMessage(chatId, 'حدث خطأ أثناء جلب الجامعات.', mainMenuKeyboard);
        }
        break;

      case '🌍 المكتبة العامة':
        try {
          const generalDocs = await prisma.document.findMany({
            where: { isGeneral: true, status: 'APPROVED' },
            take: 10,
            orderBy: { createdAt: 'desc' }
          });

          if (generalDocs.length === 0) {
            bot.sendMessage(chatId, 'عذراً، لا توجد مراجع عامة حالياً.', mainMenuKeyboard);
            return;
          }

          let msgText = '🌍 *أحدث المراجع العامة:*\n\n';
          const inlineKeyboard: any[] = [];

          generalDocs.forEach((doc, index) => {
            msgText += `${index + 1}. *${doc.title}*\n`;
            inlineKeyboard.push([{ text: `📥 تحميل: ${doc.title}`, callback_data: `doc_${doc.id}` }]);
          });

          bot.sendMessage(chatId, msgText, {
            parse_mode: 'Markdown',
            reply_markup: { inline_keyboard: inlineKeyboard }
          });
        } catch (error) {
          console.error(error);
          bot.sendMessage(chatId, 'حدث خطأ أثناء جلب المراجع العامة.', mainMenuKeyboard);
        }
        break;

      case '🔎 بحث':
        bot.sendMessage(chatId, 'أرسل لي اسم الكتاب، المادة، أو المؤلف الذي تبحث عنه:');
        break;

      case '⭐ المحفوظات':
        try {
          const user = await prisma.user.findFirst({ where: { telegramId: chatId.toString() } });
          
          if (!user) {
            bot.sendMessage(chatId, 'هذه الميزة تتطلب ربط حسابك أولاً.\nأرسل /link لربط حسابك بالمنصة.', mainMenuKeyboard);
            return;
          }

          const favorites = await prisma.favorite.findMany({
            where: { userId: user.id },
            include: { document: { include: { subject: true } } },
            orderBy: { createdAt: 'desc' },
            take: 10
          });

          if (favorites.length === 0) {
            bot.sendMessage(chatId, 'لا توجد لديك أي ملفات محفوظة حالياً.', mainMenuKeyboard);
            return;
          }

          const inlineKeyboard = favorites.map(fav => {
            const doc = fav.document;
            const typeIcon = doc.type === 'BOOK' ? '📚' : doc.type === 'SUMMARY' ? '📝' : doc.type === 'EXAM' ? '🎯' : '🎥';
            return [{
              text: `${typeIcon} ${doc.title}`,
              callback_data: `doc_${doc.id}`
            }];
          });

          bot.sendMessage(chatId, '⭐ *محفوظاتك:*\nاختر الملف لعرض التفاصيل:', { 
            parse_mode: 'Markdown', 
            reply_markup: { inline_keyboard: inlineKeyboard } 
          });
        } catch (error) {
          console.error(error);
          bot.sendMessage(chatId, 'حدث خطأ أثناء جلب المحفوظات.', mainMenuKeyboard);
        }
        break;

      case '🆕 أحدث الإضافات':
        try {
          const latestDocs = await prisma.document.findMany({
            where: { status: 'APPROVED' },
            orderBy: { createdAt: 'desc' },
            take: 5,
            include: { subject: true }
          });

          if (latestDocs.length === 0) {
            bot.sendMessage(chatId, 'لا توجد ملفات مضافة حديثاً.', mainMenuKeyboard);
            return;
          }

          const inlineKeyboard = latestDocs.map(doc => {
            const typeIcon = doc.type === 'BOOK' ? '📚' : doc.type === 'SUMMARY' ? '📝' : doc.type === 'EXAM' ? '🎯' : '🎥';
            return [{
              text: `${typeIcon} ${doc.title}`,
              callback_data: `doc_${doc.id}`
            }];
          });

          bot.sendMessage(chatId, '🆕 *أحدث الملفات المضافة:*\nاختر الملف لعرض التفاصيل:', { 
            parse_mode: 'Markdown', 
            reply_markup: { inline_keyboard: inlineKeyboard } 
          });
        } catch (error) {
          console.error(error);
          bot.sendMessage(chatId, 'حدث خطأ أثناء جلب الملفات.', mainMenuKeyboard);
        }
        break;

      case '📖 موادي':
        try {
          const user = await prisma.user.findFirst({ where: { telegramId: chatId.toString() } });
          
          if (!user) {
            bot.sendMessage(chatId, 'هذه الميزة تتطلب ربط حسابك أولاً.\nأرسل /link لربط حسابك بالمنصة.', mainMenuKeyboard);
            return;
          }

          if (!user.levelId) {
            bot.sendMessage(chatId, 'لم تقم بتحديد مستواك الدراسي في المنصة بعد.', mainMenuKeyboard);
            return;
          }

          const subjects = await prisma.subject.findMany({ where: { levelId: user.levelId } });
          
          if (subjects.length === 0) {
            bot.sendMessage(chatId, 'لا توجد مواد مسجلة لمستواك الدراسي حالياً.', mainMenuKeyboard);
            return;
          }

          const inlineKeyboard = subjects.map(sub => ([{
            text: sub.name,
            callback_data: `sub_${sub.id}`
          }]));

          bot.sendMessage(chatId, '📚 *موادك الدراسية:*\nاختر المادة لعرض الملفات:', {
            parse_mode: 'Markdown',
            reply_markup: { inline_keyboard: inlineKeyboard }
          });
        } catch (error) {
          console.error(error);
          bot.sendMessage(chatId, 'حدث خطأ أثناء جلب المواد.', mainMenuKeyboard);
        }
        break;

      case '❌ إلغاء':
        bot.sendMessage(chatId, 'تم الإلغاء.', mainMenuKeyboard);
        break;

      case 'ℹ️ عن المكتبة':
        const aboutText = `*مَصْدَر | Masdar* 🎓\n\nمنصة أكاديمية تهدف إلى تجميع وتنظيم المراجع والكتب والمحاضرات الجامعية لتسهيل وصول الطلاب إليها.\n\n🌐 الموقع الإلكتروني: [قريباً]\n👨‍💻 تطوير: فريق مَصْدَر`;
        bot.sendMessage(chatId, aboutText, { parse_mode: 'Markdown', ...mainMenuKeyboard });
        break;

      default:
        // Handle search input or unknown commands
        if (!text.startsWith('/')) {
          try {
            const searchResults = await prisma.document.findMany({
              where: {
                status: 'APPROVED',
                OR: [
                  { title: { contains: text } },
                  { description: { contains: text } },
                  { subject: { name: { contains: text } } }
                ]
              },
              take: 5,
              include: { subject: true }
            });

            if (searchResults.length === 0) {
              bot.sendMessage(chatId, `لم أجد أي نتائج لـ "${text}". جرب كلمة أخرى. 🔎`);
              return;
            }

            const inlineKeyboard = searchResults.map(doc => {
              const typeIcon = doc.type === 'BOOK' ? '📚' : doc.type === 'SUMMARY' ? '📝' : doc.type === 'EXAM' ? '🎯' : '🎥';
              return [{
                text: `${typeIcon} ${doc.title}`,
                callback_data: `doc_${doc.id}`
              }];
            });

            bot.sendMessage(chatId, `🔎 *نتائج البحث عن "${text}":*\nاختر الملف لعرض التفاصيل:`, { 
              parse_mode: 'Markdown',
              reply_markup: { inline_keyboard: inlineKeyboard }
            });
          } catch (error) {
            console.error(error);
            bot.sendMessage(chatId, 'حدث خطأ أثناء البحث.');
          }
        }
        break;
    }
  });

  // Handle callback queries (Inline keyboard clicks)
  bot.on('callback_query', async (query: any) => {
    const chatId = query.message.chat.id;
    const data = query.data;

    if (!data) return;

    try {
      // Handle upload type selection
      if (data.startsWith('type_') && uploadState[chatId] && uploadState[chatId].step === 'WAITING_FOR_TYPE') {
        uploadState[chatId].type = data.split('_')[1];
        uploadState[chatId].step = 'WAITING_FOR_SUBJECT';

        const user = await prisma.user.findFirst({ where: { telegramId: chatId.toString() } });
        if (!user || !user.levelId) {
          bot.sendMessage(chatId, 'عذراً، لم تقم بتحديد مستواك الدراسي في المنصة.');
          delete uploadState[chatId];
          return;
        }

        const subjects = await prisma.subject.findMany({ where: { levelId: user.levelId } });
        if (subjects.length === 0) {
          bot.sendMessage(chatId, 'لا توجد مواد مسجلة لمستواك الدراسي.');
          delete uploadState[chatId];
          return;
        }

        const inlineKeyboard = subjects.map(sub => ([{
          text: sub.name,
          callback_data: `upsub_${sub.id}`
        }]));

        bot.sendMessage(chatId, 'الرجاء اختيار **المادة** التي يتبع لها هذا الملف:', {
          parse_mode: 'Markdown',
          reply_markup: { inline_keyboard: inlineKeyboard }
        });
      }
      // Handle upload subject selection
      else if (data.startsWith('upsub_') && uploadState[chatId] && uploadState[chatId].step === 'WAITING_FOR_SUBJECT') {
        const subjectId = parseInt(data.split('_')[1]);
        const state = uploadState[chatId];
        
        bot.sendMessage(chatId, 'جاري رفع الملف إلى المنصة... ⏳');

        // Download file from Telegram
        const fileLink = await bot.getFileLink(state.fileId!);
        
        // In a real app, you would download the file from fileLink and save it to /uploads
        // For this demo, we'll just save the Telegram file link or a dummy path
        // Let's actually download it using fetch
        const fs = require('fs');
        const path = require('path');
        const https = require('https');
        
        const ext = path.extname(state.fileName || '.pdf');
        const newFileName = `doc_${Date.now()}${ext}`;
        const localFilePath = path.join(__dirname, '../../uploads', newFileName);
        
        const file = fs.createWriteStream(localFilePath);
        https.get(fileLink, async (response: any) => {
          response.pipe(file);
          
          file.on('finish', async () => {
            file.close();
            
            // Save to database
            await prisma.document.create({
              data: {
                title: state.title!,
                description: 'تم الرفع عبر بوت التيليجرام',
                type: state.type! as any,
                fileUrl: `/uploads/${newFileName}`,
                subjectId: subjectId,
                uploaderId: state.uploaderId!,
                status: 'PENDING'
              }
            });

            bot.sendMessage(chatId, '✅ **تم رفع الملف بنجاح!**\n\nالملف الآن قيد المراجعة من قبل المشرفين، وسيتم إشعار الطلاب فور اعتماده.', {
              parse_mode: 'Markdown',
              ...mainMenuKeyboard
            });

            delete uploadState[chatId];
          });
        }).on('error', (err: any) => {
          console.error(err);
          bot.sendMessage(chatId, 'حدث خطأ أثناء تحميل الملف من تيليجرام.');
          delete uploadState[chatId];
        });
      }
      // Handle browsing universities
      else if (data.startsWith('uni_')) {
        const uniId = parseInt(data.split('_')[1]);
        const colleges = await prisma.college.findMany({ where: { universityId: uniId } });
        
        if (colleges.length === 0) {
          bot.sendMessage(chatId, 'لا توجد كليات مسجلة لهذه الجامعة.');
          return;
        }

        const inlineKeyboard = colleges.map(col => ([{
          text: col.name,
          callback_data: `col_${col.id}`
        }]));

        bot.sendMessage(chatId, 'اختر الكلية:', {
          reply_markup: { inline_keyboard: inlineKeyboard }
        });
      } 
      else if (data.startsWith('col_')) {
        const colId = parseInt(data.split('_')[1]);
        const departments = await prisma.department.findMany({ where: { collegeId: colId } });
        
        if (departments.length === 0) {
          bot.sendMessage(chatId, 'لا توجد أقسام مسجلة لهذه الكلية.');
          return;
        }

        const inlineKeyboard = departments.map(dep => ([{
          text: dep.name,
          callback_data: `dep_${dep.id}`
        }]));

        bot.sendMessage(chatId, 'اختر القسم:', {
          reply_markup: { inline_keyboard: inlineKeyboard }
        });
      }
      else if (data.startsWith('dep_')) {
        const depId = parseInt(data.split('_')[1]);
        const majors = await prisma.major.findMany({ where: { departmentId: depId } });
        
        if (majors.length === 0) {
          bot.sendMessage(chatId, 'لا توجد تخصصات مسجلة لهذا القسم.');
          return;
        }

        const inlineKeyboard = majors.map(maj => ([{
          text: maj.name,
          callback_data: `maj_${maj.id}`
        }]));

        bot.sendMessage(chatId, 'اختر التخصص:', {
          reply_markup: { inline_keyboard: inlineKeyboard }
        });
      }
      else if (data.startsWith('maj_')) {
        const majId = parseInt(data.split('_')[1]);
        const levels = await prisma.level.findMany({ where: { majorId: majId } });
        
        if (levels.length === 0) {
          bot.sendMessage(chatId, 'لا توجد مستويات مسجلة لهذا التخصص.');
          return;
        }

        const inlineKeyboard = levels.map(lvl => ([{
          text: lvl.name,
          callback_data: `lvl_${lvl.id}`
        }]));

        bot.sendMessage(chatId, 'اختر المستوى الدراسي:', {
          reply_markup: { inline_keyboard: inlineKeyboard }
        });
      }
      else if (data.startsWith('lvl_')) {
        const lvlId = parseInt(data.split('_')[1]);
        const subjects = await prisma.subject.findMany({ where: { levelId: lvlId } });
        
        if (subjects.length === 0) {
          bot.sendMessage(chatId, 'لا توجد مواد مسجلة لهذا المستوى.');
          return;
        }

        const inlineKeyboard = subjects.map(sub => ([{
          text: sub.name,
          callback_data: `sub_${sub.id}`
        }]));

        bot.sendMessage(chatId, 'اختر المادة:', {
          reply_markup: { inline_keyboard: inlineKeyboard }
        });
      }
      else if (data.startsWith('sub_')) {
        const subId = parseInt(data.split('_')[1]);
        const documents = await prisma.document.findMany({ 
          where: { subjectId: subId, status: 'APPROVED' } 
        });
        
        if (documents.length === 0) {
          bot.sendMessage(chatId, 'لا توجد ملفات معتمدة لهذه المادة حالياً.');
          return;
        }

        const inlineKeyboard = documents.map(doc => {
          const typeIcon = doc.type === 'BOOK' ? '📚' : doc.type === 'SUMMARY' ? '📝' : doc.type === 'EXAM' ? '🎯' : '🎥';
          return [{
            text: `${typeIcon} ${doc.title}`,
            callback_data: `doc_${doc.id}`
          }];
        });

        bot.sendMessage(chatId, 'اختر الملف لعرض التفاصيل والتحميل:', {
          reply_markup: { inline_keyboard: inlineKeyboard }
        });
      }
      else if (data.startsWith('doc_')) {
        const docId = parseInt(data.split('_')[1]);
        const document = await prisma.document.findUnique({
          where: { id: docId },
          include: {
            subject: {
              include: {
                level: {
                  include: {
                    major: {
                      include: {
                        department: {
                          include: {
                            college: {
                              include: {
                                university: true
                              }
                            }
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        });

        if (!document) {
          bot.sendMessage(chatId, 'عذراً، الملف غير موجود.');
          return;
        }

        const typeName = document.type === 'BOOK' ? 'كتاب' : document.type === 'SUMMARY' ? 'ملخص' : document.type === 'EXAM' ? 'اختبار' : 'محاضرة';
        
        const fileSize = document.fileSize || 'غير معروف';

        let msgText = `📄 *تفاصيل الملف:*\n\n`;
        msgText += `*العنوان:* ${document.title}\n`;
        msgText += `*النوع:* ${typeName}\n`;
        msgText += `*الحجم:* ${fileSize}\n`;
        msgText += `*الوصف:* ${document.description || 'لا يوجد'}\n\n`;
        
        if (document.subject) {
          msgText += `*المادة:* ${document.subject.name}\n`;
          msgText += `*المستوى:* ${document.subject.level.name}\n`;
          msgText += `*التخصص:* ${document.subject.level.major.name}\n`;
          msgText += `*القسم:* ${document.subject.level.major.department.name}\n`;
          msgText += `*الكلية:* ${document.subject.level.major.department.college.name}\n`;
          msgText += `*الجامعة:* ${document.subject.level.major.department.college.university.name}\n`;
        }

        const inlineKeyboard = [
          [{ text: '📥 تحميل الملف', callback_data: `dl_${document.id}` }],
          [{ text: '❤️ حفظ في المفضلة', callback_data: `sv_${document.id}` }]
        ];

        bot.sendMessage(chatId, msgText, {
          parse_mode: 'Markdown',
          reply_markup: { inline_keyboard: inlineKeyboard }
        });
      }
      else if (data.startsWith('dl_')) {
        const docId = parseInt(data.split('_')[1]);
        const document = await prisma.document.findUnique({ where: { id: docId } });
        if (!document || document.status !== 'APPROVED') {
          bot.sendMessage(chatId, 'عذراً، الملف غير موجود أو غير متاح للتحميل.');
          return;
        }

        bot.sendMessage(chatId, 'جاري تحضير الملف... ⏳');
        
        const fs = require('fs');
        const path = require('path');
        const localFilePath = path.join(__dirname, '../../', document.fileUrl);
        
        if (fs.existsSync(localFilePath)) {
          bot.sendDocument(chatId, localFilePath, {
            caption: `📚 ${document.title}\n\nتم التحميل عبر بوت مكتبتي الجامعية`
          }).then(() => {
            const rateKeyboard = {
              inline_keyboard: [
                [
                  { text: '⭐', callback_data: `rate_${docId}_1` },
                  { text: '⭐⭐', callback_data: `rate_${docId}_2` },
                  { text: '⭐⭐⭐', callback_data: `rate_${docId}_3` }
                ],
                [
                  { text: '⭐⭐⭐⭐', callback_data: `rate_${docId}_4` },
                  { text: '⭐⭐⭐⭐⭐', callback_data: `rate_${docId}_5` }
                ]
              ]
            };
            bot.sendMessage(chatId, 'كيف تقيم هذا الملف؟', { reply_markup: rateKeyboard });
          });
        } else {
          const baseUrl = process.env.BASE_URL || 'http://localhost:5000';
          const filePath = `${baseUrl}${document.fileUrl}`;
          bot.sendMessage(chatId, `عذراً، لم أتمكن من العثور على الملف في الخادم.\nالرابط المباشر: ${filePath}`);
        }
      }
      else if (data.startsWith('sv_')) {
        const docId = parseInt(data.split('_')[1]);
        const user = await prisma.user.findFirst({ where: { telegramId: chatId.toString() } });
        
        if (!user) {
          bot.sendMessage(chatId, 'عذراً، يجب ربط حسابك أولاً لتتمكن من حفظ الملفات. أرسل /link للربط.');
          return;
        }

        const existingFav = await prisma.favorite.findUnique({
          where: { userId_documentId: { userId: user.id, documentId: docId } }
        });

        if (existingFav) {
          await prisma.favorite.delete({ where: { id: existingFav.id } });
          bot.sendMessage(chatId, '❌ تم إزالة الملف من المحفوظات.');
        } else {
          await prisma.favorite.create({ data: { userId: user.id, documentId: docId } });
          bot.sendMessage(chatId, '❤️ تم حفظ الملف بنجاح! يمكنك الوصول إليه من زر "المحفوظات".');
        }
      }
      else if (data.startsWith('rate_')) {
        const parts = data.split('_');
        const docId = parseInt(parts[1]);
        const rating = parseInt(parts[2]);
        
        const user = await prisma.user.findFirst({ where: { telegramId: chatId.toString() } });
        
        if (!user) {
          bot.sendMessage(chatId, 'عذراً، يجب ربط حسابك أولاً لتتمكن من التقييم. أرسل /link للربط.');
          return;
        }

        await prisma.review.upsert({
          where: {
            userId_documentId: {
              userId: user.id,
              documentId: docId,
            },
          },
          update: { rating },
          create: {
            userId: user.id,
            documentId: docId,
            rating,
          },
        });

        bot.sendMessage(chatId, `شكراً لتقييمك! منحته ${rating} نجوم ⭐`);
      }
      
      // Answer callback query to remove loading state on button
      bot.answerCallbackQuery(query.id);
    } catch (error) {
      console.error(error);
      bot.sendMessage(chatId, 'حدث خطأ.');
    }
  });

  // Handle /download_ID commands
  bot.onText(/\/download_(\d+)/, async (msg: any, match: any) => {
    const chatId = msg.chat.id;
    const docId = parseInt(match[1]);

    try {
      const document = await prisma.document.findUnique({ where: { id: docId } });
      
      if (!document || document.status !== 'APPROVED') {
        bot.sendMessage(chatId, 'عذراً، الملف غير موجود أو غير متاح للتحميل.');
        return;
      }

      bot.sendMessage(chatId, 'جاري تحضير الملف... ⏳');
      
      const fs = require('fs');
      const path = require('path');
      
      const localFilePath = path.join(__dirname, '../../', document.fileUrl);
      
      if (fs.existsSync(localFilePath)) {
        bot.sendDocument(chatId, localFilePath, {
          caption: `📚 ${document.title}\n\nتم التحميل عبر بوت مكتبتي الجامعية`
        });
      } else {
        const filePath = `http://localhost:5000${document.fileUrl}`;
        bot.sendMessage(chatId, `عذراً، لم أتمكن من العثور على الملف في الخادم.\nالرابط المباشر: ${filePath}`);
      }

    } catch (error) {
      console.error(error);
      bot.sendMessage(chatId, 'حدث خطأ أثناء تحميل الملف.');
    }
  });

  // Handle /save_ID commands
  bot.onText(/\/save_(\d+)/, async (msg: any, match: any) => {
    const chatId = msg.chat.id;
    const docId = parseInt(match[1]);

    try {
      const user = await prisma.user.findFirst({ where: { telegramId: chatId.toString() } });
      
      if (!user) {
        bot.sendMessage(chatId, 'عذراً، يجب ربط حسابك أولاً لتتمكن من حفظ الملفات. أرسل /link للربط.');
        return;
      }

      const document = await prisma.document.findUnique({ where: { id: docId } });
      if (!document || document.status !== 'APPROVED') {
        bot.sendMessage(chatId, 'عذراً، الملف غير موجود.');
        return;
      }

      const existingFav = await prisma.favorite.findUnique({
        where: {
          userId_documentId: {
            userId: user.id,
            documentId: docId
          }
        }
      });

      if (existingFav) {
        await prisma.favorite.delete({ where: { id: existingFav.id } });
        bot.sendMessage(chatId, '❌ تم إزالة الملف من المحفوظات.');
      } else {
        await prisma.favorite.create({
          data: {
            userId: user.id,
            documentId: docId
          }
        });
        bot.sendMessage(chatId, '❤️ تم حفظ الملف بنجاح! يمكنك الوصول إليه من زر "المحفوظات".');
      }

    } catch (error) {
      console.error(error);
      bot.sendMessage(chatId, 'حدث خطأ أثناء حفظ الملف.');
    }
  });
} else {
  console.log('⚠️ Telegram Bot Token not found. Bot is disabled.');
}
