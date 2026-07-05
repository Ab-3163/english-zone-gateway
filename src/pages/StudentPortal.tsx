import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Loader2, LogOut, User, GraduationCap, DollarSign, Award, Calendar, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const statusLabel = (s?: string) => ({
  new: "جديد",
  awaiting_payment: "بانتظار الدفع",
  awaiting_confirmation: "بانتظار التأكيد",
  registered: "مسجل رسمياً",
  rejected: "مرفوض",
  suspended: "متوقف",
}[s || ""] || s || "-");

const payLabel = (s?: string) => ({
  pending: "بانتظار الدفع",
  awaiting_confirmation: "بانتظار التأكيد",
  confirmed: "مؤكد",
  partial: "دفع جزئي",
  rejected: "مرفوض",
}[s || ""] || s || "-");

const StudentPortal = () => {
  const [student, setStudent] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const session = sessionStorage.getItem("student_session");
    if (!session) { navigate("/student-login"); return; }
    const { student_id, phone } = JSON.parse(session);
    supabase.rpc("get_student_by_credentials", { _student_id: student_id, _phone: phone })
      .then(({ data, error }) => {
        if (error || !data || (Array.isArray(data) && data.length === 0)) {
          sessionStorage.removeItem("student_session");
          navigate("/student-login");
          return;
        }
        setStudent(Array.isArray(data) ? data[0] : data);
        setLoading(false);
      });
  }, [navigate]);

  const logout = () => {
    sessionStorage.removeItem("student_session");
    toast({ title: "تم تسجيل الخروج" });
    navigate("/");
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;
  }

  const Field = ({ label, value }: { label: string; value: any }) => (
    <div className="flex justify-between items-center py-2 border-b border-border last:border-0">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className="font-medium text-sm">{value ?? "-"}</span>
    </div>
  );

  const Section = ({ icon: Icon, title, children }: any) => (
    <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
      <h3 className="font-bold text-lg mb-4 flex items-center gap-2"><Icon className="w-5 h-5 text-primary" /> {title}</h3>
      {children}
    </div>
  );

  return (
    <div className="min-h-screen bg-background" dir="rtl">
      <Navbar />
      <main className="pt-32 pb-20 section-padding">
        <div className="container mx-auto max-w-4xl">
          <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold mb-1">مرحباً، {student.full_name}</h1>
              <p className="text-muted-foreground" dir="ltr">{student.student_id}</p>
            </div>
            <div className="flex items-center gap-3">
              <Badge variant={student.status === "registered" ? "default" : "secondary"}>
                {statusLabel(student.status)}
              </Badge>
              <Button variant="outline" size="sm" onClick={logout}><LogOut className="w-4 h-4 ml-1" /> خروج</Button>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <Section icon={User} title="البيانات الشخصية">
              <Field label="الاسم" value={student.full_name} />
              <Field label="Student ID" value={<span dir="ltr">{student.student_id}</span>} />
              <Field label="الهاتف" value={<span dir="ltr">{student.phone}</span>} />
              <Field label="البريد" value={student.email || "-"} />
            </Section>

            <Section icon={GraduationCap} title="الدراسة">
              <Field label="اللغة" value={student.language} />
              <Field label="المستوى الحالي" value={student.level} />
              <Field label="مركز الدراسة" value={student.study_center === "ksar" ? "Ksar" : student.study_center === "tensoueilim" ? "تنسويلم" : "-"} />
              <Field label="القسم/المجموعة" value={student.group_name} />
              <Field label="الأستاذ" value={student.teacher} />
              <Field label="أيام الدراسة" value={student.study_days} />
              <Field label="التوقيت" value={student.study_time} />
              <Field label="القاعة" value={student.room} />
            </Section>

            <Section icon={DollarSign} title="المالية">
              <Field label="رسوم الدورة" value={student.course_fee ? `${student.course_fee} MRU` : "-"} />
              <Field label="المدفوع" value={student.paid_amount ? `${student.paid_amount} MRU` : "-"} />
              <Field label="المتبقي" value={student.remaining_amount ? `${student.remaining_amount} MRU` : "-"} />
              <Field label="حالة الدفع" value={<Badge variant={student.payment_status === "confirmed" ? "default" : "secondary"}>{payLabel(student.payment_status)}</Badge>} />
            </Section>

            <Section icon={Award} title="النتائج">
              <Field label="اختبار أول" value={student.first_exam_score} />
              <Field label="اختبار نهائي" value={student.final_exam_score} />
              <Field label="المعدل" value={student.average} />
              <Field label="التقدير" value={student.grade} />
              <Field label="الحالة" value={student.pass_status === "pass" ? "✅ ناجح" : student.pass_status === "fail" ? "❌ راسب" : "-"} />
              <Field label="المستوى القادم" value={student.next_level} />
              <Field label="مؤهل للترقية" value={student.eligible_promotion ? "✅ نعم" : "لا"} />
              {student.admin_note && <p className="mt-3 p-3 bg-muted rounded-lg text-sm">📝 {student.admin_note}</p>}
            </Section>

            <Section icon={Calendar} title="الحضور">
              <Field label="عدد الحصص" value={student.total_sessions} />
              <Field label="الغيابات" value={student.absences} />
              <Field label="نسبة الحضور" value={student.attendance_rate ? `${student.attendance_rate}%` : "-"} />
            </Section>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default StudentPortal;