import { useEffect, useMemo, useState } from "react";
import { Search, Loader2, GraduationCap, CheckCircle2, XCircle, Clock, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

interface ResultRow {
  student_id: string;
  full_name: string;
  course: string;
  level: string | null;
  score: number | null;
  grade: string | null;
  status: string;
  admin_note: string | null;
}

const Results = () => {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [rows, setRows] = useState<ResultRow[]>([]);
  const [activeQuery, setActiveQuery] = useState("");

  const fetchRows = async (q: string) => {
    setLoading(true);
    const { data, error } = await supabase.rpc("list_published_results", {
      _query: q.trim() || null,
    });
    setLoading(false);
    if (error) {
      toast({ title: "خطأ", description: "تعذّر جلب النتائج", variant: "destructive" });
      return;
    }
    setRows((data as ResultRow[]) || []);
  };

  useEffect(() => {
    fetchRows("");
  }, []);

  // Debounced search as user types
  useEffect(() => {
    const t = setTimeout(() => {
      if (query.trim() === activeQuery.trim()) return;
      setActiveQuery(query.trim());
      fetchRows(query);
    }, 350);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query]);

  const groups = useMemo(() => {
    const map = new Map<string, ResultRow[]>();
    for (const r of rows) {
      const key = `${r.course}${r.level ? ` — ${r.level}` : ""}`;
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(r);
    }
    return Array.from(map.entries());
  }, [rows]);

  const statusBadge = (status: string) => {
    if (status === "pass") return <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-green-500/10 text-green-600 text-xs font-medium whitespace-nowrap"><CheckCircle2 className="w-3.5 h-3.5" /> ناجح</span>;
    if (status === "fail") return <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-red-500/10 text-red-600 text-xs font-medium whitespace-nowrap"><XCircle className="w-3.5 h-3.5" /> راسب</span>;
    return <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-600 text-xs font-medium whitespace-nowrap"><Clock className="w-3.5 h-3.5" /> قيد المراجعة</span>;
  };

  return (
    <div className="min-h-screen bg-background" dir="rtl">
      <Navbar />
      <main className="pt-28 md:pt-32 pb-20 section-padding">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-8 md:mb-10">
            <div className="inline-flex items-center justify-center w-14 h-14 md:w-16 md:h-16 rounded-2xl bg-primary/10 text-primary mb-4">
              <GraduationCap className="w-7 h-7 md:w-8 md:h-8" />
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-3">نتائج الطلاب</h1>
            <p className="text-muted-foreground text-sm md:text-base">جميع النتائج المنشورة مرتبة حسب الأقسام والمستويات</p>
          </div>

          {/* Search bar */}
          <div className="bg-card border border-border rounded-2xl p-3 sm:p-4 shadow-sm mb-8 sticky top-20 z-20">
            <div className="relative">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="ابحث برقم الطالب أو الهاتف أو الاسم..."
                maxLength={60}
                className="pr-10 pl-10 h-11"
              />
              {query && (
                <button
                  type="button"
                  onClick={() => setQuery("")}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  aria-label="مسح البحث"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : groups.length === 0 ? (
            <div className="bg-card border border-border rounded-2xl p-10 text-center text-muted-foreground">
              {query.trim()
                ? "لا توجد نتيجة بهذا الرقم أو الاسم."
                : "لا توجد نتائج منشورة حالياً."}
            </div>
          ) : (
            <div className="space-y-10">
              {groups.map(([groupName, items]) => (
                <section key={groupName}>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="h-8 w-1.5 rounded-full bg-primary" />
                    <h2 className="text-xl md:text-2xl font-bold">{groupName}</h2>
                    <span className="text-sm text-muted-foreground">({items.length} طالب)</span>
                  </div>

                  {/* Desktop table */}
                  <div className="hidden md:block bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead className="bg-muted/50">
                          <tr className="text-right">
                            <th className="p-3 font-semibold">رقم الطالب</th>
                            <th className="p-3 font-semibold">الاسم</th>
                            <th className="p-3 font-semibold">الدورة</th>
                            <th className="p-3 font-semibold">المستوى</th>
                            <th className="p-3 font-semibold">الدرجة /20</th>
                            <th className="p-3 font-semibold">التقدير</th>
                            <th className="p-3 font-semibold">الحالة</th>
                          </tr>
                        </thead>
                        <tbody>
                          {items.map((r, i) => (
                            <tr key={r.student_id + i} className="border-t border-border hover:bg-muted/30 transition-colors">
                              <td className="p-3 font-mono" dir="ltr">{r.student_id}</td>
                              <td className="p-3 font-medium">{r.full_name}</td>
                              <td className="p-3">{r.course}</td>
                              <td className="p-3">{r.level || "—"}</td>
                              <td className="p-3 font-semibold">{r.score ?? "—"}</td>
                              <td className="p-3">{r.grade || "—"}</td>
                              <td className="p-3">{statusBadge(r.status)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Mobile cards */}
                  <div className="md:hidden space-y-3">
                    {items.map((r, i) => (
                      <div key={r.student_id + i} className="bg-card border border-border rounded-xl p-4 shadow-sm">
                        <div className="flex items-start justify-between gap-3 mb-3">
                          <div className="min-w-0">
                            <h3 className="font-bold truncate">{r.full_name}</h3>
                            <p className="text-xs font-mono text-muted-foreground" dir="ltr">{r.student_id}</p>
                          </div>
                          {statusBadge(r.status)}
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          <div className="bg-muted/40 rounded-lg p-2">
                            <div className="text-[11px] text-muted-foreground">الدورة</div>
                            <div className="font-medium truncate">{r.course}</div>
                          </div>
                          <div className="bg-muted/40 rounded-lg p-2">
                            <div className="text-[11px] text-muted-foreground">المستوى</div>
                            <div className="font-medium truncate">{r.level || "—"}</div>
                          </div>
                          <div className="bg-muted/40 rounded-lg p-2">
                            <div className="text-[11px] text-muted-foreground">الدرجة /20</div>
                            <div className="font-semibold">{r.score ?? "—"}</div>
                          </div>
                          <div className="bg-muted/40 rounded-lg p-2">
                            <div className="text-[11px] text-muted-foreground">التقدير</div>
                            <div className="font-semibold">{r.grade || "—"}</div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              ))}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Results;