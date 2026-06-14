import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Users, UserCheck, Clock, DollarSign, Award, XCircle, Loader2, GraduationCap, ClipboardList, FileSpreadsheet, TrendingUp } from "lucide-react";

const Card = ({ icon: Icon, label, value, gradient, hint }: any) => (
  <div className="group relative bg-card border border-border rounded-2xl p-5 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all overflow-hidden">
    <div className={`absolute inset-x-0 top-0 h-1 ${gradient}`} />
    <div className="flex items-start justify-between mb-3">
      <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${gradient} shadow-sm`}>
        <Icon className="w-5 h-5 text-white" />
      </div>
      {hint && <span className="text-[10px] font-semibold text-muted-foreground bg-muted px-2 py-0.5 rounded-full">{hint}</span>}
    </div>
    <p className="text-xs text-muted-foreground mb-1">{label}</p>
    <p className="text-2xl sm:text-3xl font-bold tracking-tight">{value}</p>
  </div>
);

const StatsDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    (async () => {
      const [studentsRes, regsRes, coursesRes, resultsRes, certsRes] = await Promise.all([
        supabase.from("students").select("status,payment_status,paid_amount,pass_status,level,group_name,created_at"),
        supabase.from("registrations").select("id", { count: "exact", head: true }).eq("status", "new"),
        supabase.from("courses").select("id", { count: "exact", head: true }),
        supabase.from("student_results").select("id", { count: "exact", head: true }),
        supabase.from("certificates" as any).select("id", { count: "exact", head: true }),
      ]);
      const data = studentsRes.data;
      const rows = data || [];
      const today = new Date(); today.setHours(0,0,0,0);
      const byLevel: Record<string, number> = {};
      const byGroup: Record<string, number> = {};
      let revenue = 0, active = 0, newToday = 0, pendingPay = 0, awaitConf = 0, pass = 0, fail = 0;
      for (const s of rows) {
        if (s.status === "registered") active++;
        if (new Date(s.created_at) >= today) newToday++;
        if (s.payment_status === "pending") pendingPay++;
        if (s.payment_status === "awaiting_confirmation" || s.status === "awaiting_confirmation") awaitConf++;
        if (s.payment_status === "confirmed") revenue += Number(s.paid_amount || 0);
        if (s.pass_status === "pass") pass++;
        if (s.pass_status === "fail") fail++;
        if (s.level) byLevel[s.level] = (byLevel[s.level] || 0) + 1;
        if (s.group_name) byGroup[s.group_name] = (byGroup[s.group_name] || 0) + 1;
      }
      setStats({
        total: rows.length, active, newToday, pendingPay, awaitConf, revenue, pass, fail, byLevel, byGroup,
        newRegs: regsRes.count || 0,
        coursesCount: coursesRes.count || 0,
        resultsCount: resultsRes.count || 0,
        certsCount: certsRes.count || 0,
      });
      setLoading(false);
    })();
  }, []);

  if (loading) return <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 animate-spin" /></div>;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4">
        <Card icon={Users} label="إجمالي الطلاب" value={stats.total} gradient="bg-gradient-to-br from-[#0B1F4D] to-[#1e3a8a]" hint={`+${stats.newToday} اليوم`} />
        <Card icon={ClipboardList} label="طلبات جديدة" value={stats.newRegs} gradient="bg-gradient-to-br from-[#EF4444] to-[#dc2626]" />
        <Card icon={GraduationCap} label="الدورات" value={stats.coursesCount} gradient="bg-gradient-to-br from-amber-500 to-orange-600" />
        <Card icon={FileSpreadsheet} label="النتائج" value={stats.resultsCount} gradient="bg-gradient-to-br from-blue-500 to-cyan-600" />
        <Card icon={Award} label="الشهادات" value={stats.certsCount} gradient="bg-gradient-to-br from-emerald-500 to-green-600" />
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
        <Card icon={UserCheck} label="الطلاب النشطون" value={stats.active} gradient="bg-gradient-to-br from-green-500 to-emerald-600" />
        <Card icon={Clock} label="بانتظار التأكيد" value={stats.awaitConf} gradient="bg-gradient-to-br from-orange-500 to-amber-600" />
        <Card icon={TrendingUp} label="إجمالي الإيرادات" value={`${stats.revenue.toLocaleString()} MRU`} gradient="bg-gradient-to-br from-emerald-600 to-teal-700" />
        <Card icon={XCircle} label="الراسبون" value={stats.fail} gradient="bg-gradient-to-br from-rose-500 to-red-600" />
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-card border border-border rounded-2xl p-6">
          <h3 className="font-bold mb-4">الطلاب حسب المستوى</h3>
          {Object.keys(stats.byLevel).length === 0 ? <p className="text-sm text-muted-foreground">لا توجد بيانات</p> :
            Object.entries(stats.byLevel).map(([k, v]: any) => (
              <div key={k} className="flex justify-between items-center py-2 border-b border-border last:border-0">
                <span className="font-medium">{k}</span><span className="text-primary font-bold">{v}</span>
              </div>
            ))}
        </div>
        <div className="bg-card border border-border rounded-2xl p-6">
          <h3 className="font-bold mb-4">الطلاب حسب القسم</h3>
          {Object.keys(stats.byGroup).length === 0 ? <p className="text-sm text-muted-foreground">لا توجد بيانات</p> :
            Object.entries(stats.byGroup).map(([k, v]: any) => (
              <div key={k} className="flex justify-between items-center py-2 border-b border-border last:border-0">
                <span className="font-medium">{k}</span><span className="text-primary font-bold">{v}</span>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
};

export default StatsDashboard;