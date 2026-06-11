import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Lock, Shield, ArrowRight, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "@/hooks/use-toast";
import { verifyOtp, checkAdminSession } from "@/lib/adminAuth";
import logo from "@/assets/logo.jpeg";

const AdminLogin = () => {
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [checkingSession, setCheckingSession] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const checkSession = async () => {
      const { valid } = await checkAdminSession();
      if (valid) navigate("/admin/dashboard");
      setCheckingSession(false);
    };
    checkSession();
  }, [navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!/^\d{4,6}$/.test(code)) {
      toast({ title: "خطأ", description: "أدخل رمز الدخول", variant: "destructive" });
      return;
    }
    setLoading(true);
    const result = await verifyOtp(code);
    setLoading(false);
    if (result.success) {
      toast({ title: "تم التحقق", description: "مرحباً بك في لوحة التحكم" });
      navigate("/admin/dashboard");
    } else {
      toast({ title: "خطأ", description: result.error || "رمز غير صحيح", variant: "destructive" });
    }
  };

  if (checkingSession) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <img src={logo} alt="ÉLITE ZONE" className="h-20 w-auto mx-auto rounded-2xl shadow-lg mb-4" />
          <h1 className="text-2xl font-bold text-foreground">لوحة تحكم الأدمن</h1>
          <p className="text-muted-foreground mt-2">ÉLITE ZONE</p>
        </div>

        <div className="bg-card rounded-2xl shadow-2xl border border-border p-8">
          <form onSubmit={handleLogin} className="space-y-6">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="w-8 h-8 text-primary" />
              </div>
              <h2 className="text-xl font-semibold">تسجيل دخول الأدمن</h2>
              <p className="text-muted-foreground text-sm mt-2">أدخل رمز الدخول</p>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">رمز الدخول</label>
              <div className="relative">
                <Lock className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input type="password" inputMode="numeric" maxLength={6} value={code} onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))} className="pr-10 text-center tracking-widest" dir="ltr" required />
              </div>
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : (<>دخول<ArrowRight className="w-5 h-5 mr-2" /></>)}
            </Button>
          </form>
        </div>

        <p className="text-center text-muted-foreground text-sm mt-6">
          جلسة تسجيل الدخول صالحة لمدة 30 يوماً
        </p>
      </div>
    </div>
  );
};

export default AdminLogin;
