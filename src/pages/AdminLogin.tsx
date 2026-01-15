import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Mail, Lock, Shield, ArrowRight, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { toast } from "@/hooks/use-toast";
import { sendOtp, verifyOtp, checkAdminSession } from "@/lib/adminAuth";
import logo from "@/assets/logo.jpeg";

type Step = "email" | "otp";

const AdminLogin = () => {
  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [checkingSession, setCheckingSession] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // Check if already logged in with valid session
    const checkSession = async () => {
      const { valid } = await checkAdminSession();
      if (valid) {
        navigate("/admin/dashboard");
      }
      setCheckingSession(false);
    };
    checkSession();
  }, [navigate]);

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Email validation now done server-side against user_roles table

    setLoading(true);
    const result = await sendOtp(email);
    setLoading(false);

    if (result.success) {
      setStep("otp");
      toast({
        title: "تم الإرسال",
        description: "تم إرسال رمز التحقق إلى بريدك الإلكتروني",
      });
    } else {
      toast({
        title: "خطأ",
        description: result.error || "فشل في إرسال رمز التحقق",
        variant: "destructive",
      });
    }
  };

  const handleVerifyOtp = async () => {
    if (otp.length !== 6) {
      toast({
        title: "خطأ",
        description: "يرجى إدخال الرمز المكون من 6 أرقام",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    const result = await verifyOtp(email, otp);
    setLoading(false);

    if (result.success) {
      toast({
        title: "تم التحقق",
        description: "مرحباً بك في لوحة التحكم",
      });
      navigate("/admin/dashboard");
    } else {
      toast({
        title: "خطأ",
        description: result.error || "رمز التحقق غير صحيح",
        variant: "destructive",
      });
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
        {/* Logo */}
        <div className="text-center mb-8">
          <img src={logo} alt="ÉLITE ZONE" className="h-20 w-auto mx-auto rounded-2xl shadow-lg mb-4" />
          <h1 className="text-2xl font-bold text-foreground">لوحة تحكم الأدمن</h1>
          <p className="text-muted-foreground mt-2">ÉLITE ZONE</p>
        </div>

        {/* Card */}
        <div className="bg-card rounded-2xl shadow-2xl border border-border p-8">
          {step === "email" ? (
            <form onSubmit={handleSendOtp} className="space-y-6">
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Shield className="w-8 h-8 text-primary" />
                </div>
                <h2 className="text-xl font-semibold">تسجيل الدخول</h2>
                <p className="text-muted-foreground text-sm mt-2">أدخل بريدك الإلكتروني للمتابعة</p>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">البريد الإلكتروني</label>
                <div className="relative">
                  <Mail className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input
                    type="email"
                    placeholder="أدخل بريدك الإلكتروني"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pr-10 text-left"
                    dir="ltr"
                    required
                  />
                </div>
              </div>

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    إرسال رمز التحقق
                    <ArrowRight className="w-5 h-5 mr-2" />
                  </>
                )}
              </Button>
            </form>
          ) : (
            <div className="space-y-6">
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Lock className="w-8 h-8 text-primary" />
                </div>
                <h2 className="text-xl font-semibold">رمز التحقق</h2>
                <p className="text-muted-foreground text-sm mt-2">
                  أدخل الرمز المرسل إلى <span className="text-primary font-medium" dir="ltr">{email}</span>
                </p>
              </div>

              <div className="flex justify-center" dir="ltr">
                <InputOTP value={otp} onChange={setOtp} maxLength={6}>
                  <InputOTPGroup>
                    <InputOTPSlot index={0} />
                    <InputOTPSlot index={1} />
                    <InputOTPSlot index={2} />
                    <InputOTPSlot index={3} />
                    <InputOTPSlot index={4} />
                    <InputOTPSlot index={5} />
                  </InputOTPGroup>
                </InputOTP>
              </div>

              <Button onClick={handleVerifyOtp} className="w-full" disabled={loading || otp.length !== 6}>
                {loading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    تأكيد الدخول
                    <ArrowRight className="w-5 h-5 mr-2" />
                  </>
                )}
              </Button>

              <button
                type="button"
                onClick={() => {
                  setStep("email");
                  setOtp("");
                }}
                className="w-full text-center text-sm text-muted-foreground hover:text-primary transition-colors"
              >
                العودة لإدخال البريد الإلكتروني
              </button>

              <button
                type="button"
                onClick={() => handleSendOtp({ preventDefault: () => {} } as React.FormEvent)}
                className="w-full text-center text-sm text-primary hover:underline"
                disabled={loading}
              >
                إعادة إرسال الرمز
              </button>
            </div>
          )}
        </div>

        <p className="text-center text-muted-foreground text-sm mt-6">
          جلسة تسجيل الدخول صالحة لمدة 30 يوماً
        </p>
      </div>
    </div>
  );
};

export default AdminLogin;
