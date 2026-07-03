import { useState } from "react";
import { z } from "zod";
import { Loader2, CheckCircle2, UserPlus } from "lucide-react";
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
  age: z.coerce.number().int().min(5).max(99).optional().or(z.literal(undefined)),
  language: z.enum(["french", "english", "arabic"]),
  level: z.enum(["A1", "A2", "B1", "B2", "C1"]),
  course_type: z.enum(["in_person", "online"]),
  preferred_time: z.string().trim().max(100).optional(),
  notes: z.string().trim().max(1000).optional(),
});

const Register = () => {
  const [form, setForm] = useState({
    full_name: "",
    phone: "",
    age: "",
    language: "english",
    level: "A1",
    course_type: "in_person",
    preferred_time: "",
    notes: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [lastSubmit, setLastSubmit] = useState(0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (Date.now() - lastSubmit < 5000) {
      toast({ title: "انتظر قليلاً", description: "يرجى الانتظار قبل إعادة الإرسال", variant: "destructive" });
      return;
    }
    const parsed = schema.safeParse({ ...form, age: form.age ? Number(form.age) : undefined });
    if (!parsed.success) {
      const firstErr = parsed.error.errors[0]?.message || "بيانات غير صحيحة";
      toast({ title: "خطأ في النموذج", description: firstErr, variant: "destructive" });
      return;
    }
    setSubmitting(true);
    setLastSubmit(Date.now());
    const { error } = await supabase.from("registrations").insert({
      full_name: parsed.data.full_name,
      phone: parsed.data.phone,
      age: parsed.data.age ?? null,
      language: parsed.data.language,
      level: parsed.data.level,
      course_type: parsed.data.course_type,
      preferred_time: parsed.data.preferred_time || null,
      notes: parsed.data.notes || null,
    });
    setSubmitting(false);
    if (error) {
      toast({ title: "خطأ", description: "تعذّر إرسال الطلب، حاول مجدداً", variant: "destructive" });
      return;
    }
    // Fire-and-forget WhatsApp notification to admin
    supabase.functions.invoke("notify-whatsapp-registration", {
      body: {
        full_name: parsed.data.full_name,
        phone: parsed.data.phone,
        language: parsed.data.language,
        level: parsed.data.level,
        created_at: new Date().toISOString(),
      },
    }).catch(() => {});
    setDone(true);
    toast({ title: "تم", description: "تم استلام طلب التسجيل بنجاح" });
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
            <h1 className="text-4xl md:text-5xl font-bold mb-3">التسجيل في الدورات</h1>
            <p className="text-muted-foreground">املأ النموذج وسنتواصل معك في أقرب وقت</p>
          </div>

          {done ? (
            <div className="bg-card border border-border rounded-2xl p-10 text-center shadow-sm">
              <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto mb-4" />
              <h2 className="text-2xl font-bold mb-2">تم استلام طلب التسجيل بنجاح</h2>
              <p className="text-muted-foreground mb-6">سنتواصل معك قريبًا.</p>
              <Button onClick={() => { setDone(false); setForm({ ...form, full_name: "", phone: "", age: "", preferred_time: "", notes: "" }); }}>
                تقديم طلب آخر
              </Button>
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
                  <label className="text-sm font-medium mb-2 block">المستوى المطلوب *</label>
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
              <Button type="submit" disabled={submitting} className="w-full">
                {submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : "إرسال طلب التسجيل"}
              </Button>
            </form>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Register;