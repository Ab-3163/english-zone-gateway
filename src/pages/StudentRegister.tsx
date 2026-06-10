import { useState } from "react";
import { z } from "zod";
import { Loader2, CheckCircle2, UserPlus, Upload, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const schema = z.object({
  full_name: z.string().trim().min(2, "الاسم قصير جداً").max(100),
  phone: z.string().trim().min(5, "رقم غير صحيح").max(30),
  email: z.string().trim().email("بريد غير صحيح").max(255).optional().or(z.literal("")),
  birth_date: z.string().optional(),
  age: z.coerce.number().int().min(5).max(99).optional().or(z.literal(undefined)),
  language: z.enum(["french", "english", "arabic"]),
  level: z.enum(["A1", "A2", "B1", "B2", "C1"]),
  course_type: z.enum(["in_person", "online"]),
  preferred_time: z.string().trim().max(100).optional(),
  notes: z.string().trim().max(1000).optional(),
});

const StudentRegister = () => {
  const [form, setForm] = useState({
    full_name: "", phone: "", email: "", birth_date: "", age: "",
    language: "english", level: "A1", course_type: "in_person",
    preferred_time: "", notes: "",
  });
  const [receipt, setReceipt] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<{ student_id: string } | null>(null);
  const [lastSubmit, setLastSubmit] = useState(0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (Date.now() - lastSubmit < 5000) {
      toast({ title: "انتظر قليلاً", description: "يرجى الانتظار قبل إعادة الإرسال", variant: "destructive" });
      return;
    }
    const parsed = schema.safeParse({ ...form, age: form.age ? Number(form.age) : undefined });
    if (!parsed.success) {
      toast({ title: "خطأ في النموذج", description: parsed.error.errors[0]?.message || "بيانات غير صحيحة", variant: "destructive" });
      return;
    }
    setSubmitting(true);
    setLastSubmit(Date.now());

    // Upload receipt if provided
    let receiptUrl: string | null = null;
    if (receipt) {
      const path = `receipts/${Date.now()}-${receipt.name.replace(/[^a-zA-Z0-9.\-_]/g, "_")}`;
      const { error: upErr } = await supabase.storage.from("payment-receipts").upload(path, receipt);
      if (upErr) {
        setSubmitting(false);
        toast({ title: "خطأ", description: "تعذّر رفع وصل الدفع", variant: "destructive" });
        return;
      }
      receiptUrl = path;
    }

    const { data, error } = await supabase.from("students").insert({
      full_name: parsed.data.full_name,
      phone: parsed.data.phone,
      email: parsed.data.email || null,
      birth_date: parsed.data.birth_date || null,
      age: parsed.data.age ?? null,
      language: parsed.data.language,
      level: parsed.data.level,
      course_type: parsed.data.course_type,
      preferred_time: parsed.data.preferred_time || null,
      notes: parsed.data.notes || null,
      payment_receipt_url: receiptUrl,
      payment_status: receiptUrl ? "awaiting_confirmation" : "pending",
      status: "awaiting_confirmation",
    }).select("student_id, full_name, phone, email, language, level, course_type, preferred_time").single();

    if (error || !data) {
      setSubmitting(false);
      toast({ title: "خطأ", description: "تعذّر إرسال التسجيل، حاول مجدداً", variant: "destructive" });
      return;
    }

    // Fire-and-forget notification
    supabase.functions.invoke("notify-admin-registration", {
      body: { ...data, has_receipt: !!receiptUrl },
    }).catch(() => {});

    setSubmitting(false);
    setResult({ student_id: data.student_id });
    toast({ title: "تم بنجاح", description: `رقم الطالب: ${data.student_id}` });
  };

  const copyId = () => {
    if (result) {
      navigator.clipboard.writeText(result.student_id);
      toast({ title: "تم النسخ", description: "تم نسخ رقم الطالب" });
    }
  };

  return (
    <div className="min-h-screen bg-background" dir="rtl">
      <Navbar />
      <main className="pt-32 pb-20 section-padding">
        <div className="container mx-auto max-w-2xl">
          <div className="text-center mb-10">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 text-primary mb-4">
              <UserPlus className="w-8 h-8" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-3">تسجيل طالب جديد</h1>
            <p className="text-muted-foreground">أنشئ حسابك واستلم رقمك التعريفي فوراً</p>
          </div>

          {result ? (
            <div className="bg-card border border-border rounded-2xl p-10 text-center shadow-sm">
              <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto mb-4" />
              <h2 className="text-2xl font-bold mb-3">تم استلام طلب التسجيل بنجاح</h2>
              <p className="text-muted-foreground mb-6">رقم الطالب الخاص بك:</p>
              <div className="bg-primary/10 border-2 border-primary/30 border-dashed rounded-xl p-6 mb-6 flex items-center justify-center gap-3">
                <span className="text-3xl font-bold text-primary tracking-wider" dir="ltr">{result.student_id}</span>
                <Button size="icon" variant="outline" onClick={copyId}><Copy className="w-4 h-4" /></Button>
              </div>
              <p className="text-sm text-muted-foreground mb-6">
                احتفظ بهذا الرقم — ستحتاجه لتسجيل الدخول. سيتم تأكيد تسجيلك بعد مراجعة الدفع من الإدارة.
              </p>
              <div className="flex gap-3 justify-center flex-wrap">
                <Button onClick={() => (window.location.href = "/student-login")}>تسجيل الدخول</Button>
                <Button variant="outline" onClick={() => { setResult(null); setForm({ full_name: "", phone: "", email: "", birth_date: "", age: "", language: "english", level: "A1", course_type: "in_person", preferred_time: "", notes: "" }); setReceipt(null); }}>تسجيل آخر</Button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="bg-card border border-border rounded-2xl p-6 md:p-8 shadow-sm space-y-5">
              <div>
                <label className="text-sm font-medium mb-2 block">الاسم الكامل *</label>
                <Input value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} maxLength={100} required />
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">رقم الهاتف / واتساب *</label>
                  <Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} maxLength={30} dir="ltr" required />
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">البريد الإلكتروني</label>
                  <Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} maxLength={255} dir="ltr" />
                </div>
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">تاريخ الميلاد</label>
                  <Input type="date" value={form.birth_date} onChange={(e) => setForm({ ...form, birth_date: e.target.value })} dir="ltr" />
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">العمر</label>
                  <Input type="number" min={5} max={99} value={form.age} onChange={(e) => setForm({ ...form, age: e.target.value })} dir="ltr" />
                </div>
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">اللغة المطلوبة *</label>
                  <Select value={form.language} onValueChange={(v) => setForm({ ...form, language: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="french">الفرنسية</SelectItem>
                      <SelectItem value="english">الإنجليزية</SelectItem>
                      <SelectItem value="arabic">العربية</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">المستوى *</label>
                  <Select value={form.level} onValueChange={(v) => setForm({ ...form, level: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {["A1","A2","B1","B2","C1"].map(l => <SelectItem key={l} value={l}>{l}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">نوع الدورة *</label>
                  <Select value={form.course_type} onValueChange={(v) => setForm({ ...form, course_type: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="in_person">حضورية</SelectItem>
                      <SelectItem value="online">أونلاين</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">الوقت المناسب</label>
                  <Input value={form.preferred_time} onChange={(e) => setForm({ ...form, preferred_time: e.target.value })} placeholder="مثال: المساء بعد ٦" maxLength={100} />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">ملاحظات</label>
                <Textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} maxLength={1000} rows={3} />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block flex items-center gap-2"><Upload className="w-4 h-4" /> صورة وصل الدفع</label>
                <Input type="file" accept="image/*,application/pdf" onChange={(e) => setReceipt(e.target.files?.[0] || null)} />
                {receipt && <p className="text-xs text-muted-foreground mt-1">تم اختيار: {receipt.name}</p>}
              </div>
              <Button type="submit" disabled={submitting} className="w-full" size="lg">
                {submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : "إرسال طلب التسجيل"}
              </Button>
              <p className="text-xs text-center text-muted-foreground">
                لديك حساب بالفعل؟ <a href="/student-login" className="text-primary hover:underline">سجّل الدخول</a>
              </p>
            </form>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default StudentRegister;