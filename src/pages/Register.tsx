import { useState, useRef } from "react";
import { z } from "zod";
import { Loader2, CheckCircle2, UserPlus, Copy, Check, Upload, FileText, X, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const BANKILY_NUMBER = "36423111";
const ACCEPTED_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp", "application/pdf"];
const MAX_SIZE = 5 * 1024 * 1024; // 5MB

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
  const [receipt, setReceipt] = useState<File | null>(null);
  const [receiptPreview, setReceiptPreview] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const copyBankily = async () => {
    try {
      await navigator.clipboard.writeText(BANKILY_NUMBER);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      toast({ title: "تم النسخ", description: "تم نسخ رقم بنكيلي بنجاح." });
    } catch {
      toast({ title: "خطأ", description: "تعذّر النسخ", variant: "destructive" });
    }
  };

  const handleFile = (f: File | null) => {
    if (!f) return;
    if (!ACCEPTED_TYPES.includes(f.type)) {
      toast({ title: "نوع غير مدعوم", description: "JPG, PNG, WEBP أو PDF فقط", variant: "destructive" });
      return;
    }
    if (f.size > MAX_SIZE) {
      toast({ title: "الملف كبير", description: "الحد الأقصى 5MB", variant: "destructive" });
      return;
    }
    setReceipt(f);
    if (f.type.startsWith("image/")) {
      const url = URL.createObjectURL(f);
      setReceiptPreview(url);
    } else {
      setReceiptPreview(null);
    }
  };

  const removeReceipt = () => {
    setReceipt(null);
    if (receiptPreview) URL.revokeObjectURL(receiptPreview);
    setReceiptPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

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
    if (!receipt) {
      toast({ title: "إيصال الدفع مطلوب", description: "يرجى رفع صورة إيصال الدفع قبل إرسال الطلب", variant: "destructive" });
      return;
    }
    setSubmitting(true);
    setLastSubmit(Date.now());

    // Upload receipt
    const ext = receipt.name.split(".").pop() || "bin";
    const path = `receipt-${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
    const { error: upErr } = await supabase.storage.from("payment-receipts").upload(path, receipt, {
      contentType: receipt.type,
      upsert: false,
    });
    if (upErr) {
      setSubmitting(false);
      toast({ title: "فشل رفع الإيصال", description: upErr.message, variant: "destructive" });
      return;
    }

    const { error } = await supabase.from("registrations").insert({
      full_name: parsed.data.full_name,
      phone: parsed.data.phone,
      age: parsed.data.age ?? null,
      language: parsed.data.language,
      level: parsed.data.level,
      course_type: parsed.data.course_type,
      preferred_time: parsed.data.preferred_time || null,
      notes: parsed.data.notes || null,
      receipt_url: path,
      payment_method: "bankily",
      status: "payment_review",
    });
    setSubmitting(false);
    if (error) {
      toast({ title: "خطأ", description: "تعذّر إرسال الطلب، حاول مجدداً", variant: "destructive" });
      return;
    }
    // Fire-and-forget WhatsApp notification to admin (after successful save)
    console.log("WhatsApp notification started");
    supabase.functions
      .invoke("notify-whatsapp-registration", {
        body: {
          full_name: parsed.data.full_name,
          phone: parsed.data.phone,
          language: parsed.data.language,
          level: parsed.data.level,
          age: parsed.data.age ?? null,
          preferred_time: parsed.data.preferred_time || "",
          created_at: new Date().toISOString(),
        },
      })
      .then((res) => {
        if (res.error) console.error("WhatsApp notification failed:", res.error);
        else console.log("WhatsApp notification sent successfully", res.data);
      })
      .catch((err) => console.error("WhatsApp notification failed:", err));
    setDone(true);
    toast({ title: "تم", description: "تم استلام طلبك بنجاح، وسيتم مراجعته بعد التحقق من عملية الدفع." });
  };

  return (
    <div className="min-h-screen bg-background" dir="rtl">
      <Navbar />
      <main className="pt-20 sm:pt-24 pb-24">
        <div className="w-[92%] max-w-2xl mx-auto">
          <div className="text-center mb-6 sm:mb-8">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-primary/10 text-primary mb-3">
              <UserPlus className="w-7 h-7" />
            </div>
            <h1 className="text-2xl sm:text-4xl font-bold mb-2">التسجيل في الدورات</h1>
            <p className="text-sm sm:text-base text-muted-foreground">املأ النموذج وسنتواصل معك في أقرب وقت</p>
          </div>

          {done ? (
            <div className="bg-card border border-border rounded-2xl p-6 sm:p-10 text-center shadow-sm">
              <CheckCircle2 className="w-14 h-14 text-green-500 mx-auto mb-3" />
              <h2 className="text-xl sm:text-2xl font-bold mb-2">تم استلام طلبك بنجاح</h2>
              <p className="text-sm sm:text-base text-muted-foreground mb-6">سيتم مراجعته بعد التحقق من الدفع، وسنتواصل معك قريباً.</p>
              <Button onClick={() => { setDone(false); removeReceipt(); setForm({ ...form, full_name: "", phone: "", age: "", preferred_time: "", notes: "" }); }}>
                تقديم طلب آخر
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="bg-card border border-border rounded-2xl p-4 sm:p-7 shadow-sm space-y-4">
              <div>
                <label className="text-sm font-medium mb-1.5 block">الاسم الكامل *</label>
                <Input className="h-11" value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} maxLength={100} required />
              </div>
              <div className="grid sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-sm font-medium mb-1.5 block">رقم الهاتف / واتساب *</label>
                  <Input className="h-11" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} maxLength={30} dir="ltr" required />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1.5 block">العمر</label>
                  <Input className="h-11" type="number" min={5} max={99} value={form.age} onChange={(e) => setForm({ ...form, age: e.target.value })} dir="ltr" />
                </div>
              </div>
              <div className="grid sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-sm font-medium mb-1.5 block">اللغة المطلوبة *</label>
                  <Select value={form.language} onValueChange={(v) => setForm({ ...form, language: v })}>
                    <SelectTrigger className="h-11"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="french">الفرنسية</SelectItem>
                      <SelectItem value="english">الإنجليزية</SelectItem>
                      <SelectItem value="arabic">العربية</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium mb-1.5 block">المستوى المطلوب *</label>
                  <Select value={form.level} onValueChange={(v) => setForm({ ...form, level: v })}>
                    <SelectTrigger className="h-11"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {["A1","A2","B1","B2","C1"].map(l => <SelectItem key={l} value={l}>{l}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium mb-1.5 block">الوقت المناسب</label>
                <Input className="h-11" value={form.preferred_time} onChange={(e) => setForm({ ...form, preferred_time: e.target.value })} placeholder="مثال: المساء بعد ٦" maxLength={100} />
              </div>
              <div>
                <label className="text-sm font-medium mb-1.5 block">ملاحظات</label>
                <Textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} maxLength={1000} rows={2} />
              </div>

              {/* Payment Card — simple, clear */}
              <div className="rounded-2xl border border-border bg-card shadow-sm overflow-hidden">
                <div className="px-4 py-3 border-b border-border flex items-center justify-between">
                  <div className="font-bold text-base">معلومات الدفع</div>
                  <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-orange-500/10 text-orange-600">Bankily</span>
                </div>
                <div className="p-4 sm:p-5 space-y-3">
                  <div className="text-center">
                    <div className="text-xs text-muted-foreground mb-1">رقم Bankily</div>
                    <div
                      className="font-black text-3xl sm:text-4xl tracking-[0.15em] text-foreground select-all py-2"
                      dir="ltr"
                    >
                      {BANKILY_NUMBER}
                    </div>
                    <Button
                      type="button"
                      onClick={copyBankily}
                      size="sm"
                      variant={copied ? "secondary" : "default"}
                      className="mt-1 gap-1.5 min-w-[140px] transition-all"
                    >
                      {copied ? (
                        <>
                          <Check className="w-4 h-4" /> تم النسخ
                        </>
                      ) : (
                        <>
                          <Copy className="w-4 h-4" /> نسخ الرقم
                        </>
                      )}
                    </Button>
                  </div>
                  <div className="flex items-start gap-2 bg-green-50 border border-green-200 rounded-xl p-3 text-sm text-green-900 leading-relaxed">
                    <CheckCircle2 className="w-4 h-4 text-green-600 shrink-0 mt-0.5" />
                    <span>حوّل رسوم التسجيل إلى رقم Bankily، ثم ارفع صورة الإيصال لإتمام الطلب.</span>
                  </div>
                </div>
              </div>

              {/* Receipt upload */}
              <div>
                <label className="text-sm font-medium mb-1.5 flex items-center gap-2">
                  <Upload className="w-4 h-4 text-primary" />
                  إيصال الدفع <span className="text-primary">*</span>
                </label>
                {!receipt ? (
                  <label htmlFor="receipt" className="block cursor-pointer border-2 border-dashed border-border hover:border-primary/50 hover:bg-primary/5 rounded-xl p-4 text-center transition-all">
                    <Upload className="w-6 h-6 text-muted-foreground mx-auto mb-1.5" />
                    <div className="text-sm font-medium">اضغط لاختيار الإيصال</div>
                    <div className="text-[11px] text-muted-foreground mt-0.5">JPG · PNG · WEBP · PDF (حتى 5MB)</div>
                    <input
                      id="receipt"
                      ref={fileInputRef}
                      type="file"
                      accept="image/jpeg,image/png,image/webp,application/pdf"
                      className="hidden"
                      onChange={(e) => handleFile(e.target.files?.[0] || null)}
                    />
                  </label>
                ) : (
                  <div className="border border-border rounded-xl p-2.5 bg-secondary/30 flex items-center gap-3">
                    {receiptPreview ? (
                      <img src={receiptPreview} alt="preview" className="w-14 h-14 rounded-lg object-cover border border-border" />
                    ) : (
                      <div className="w-14 h-14 rounded-lg bg-primary/10 flex items-center justify-center">
                        <FileText className="w-7 h-7 text-primary" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-semibold truncate">{receipt.name}</div>
                      <div className="text-xs text-muted-foreground">{(receipt.size / 1024).toFixed(0)} KB · جاهز للإرسال</div>
                    </div>
                    <Button type="button" variant="ghost" size="icon" onClick={removeReceipt} aria-label="إزالة">
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                )}
              </div>

              <Button type="submit" disabled={submitting} className="w-full h-12 text-base font-bold shadow-lg shadow-primary/25">
                {submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : "إرسال طلب التسجيل"}
              </Button>

              <div className="flex items-start gap-2 text-xs text-muted-foreground pt-1">
                <Info className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                <span>بالضغط على "إرسال" فإنك توافق على مراجعة الإدارة لطلبك خلال 24 ساعة.</span>
              </div>
            </form>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Register;