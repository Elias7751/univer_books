# 🚀 دليل نشر منصة مَصْدَر (Deployment Guide)

هذا الدليل يشرح كيفية رفع المنصة (Backend & Frontend) على خادم حقيقي (VPS) مثل DigitalOcean, Linode, أو AWS.

## 📌 المتطلبات الأساسية على الخادم (VPS)

1. **Node.js** (إصدار 18 أو أحدث)
2. **PostgreSQL** (قاعدة البيانات)
3. **Nginx** (كخادم ويب وكيل - Reverse Proxy)
4. **PM2** (لإبقاء الخادم يعمل في الخلفية)
5. **Git** (لجلب الكود)

---

## ⚙️ الخطوة 1: إعداد قاعدة البيانات (PostgreSQL)

1. قم بتثبيت PostgreSQL على الخادم.
2. قم بإنشاء قاعدة بيانات جديدة (مثلاً: `masdar_db`).
3. قم بإنشاء مستخدم جديد وكلمة مرور، وامنحه الصلاحيات على قاعدة البيانات.

---

## 🖥️ الخطوة 2: رفع الـ Backend

1. انسخ مجلد `backend` إلى الخادم.
2. ادخل إلى المجلد وقم بتثبيت الحزم:
   ```bash
   cd backend
   npm install
   ```
3. قم بإنشاء ملف `.env` وأضف المتغيرات التالية:
   ```env
   DATABASE_URL="postgresql://user:password@localhost:5432/masdar_db?schema=public"
   JWT_SECRET="your_super_secret_key_here"
   PORT=5000
   TELEGRAM_BOT_TOKEN="your_bot_token"
   REP_TELEGRAM_BOT_TOKEN="your_rep_bot_token"
   BASE_URL="https://api.yourdomain.com"
   ```
4. قم بتجهيز قاعدة البيانات:
   ```bash
   npx prisma generate
   npx prisma db push
   ```
5. قم ببناء المشروع:
   ```bash
   npm run build
   ```
6. قم بتشغيل الخادم باستخدام PM2:
   ```bash
   npm install -g pm2
   pm2 start dist/index.js --name "masdar-backend"
   pm2 save
   pm2 startup
   ```

---

## 🎨 الخطوة 3: رفع الـ Frontend

1. انسخ مجلد `frontend` إلى الخادم.
2. ادخل إلى المجلد وقم بتثبيت الحزم:
   ```bash
   cd frontend
   npm install
   ```
3. قم بإنشاء ملف `.env` وأضف المتغيرات التالية:
   ```env
   VITE_API_URL="https://api.yourdomain.com/api"
   VITE_BASE_URL="https://api.yourdomain.com"
   ```
4. قم ببناء المشروع:
   ```bash
   npm run build
   ```
5. سيتم إنشاء مجلد `dist`، هذا المجلد يحتوي على الملفات الثابتة (Static Files) التي سيقوم Nginx بتقديمها.

---

## 🌐 الخطوة 4: إعداد Nginx

1. قم بتثبيت Nginx.
2. قم بإنشاء ملف إعدادات جديد في `/etc/nginx/sites-available/masdar`:

   ```nginx
   server {
       listen 80;
       server_name yourdomain.com www.yourdomain.com;

       # Frontend
       location / {
           root /path/to/frontend/dist;
           index index.html;
           try_files $uri $uri/ /index.html;
       }
   }

   server {
       listen 80;
       server_name api.yourdomain.com;

       # Backend API
       location / {
           proxy_pass http://localhost:5000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
       }
   }
   ```

3. قم بتفعيل الإعدادات:
   ```bash
   ln -s /etc/nginx/sites-available/masdar /etc/nginx/sites-enabled/
   nginx -t
   systemctl restart nginx
   ```

---

## 🔒 الخطوة 5: تفعيل SSL (HTTPS)

استخدم Certbot لتأمين الموقع مجاناً:

```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com -d api.yourdomain.com
```

🎉 **مبروك! منصة مَصْدَر الآن تعمل على الإنترنت!**
