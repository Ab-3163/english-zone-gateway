import { useEffect, useMemo, useState } from "react";
import { Plus, Pencil, Trash2, Eye, EyeOff, Loader2, Save, X, Search, GraduationCap, CheckCircle2, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import ConfirmDialog from "./ConfirmDialog";

interface Student {
  id: string;
  student_id: string;
  full_name: string;
  phone: string | null;
  language: string | null;
  level: string | null;
  study_center: string | null;
}

interface ResultRow {
  id: string;
  student_id: string;
  full_name: string;
  phone: string | null;
  course: string;
  level: string | null;
  score: number | null;
  grade: string | null;
  status: string;
  published: boolean;
}

const LANG_LABEL: Record<string, string> = {
  english: "الإنجليزية",
  french: "الفرنسية",
  arabic: "العربية",
  spanish: "الإسبانية",
  informatique: "المعلوماتية",
  computer: "المعلوماتية",
};

const courseLabel = (lang: string | null) => {
  if (!lang) return "غير محدد";
  return LANG_LABEL[lang.toLowerCase()] || lang;
};

const computeGrade = (score: number): { status: "pass" | "fail"; grade: string } => {
  if (score >= 18) return { status: "pass", grade: "ممتاز" };
  if (score >= 16) return { status: "pass", grade: "جيد جداً" };
  if (score >= 14) return { status: "pass", grade: "جيد" };
  if (score >= 10) return { status: "pass", grade: "مقبول" };
  return { status: "fail", grade: "راسب" };
};

const statusBadge = (status: string) => {
  if (status === "pass")
    return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-green-500/10 text-green-600 text-xs font-medium"><CheckCircle2 className="w-3 h-3" /> ناجح</span>;
  if (status === "fail")
    return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-red-500/10 text-red-600 text-xs font-medium"><XCircle className="w-3 h-3" /> راسب</span>;
  return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-600 text-xs font-medium">قيد المراجعة</span>;
};

const ResultsManager = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const [results, setResults] = useState<ResultRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [editing, setEditing] = useState<{ student: Student; existing: ResultRow | null } | null>(null);
  const [scoreInput, setScoreInput] = useState("");
  const [saving, setSaving] = useState(false);
  const [confirmId, setConfirmId] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    const [{ data: sData, error: sErr }, { data: rData, error: rErr }] = await Promise.all([
      supabase.from("students").select("id, student_id, full_name, phone, language, level, study_center").order("full_name"),
      supabase.from("student_results").select("*").order("created_at", { ascending: false }),
    ]);
    if (sErr || rErr) {
      toast({ title: "خطأ", description: "تعذّر تحميل البيانات", variant: "destructive" });
    } else {
      setStudents((sData as Student[]) || []);
      setResults((rData as ResultRow[]) || []);
    }
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  // Map student_id -> latest result
  const resultByStudent = useMemo(() => {
    const m = new Map<string, ResultRow>();
    for (const r of results) if (!m.has(r.student_id)) m.set(r.student_id, r);
    return m;
  }, [results]);

  // Filter students by search
  const filteredStudents = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return students;
    return students.filter(s =>
      s.full_name.toLowerCase().includes(q) ||
      s.student_id.toLowerCase().includes(q) ||
      (s.phone || "").includes(q)
    );
  }, [students, search]);

  // Group by course + level
  const groups = useMemo(() => {
    const map = new Map<string, { label: string; students: Student[] }>();
    for (const s of filteredStudents) {
      const course = courseLabel(s.language);
      const level = s.level || "بدون مستوى";
      const key = `${course}||${level}`;
      const label = `قسم ${course} - ${level}`;
      if (!map.has(key)) map.set(key, { label, students: [] });
      map.get(key)!.students.push(s);
    }
    return Array.from(map.values()).sort((a, b) => a.label.localeCompare(b.label, "ar"));
  }, [filteredStudents]);

  const openEditor = (student: Student) => {
    const existing = resultByStudent.get(student.student_id) || null;
    setEditing({ student, existing });
    setScoreInput(existing?.score != null ? String(existing.score) : "");
  };

  const save = async () => {
    if (!editing) return;
    const scoreNum = Number(scoreInput);
    if (!scoreInput || isNaN(scoreNum) || scoreNum < 0 || scoreNum > 20) {
      toast({ title: "خطأ", description: "أدخل معدل صحيح بين 0 و 20", variant: "destructive" });
      return;
    }
    const { student, existing } = editing;
    const { status, grade } = computeGrade(scoreNum);
    setSaving(true);
    const payload = {
      student_id: student.student_id,
      full_name: student.full_name,
      phone: student.phone,
      course: courseLabel(student.language),
      level: student.level,
      score: scoreNum,
      grade,
      status,
      published: existing?.published ?? true,
    };
    const { error } = existing
      ? await supabase.from("student_results").update(payload).eq("id", existing.id)
      : await supabase.from("student_results").insert(payload);
    setSaving(false);
    if (error) {
      toast({ title: "خطأ", description: error.message, variant: "destructive" });
      return;
    }
    toast({ title: "تم", description: existing ? "تم تعديل النتيجة" : "تمت إضافة النتيجة" });
    setEditing(null);
    load();
  };

  const remove = async (id: string) => {
    const { error } = await supabase.from("student_results").delete().eq("id", id);
    if (error) toast({ title: "خطأ", description: error.message, variant: "destructive" });
    else { toast({ title: "تم", description: "تم حذف النتيجة" }); load(); }
  };

  const togglePublished = async (r: ResultRow) => {
    const { error } = await supabase.from("student_results").update({ published: !r.published }).eq("id", r.id);
    if (error) toast({ title: "خطأ", description: error.message, variant: "destructive" });
    else load();
  };

  if (loading)
    return <div className="flex items-center justify-center h-64"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;

  const preview = scoreInput ? computeGrade(Number(scoreInput) || 0) : null;

  return (
    <div className="space-y-6" dir="rtl">
      <div className="relative">
        <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
        <Input
          placeholder="ابحث عن طالب بالاسم أو الرقم أو الهاتف..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="pr-10 h-11"
        />
      </div>

      {groups.length === 0 ? (
        <div className="bg-card border border-border rounded-2xl p-10 text-center text-muted-foreground">
          لا يوجد طلاب.
        </div>
      ) : (
        <div className="space-y-8">
          {groups.map(g => (
            <section key={g.label}>
              <div className="flex items-center gap-3 mb-3">
                <div className="h-8 w-1.5 rounded-full bg-primary" />
                <h2 className="text-lg md:text-xl font-bold">{g.label}</h2>
                <span className="text-xs text-muted-foreground">({g.students.length} طالب)</span>
              </div>
              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                {g.students.map(s => {
                  const r = resultByStudent.get(s.student_id);
                  return (
                    <div key={s.id} className="bg-card border border-border rounded-xl p-4 shadow-sm flex flex-col gap-3">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <div className="font-bold truncate">{s.full_name}</div>
                          <div className="text-xs font-mono text-muted-foreground" dir="ltr">{s.student_id}</div>
                          {s.phone && <div className="text-xs text-muted-foreground" dir="ltr">{s.phone}</div>}
                        </div>
                        {r ? statusBadge(r.status) : <span className="text-xs text-muted-foreground">لا توجد نتيجة</span>}
                      </div>

                      <div className="grid grid-cols-3 gap-2 text-xs">
                        <div className="bg-muted/40 rounded-lg p-2">
                          <div className="text-[10px] text-muted-foreground">الدورة</div>
                          <div className="font-medium truncate">{courseLabel(s.language)}</div>
                        </div>
                        <div className="bg-muted/40 rounded-lg p-2">
                          <div className="text-[10px] text-muted-foreground">المستوى</div>
                          <div className="font-medium truncate">{s.level || "—"}</div>
                        </div>
                        <div className="bg-muted/40 rounded-lg p-2">
                          <div className="text-[10px] text-muted-foreground">المركز</div>
                          <div className="font-medium truncate">{s.study_center || "—"}</div>
                        </div>
                      </div>

                      {r && (
                        <div className="flex items-center justify-between bg-primary/5 rounded-lg p-2 text-sm">
                          <span className="font-semibold">
                            <span className="text-primary">{r.score}</span>
                            <span className="text-muted-foreground text-xs">/20</span>
                          </span>
                          <span className="text-xs">{r.grade || "—"}</span>
                        </div>
                      )}

                      <div className="flex flex-wrap gap-2 mt-auto">
                        <Button size="sm" onClick={() => openEditor(s)} className="gap-1 flex-1 min-w-[110px]">
                          {r ? <><Pencil className="w-3.5 h-3.5" /> تعديل النتيجة</> : <><Plus className="w-3.5 h-3.5" /> إضافة نتيجة</>}
                        </Button>
                        {r && (
                          <>
                            <Button size="sm" variant="outline" onClick={() => togglePublished(r)} className="gap-1" title={r.published ? "إخفاء" : "نشر"}>
                              {r.published ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                            </Button>
                            <Button size="sm" variant="outline" onClick={() => setConfirmId(r.id)} className="gap-1 text-destructive hover:text-destructive">
                              <Trash2 className="w-3.5 h-3.5" />
                            </Button>
                          </>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          ))}
        </div>
      )}

      <Dialog open={!!editing} onOpenChange={(o) => { if (!o) setEditing(null); }}>
        <DialogContent dir="rtl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <GraduationCap className="w-5 h-5 text-primary" />
              {editing?.existing ? "تعديل نتيجة" : "إضافة نتيجة"}
            </DialogTitle>
          </DialogHeader>
          {editing && (
            <div className="space-y-4">
              <div className="bg-muted/40 rounded-lg p-3 text-sm space-y-1">
                <div><span className="text-muted-foreground">الطالب: </span><span className="font-semibold">{editing.student.full_name}</span></div>
                <div className="text-xs text-muted-foreground" dir="ltr">ID: {editing.student.student_id}</div>
                <div className="text-xs">
                  {courseLabel(editing.student.language)} — {editing.student.level || "—"}
                  {editing.student.study_center ? ` — ${editing.student.study_center}` : ""}
                </div>
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">المعدل من 20</label>
                <Input
                  type="number"
                  min={0}
                  max={20}
                  step="0.01"
                  value={scoreInput}
                  onChange={(e) => setScoreInput(e.target.value)}
                  placeholder="مثال: 15.5"
                  dir="ltr"
                  className="text-lg"
                />
              </div>
              {preview && (
                <div className="flex items-center justify-between bg-primary/5 rounded-lg p-3 text-sm">
                  <span>الحالة والتقدير:</span>
                  <span className="flex items-center gap-2">
                    {statusBadge(preview.status)}
                    <span className="font-semibold">{preview.grade}</span>
                  </span>
                </div>
              )}
            </div>
          )}
          <DialogFooter className="gap-2 sm:gap-2">
            <Button variant="outline" onClick={() => setEditing(null)} className="gap-1"><X className="w-4 h-4" /> إلغاء</Button>
            <Button onClick={save} disabled={saving} className="gap-1">
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              حفظ
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={!!confirmId}
        onOpenChange={(o) => { if (!o) setConfirmId(null); }}
        description="هل تريد حذف هذه النتيجة؟"
        onConfirm={() => { if (confirmId) { remove(confirmId); setConfirmId(null); } }}
      />
    </div>
  );
};

export default ResultsManager;