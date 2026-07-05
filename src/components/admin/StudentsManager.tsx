import { useEffect, useState, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/hooks/use-toast";
import { Loader2, Search, Plus, Pencil, Trash2, Check, X, MessageCircle, FileImage, FileText, Send } from "lucide-react";
import { generateAndUploadInvoice } from "@/lib/invoiceGenerator";

type Student = any;

const STATUS = ["awaiting_confirmation", "registered", "rejected", "suspended", "awaiting_payment", "new"];
const PAY_STATUS = ["pending", "awaiting_confirmation", "confirmed", "partial", "rejected"];

const empty: Partial<Student> = {
  full_name: "", phone: "", email: "", language: "english", level: "A1",
  course_type: "in_person", course_fee: 1700, paid_amount: 0, remaining_amount: 1700,
  payment_status: "pending", status: "awaiting_confirmation",
};

const StudentsManager = () => {
  const [list, setList] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [payFilter, setPayFilter] = useState("all");
  const [levelFilter, setLevelFilter] = useState("all");
  const [editing, setEditing] = useState<Partial<Student> | null>(null);
  const [saving, setSaving] = useState(false);
  const [viewReceipt, setViewReceipt] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    const { data, error } = await supabase.from("students").select("*").order("created_at", { ascending: false });
    if (error) toast({ title: "خطأ", description: error.message, variant: "destructive" });
    setList(data || []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const filtered = useMemo(() => list.filter(s => {
    const q = search.trim().toLowerCase();
    if (q && !`${s.student_id} ${s.full_name} ${s.phone} ${s.group_name || ""}`.toLowerCase().includes(q)) return false;
    if (statusFilter !== "all" && s.status !== statusFilter) return false;
    if (payFilter !== "all" && s.payment_status !== payFilter) return false;
    if (levelFilter !== "all" && s.level !== levelFilter) return false;
    return true;
  }), [list, search, statusFilter, payFilter, levelFilter]);

  const save = async () => {
    if (!editing) return;
    if (!editing.full_name || !editing.phone) {
      toast({ title: "خطأ", description: "الاسم والهاتف مطلوبان", variant: "destructive" }); return;
    }
    setSaving(true);
    const payload: any = { ...editing };
    delete payload.created_at; delete payload.updated_at;
    // numeric coercion
    ["course_fee","paid_amount","remaining_amount","first_exam_score","final_exam_score","average","age","total_sessions","absences","attendance_rate"].forEach(k => {
      if (payload[k] === "" || payload[k] === undefined) payload[k] = null;
      else if (payload[k] !== null) payload[k] = Number(payload[k]);
    });
    if (editing.id) {
      const { error } = await supabase.from("students").update(payload).eq("id", editing.id);
      if (error) { toast({ title: "خطأ", description: error.message, variant: "destructive" }); setSaving(false); return; }
      toast({ title: "تم", description: "تم تحديث الطالب" });
    } else {
      delete payload.id;
      delete payload.student_id; // auto-generated unless provided
      if (editing.student_id) payload.student_id = editing.student_id;
      const { error } = await supabase.from("students").insert(payload);
      if (error) { toast({ title: "خطأ", description: error.message, variant: "destructive" }); setSaving(false); return; }
      toast({ title: "تم", description: "تم إضافة الطالب" });
    }
    setSaving(false); setEditing(null); load();
  };

  const remove = async (id: string) => {
    if (!confirm("حذف الطالب نهائياً؟")) return;
    const { error } = await supabase.from("students").delete().eq("id", id);
    if (error) return toast({ title: "خطأ", description: error.message, variant: "destructive" });
    toast({ title: "تم الحذف" }); load();
  };

  const setStatus = async (id: string, patch: any) => {
    const { error } = await supabase.from("students").update(patch).eq("id", id);
    if (error) return toast({ title: "خطأ", description: error.message, variant: "destructive" });
    toast({ title: "تم التحديث" }); load();
  };

  // Confirm payment => assign 4-digit ID + invoice_number, generate PDF invoice, save URL
  const confirmPaymentAndInvoice = async (s: Student) => {
    setBusyId(s.id);
    try {
      const method = prompt("طريقة الدفع (نقدًا / بنكيا / بانكيلي...)", s.payment_method || "نقدًا") || "نقدًا";
      const { data: updated, error } = await supabase.rpc("confirm_payment_and_prepare_invoice" as any, {
        _student_uuid: s.id,
        _payment_method: method,
        _paid_amount: s.paid_amount ?? s.course_fee ?? 1700,
      });
      if (error) throw error;
      const student = updated as any;
      toast({ title: "تم تأكيد الدفع", description: `Student ID: ${student.student_id}` });

      // Generate the PDF invoice
      const { path } = await generateAndUploadInvoice({
        id: student.id,
        student_id: student.student_id,
        invoice_number: student.invoice_number,
        full_name: student.full_name,
        phone: student.phone,
        language: student.language,
        level: student.level,
        group_name: student.group_name,
        course_type: student.course_type,
        study_center: student.study_center,
        paid_amount: Number(student.paid_amount),
        course_fee: Number(student.course_fee),
        payment_method: student.payment_method,
        payment_confirmed_at: student.payment_confirmed_at,
      });

      await supabase.from("students").update({
        invoice_pdf_url: path,
        invoice_generated_at: new Date().toISOString(),
        invoice_status: "generated",
      }).eq("id", student.id);

      toast({ title: "تم إنشاء الفاتورة", description: `فاتورة رقم ${student.invoice_number}` });
      load();
    } catch (e: any) {
      toast({ title: "خطأ في إنشاء الفاتورة", description: e.message, variant: "destructive" });
    } finally {
      setBusyId(null);
    }
  };

  const openInvoice = async (path: string) => {
    const { data } = await supabase.storage.from("invoices").createSignedUrl(path, 600);
    if (data?.signedUrl) window.open(data.signedUrl, "_blank");
    else toast({ title: "تعذر فتح الفاتورة", variant: "destructive" });
  };

  const sendInvoiceWhatsapp = async (s: Student) => {
    setBusyId(s.id);
    try {
      const { data, error } = await supabase.functions.invoke("send-invoice-whatsapp", {
        body: { student_id: s.id },
      });
      if (error) throw error;
      if (!data?.success) throw new Error("فشل الإرسال - راجع سجل invoice_logs");
      toast({ title: "تم إرسال الفاتورة", description: "تم إرسالها إلى واتساب الطالب" });
      load();
    } catch (e: any) {
      toast({ title: "فشل الإرسال", description: e.message, variant: "destructive" });
    } finally {
      setBusyId(null);
    }
  };

  const openReceipt = async (path: string) => {
    const { data } = await supabase.storage.from("payment-receipts").createSignedUrl(path, 300);
    if (data?.signedUrl) setViewReceipt(data.signedUrl);
    else toast({ title: "تعذّر فتح الوصل", variant: "destructive" });
  };

  const wa = (phone: string) => {
    const clean = phone.replace(/[^\d+]/g, "");
    window.open(`https://wa.me/${clean.replace(/^\+/, "")}`, "_blank");
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-2 flex-wrap items-center">
        <div className="relative flex-1 min-w-full sm:min-w-[200px]">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="بحث: رقم الطالب، الاسم، الهاتف..." value={search} onChange={(e) => setSearch(e.target.value)} className="pr-9" />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-[160px] flex-1 sm:flex-none"><SelectValue placeholder="الحالة" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">كل الحالات</SelectItem>
            {STATUS.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={payFilter} onValueChange={setPayFilter}>
          <SelectTrigger className="w-full sm:w-[160px] flex-1 sm:flex-none"><SelectValue placeholder="حالة الدفع" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">كل المدفوعات</SelectItem>
            {PAY_STATUS.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={levelFilter} onValueChange={setLevelFilter}>
          <SelectTrigger className="w-full sm:w-[120px] flex-1 sm:flex-none"><SelectValue placeholder="المستوى" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">كل المستويات</SelectItem>
            {["A1","A2","B1","B2","C1"].map(l => <SelectItem key={l} value={l}>{l}</SelectItem>)}
          </SelectContent>
        </Select>
        <Button onClick={() => setEditing({ ...empty })} className="w-full sm:w-auto"><Plus className="w-4 h-4 ml-1" /> إضافة طالب</Button>
      </div>

      {loading ? <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 animate-spin" /></div> : (
      <>
        {/* Mobile cards */}
        <div className="md:hidden space-y-3">
          {filtered.length === 0 && <div className="bg-card border rounded-2xl p-8 text-center text-muted-foreground">لا توجد نتائج</div>}
          {filtered.map((s) => (
            <div key={s.id} className="bg-card border rounded-2xl p-4 shadow-sm space-y-3">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-bold text-sm truncate">{s.full_name}</h3>
                  </div>
                  <p className="text-xs text-muted-foreground font-mono" dir="ltr">{s.student_id}</p>
                </div>
                <Badge variant={s.status === "registered" ? "default" : "outline"} className="text-xs shrink-0">{s.status}</Badge>
              </div>
              <div className="grid grid-cols-2 gap-x-3 gap-y-1.5 text-xs">
                <div><span className="text-muted-foreground">الهاتف: </span><span dir="ltr">{s.phone}</span></div>
                <div><span className="text-muted-foreground">المستوى: </span>{s.level || "—"}</div>
                <div><span className="text-muted-foreground">اللغة: </span>{s.language}</div>
                <div><span className="text-muted-foreground">الدفع: </span>
                  <Badge variant={s.payment_status === "confirmed" ? "default" : "secondary"} className="text-[10px] h-4">{s.payment_status}</Badge>
                </div>
              </div>
              <div className="flex flex-wrap gap-1.5 pt-1">
                <Button size="sm" variant="outline" onClick={() => setEditing(s)} className="h-8 flex-1 min-w-[70px] gap-1"><Pencil className="w-3.5 h-3.5" /> تعديل</Button>
                <Button size="sm" variant="outline" onClick={() => wa(s.phone)} className="h-8 text-green-700 border-green-200"><MessageCircle className="w-4 h-4" /></Button>
                {s.payment_status !== "confirmed" && (
                  <Button size="sm" disabled={busyId === s.id} onClick={() => confirmPaymentAndInvoice(s)} className="h-8 bg-green-600 hover:bg-green-700 text-white gap-1">
                    {busyId === s.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                    تأكيد الدفع
                  </Button>
                )}
                {s.invoice_pdf_url && (
                  <Button size="sm" variant="outline" onClick={() => openInvoice(s.invoice_pdf_url)} className="h-8 gap-1">
                    <FileText className="w-4 h-4" /> فاتورة
                  </Button>
                )}
                {s.invoice_pdf_url && (
                  <Button size="sm" disabled={busyId === s.id} onClick={() => sendInvoiceWhatsapp(s)} className="h-8 bg-emerald-600 hover:bg-emerald-700 text-white gap-1">
                    {busyId === s.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                    إرسال واتساب
                  </Button>
                )}
                <Button size="sm" variant="outline" onClick={() => remove(s.id)} className="h-8 text-destructive border-destructive/20"><Trash2 className="w-4 h-4" /></Button>
              </div>
            </div>
          ))}
        </div>

        {/* Desktop table */}
        <div className="hidden md:block bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/50">
                <tr>
                  <th className="text-right p-3">Student ID</th>
                  <th className="text-right p-3">الاسم</th>
                  <th className="text-right p-3">الهاتف</th>
                  <th className="text-right p-3">اللغة/المستوى</th>
                  <th className="text-right p-3">القسم</th>
                  <th className="text-right p-3">الدفع</th>
                  <th className="text-right p-3">الحالة</th>
                  <th className="text-right p-3">إجراءات</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((s) => (
                  <tr key={s.id} className="border-t border-border hover:bg-muted/30">
                    <td className="p-3 font-mono text-xs" dir="ltr">{s.student_id}</td>
                    <td className="p-3 font-medium">{s.full_name}</td>
                    <td className="p-3" dir="ltr">{s.phone}</td>
                    <td className="p-3">{s.language} / {s.level}</td>
                    <td className="p-3">{s.group_name || "-"}</td>
                    <td className="p-3"><Badge variant={s.payment_status === "confirmed" ? "default" : "secondary"}>{s.payment_status}</Badge></td>
                    <td className="p-3"><Badge variant={s.status === "registered" ? "default" : "outline"}>{s.status}</Badge></td>
                    <td className="p-3">
                      <div className="flex gap-1 flex-wrap">
                        <Button size="icon" variant="ghost" title="تعديل" onClick={() => setEditing(s)}><Pencil className="w-4 h-4" /></Button>
                        {s.payment_status !== "confirmed" ? (
                          <Button size="icon" variant="ghost" title="تأكيد الدفع + إنشاء فاتورة" disabled={busyId === s.id} className="text-green-600" onClick={() => confirmPaymentAndInvoice(s)}>
                            {busyId === s.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                          </Button>
                        ) : null}
                        <Button size="icon" variant="ghost" title="رفض الدفع" className="text-destructive" onClick={() => { const r = prompt("سبب الرفض؟"); if (r !== null) setStatus(s.id, { payment_status: "rejected", status: "rejected", rejection_reason: r }); }}><X className="w-4 h-4" /></Button>
                        {s.payment_receipt_url && <Button size="icon" variant="ghost" title="عرض الوصل" onClick={() => openReceipt(s.payment_receipt_url)}><FileImage className="w-4 h-4" /></Button>}
                        {s.invoice_pdf_url && (
                          <Button size="icon" variant="ghost" title="عرض الفاتورة" onClick={() => openInvoice(s.invoice_pdf_url)}>
                            <FileText className="w-4 h-4 text-blue-600" />
                          </Button>
                        )}
                        {s.invoice_pdf_url && (
                          <Button size="icon" variant="ghost" title="إرسال الفاتورة واتساب" disabled={busyId === s.id} className="text-emerald-600" onClick={() => sendInvoiceWhatsapp(s)}>
                            {busyId === s.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                          </Button>
                        )}
                        <Button size="icon" variant="ghost" title="واتساب" className="text-green-600" onClick={() => wa(s.phone)}><MessageCircle className="w-4 h-4" /></Button>
                        <Button size="icon" variant="ghost" title="حذف" className="text-destructive" onClick={() => remove(s.id)}><Trash2 className="w-4 h-4" /></Button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && <tr><td colSpan={8} className="text-center p-8 text-muted-foreground">لا توجد نتائج</td></tr>}
              </tbody>
            </table>
          </div>
        </div>
      </>
      )}

      <Dialog open={!!editing} onOpenChange={(o) => !o && setEditing(null)}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto" dir="rtl">
          <DialogHeader><DialogTitle>{editing?.id ? "تعديل طالب" : "إضافة طالب جديد"}</DialogTitle></DialogHeader>
          {editing && (
            <div className="grid md:grid-cols-2 gap-3 text-sm">
              {editing.id && <div><label className="text-xs text-muted-foreground">Student ID</label><Input value={editing.student_id || ""} disabled dir="ltr" /></div>}
              {!editing.id && <div><label className="text-xs text-muted-foreground">Student ID (اتركه فارغًا للتوليد التلقائي)</label><Input value={editing.student_id || ""} onChange={(e) => setEditing({ ...editing, student_id: e.target.value })} placeholder="0001" dir="ltr" maxLength={4} /></div>}
              <div><label className="text-xs text-muted-foreground">الاسم الكامل *</label><Input value={editing.full_name || ""} onChange={(e) => setEditing({ ...editing, full_name: e.target.value })} /></div>
              <div><label className="text-xs text-muted-foreground">الهاتف *</label><Input value={editing.phone || ""} onChange={(e) => setEditing({ ...editing, phone: e.target.value })} dir="ltr" /></div>
              <div><label className="text-xs text-muted-foreground">البريد</label><Input value={editing.email || ""} onChange={(e) => setEditing({ ...editing, email: e.target.value })} dir="ltr" /></div>
              <div><label className="text-xs text-muted-foreground">العمر</label><Input type="number" value={editing.age ?? ""} onChange={(e) => setEditing({ ...editing, age: e.target.value })} dir="ltr" /></div>
              <div><label className="text-xs text-muted-foreground">تاريخ الميلاد</label><Input type="date" value={editing.birth_date || ""} onChange={(e) => setEditing({ ...editing, birth_date: e.target.value })} dir="ltr" /></div>
              <div><label className="text-xs text-muted-foreground">اللغة</label>
                <Select value={editing.language || ""} onValueChange={(v) => setEditing({ ...editing, language: v })}>
                  <SelectTrigger><SelectValue placeholder="-" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="french">الفرنسية</SelectItem><SelectItem value="english">الإنجليزية</SelectItem><SelectItem value="arabic">العربية</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div><label className="text-xs text-muted-foreground">المستوى</label>
                <Select value={editing.level || ""} onValueChange={(v) => setEditing({ ...editing, level: v })}>
                  <SelectTrigger><SelectValue placeholder="-" /></SelectTrigger>
                  <SelectContent>{["A1","A2","B1","B2","C1"].map(l => <SelectItem key={l} value={l}>{l}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div><label className="text-xs text-muted-foreground">القسم/المجموعة</label><Input value={editing.group_name || ""} onChange={(e) => setEditing({ ...editing, group_name: e.target.value })} /></div>
              <div><label className="text-xs text-muted-foreground">الأستاذ</label><Input value={editing.teacher || ""} onChange={(e) => setEditing({ ...editing, teacher: e.target.value })} /></div>
              <div><label className="text-xs text-muted-foreground">أيام الدراسة</label><Input value={editing.study_days || ""} onChange={(e) => setEditing({ ...editing, study_days: e.target.value })} placeholder="السبت/الإثنين" /></div>
              <div><label className="text-xs text-muted-foreground">التوقيت</label><Input value={editing.study_time || ""} onChange={(e) => setEditing({ ...editing, study_time: e.target.value })} placeholder="18:00-20:00" /></div>
              <div><label className="text-xs text-muted-foreground">القاعة</label><Input value={editing.room || ""} onChange={(e) => setEditing({ ...editing, room: e.target.value })} /></div>
              <div><label className="text-xs text-muted-foreground">نوع الدورة</label>
                <Select value={editing.course_type || ""} onValueChange={(v) => setEditing({ ...editing, course_type: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent><SelectItem value="in_person">حضورية</SelectItem><SelectItem value="online">أونلاين</SelectItem></SelectContent>
                </Select>
              </div>
              <div><label className="text-xs text-muted-foreground">رسوم الدورة</label><Input type="number" value={editing.course_fee ?? ""} onChange={(e) => setEditing({ ...editing, course_fee: e.target.value })} dir="ltr" /></div>
              <div><label className="text-xs text-muted-foreground">المبلغ المدفوع</label><Input type="number" value={editing.paid_amount ?? ""} onChange={(e) => setEditing({ ...editing, paid_amount: e.target.value })} dir="ltr" /></div>
              <div><label className="text-xs text-muted-foreground">المتبقي</label><Input type="number" value={editing.remaining_amount ?? ""} onChange={(e) => setEditing({ ...editing, remaining_amount: e.target.value })} dir="ltr" /></div>
              <div><label className="text-xs text-muted-foreground">حالة الدفع</label>
                <Select value={editing.payment_status || ""} onValueChange={(v) => setEditing({ ...editing, payment_status: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{PAY_STATUS.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div><label className="text-xs text-muted-foreground">حالة الطالب</label>
                <Select value={editing.status || ""} onValueChange={(v) => setEditing({ ...editing, status: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{STATUS.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div><label className="text-xs text-muted-foreground">نتيجة الاختبار الأول</label><Input type="number" value={editing.first_exam_score ?? ""} onChange={(e) => setEditing({ ...editing, first_exam_score: e.target.value })} dir="ltr" /></div>
              <div><label className="text-xs text-muted-foreground">النتيجة النهائية</label><Input type="number" value={editing.final_exam_score ?? ""} onChange={(e) => setEditing({ ...editing, final_exam_score: e.target.value })} dir="ltr" /></div>
              <div><label className="text-xs text-muted-foreground">المعدل</label><Input type="number" value={editing.average ?? ""} onChange={(e) => setEditing({ ...editing, average: e.target.value })} dir="ltr" /></div>
              <div><label className="text-xs text-muted-foreground">التقدير</label><Input value={editing.grade || ""} onChange={(e) => setEditing({ ...editing, grade: e.target.value })} /></div>
              <div><label className="text-xs text-muted-foreground">الحالة</label>
                <Select value={editing.pass_status || ""} onValueChange={(v) => setEditing({ ...editing, pass_status: v })}>
                  <SelectTrigger><SelectValue placeholder="-" /></SelectTrigger>
                  <SelectContent><SelectItem value="pass">ناجح</SelectItem><SelectItem value="fail">راسب</SelectItem></SelectContent>
                </Select>
              </div>
              <div><label className="text-xs text-muted-foreground">المستوى القادم</label><Input value={editing.next_level || ""} onChange={(e) => setEditing({ ...editing, next_level: e.target.value })} /></div>
              <div className="flex items-end gap-2"><label className="text-xs"><input type="checkbox" checked={!!editing.eligible_promotion} onChange={(e) => setEditing({ ...editing, eligible_promotion: e.target.checked })} className="ml-2" /> مؤهل للترقية</label></div>
              <div><label className="text-xs text-muted-foreground">عدد الحصص</label><Input type="number" value={editing.total_sessions ?? ""} onChange={(e) => setEditing({ ...editing, total_sessions: e.target.value })} dir="ltr" /></div>
              <div><label className="text-xs text-muted-foreground">الغيابات</label><Input type="number" value={editing.absences ?? ""} onChange={(e) => setEditing({ ...editing, absences: e.target.value })} dir="ltr" /></div>
              <div><label className="text-xs text-muted-foreground">نسبة الحضور %</label><Input type="number" value={editing.attendance_rate ?? ""} onChange={(e) => setEditing({ ...editing, attendance_rate: e.target.value })} dir="ltr" /></div>
              <div className="md:col-span-2"><label className="text-xs text-muted-foreground">ملاحظة الإدارة</label><Textarea value={editing.admin_note || ""} onChange={(e) => setEditing({ ...editing, admin_note: e.target.value })} rows={2} /></div>
              <div className="md:col-span-2"><label className="text-xs text-muted-foreground">ملاحظات</label><Textarea value={editing.notes || ""} onChange={(e) => setEditing({ ...editing, notes: e.target.value })} rows={2} /></div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditing(null)}>إلغاء</Button>
            <Button onClick={save} disabled={saving}>{saving ? <Loader2 className="w-4 h-4 animate-spin" /> : "حفظ"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!viewReceipt} onOpenChange={(o) => !o && setViewReceipt(null)}>
        <DialogContent className="max-w-2xl" dir="rtl">
          <DialogHeader><DialogTitle>وصل الدفع</DialogTitle></DialogHeader>
          {viewReceipt && (viewReceipt.includes(".pdf") ? (
            <iframe src={viewReceipt} className="w-full h-[70vh]" />
          ) : (
            <img src={viewReceipt} alt="وصل الدفع" className="w-full rounded-lg" />
          ))}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default StudentsManager;