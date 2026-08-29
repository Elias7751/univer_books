# بنية قاعدة البيانات (Database Schema)

يستخدم المشروع Prisma ORM لإدارة قاعدة البيانات. فيما يلي الهيكلية الأساسية لقاعدة البيانات:

## 1. المستخدمين والصلاحيات (Users & Roles)

- **User (المستخدم):** يمثل جميع المستخدمين في النظام.
  - الحقول: `id`, `name`, `email`, `password`, `role` (ADMIN, SUPERVISOR, STUDENT), `status` (ACTIVE, BANNED).
  - العلاقات: ينتمي إلى `Department` (قسم) و `Level` (مستوى). يمكنه رفع، تقييم، الإبلاغ عن، وتفضيل المستندات.

## 2. الهيكلية الأكاديمية (Academic Hierarchy)

- **University (الجامعة):** الكيان الأعلى في الهيكلية.
- **College (الكلية):** تنتمي إلى جامعة.
- **Department (القسم):** ينتمي إلى كلية.
- **Level (المستوى):** ينتمي إلى قسم (مثل: السنة الأولى، السنة الثانية).
- **Subject (المادة):** تنتمي إلى مستوى. تمثل مقرراً دراسياً معيناً.

## 3. المكتبة العامة (General Library)

- **GeneralCategory (فئة عامة):** فئات الكتب في المكتبة العامة (مثل: تقنية، تاريخ).
- **GeneralBook (كتاب عام):** الكتب المتاحة في المكتبة العامة.
  - الحقول: `title`, `author`, `description`, `coverUrl`, `fileUrl`, `language`, `pages`.

## 4. المستندات والملفات (Documents & Files)

- **Document (المستند):** الموارد الأكاديمية التي يرفعها المستخدمون.
  - الحقول: `title`, `description`, `fileUrl`, `type` (BOOK, RESEARCH, SUMMARY, EXAM).
  - الحالة: `status` (PENDING, APPROVED, REJECTED).
  - العلاقات: ينتمي إلى `Subject` (إذا كان أكاديمياً) أو يتم تعليمه كـ `isGeneral`. مرتبط بـ `uploader` (الرافع) و `reviewer` (المراجع).

## 5. التفاعلات (Interactions)

- **Favorite (المفضلة):** يربط `User` بـ `Document` قام بحفظه.
- **Review (التقييم):** يسمح لـ `User` بترك `rating` (تقييم من 1-5) و `comment` (تعليق) على `Document`.
- **Report (البلاغ):** يسمح لـ `User` بالإبلاغ عن `Document` مع ذكر `reason` (السبب).

## 6. سجل النظام (System Logs)

- **AuditLog (سجل النشاطات):** يسجل الإجراءات التي تمت داخل النظام لأغراض التتبع الإداري.
