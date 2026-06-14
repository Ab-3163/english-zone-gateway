import { useEffect, useState, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Loader2, Search, Trash2, Award, Calendar, GraduationCap } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface Cert {
  id: string;
  certificate_number: string;
  student_id: string;
  full_name: string;
  course: string;
  level: string | null;
  score: number | null;
  grade: string | null;
  pass_date: string;
  created_at: string;
}

const CertificatesManager = () => {
  const [list, setList] = useState<Cert[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const load = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("certificates" as any)
      .select("*")
      .order("created_at", { ascending: false });
    if (error) toast({ title: "خطأ", description: error.message, variant: "destructive" });
    else setList((data as any) || []);
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return list;
    return list.filter((c) =>
      `${c.certificate_number} ${c.student_id} ${c.full_name} ${c.course}`.toLowerCase().includes(q)
    );
  }, [list, search]);

  const remove = async (id: string) => {
    if (!confirm("حذف الشهادة نهائياً؟")) return;
    const { error } = await supabase.from("certificates" as any).delete().eq("id", id);
    if (error) return toast({ title: "خطأ", description: error.message, variant: "destructive" });
    toast({ title: "تم الحذف" });
    load();
  };

  if (loading) return <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>;

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="بحث برقم الشهادة، الاسم، رقم الطالب..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pr-9 h-11"
        />
      </div>

      {filtered.length === 0 ? (
        <div className="bg-card border rounded-2xl p-12 text-center text-muted-foreground">
          لا توجد شهادات بعد. ستنشأ تلقائياً عند نجاح أي طالب.
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((c) => (
            <div key={c.id} className="group relative bg-gradient-to-br from-card to-muted/30 border border-border rounded-2xl p-5 shadow-sm hover:shadow-lg hover:-translate-y-0.5 transition-all">
              <div className="absolute top-4 left-4 opacity-10 group-hover:opacity-20 transition">
                <Award className="w-16 h-16 text-primary" />
              </div>
              <div className="relative">
                <div className="flex items-start justify-between mb-3">
                  <Badge className="bg-primary/10 text-primary border-primary/20 font-mono text-xs" variant="outline">
                    {c.certificate_number}
                  </Badge>
                  <button onClick={() => remove(c.id)} className="text-destructive/70 hover:text-destructive transition">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                <h3 className="font-bold text-base mb-1 line-clamp-1">{c.full_name}</h3>
                <p className="text-xs text-muted-foreground font-mono mb-3" dir="ltr">{c.student_id}</p>
                <div className="space-y-1.5 text-sm">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <GraduationCap className="w-4 h-4 shrink-0" />
                    <span className="truncate">{c.course}{c.level ? ` · ${c.level}` : ""}</span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Calendar className="w-4 h-4 shrink-0" />
                    <span>{new Date(c.pass_date).toLocaleDateString("ar")}</span>
                  </div>
                </div>
                {(c.score !== null || c.grade) && (
                  <div className="mt-3 pt-3 border-t border-border flex items-center justify-between">
                    {c.score !== null && (
                      <div>
                        <span className="text-xs text-muted-foreground">الدرجة: </span>
                        <span className="font-bold text-primary">{c.score}/100</span>
                      </div>
                    )}
                    {c.grade && <Badge variant="secondary" className="text-xs">{c.grade}</Badge>}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CertificatesManager;