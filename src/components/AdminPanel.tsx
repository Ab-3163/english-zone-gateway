import { useState, useEffect } from "react";
import { 
  LayoutDashboard, 
  Megaphone, 
  GraduationCap, 
  Image, 
  Settings, 
  LogOut,
  X,
  Loader2,
  Shield,
  Mail,
  Lock,
  ArrowRight
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { checkAdminSession, signOut, verifyOtp } from "@/lib/adminAuth";
import { toast } from "@/hooks/use-toast";
import logo from "@/assets/logo.jpeg";
import AnnouncementsManager from "@/components/admin/AnnouncementsManager";
import CoursesManager from "@/components/admin/CoursesManager";
import MediaManager from "@/components/admin/MediaManager";
import SettingsManager from "@/components/admin/SettingsManager";

type Tab = "announcements" | "courses" | "media" | "settings";

interface AdminPanelProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onLogout: () => void;
}

const AdminPanel = ({ open, onOpenChange, onLogout }: AdminPanelProps) => {
  const [activeTab, setActiveTab] = useState<Tab>("announcements");
  const [loading, setLoading] = useState(true);
  const [isValid, setIsValid] = useState(false);
  
  // Login form state
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [loginLoading, setLoginLoading] = useState(false);

  useEffect(() => {
    if (open) {
      const checkSession = async () => {
        setLoading(true);
        const { valid } = await checkAdminSession();
        setIsValid(valid);
        setLoading(false);
      };
      checkSession();
    }
  }, [open]);

  const handleLogout = async () => {
    await signOut();
    localStorage.setItem("isAdminUser", "false");
    toast({
      title: "تم تسجيل الخروج",
      description: "تم تسجيل الخروج بنجاح",
    });
    onLogout();
    onOpenChange(false);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !/^\d{4,6}$/.test(code)) {
      toast({
        title: "خطأ",
        description: "أدخل البريد ورمز الدخول",
        variant: "destructive",
      });
      return;
    }

    setLoginLoading(true);
    const result = await verifyOtp(code, email);
    setLoginLoading(false);

    if (result.success) {
      toast({
        title: "تم التحقق",
        description: "مرحباً بك في لوحة التحكم",
      });
      setIsValid(true);
      localStorage.setItem("isAdminUser", "true");
      setEmail("");
      setCode("");
    } else {
      toast({
        title: "خطأ",
        description: result.error || "رمز الدخول غير صحيح",
        variant: "destructive",
      });
    }
  };

  const tabs = [
    { id: "announcements" as Tab, label: "الإعلانات", icon: Megaphone },
    { id: "courses" as Tab, label: "الدورات", icon: GraduationCap },
    { id: "media" as Tab, label: "الوسائط", icon: Image },
    { id: "settings" as Tab, label: "الإعدادات", icon: Settings },
  ];

  const renderLoginForm = () => (
    <div className="flex flex-col items-center justify-center h-full p-6">
      {/* Logo */}
      <img src={logo} alt="ÉLITE ZONE" className="h-16 w-auto rounded-xl shadow-lg mb-4" />
      
      <div className="w-full max-w-sm bg-card rounded-xl border border-border p-6">
        <form onSubmit={handleLogin} className="space-y-4">
            <div className="text-center mb-4">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
                <Shield className="w-6 h-6 text-primary" />
              </div>
              <h2 className="text-lg font-semibold">تسجيل دخول الأدمن</h2>
              <p className="text-muted-foreground text-sm mt-1">أدخل البريد ورمز الدخول</p>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">البريد الإلكتروني</label>
              <div className="relative">
                <Mail className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  type="email"
                  placeholder="admin@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pr-10 text-left"
                  dir="ltr"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">رمز الدخول</label>
              <div className="relative">
                <Lock className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  type="password"
                  inputMode="numeric"
                  maxLength={6}
                  value={code}
                  onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
                  className="pr-10 text-center tracking-widest"
                  dir="ltr"
                  required
                />
              </div>
            </div>

            <Button type="submit" className="w-full" disabled={loginLoading}>
              {loginLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  دخول
                  <ArrowRight className="w-4 h-4 mr-2" />
                </>
              )}
            </Button>
        </form>
      </div>

      <Button
        variant="ghost"
        className="mt-4"
        onClick={() => onOpenChange(false)}
      >
        إغلاق
      </Button>
    </div>
  );

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent 
        side="right" 
        className="w-full sm:max-w-[900px] p-0 overflow-hidden"
        dir="rtl"
      >
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : !isValid ? (
          renderLoginForm()
        ) : (
          <div className="flex flex-col h-full">
            {/* Header */}
            <div className="bg-card border-b border-border px-4 py-3 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <img src={logo} alt="ÉLITE ZONE" className="h-10 w-auto rounded-lg" />
                <div>
                  <h1 className="font-bold text-foreground flex items-center gap-2">
                    <LayoutDashboard className="w-5 h-5 text-primary" />
                    لوحة التحكم
                  </h1>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onOpenChange(false)}
              >
                <X className="w-5 h-5" />
              </Button>
            </div>

            {/* Tabs */}
            <div className="bg-card border-b border-border px-4 py-2 flex gap-2 overflow-x-auto">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`
                      flex items-center gap-2 px-4 py-2 rounded-lg whitespace-nowrap
                      transition-all duration-200
                      ${activeTab === tab.id 
                        ? "bg-primary text-primary-foreground" 
                        : "text-foreground/70 hover:bg-muted hover:text-foreground"
                      }
                    `}
                  >
                    <Icon className="w-4 h-4" />
                    <span className="text-sm font-medium">{tab.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Content */}
            <div className="flex-1 p-4 overflow-auto bg-background">
              {activeTab === "announcements" && <AnnouncementsManager />}
              {activeTab === "courses" && <CoursesManager />}
              {activeTab === "media" && <MediaManager />}
              {activeTab === "settings" && <SettingsManager />}
            </div>

            {/* Footer */}
            <div className="bg-card border-t border-border p-4">
              <Button
                variant="destructive"
                className="w-full"
                onClick={handleLogout}
              >
                <LogOut className="w-5 h-5 ml-2" />
                تسجيل الخروج
              </Button>
            </div>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
};

export default AdminPanel;
