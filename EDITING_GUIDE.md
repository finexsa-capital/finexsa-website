# 📖 دليل تعديل موقع FINEXSA Capital

دليل بسيط لتعديل أهم الأشياء في الموقع بدون الحاجة لمعرفة برمجية.

---

## 🎯 الأهم: كيف تعدّل أي شيء

### الخطوة العامة (لأي تعديل):

1. روح لـ: **https://github.com/finexsa-capital/finexsa-website**
2. اضغط على الملف اللي بدك تعدّل (مثلاً `index.html`)
3. اضغط أيقونة **القلم ✏️** (أعلى يمين الملف)
4. عدّل النص اللي بدك
5. انزل تحت → اكتب وصف للتعديل → **Commit changes**
6. الموقع راح يتحدّث خلال 1-3 دقايق

---

## 📋 التعديلات الشائعة

### 1️⃣ تغيير رقم هاتف

**في ملف:** `index.html`

ابحث عن (Ctrl+F):
```
+90 536 232 3310
```
أو الرقم اللي بدك تغيّره، وعدّله.

> ⚠️ **مهم:** الرقم يظهر في عدة أماكن (Hero, About, Footer) — عدّل في كل الأماكن.

---

### 2️⃣ إضافة/تعديل عضو فريق

**في ملف:** `index.html`

ابحث عن:
```html
<div class="team-card fade-in">
```

كل بطاقة فيها:
- اسم → بين `<h3 class="team-name">` و `</h3>`
- منصب → بين `<div class="team-role">` و `</div>`
- فرع → بين `<div class="team-branch">` و `</div>`
- صورة → في `<img src="team-images/...">`

#### لتغيير صورة عضو:

1. ارفع الصورة الجديدة في مجلد `team-images/` (نفس الاسم)
2. أو غيّر الاسم في `<img src="team-images/SAVE_NAME.jpeg">`

---

### 3️⃣ تحديث رقم الواتساب

أرقام الواتساب على شكل `wa.me/905...`

ابحث عن:
```
wa.me/
```

وغيّر الرقم اللي بعده. مثال:
```
wa.me/905362323310  → wa.me/الرقم_الجديد
```

---

### 4️⃣ تغيير نص في الصفحة الرئيسية

**Hero (العنوان الرئيسي):**
ابحث عن: `شريكك المالي`

**About (من نحن):**
ابحث عن: `خبرة محاسبية`

**FINEXSA One:**
ابحث عن: `FINEXSA One`

**الاستضافة السحابية:**
ابحث عن: `الاستضافة السحابية`

---

### 5️⃣ إضافة رقم نور المصري لاحقاً

**في ملف:** `index.html`

ابحث عن:
```html
<h3 class="team-name">نور المصري</h3>
```

تحت بطاقته، نور المصري عنده زرين فقط (إيميل + LinkedIn). لإضافة الواتساب:

استبدل:
```html
<div class="team-social">
  <a href="mailto:nour.almasri@finexsacapitalnet.com" class="team-social-btn" title="البريد الإلكتروني">
```

بـ:
```html
<div class="team-social">
  <a href="https://wa.me/RAQAM_NOUR" target="_blank" rel="noopener" class="team-social-btn" title="واتساب">
    <svg viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413"/></svg>
  </a>
  <a href="mailto:nour.almasri@finexsacapitalnet.com" class="team-social-btn" title="البريد الإلكتروني">
```

(فقط استبدل `RAQAM_NOUR` برقم الواتساب الفعلي بصيغة `905...`)

---

### 6️⃣ إضافة أسعار حقيقية للباقات (لما تجهّز الدراسة)

**في ملف:** `services/hosting.html`

ابحث عن (3 مرات):
```html
<span class="pricing-coming">قريباً</span>
```

استبدل كل واحدة بسعر فعلي. مثال:
```html
<span class="pricing-amount">$50</span>
<span class="pricing-period">/شهر</span>
```

---

### 7️⃣ تحديث صور الفريق

**رفع صورة جديدة:**

