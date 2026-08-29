# متغيرات البيئة (Environment Variables)

لتشغيل هذا المشروع محلياً أو على خادم الإنتاج (Production)، تحتاج إلى إعداد متغيرات البيئة لكل من واجهة المستخدم (Frontend) والخادم (Backend).

## الخادم (`/backend/.env`)

قم بإنشاء ملف `.env` في مجلد `backend` وأضف المتغيرات التالية:

```env
# إعدادات الخادم
PORT=3000
NODE_ENV=development

# إعدادات قاعدة البيانات (Prisma)
# استبدل هذا الرابط برابط الاتصال الفعلي بقاعدة بيانات PostgreSQL أو MySQL
DATABASE_URL="postgresql://user:password@localhost:5432/univer_db?schema=public"

# المصادقة (Authentication)
# المفتاح السري لتوقيع رموز JWT. تأكد من استخدام نص طويل وعشوائي في بيئة الإنتاج.
JWT_SECRET="your_super_secret_jwt_key_here"
JWT_EXPIRES_IN="7d"

# رفع الملفات (إذا كنت تستخدم خدمة خارجية مثل AWS S3 أو Cloudinary)
# CLOUDINARY_URL="cloudinary://..."

# بوت تيليجرام (اختياري)
TELEGRAM_BOT_TOKEN="your_telegram_bot_token"
```

## واجهة المستخدم (`/frontend/.env`)

قم بإنشاء ملف `.env` في مجلد `frontend` وأضف المتغيرات التالية:

```env
# رابط الـ API
# يشير إلى خادم الباك إند. استخدم الرابط الفعلي عند رفع المشروع (Deployment).
VITE_API_URL="http://localhost:3000/api"

# متغيرات أخرى (إن وجدت)
# VITE_APP_NAME="Academic Library"
```

### ملاحظات هامة:

- **لا تقم أبداً برفع ملفات `.env` إلى GitHub.** تأكد من وجود `.env` داخل ملف `.gitignore`.
- في بيئة الإنتاج (مثل Vercel أو Render)، يجب عليك إضافة هذه المتغيرات من خلال لوحة تحكم الاستضافة.
