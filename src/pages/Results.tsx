import { useState } from "react";
import { Search, Loader2, GraduationCap, Award, CheckCircle2, XCircle, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

interface ResultRow {
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
  const [results, setResults] = useState<ResultRow[] | null>(null);
  const [lastSearchedAt, setLastSearchedAt] = useState<number>(0);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    const q = query.trim();
    if (q.length < 3) {
      toast({ title: "تنبيه", description: "أدخل رقم تسجيل أو هاتف صحيح (٣ خانات على الأقل)", variant: "destructive" });
      return;
    }
    // anti-spam: throttle to 1 search / 2s
    if (Date.now() - lastSearchedAt < 2000) {
      toast({ title: "انتظر قليلاً", description: "يرجى الانتظار قبل إعادة البحث", variant: "destructive" });
      return;
    }
    setLastSearchedAt(Date.now());
    setLoading(true);
    const { data, error } = await supabase.rpc("search_student_result", { _query: q });
    setLoading(false);
    if (error) {
      toast({ title: "خطأ", description: "تعذّر جلب النتيجة", variant: "destructive" });
      return;
    }
    setResults((data as ResultRow[]) || []);
  };

  const statusBadge = (status: string) => {
    if (status === "pass") return <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-green-500/10 text-green-600 text-sm font-medium"><CheckCircle2 className="w-4 h-4" /> ناجح</span>;
    if (status === "fail") return <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-red-500/10 text-red-600 text-sm font-medium"><XCircle className="w-4 h-4" /> راسب</span>;
    return <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-amber-500/10 text-amber-600 text-sm font-medium"><Clock className="w-4 h-4" /> قيد المراجعة</span>;
  };

  return (
    <div className="min-h-screen bg-background" dir="rtl">
      <Navbar />
      <main className="pt-32 pb-20 section-padding">
        <div className="container mx-auto max-w-3xl">
          <div className="text-center mb-10">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 text-primary mb-4">
              <GraduationCap className="w-8 h-8" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-3">نتائج الطلاب</h1>
            <p className="text-muted-foreground">ابحث عن نتيجتك باستخدام رقم التسجيل أو رقم الهاتف</p>
          </div>

          <form onSubmit={handleSearch} className="bg-card border border-border rounded-2xl p-6 shadow-sm flex flex-col sm:flex-row gap-3 mb-8">
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="رقم التسجيل أو رقم الهاتف"
              maxLength={40}
              className="flex-1"
              dir="ltr"
            />
            <Button type="submit" disabled={loading} className="gap-2">
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
              بحث
            </Button>
          </form>

          {results !== null && (
            <div className="space-y-4">
              {results.length === 0 ? (
                <div className="bg-card border border-border rounded-2xl p-8 text-center text-muted-foreground">
                  لا توجد نتائج مطابقة. تأكد من رقم التسجيل أو الهاتف.
                </div>
              ) : (
                results.map((r, i) => (
                  <div key={i} className="bg-card border border-border rounded-2xl p-6 shadow-sm">
                    <div className="flex flex-wrap items-start justify-between gap-3 mb-4">
                      <div>
                        <h3 className="text-xl font-bold">{r.full_name}</h3>
                        <p className="text-sm text-muted-foreground">{r.course}{r.level ? ` — ${r.level}` : ""}</p>
                      </div>
                      {statusBadge(r.status)}
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div className="bg-muted/40 rounded-lg p-3">
                        <div className="text-muted-foreground mb-1">النتيجة</div>
                        <div className="font-semibold text-lg">{r.score ?? "—"}</div>
                      </div>
                      <div className="bg-muted/40 rounded-lg p-3">
                        <div className="text-muted-foreground mb-1 flex items-center gap-1"><Award className="w-3 h-3" /> التقدير</div>
                        <div className="font-semibold text-lg">{r.grade ?? "—"}</div>
                      </div>
                    </div>
                    {r.admin_note && (
                      <div className="mt-4 p-3 rounded-lg bg-primary/5 border border-primary/10 text-sm">
                        <span className="font-medium">ملاحظة الإدارة: </span>{r.admin_note}
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Results;