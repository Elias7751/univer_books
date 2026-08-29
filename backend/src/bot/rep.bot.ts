import TelegramBot from 'node-telegram-bot-api';
import prisma from '../utils/prisma';
import fs from 'fs';
import path from 'path';
import axios from 'axios';
import { DocStatus, DocType } from '@prisma/client';

const token = process.env.REP_BOT_TOKEN;

export let repBot: TelegramBot | null = null;

if (token) {
  repBot = new TelegramBot(token, { polling: true });
  console.log('🤖 Representative Telegram Bot is running...');

  // State machine for uploads
  const userStates: Record<number, { 
    step: string, 
    data: {
      universityId?: number,
      collegeId?: number,
      departmentId?: number,
      majorId?: number,
      levelId?: number,
      subjectId?: number,
      type?: DocType,
      title?: string,
      uploaderId?: number
    }
  }> = {};

  // Helper to check if user is authorized
  const checkAuth = async (chatId: number, telegramId: string) => {
    const user = await prisma.user.findUnique({ where: { telegramId } });
    if (!user) {
      repBot!.sendMessage(chatId, 'عذراً، حسابك غير مربوط بالمنصة. يرجى ربط حسابك أولاً من خلال البوت الرئيسي.');
      return null;
    }
    if (user.role !== 'REPRESENTATIVE' && user.role !== 'ADMIN') {
      repBot!.sendMessage(chatId, 'عذراً، هذا البوت مخصص للمناديب والإدارة فقط.');
      return null;
    }
    return user;
  };

  repBot.onText(/\/start/, async (msg) => {
    const chatId = msg.chat.id;
    const telegramId = msg.from?.id.toString();
    if (!telegramId) return;

    const user = await checkAuth(chatId, telegramId);
    if (!user) return;

    repBot!.sendMessage(chatId, `مرحباً بك يا ${user.name} في بوت المناديب! 🎓\n\nلرفع ملف جديد، أرسل الأمر /upload`);
  });

  repBot.onText(/\/upload/, async (msg) => {
    const chatId = msg.chat.id;
    const telegramId = msg.from?.id.toString();
    if (!telegramId) return;

    const user = await checkAuth(chatId, telegramId);
    if (!user) return;

    // Start upload flow
    userStates[chatId] = { step: 'SELECT_UNI', data: { uploaderId: user.id } };

    const universities = await prisma.university.findMany();
    if (universities.length === 0) {
      repBot!.sendMessage(chatId, 'لا توجد جامعات مسجلة في النظام.');
      return;
    }

    const inlineKeyboard = universities.map(uni => ([{
      text: uni.name,
      callback_data: `uni_${uni.id}`
    }]));

    repBot!.sendMessage(chatId, 'خطوة 1/9: اختر الجامعة:', {
      reply_markup: { inline_keyboard: inlineKeyboard }
    });
  });

  repBot.on('callback_query', async (query) => {
    const chatId = query.message?.chat.id;
    const data = query.data;
    if (!chatId || !data) return;

    const state = userStates[chatId];
    if (!state) {
      repBot!.answerCallbackQuery(query.id, { text: 'انتهت الجلسة. أرسل /upload للبدء من جديد.' });
      return;
    }

    try {
      if (data.startsWith('uni_') && state.step === 'SELECT_UNI') {
        const uniId = parseInt(data.split('_')[1]);
        state.data.universityId = uniId;
        state.step = 'SELECT_COLLEGE';

        const colleges = await prisma.college.findMany({ where: { universityId: uniId } });
        const inlineKeyboard = colleges.map(col => ([{ text: col.name, callback_data: `col_${col.id}` }]));
        
        repBot!.editMessageText('خطوة 2/9: اختر الكلية:', {
          chat_id: chatId,
          message_id: query.message?.message_id,
          reply_markup: { inline_keyboard: inlineKeyboard }
        });
      }
      else if (data.startsWith('col_') && state.step === 'SELECT_COLLEGE') {
        const colId = parseInt(data.split('_')[1]);
        state.data.collegeId = colId;
        state.step = 'SELECT_DEPT';

        const depts = await prisma.department.findMany({ where: { collegeId: colId } });
        const inlineKeyboard = depts.map(d => ([{ text: d.name, callback_data: `dep_${d.id}` }]));
        
        repBot!.editMessageText('خطوة 3/9: اختر القسم:', {
          chat_id: chatId,
          message_id: query.message?.message_id,
          reply_markup: { inline_keyboard: inlineKeyboard }
        });
      }
      else if (data.startsWith('dep_') && state.step === 'SELECT_DEPT') {
        const depId = parseInt(data.split('_')[1]);
        state.data.departmentId = depId;
        state.step = 'SELECT_MAJOR';

        const majors = await prisma.major.findMany({ where: { departmentId: depId } });
        const inlineKeyboard = majors.map(m => ([{ text: m.name, callback_data: `maj_${m.id}` }]));
        
        repBot!.editMessageText('خطوة 4/9: اختر التخصص:', {
          chat_id: chatId,
          message_id: query.message?.message_id,
          reply_markup: { inline_keyboard: inlineKeyboard }
        });
      }
      else if (data.startsWith('maj_') && state.step === 'SELECT_MAJOR') {
        const majId = parseInt(data.split('_')[1]);
        state.data.majorId = majId;
        state.step = 'SELECT_LEVEL';

        const levels = await prisma.level.findMany({ where: { majorId: majId } });
        const inlineKeyboard = levels.map(l => ([{ text: l.name, callback_data: `lvl_${l.id}` }]));
        
        repBot!.editMessageText('خطوة 5/9: اختر المستوى:', {
          chat_id: chatId,
          message_id: query.message?.message_id,
          reply_markup: { inline_keyboard: inlineKeyboard }
        });
      }
      else if (data.startsWith('lvl_') && state.step === 'SELECT_LEVEL') {
        const lvlId = parseInt(data.split('_')[1]);
        state.data.levelId = lvlId;
        state.step = 'SELECT_SUBJECT';

        const subjects = await prisma.subject.findMany({ where: { levelId: lvlId } });
        const inlineKeyboard = subjects.map(s => ([{ text: `${s.name} (الفصل ${s.semester})`, callback_data: `sub_${s.id}` }]));
        
        repBot!.editMessageText('خطوة 6/9: اختر المادة:', {
          chat_id: chatId,
          message_id: query.message?.message_id,
          reply_markup: { inline_keyboard: inlineKeyboard }
        });
      }
      else if (data.startsWith('sub_') && state.step === 'SELECT_SUBJECT') {
        const subId = parseInt(data.split('_')[1]);
        state.data.subjectId = subId;
        state.step = 'SELECT_TYPE';

        const inlineKeyboard = [
          [{ text: 'كتاب', callback_data: 'type_BOOK' }, { text: 'ملخص', callback_data: 'type_SUMMARY' }],
          [{ text: 'نموذج اختبار', callback_data: 'type_EXAM' }, { text: 'محاضرة', callback_data: 'type_LECTURE' }]
        ];
        
        repBot!.editMessageText('خطوة 7/9: اختر نوع الملف:', {
          chat_id: chatId,
          message_id: query.message?.message_id,
          reply_markup: { inline_keyboard: inlineKeyboard }
        });
      }
      else if (data.startsWith('type_') && state.step === 'SELECT_TYPE') {
        const type = data.split('_')[1] as DocType;
        state.data.type = type;
        state.step = 'ENTER_TITLE';

        repBot!.editMessageText('خطوة 8/9: أرسل عنوان الملف (رسالة نصية):', {
          chat_id: chatId,
          message_id: query.message?.message_id
        });
      }
      
      repBot!.answerCallbackQuery(query.id);
    } catch (error) {
      console.error(error);
      repBot!.sendMessage(chatId, 'حدث خطأ، يرجى المحاولة مرة أخرى.');
    }
  });

  repBot.on('message', async (msg) => {
    const chatId = msg.chat.id;
    const state = userStates[chatId];
    if (!state) return;

    if (state.step === 'ENTER_TITLE' && msg.text && !msg.text.startsWith('/')) {
      state.data.title = msg.text;
      state.step = 'UPLOAD_FILE';
      repBot!.sendMessage(chatId, 'خطوة 9/9: أرسل الملف الآن (PDF, Word, صور...).\n\n*ملاحظة:* الحد الأقصى لحجم الملف هو 20 ميجابايت.', { parse_mode: 'Markdown' });
    }
    else if (state.step === 'UPLOAD_FILE' && msg.document) {
      try {
        repBot!.sendMessage(chatId, 'جاري تحميل الملف... ⏳');
        
        const fileId = msg.document.file_id;
        const file = await repBot!.getFile(fileId);
        
        if (!file.file_path) {
          repBot!.sendMessage(chatId, 'عذراً، لم أتمكن من تحميل الملف. قد يكون حجمه كبيراً جداً.');
          return;
        }

        const fileUrl = `https://api.telegram.org/file/bot${token}/${file.file_path}`;
        
        // Download file to local uploads directory
        const uploadsDir = path.join(__dirname, '../../uploads');
        if (!fs.existsSync(uploadsDir)) {
          fs.mkdirSync(uploadsDir, { recursive: true });
        }

        const fileName = `${Date.now()}_${msg.document.file_name || 'document'}`;
        const filePath = path.join(uploadsDir, fileName);
        
        const response = await axios({
          method: 'GET',
          url: fileUrl,
          responseType: 'stream'
        });

        const writer = fs.createWriteStream(filePath);
        response.data.pipe(writer);

        writer.on('finish', async () => {
          // Calculate size
          const sizeInMB = ((msg.document?.file_size || 0) / (1024 * 1024)).toFixed(2);
          const fileSizeStr = `${sizeInMB} MB`;

          // Save to database
          await prisma.document.create({
            data: {
              title: state.data.title!,
              type: state.data.type!,
              fileUrl: `/uploads/${fileName}`,
              fileSize: fileSizeStr,
              subjectId: state.data.subjectId!,
              uploaderId: state.data.uploaderId!,
              status: DocStatus.PENDING
            }
          });

          repBot!.sendMessage(chatId, '✅ تم رفع الملف بنجاح! وهو الآن قيد المراجعة من قبل الإدارة.');
          delete userStates[chatId]; // Clear state
        });

        writer.on('error', () => {
          repBot!.sendMessage(chatId, 'حدث خطأ أثناء حفظ الملف.');
        });

      } catch (error) {
        console.error(error);
        repBot!.sendMessage(chatId, 'حدث خطأ أثناء معالجة الملف. تأكد أن حجم الملف أقل من 20MB.');
      }
    }
  });

} else {
  console.log('⚠️ REP_BOT_TOKEN is not defined in .env');
}
