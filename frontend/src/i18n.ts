import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Translation resources
const resources = {
  ar: {
    translation: {
      "login": {
        "title": "تسجيل الدخول إلى يونيفر",
        "subtitle": "منصتك التعليمية الجامعية",
        "email": "البريد الإلكتروني",
        "password": "كلمة المرور",
        "submit": "تسجيل الدخول",
        "submitting": "جاري تسجيل الدخول...",
        "no_account": "ليس لديك حساب؟",
        "register_link": "إنشاء حساب جديد"
      },
      "register": {
        "title": "إنشاء حساب جديد",
        "subtitle": "انضم إلى يونيفر واستفد من آلاف المصادر",
        "name": "الاسم الكامل",
        "email": "البريد الإلكتروني",
        "password": "كلمة المرور",
        "submit": "إنشاء الحساب",
        "submitting": "جاري الإنشاء...",
        "has_account": "لديك حساب بالفعل؟",
        "login_link": "تسجيل الدخول"
      },
      "dashboard": {
        "welcome": "مرحباً بعودتك",
        "logout": "تسجيل الخروج",
        "search_title": "ابحث عن المصادر",
        "search_placeholder": "ابحث عن كتب، ملخصات، أو نماذج اختبارات...",
        "search_btn": "بحث",
        "recent": "أحدث الإضافات",
        "download": "تحميل",
        "no_docs": "لا توجد ملفات",
        "no_docs_desc": "لم يتم إضافة أي ملفات معتمدة حتى الآن.",
        "by": "بواسطة:"
      },
      "admin": {
        "title": "لوحة تحكم يونيفر",
        "pending": "الملفات المعلقة",
        "universities": "الجامعات والكليات",
        "users": "المستخدمين",
        "approve": "موافقة",
        "reject": "رفض",
        "no_pending": "كل شيء مكتمل!",
        "no_pending_desc": "لا توجد ملفات بانتظار الموافقة.",
        "document": "الملف",
        "type": "النوع",
        "uploader": "الرافع",
        "date": "التاريخ",
        "actions": "الإجراءات",
        "view_file": "عرض الملف",
        "review_desc": "مراجعة واعتماد الملفات المرفوعة من قبل المندوبين.",
        "uni_desc": "إدارة الهيكل الأكاديمي (الجامعات، الكليات، الأقسام، إلخ)",
        "users_desc": "إدارة مستخدمي المنصة والصلاحيات.",
        "add_new": "إضافة جديد"
      },
      "academic": {
        "universities": "الجامعات",
        "new_uni": "اسم الجامعة الجديدة",
        "add": "إضافة",
        "colleges": "الكليات",
        "new_college": "اسم الكلية الجديدة",
        "no_colleges": "لا توجد كليات. قم بإضافة واحدة بالأعلى.",
        "departments": "الأقسام",
        "new_dept": "اسم القسم الجديد",
        "no_depts": "لا توجد أقسام. قم بإضافة واحد بالأعلى.",
        "manage_majors": "انقر لإدارة التخصصات"
      }
    }
  },
  en: {
    translation: {
      "login": {
        "title": "Sign in to Univer",
        "subtitle": "Your University Educational Platform",
        "email": "Email address",
        "password": "Password",
        "submit": "Sign in",
        "submitting": "Signing in...",
        "no_account": "Don't have an account?",
        "register_link": "Sign up"
      },
      "register": {
        "title": "Create an Account",
        "subtitle": "Join Univer and access thousands of resources",
        "name": "Full Name",
        "email": "Email address",
        "password": "Password",
        "submit": "Sign up",
        "submitting": "Signing up...",
        "has_account": "Already have an account?",
        "login_link": "Sign in"
      },
      "dashboard": {
        "welcome": "Welcome back",
        "logout": "Logout",
        "search_title": "Find Resources",
        "search_placeholder": "Search for books, summaries, or exams...",
        "search_btn": "Search",
        "recent": "Recently Added",
        "download": "Download",
        "no_docs": "No documents",
        "no_docs_desc": "No approved documents are available yet.",
        "by": "By:"
      },
      "admin": {
        "title": "Univer Admin",
        "pending": "Pending Approvals",
        "universities": "Universities & Colleges",
        "users": "Users",
        "approve": "Approve",
        "reject": "Reject",
        "no_pending": "All caught up!",
        "no_pending_desc": "There are no documents waiting for approval.",
        "document": "Document",
        "type": "Type",
        "uploader": "Uploader",
        "date": "Date",
        "actions": "Actions",
        "view_file": "View File",
        "review_desc": "Review and approve documents uploaded by representatives.",
        "uni_desc": "Manage academic structure (Universities, Colleges, Departments, etc.)",
        "users_desc": "Manage platform users and roles.",
        "add_new": "Add New"
      },
      "academic": {
        "universities": "Universities",
        "new_uni": "New University Name",
        "add": "Add",
        "colleges": "Colleges",
        "new_college": "New College Name",
        "no_colleges": "No colleges found. Add one above.",
        "departments": "Departments",
        "new_dept": "New Department Name",
        "no_depts": "No departments found. Add one above.",
        "manage_majors": "Click to manage majors (Coming soon)"
      }
    }
  }
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'ar', // Arabic is the default
    lng: 'ar', // Force Arabic initially
    interpolation: {
      escapeValue: false, // react already safes from xss
    },
  });

export default i18n;
