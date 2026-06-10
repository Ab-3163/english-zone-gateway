## نظام تسجيل ودخول الطلاب الكامل

### 1) قاعدة البيانات (Migration)

**جدول `students`** (الجدول الرئيسي):
- `id` (uuid), `student_id` (text فريد بصيغة EZ-2026-0001)
- بيانات شخصية: `full_name`, `phone`, `email`, `birth_date`, `age`
- بيانات دراسية: `language`, `level`, `group_name`, `teacher`, `study_days`, `study_time`, `room`, `course_type`
- مالية: `course_fee`, `paid_amount`, `remaining_amount`, `payment_status`, `payment_receipt_url`, `payment_confirmed_at`
- نتائج: `first_exam_score`, `final_exam_score`, `average`, `grade`, `pass_status`, `admin_note`, `next_level`, `eligible_promotion`
- حضور: `total_sessions`, `absences`, `attendance_rate`
- حالة: `status` (new/awaiting_payment/awaiting_confirmation/registered/rejected/suspended)
- `preferred_time`, `notes`, `rejection_reason`

**Sequence** `student_id_seq_2026` + دالة `generate_student_id()` لإنشاء `EZ-YYYY-NNNN`.

**Storage bucket** `payment-receipts` (خاص) لرفع وصولات الدفع.

**RLS:**
- إدراج عام للتسجيل الجديد (anon + authenticated)
- قراءة بواسطة دالة `get_student_by_credentials(student_id, phone)` فقط — لا قراءة مباشرة
- الإدارة (`has_role admin`) كاملة الصلاحيات

**جدول `admin_notifications`** لسجل التنبيهات.

### 2) Edge Functions

- **`notify-admin-registration`**: يرسل إيميل عبر Resend للأدمن عند تسجيل جديد بكل التفاصيل + رابط اللوحة.
- تعديل **`send-otp`**: قبول الكود الثابت `1739` كبديل دائم للأدمن (بدون OTP حقيقي إذا طُلب).

### 3) الواجهة الأمامية

**صفحات جديدة:**
- `/student-register` — نموذج تسجيل احترافي + رفع وصل الدفع، يعرض Student ID بعد النجاح
- `/student-login` — Student ID + رقم الهاتف
- `/student-portal` — لوحة الطالب الشخصية

**تعديل صفحة `/admin`:** تسجيل دخول بالإيميل + الكود الثابت `1739` (بدلاً من OTP عبر الإيميل).

**لوحة الإدارة - تبويبات جديدة:**
- **Dashboard**: إحصائيات (عدد الطلاب، النشطين، الجدد، المعلقين، الإيرادات، الناجحين/الراسبين، توزيع حسب المستوى/القسم)
- **إدارة الطلاب**: جدول كامل + بحث وفلترة + إجراءات سريعة (تأكيد/رفض الدفع، تعديل، نتيجة، نقل مستوى، واتساب، طباعة بطاقة)
- إضافة طالب يدويًا (للقدامى)
- نموذج تعديل تفصيلي

### 4) التنبيهات
- Toast عند النجاح/الخطأ
- إيميل تلقائي للأدمن عند كل تسجيل جديد

### تفاصيل تقنية
- RTL + Cairo + ألوان ÉLITE ZONE
- Zod validation، حماية spam (cooldown 5s)
- React Query للجلب
- `framer-motion` للحركات الخفيفة
- ملف Migration واحد شامل

### ملاحظة
نظام التسجيل القديم (`registrations`) يبقى منفصلًا (طلبات الاستفسار) — `students` للطلاب المُسجَّلين فعلياً. سأضيف زر "ترقية إلى طالب" في `RegistrationsManager` لتحويل الطلب إلى طالب رسمي.
