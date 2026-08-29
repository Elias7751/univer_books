# توثيق الواجهة البرمجية (API Documentation)

يوضح هذا الملف مسارات الـ API (Endpoints) الأساسية المتاحة في خادم منصة المكتبة الأكاديمية.

## الرابط الأساسي (Base URL)

`http://localhost:3000/api` (في بيئة التطوير المحلية)

## المصادقة (Authentication)

معظم المسارات تتطلب إرسال رمز (JWT Token) في ترويسة `Authorization`.
`Authorization: Bearer <your_token_here>`

---

## 1. مسارات المصادقة (`/auth`)

### تسجيل مستخدم جديد (Register)

- **URL:** `/auth/register`
- **Method:** `POST`
- **Body:**
  ```json
  {
    "name": "John Doe",
    "email": "john@example.com",
    "password": "password123",
    "departmentId": 1,
    "levelId": 1
  }
  ```

### تسجيل الدخول (Login)

- **URL:** `/auth/login`
- **Method:** `POST`
- **Body:**
  ```json
  {
    "email": "john@example.com",
    "password": "password123"
  }
  ```
- **Response:** يعيد بيانات المستخدم مع رمز JWT.

---

## 2. الهيكلية الأكاديمية (`/academic`)

### جلب جميع الجامعات (Get all Universities)

- **URL:** `/academic/universities`
- **Method:** `GET`

### جلب الكليات التابعة لجامعة (Get Colleges by University)

- **URL:** `/academic/universities/:id/colleges`
- **Method:** `GET`

### جلب الأقسام التابعة لكلية (Get Departments by College)

- **URL:** `/academic/colleges/:id/departments`
- **Method:** `GET`

### جلب المستويات التابعة لقسم (Get Levels by Department)

- **URL:** `/academic/departments/:id/levels`
- **Method:** `GET`

### جلب المواد التابعة لمستوى (Get Subjects by Level)

- **URL:** `/academic/levels/:id/subjects`
- **Method:** `GET`

---

## 3. المستندات (`/documents`)

### رفع مستند (Upload a Document)

- **URL:** `/documents/upload`
- **Method:** `POST`
- **Headers:** `Authorization: Bearer <token>`
- **Body:** `multipart/form-data` (يحتوي على الملف، العنوان، الوصف، النوع، ومعرف المادة)

### جلب المستندات المعتمدة لمادة معينة (Get Approved Documents)

- **URL:** `/documents/subject/:subjectId`
- **Method:** `GET`

### جلب المستندات قيد الانتظار (Get Pending Documents) - للمدراء والمشرفين

- **URL:** `/documents/pending`
- **Method:** `GET`
- **Headers:** `Authorization: Bearer <token>`

### قبول/رفض مستند (Approve/Reject Document)

- **URL:** `/documents/:id/status`
- **Method:** `PATCH`
- **Headers:** `Authorization: Bearer <token>`
- **Body:**
  ```json
  {
    "status": "APPROVED", // أو "REJECTED"
    "rejectionReason": "سبب الرفض اختياري"
  }
  ```

---

## 4. المكتبة العامة (`/general-library`)

### جلب الفئات العامة (Get General Categories)

- **URL:** `/general-library/categories`
- **Method:** `GET`

### جلب الكتب حسب الفئة (Get Books by Category)

- **URL:** `/general-library/categories/:id/books`
- **Method:** `GET`

---

## 5. تفاعلات المستخدمين (`/interactions`)

### الإضافة للمفضلة (Add to Favorites)

- **URL:** `/interactions/favorites`
- **Method:** `POST`
- **Headers:** `Authorization: Bearer <token>`
- **Body:** `{ "documentId": 1 }`

### إضافة تقييم (Add a Review)

- **URL:** `/interactions/reviews`
- **Method:** `POST`
- **Headers:** `Authorization: Bearer <token>`
- **Body:**
  ```json
  {
    "documentId": 1,
    "rating": 5,
    "comment": "ملخص ممتاز!"
  }
  ```

_(ملاحظة: هذه نظرة عامة. للحصول على التفاصيل الكاملة، يرجى مراجعة الكود المصدري في `backend/src/routes`)_
