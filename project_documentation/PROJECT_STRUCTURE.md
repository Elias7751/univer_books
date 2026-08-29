# بنية المشروع (Project Structure)

تم بناء المشروع بنظام (Monorepo) حيث يحتوي على كل من واجهة المستخدم (Frontend) والخادم (Backend) في نفس المستودع.

## المجلد الرئيسي (Root Directory)

- `frontend/`: يحتوي على تطبيق React/Vite.
- `backend/`: يحتوي على تطبيق Node.js/Express.
- `project_documentation/`: يحتوي على ملفات التوثيق الخاصة بالمشروع.

## واجهة المستخدم (`/frontend`)

- `src/`
  - `components/`: مكونات واجهة المستخدم القابلة لإعادة الاستخدام (مثل: Navbar, Buttons, Modals).
  - `pages/`: مكونات الصفحات التي تمثل المسارات المختلفة (مثل: Home, Dashboard, Admin, GeneralLibrary).
  - `context/` أو `store/`: إدارة حالة التطبيق (مثل: AuthContext).
  - `services/` أو `api/`: الدوال الخاصة بالاتصال بالخادم (API calls).
  - `assets/`: الملفات الثابتة مثل الصور والأيقونات.
  - `styles/`: ملفات التنسيق CSS أو إعدادات Tailwind.
- `public/`: الأصول العامة (Public assets).

## الخادم (`/backend`)

- `src/`
  - `controllers/`: معالجة الطلبات القادمة (HTTP requests) وإرسال الردود.
  - `routes/`: تعريف مسارات الـ API وربطها بالـ Controllers.
  - `middlewares/`: وظائف وسيطة (مثل: التحقق من المصادقة، معالجة الأخطاء).
  - `services/`: منطق الأعمال (Business logic) والتفاعل مع قاعدة البيانات.
  - `bot/`: الأكواد الخاصة بربط بوت تيليجرام.
- `prisma/`
  - `schema.prisma`: ملف تعريف بنية قاعدة البيانات.
  - `seed.ts`: سكريبت لإدخال البيانات الأولية إلى قاعدة البيانات.
- `.env`: متغيرات البيئة (مثل: رابط قاعدة البيانات، سر الـ JWT).
