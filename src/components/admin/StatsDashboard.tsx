import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Users, UserCheck, Clock, DollarSign, Award, XCircle, Loader2 } from "lucide-react";

const Card = ({ icon: Icon, label, value, color }: any) => (
  <div className="bg-card border border-border rounded-2xl p-5 shadow-sm">
    <div className="flex items-center gap-3 mb-2">
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${color}`}><Icon className="w-5 h-5 text-white" /></div>
      <span className="text-sm text-muted-foreground">{label}</span>
    </div>
    <p className="text-3xl font-bold">{value}</p>
  </div>
);

const StatsDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    (async () => {
      const { data } = await supabase.from("students").select("status,payment_status,paid_amount,pass_status,level,group_name,created_at");
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
      setStats({ total: rows.length, active, newToday, pendingPay, awaitConf, revenue, pass, fail, byLevel, byGroup });
      setLoading(false);
    })();
  }, []);

  if (loading) return <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 animate-spin" /></div>;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card icon={Users} label="إجمالي الطلاب" value={stats.total} color="bg-blue-500" />
        <Card icon={UserCheck} label="الطلاب النشطون" value={stats.active} color="bg-green-500" />
        <Card icon={Clock} label="طلبات اليوم" value={stats.newToday} color="bg-amber-500" />
        <Card icon={Clock} label="بانتظار التأكيد" value={stats.awaitConf} color="bg-orange-500" />
        <Card icon={DollarSign} label="مدفوعات معلقة" value={stats.pendingPay} color="bg-red-500" />
        <Card icon={DollarSign} label="إجمالي الإيرادات" value={`${stats.revenue.toLocaleString()} MRU`} color="bg-emerald-600" />
        <Card icon={Award} label="الناجحون" value={stats.pass} color="bg-green-600" />
        <Card icon={XCircle} label="الراسبون" value={stats.fail} color="bg-rose-600" />
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