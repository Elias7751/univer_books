# دليل المساهمة (Contributing Guidelines)

شكراً لاهتمامك بالمساهمة في منصة المكتبة الأكاديمية! نحن نرحب بمساهمات الجميع.

## كيفية المساهمة

1. **نسخ المستودع (Fork):** اضغط على زر "Fork" في أعلى يمين صفحة المستودع على GitHub.
2. **استنساخ النسخة (Clone):**
   ```bash
   git clone https://github.com/your-username/univer-StudentDev.git
   cd univer-StudentDev
   ```
3. **إنشاء فرع جديد (Branch):** قم بإنشاء فرع جديد للميزة أو الإصلاح الذي تعمل عليه.
   ```bash
   git checkout -b feature/your-feature-name
   # أو للإصلاحات
   git checkout -b fix/your-bugfix-name
   ```
4. **إجراء التعديلات:** قم بكتابة الكود الخاص بك. تأكد من اتباع معايير كتابة الكود الخاصة بالمشروع.
5. **حفظ التعديلات (Commit):** اكتب رسائل توضيحية واضحة لما قمت بتعديله.
   ```bash
   git commit -m "Add: User profile picture upload feature"
   ```
6. **رفع التعديلات (Push):**
   ```bash
   git push origin feature/your-feature-name
   ```
7. **إنشاء طلب سحب (Pull Request):** اذهب إلى المستودع الأصلي واضغط على "New Pull Request". اشرح التعديلات التي قمت بها بالتفصيل.

## معايير كتابة الكود (Coding Standards)

- استخدم **TypeScript** في كل من الـ Frontend والـ Backend.
- تأكد من تنسيق الكود بشكل صحيح (نوصي باستخدام Prettier).
- تجنب ترك أوامر `console.log` في الكود النهائي (Production).
- قم بكتابة تعليقات (Comments) للأكواد المعقدة.

## الإبلاغ عن الأخطاء (Reporting Bugs)

إذا وجدت خطأ (Bug)، يرجى فتح Issue على GitHub مع تضمين:

- عنوان ووصف واضح للمشكلة.
- خطوات إعادة إنتاج الخطأ (Steps to reproduce).
- السلوك المتوقع مقابل السلوك الفعلي.
- بيئة العمل الخاصة بك (نظام التشغيل، المتصفح، إصدار Node).
