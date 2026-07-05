import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Plus, Pencil, Trash2, Eye, EyeOff, Upload, Loader2, Save, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import ConfirmDialog from "./ConfirmDialog";

interface Result {
  id: string;
  student_id: string;
  phone: string | null;
  full_name: string;
  course: string;
  level: string | null;
  score: number | null;
  grade: string | null;
  status: string;
  admin_note: string | null;
  published: boolean;
}

const empty = {
  student_id: "", phone: "", full_name: "", course: "",
  level: "", score: "", grade: "", status: "pending", admin_note: "", published: true,
};

const ResultsManager = () => {
  const { t } = useTranslation();
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const [rows, setRows] = useState<Result[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<any>(empty);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  const fetch = async () => {
    setLoading(true);
    const { data, error } = await supabase.from("student_results").select("*").order("created_at", { ascending: false });
    if (error) toast({ title: t("admin.common.error"), description: t("admin.results.fetchFail"), variant: "destructive" });
    else setRows(data || []);
    setLoading(false);
  };
  useEffect(() => { fetch(); }, []);

  const startEdit = (r: Result) => {
    setEditingId(r.id);
    setForm({
      student_id: r.student_id, phone: r.phone || "", full_name: r.full_name, course: r.course,
      level: r.level || "", score: r.score?.toString() || "", grade: r.grade || "",
      status: r.status, admin_note: r.admin_note || "", published: r.published,
    });
    setShowForm(true);
  };

  const reset = () => { setForm(empty); setEditingId(null); setShowForm(false); };

  const save = async () => {
    if (!form.student_id.trim() || !form.full_name.trim() || !form.course.trim()) {
      toast({ title: t("admin.common.error"), description: t("admin.results.reqFields"), variant: "destructive" });
      return;
    }
    setSaving(true);
    const payload = {
      student_id: form.student_id.trim(),
      phone: form.phone.trim() || null,
      full_name: form.full_name.trim(),
      course: form.course.trim(),
      level: form.level.trim() || null,
      score: form.score ? Number(form.score) : null,
      grade: form.grade.trim() || null,
      status: form.status,
      admin_note: form.admin_note.trim() || null,
      published: form.published,
    };
    const { error } = editingId
      ? await supabase.from("student_results").update(payload).eq("id", editingId)
      : await supabase.from("student_results").insert(payload);
    setSaving(false);
    if (error) { toast({ title: t("admin.common.error"), description: error.message, variant: "destructive" }); return; }
    toast({ title: t("admin.common.done"), description: t("admin.results.saved") });
    reset(); fetch();
  };

  const remove = async (id: string) => {
    const { error } = await supabase.from("student_results").delete().eq("id", id);
    if (error) toast({ title: t("admin.common.error"), description: error.message, variant: "destructive" });
    else { toast({ title: t("admin.common.done"), description: t("admin.results.deleted") }); fetch(); }
  };

  const togglePublished = async (r: Result) => {
    await supabase.from("student_results").update({ published: !r.published }).eq("id", r.id);
    fetch();
  };

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const text = await file.text();
    const lines = text.split(/\r?\n/).filter(l => l.trim());
    if (lines.length < 2) { toast({ title: t("admin.common.error"), description: t("admin.results.csvEmpty"), variant: "destructive" }); return; }
    const header = lines[0].split(",").map(h => h.trim().toLowerCase());
    const required = ["student_id", "full_name", "course"];
    for (const r of required) if (!header.includes(r)) { toast({ title: t("admin.common.error"), description: t("admin.results.csvMissing", { col: r }), variant: "destructive" }); return; }
    const rows = lines.slice(1).map(line => {
      const cells = line.split(",").map(c => c.trim());
      const obj: any = {};
      header.forEach((h, i) => obj[h] = cells[i] ?? "");
      return {
        student_id: obj.student_id,
        phone: obj.phone || null,
        full_name: obj.full_name,
        course: obj.course,
        level: obj.level || null,
        score: obj.score ? Number(obj.score) : null,
        grade: obj.grade || null,
        status: obj.status || "pending",
        admin_note: obj.admin_note || null,
        published: obj.published ? obj.published === "true" : true,
      };
    }).filter(r => r.student_id && r.full_name && r.course);
    const { error } = await supabase.from("student_results").insert(rows);
    if (error) toast({ title: t("admin.results.csvImportFail"), description: error.message, variant: "destructive" });
    else { toast({ title: t("admin.common.done"), description: t("admin.results.csvImported", { n: rows.length }) }); fetch(); }
    if (fileRef.current) fileRef.current.value = "";
  };

  const filtered = rows.filter(r =>
    !search || r.student_id.includes(search) || r.full_name.includes(search) || (r.phone || "").includes(search)
  );

  if (loading) return <div className="flex items-center justify-center h-64"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-3 justify-between">
        <div className="flex gap-2 flex-1 min-w-[220px]">
          <Input placeholder={t("admin.results.searchPh")} value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <div className="flex gap-2">
          <input ref={fileRef} type="file" accept=".csv,.txt" onChange={handleFile} className="hidden" />
          <Button variant="outline" onClick={() => fileRef.current?.click()} className="gap-2">
            <Upload className="w-4 h-4" /> {t("admin.results.importCsv")}
          </Button>
          <Button onClick={() => { reset(); setShowForm(true); }} className="gap-2"><Plus className="w-4 h-4" /> {t("admin.results.add")}</Button>
        </div>
      </div>

      <div className="text-xs text-muted-foreground bg-muted/40 rounded-lg p-3">
        {t("admin.results.csvCols")}
      </div>

      {showForm && (
        <div className="bg-card border border-border rounded-xl p-6 space-y-4">
          <div className="grid md:grid-cols-2 gap-3">
            <Input placeholder={`${t("admin.results.studentId")} *`} value={form.student_id} onChange={e => setForm({ ...form, student_id: e.target.value })} />
            <Input placeholder={t("admin.results.phone")} value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} dir="ltr" />
            <Input placeholder={`${t("admin.results.fullName")} *`} value={form.full_name} onChange={e => setForm({ ...form, full_name: e.target.value })} />
            <Input placeholder={`${t("admin.results.course")} *`} value={form.course} onChange={e => setForm({ ...form, course: e.target.value })} />
            <Input placeholder={t("admin.results.level")} value={form.level} onChange={e => setForm({ ...form, level: e.target.value })} />
            <Input type="number" placeholder={t("admin.results.score")} value={form.score} onChange={e => setForm({ ...form, score: e.target.value })} dir="ltr" />
            <Input placeholder={t("admin.results.grade")} value={form.grade} onChange={e => setForm({ ...form, grade: e.target.value })} />
            <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="pass">{t("admin.results.pass")}</SelectItem>
                <SelectItem value="fail">{t("admin.results.fail")}</SelectItem>
                <SelectItem value="pending">{t("admin.results.pending")}</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Textarea placeholder={t("admin.results.note")} value={form.admin_note} onChange={e => setForm({ ...form, admin_note: e.target.value })} />
          <div className="flex items-center gap-3">
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={form.published} onChange={e => setForm({ ...form, published: e.target.checked })} />
              {t("admin.results.published")}
            </label>
          </div>
          <div className="flex gap-2">
            <Button onClick={save} disabled={saving} className="gap-2">{saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} {t("admin.results.save")}</Button>
            <Button variant="outline" onClick={reset} className="gap-2"><X className="w-4 h-4" /> {t("admin.results.cancel")}</Button>
          </div>
        </div>
      )}

      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/50">
              <tr>
                <th className="text-start p-3">{t("admin.results.studentId")}</th>
                <th className="text-start p-3">{t("admin.results.fullName")}</th>
                <th className="text-start p-3">{t("admin.results.course")}</th>
                <th className="text-start p-3">{t("admin.results.score")}</th>
                <th className="text-start p-3">{t("admin.results.status")}</th>
                <th className="text-start p-3">{t("admin.results.publish")}</th>
                <th className="text-start p-3">{t("admin.results.actions")}</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(r => (
                <tr key={r.id} className="border-t border-border">
                  <td className="p-3" dir="ltr">{r.student_id}</td>
                  <td className="p-3">{r.full_name}</td>
                  <td className="p-3">{r.course}</td>
                  <td className="p-3">{r.score ?? "—"} {r.grade ? `(${r.grade})` : ""}</td>
                  <td className="p-3">{r.status === "pass" ? t("admin.results.pass") : r.status === "fail" ? t("admin.results.fail") : t("admin.results.pending")}</td>
                  <td className="p-3">
                    <button onClick={() => togglePublished(r)} className="text-primary">
                      {r.published ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                    </button>
                  </td>
                  <td className="p-3">
                    <div className="flex gap-2">
                      <button onClick={() => startEdit(r)} className="text-primary"><Pencil className="w-4 h-4" /></button>
                      <button onClick={() => setConfirmId(r.id)} className="text-destructive"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={7} className="p-6 text-center text-muted-foreground">{t("admin.results.empty")}</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      <ConfirmDialog
        open={!!confirmId}
        onOpenChange={(o) => { if (!o) setConfirmId(null); }}
        description={t("admin.results.confirmDelete")}
        onConfirm={() => { if (confirmId) { remove(confirmId); setConfirmId(null); } }}
      />
    </div>
  );
};

export default ResultsManager;