import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Loader2, Trash2, Download, Check, X, MessageCircle, Phone, GraduationCap, Calendar, Search, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import ConfirmDialog from "./ConfirmDialog";

interface Reg {
  id: string;
  full_name: string;
  phone: string;
  age: number | null;
  language: string;
  level: string | null;
  course_type: string | null;
  study_center: string | null;
  preferred_time: string | null;
  notes: string | null;
  status: string;
  created_at: string;
}

const statusVariant: Record<string, string> = {
  new: "bg-blue-100 text-blue-700 border-blue-200",
  contacted: "bg-amber-100 text-amber-700 border-amber-200",
  confirmed: "bg-green-100 text-green-700 border-green-200",
  rejected: "bg-red-100 text-red-700 border-red-200",
};

const RegistrationsManager = () => {
  const { t, i18n } = useTranslation();
  const statusLabels: Record<string, string> = {
    new: t("admin.reg.statusNew"),
    contacted: t("admin.reg.statusContacted"),
    confirmed: t("admin.reg.statusConfirmed"),
    rejected: t("admin.reg.statusRejected"),
  };
  const centerLabel = (c: string | null) =>
    c === "nouakchott" ? t("register.centerNouakchott") : c === "tensoueilim" ? t("register.centerTensoueilim") : "—";
  const [rows, setRows] = useState<Reg[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [pendingDelete, setPendingDelete] = useState<string | null>(null);

  const fetch = async () => {
    setLoading(true);
    const { data, error } = await supabase.from("registrations").select("*").order("created_at", { ascending: false });
    if (error) toast({ title: t("admin.common.error"), description: t("admin.reg.fetchFail"), variant: "destructive" });
    else setRows(data || []);
    setLoading(false);
  };
  useEffect(() => { fetch(); }, []);

  const updateStatus = async (id: string, status: string) => {
    const { error } = await supabase.from("registrations").update({ status }).eq("id", id);
    if (error) toast({ title: t("admin.common.error"), description: error.message, variant: "destructive" });
    else { toast({ title: t("admin.common.done"), description: t("admin.reg.statusUpdated") }); fetch(); }
  };

  const doRemove = async (id: string) => {
    const { error } = await supabase.from("registrations").delete().eq("id", id);
    if (error) toast({ title: t("admin.common.error"), description: error.message, variant: "destructive" });
    else { toast({ title: t("admin.common.done"), description: t("admin.reg.deleted") }); fetch(); }
  };

  const acceptRegistration = async (r: Reg) => {
    // Create student record
    const { error: insErr } = await supabase.from("students").insert({
      full_name: r.full_name,
      phone: r.phone,
      age: r.age,
      language: r.language || "english",
      level: r.level || "A1",
      course_type: r.course_type || "in_person",
      study_center: r.study_center,
      preferred_time: r.preferred_time,
      notes: r.notes,
      course_fee: 1700,
      paid_amount: 0,
      remaining_amount: 1700,
      payment_status: "pending",
      status: "registered",
    } as any);
    if (insErr) {
      toast({ title: t("admin.common.error"), description: insErr.message, variant: "destructive" });
      return;
    }
    await supabase.from("registrations").update({ status: "confirmed" }).eq("id", r.id);
    toast({ title: t("admin.reg.accepted"), description: t("admin.reg.acceptedDesc") });
    fetch();
  };

  const openWa = (phone: string) => {
    const clean = phone.replace(/[^\d+]/g, "").replace(/^\+/, "");
    window.open(`https://wa.me/${clean}`, "_blank");
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
    (!search || `${r.full_name} ${r.phone}`.toLowerCase().includes(search.toLowerCase()))
  );

  if (loading) return <div className="flex items-center justify-center h-64"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
        <div className="flex flex-col sm:flex-row gap-2 flex-1">
          <div className="relative flex-1">
            <Search className="absolute start-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input placeholder={t("admin.reg.searchPh")} value={search} onChange={e => setSearch(e.target.value)} className="ps-9 h-11" />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full sm:w-44 h-11"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t("admin.reg.allStatuses")}</SelectItem>
              {Object.entries(statusLabels).map(([k, v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <Button onClick={exportCSV} variant="outline" className="gap-2 h-11 w-full sm:w-auto"><Download className="w-4 h-4" /> {t("admin.common.export")}</Button>
      </div>

      {/* Mobile cards */}
      <div className="md:hidden space-y-3">
        {filtered.length === 0 && (
          <div className="bg-card border rounded-2xl p-8 text-center text-muted-foreground">{t("admin.reg.empty")}</div>
        )}
        {filtered.map(r => (
          <div key={r.id} className="bg-card border rounded-2xl p-4 shadow-sm space-y-3">
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-2 min-w-0">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                  <User className="w-5 h-5 text-primary" />
                </div>
                <div className="min-w-0">
                  <h3 className="font-bold text-sm truncate">{r.full_name}</h3>
                  <p className="text-xs text-muted-foreground" dir="ltr">{r.phone}</p>
                </div>
              </div>
              <span className={`text-xs px-2 py-1 rounded-full border ${statusVariant[r.status] || "bg-muted"}`}>
                {statusLabels[r.status] || r.status}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
              <div className="flex items-center gap-1.5"><GraduationCap className="w-3.5 h-3.5" /><span>{r.language}{r.level ? ` · ${r.level}` : ""}</span></div>
              <div className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5" /><span>{new Date(r.created_at).toLocaleDateString(i18n.language)}</span></div>
              <div className="col-span-2 flex items-center gap-1.5"><span className="font-medium">{t("admin.reg.center")}:</span><span>{centerLabel(r.study_center)}</span></div>
            </div>
            {r.notes && <p className="text-xs bg-muted/50 rounded-lg p-2 line-clamp-2">{r.notes}</p>}
            <div className="flex flex-wrap gap-2 pt-1">
              {r.status !== "confirmed" && (
                <Button size="sm" onClick={() => acceptRegistration(r)} className="bg-green-600 hover:bg-green-700 text-white flex-1 min-w-[80px] h-9 gap-1">
                  <Check className="w-4 h-4" /> {t("admin.reg.accept")}
                </Button>
              )}
              {r.status !== "rejected" && (
                <Button size="sm" variant="outline" onClick={() => updateStatus(r.id, "rejected")} className="flex-1 min-w-[80px] h-9 gap-1">
                  <X className="w-4 h-4" /> {t("admin.reg.reject")}
                </Button>
              )}
              <Button size="sm" variant="outline" onClick={() => openWa(r.phone)} className="h-9 gap-1 text-green-700 border-green-200 hover:bg-green-50">
                <MessageCircle className="w-4 h-4" />
              </Button>
              <Button size="sm" variant="outline" onClick={() => setPendingDelete(r.id)} className="h-9 text-destructive border-destructive/20 hover:bg-destructive/10">
                <Trash2 className="w-4 h-4" />
              </Button>
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
                <th className="text-start p-3">{t("admin.reg.name")}</th>
                <th className="text-start p-3">{t("admin.reg.phone")}</th>
                <th className="text-start p-3">{t("admin.reg.language")}</th>
                <th className="text-start p-3">{t("admin.reg.level")}</th>
                <th className="text-start p-3">{t("admin.reg.type")}</th>
                <th className="text-start p-3">{t("admin.reg.center")}</th>
                <th className="text-start p-3">{t("admin.reg.date")}</th>
                <th className="text-start p-3">{t("admin.reg.status")}</th>
                <th className="text-start p-3">{t("admin.reg.actions")}</th>
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
                  <td className="p-3">{r.course_type === "in_person" ? t("admin.reg.inPerson") : r.course_type === "online" ? t("admin.reg.online") : "—"}</td>
                  <td className="p-3">{centerLabel(r.study_center)}</td>
                  <td className="p-3 text-xs text-muted-foreground">{new Date(r.created_at).toLocaleDateString(i18n.language)}</td>
                  <td className="p-3">
                    <span className={`text-xs px-2 py-1 rounded-full border ${statusVariant[r.status] || "bg-muted"}`}>
                      {statusLabels[r.status] || r.status}
                    </span>
                  </td>
                  <td className="p-3">
                    <div className="flex gap-1">
                      {r.status !== "confirmed" && (
                        <Button size="sm" onClick={() => acceptRegistration(r)} className="h-8 gap-1 bg-green-600 hover:bg-green-700 text-white">
                          <Check className="w-3.5 h-3.5" /> {t("admin.reg.accept")}
                        </Button>
                      )}
                      {r.status !== "rejected" && (
                        <Button size="sm" variant="outline" onClick={() => updateStatus(r.id, "rejected")} className="h-8 gap-1">
                          <X className="w-3.5 h-3.5" /> {t("admin.reg.reject")}
                        </Button>
                      )}
                      <Button size="icon" variant="ghost" onClick={() => openWa(r.phone)} className="h-8 w-8 text-green-700">
                        <MessageCircle className="w-4 h-4" />
                      </Button>
                      <Button size="icon" variant="ghost" onClick={() => setPendingDelete(r.id)} className="h-8 w-8 text-destructive">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={9} className="p-6 text-center text-muted-foreground">{t("admin.reg.empty")}</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <ConfirmDialog
        open={!!pendingDelete}
        onOpenChange={(o) => !o && setPendingDelete(null)}
        description={t("admin.reg.confirmDelete")}
        onConfirm={() => {
          if (pendingDelete) doRemove(pendingDelete);
          setPendingDelete(null);
        }}
      />
    </div>
  );
};

export default RegistrationsManager;