1. روح لـ: https://github.com/finexsa-capital/finexsa-website/tree/main/team-images
2. اضغط **Add file → Upload files**
3. ارفع الصورة (يفضّل بنفس اسم الصورة القديمة عشان ما تحتاج تعدّل HTML)
4. **Commit changes**

> 💡 الصور الحالية:
> - `mohammad.jpg` — محمد الجلاد
> - `alaa.jpg` — علاء المصري
> - `ghiath.jpeg` — غياث الجارح
> - `ali.jpeg` — علي علوش
> - `muhammad.jpeg` — محمد مصطفى
> - `nour.jpeg` — نور المصري
> - `wael.jpeg` — وائل الزراد

---

### 8️⃣ إضافة عميل جديد لنظام الدخول (Firebase)

اقرأ الشرح المفصّل في الكتاب: [دليل Firebase](https://console.firebase.google.com/project/finexsa-capital)

**باختصار:**
1. **Firebase Auth:** أنشئ user بإيميل + كلمة مرور → انسخ UID
2. **Firestore /users:** أنشئ document بالـ UID نفسه
3. **املأ الحقول:**
   - `active`: true
   - `companyName`: "اسم الشركة"
   - `email`: "client@email.com"
   - `role`: "client"
   - `spreadsheetId`: "ID جدول جوجل شيت"

---

## 🔧 ملفات الموقع — مرجع سريع

| الملف | يحتوي |
|-------|--------|
| `index.html` | الصفحة الرئيسية (Hero + About + Services + Team + FINEXSA One + Hosting + Footer) |
| `login.html` | صفحة دخول العملاء + Dashboard + Viewer |
| `privacy.html` | سياسة الخصوصية |
| `terms.html` | الشروط والأحكام |
| `styles.css` | كل ستايل الموقع |
| `services/bookkeeping.html` | مسك الدفاتر |
| `services/reports.html` | التقارير المالية |
| `services/feasibility.html` | دراسات الجدوى |
| `services/management.html` | الإدارة المالية |
| `services/audit.html` | التدقيق والمراجعة |
| `services/accounting.html` | المحاسبة المالية |
| `services/hosting.html` | الاستضافة السحابية الآمنة |
| `team-images/*` | صور الفريق |
| `CNAME` | يربط الدومين finexsacapital.com (لا تحذف!) |

---

## ⚠️ تحذيرات مهمة

### ❌ لا تحذف هذه الملفات أبداً:
- `CNAME` — لو حذفته، الدومين راح ينقطع عن الموقع!
- `styles.css` — لو حذفته، التصميم راح ينكسر تماماً
- `index.html` — الصفحة الرئيسية

### ✅ للأمان:
- قبل أي تعديل كبير، احفظ نسخة من الملف على جهازك
- اختبر التعديل بفتح Preview قبل Commit
- إذا حصل خطأ، GitHub يحفظ كل النسخ — تقدر ترجع لأي نسخة سابقة

---

## 🆘 إذا واجهت مشكلة

### "الموقع ما يفتح":
- تأكد من وجود ملف `CNAME` في الـ repo
- تأكد من إعدادات GitHub Pages (Settings → Pages)

### "صورة ما تظهر":
- تأكد من اسم الصورة بالضبط (حساس لحالة الأحرف)
- تأكد من رفع الصورة في المجلد الصحيح (`team-images/`)
- اعمل Hard Refresh للمتصفح (`Ctrl + Shift + R`)

### "لون أو ستايل غريب":
- تأكد ما عدّلت في `styles.css` بطريق الخطأ
- ارجع للنسخة السابقة من History في GitHub

---

## 📞 مراجع مفيدة

- **GitHub Repo:** https://github.com/finexsa-capital/finexsa-website
- **GitHub Pages Settings:** https://github.com/finexsa-capital/finexsa-website/settings/pages
- **Firebase Console:** https://console.firebase.google.com/project/finexsa-capital
- **Squarespace Domains:** https://account.squarespace.com/domains

---

**آخر تحديث:** أبريل 2026
