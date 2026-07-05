import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Loader2, LogIn, IdCard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const StudentLogin = () => {
  const [studentId, setStudentId] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentId.trim() || !phone.trim()) {
      toast({ title: "خطأ", description: "أدخل رقم الطالب ورقم الهاتف", variant: "destructive" });
      return;
    }
    setLoading(true);
    const { data, error } = await supabase.rpc("get_student_by_credentials", {
      _student_id: studentId.trim(),
      _phone: phone.trim(),
    });
    setLoading(false);
    if (error || !data || (Array.isArray(data) && data.length === 0)) {
      toast({ title: "بيانات غير صحيحة", description: "تحقق من رقم الطالب ورقم الهاتف", variant: "destructive" });
      return;
    }
    const student = Array.isArray(data) ? data[0] : data;
    sessionStorage.setItem("student_session", JSON.stringify({
      student_id: student.student_id,
      phone: student.phone,
    }));
    toast({ title: "مرحباً", description: `أهلاً ${student.full_name}` });
    navigate("/student-portal");
  };

  return (
    <div className="min-h-screen bg-background" dir="rtl">
      <Navbar />
      <main className="pt-32 pb-20 section-padding">
        <div className="container mx-auto max-w-md">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 text-primary mb-4">
              <LogIn className="w-8 h-8" />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold mb-2">دخول الطالب</h1>
            <p className="text-muted-foreground">أدخل رقم الطالب ورقم هاتفك</p>
          </div>
          <form onSubmit={handleSubmit} className="bg-card border border-border rounded-2xl p-6 md:p-8 shadow-sm space-y-5">
            <div>
              <label className="text-sm font-medium mb-2 block flex items-center gap-2"><IdCard className="w-4 h-4" /> رقم الطالب (Student ID)</label>
              <Input value={studentId} onChange={(e) => setStudentId(e.target.value)} placeholder="0001" dir="ltr" required />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">رقم الهاتف</label>
              <Input value={phone} onChange={(e) => setPhone(e.target.value)} dir="ltr" required />
            </div>
            <Button type="submit" disabled={loading} className="w-full" size="lg">
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "تسجيل الدخول"}
            </Button>
            <p className="text-xs text-center text-muted-foreground">
              ليس لديك حساب؟ <a href="/student-register" className="text-primary hover:underline">سجّل الآن</a>
            </p>
          </form>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default StudentLogin;