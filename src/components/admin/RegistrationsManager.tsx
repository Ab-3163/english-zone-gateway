import { useEffect, useState } from "react";
import { Loader2, Trash2, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

interface Reg {
  id: string;
  full_name: string;
  phone: string;
  age: number | null;
  language: string;
  level: string | null;
  course_type: string | null;
  preferred_time: string | null;
  notes: string | null;
  status: string;
  created_at: string;
}

const statusLabels: Record<string, string> = {
  new: "جديد", contacted: "تم التواصل", confirmed: "مؤكد", rejected: "مرفوض",
};

const RegistrationsManager = () => {
  const [rows, setRows] = useState<Reg[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const fetch = async () => {
    setLoading(true);
    const { data, error } = await supabase.from("registrations").select("*").order("created_at", { ascending: false });
    if (error) toast({ title: "خطأ", description: "فشل الجلب", variant: "destructive" });
    else setRows(data || []);
    setLoading(false);
  };
  useEffect(() => { fetch(); }, []);

  const updateStatus = async (id: string, status: string) => {
    const { error } = await supabase.from("registrations").update({ status }).eq("id", id);
    if (error) toast({ title: "خطأ", description: error.message, variant: "destructive" });
    else { toast({ title: "تم", description: "تم تحديث الحالة" }); fetch(); }
  };

  const remove = async (id: string) => {
    if (!confirm("حذف هذا الطلب؟")) return;
    const { error } = await supabase.from("registrations").delete().eq("id", id);
    if (error) toast({ title: "خطأ", description: error.message, variant: "destructive" });
    else { toast({ title: "تم", description: "تم الحذف" }); fetch(); }
  };

  const exportCSV = () => {
    const headers = ["full_name","phone","age","language","level","course_type","preferred_time","notes","status","created_at"];
    const escape = (v: any) => `"${String(v ?? "").replace(/"/g, '""')}"`;
    const lines = [headers.join(",")];
    filtered.forEach(r => lines.push(headers.map(h => escape((r as any)[h])).join(",")));
    const blob = new Blob(["\uFEFF" + lines.join("\n")], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `registrations-${Date.now()}.csv`; a.click();
    URL.revokeObjectURL(url);
  };

  const filtered = rows.filter(r =>
    (statusFilter === "all" || r.status === statusFilter) &&
    (!search || r.full_name.includes(search) || r.phone.includes(search))
  );

  if (loading) return <div className="flex items-center justify-center h-64"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-3 justify-between">
        <div className="flex gap-2 flex-1 min-w-[220px]">
          <Input placeholder="بحث بالاسم أو الهاتف..." value={search} onChange={e => setSearch(e.target.value)} />
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">الكل</SelectItem>
              {Object.entries(statusLabels).map(([k, v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <Button onClick={exportCSV} variant="outline" className="gap-2"><Download className="w-4 h-4" /> تصدير CSV</Button>
      </div>

      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/50">
              <tr>
                <th className="text-right p-3">الاسم</th>
                <th className="text-right p-3">الهاتف</th>
                <th className="text-right p-3">اللغة</th>
                <th className="text-right p-3">المستوى</th>
                <th className="text-right p-3">النوع</th>
                <th className="text-right p-3">التاريخ</th>
                <th className="text-right p-3">الحالة</th>
                <th className="text-right p-3">إجراء</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(r => (
                <tr key={r.id} className="border-t border-border align-top">
                  <td className="p-3">
                    {r.full_name}
                    {r.notes && <div className="text-xs text-muted-foreground mt-1 max-w-xs">{r.notes}</div>}
                  </td>
                  <td className="p-3" dir="ltr">{r.phone}</td>
                  <td className="p-3">{r.language}</td>
                  <td className="p-3">{r.level || "—"}</td>
                  <td className="p-3">{r.course_type === "in_person" ? "حضورية" : r.course_type === "online" ? "أونلاين" : "—"}</td>
                  <td className="p-3 text-xs text-muted-foreground">{new Date(r.created_at).toLocaleDateString("ar")}</td>
                  <td className="p-3">
                    <Select value={r.status} onValueChange={(v) => updateStatus(r.id, v)}>
                      <SelectTrigger className="w-32 h-8 text-xs"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {Object.entries(statusLabels).map(([k, v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </td>
                  <td className="p-3">
                    <button onClick={() => remove(r.id)} className="text-destructive"><Trash2 className="w-4 h-4" /></button>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={8} className="p-6 text-center text-muted-foreground">لا توجد طلبات</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default RegistrationsManager;