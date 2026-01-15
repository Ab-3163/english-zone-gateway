import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { 
  LayoutDashboard, 
  Megaphone, 
  GraduationCap, 
  Image, 
  Video, 
  Settings, 
  LogOut,
  Menu,
  X,
  Loader2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { checkAdminSession, signOut } from "@/lib/adminAuth";
import { toast } from "@/hooks/use-toast";
import logo from "@/assets/logo.jpeg";
import AnnouncementsManager from "@/components/admin/AnnouncementsManager";
import CoursesManager from "@/components/admin/CoursesManager";
import MediaManager from "@/components/admin/MediaManager";
import SettingsManager from "@/components/admin/SettingsManager";

type Tab = "announcements" | "courses" | "media" | "settings";

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState<Tab>("announcements");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const checkSession = async () => {
      const { valid, requireOtp } = await checkAdminSession();
      if (!valid) {
        if (requireOtp) {
          navigate("/admin");
        } else {
          navigate("/");
        }
      }
      setLoading(false);
    };
    checkSession();
  }, [navigate]);

  const handleLogout = async () => {
    await signOut();
    toast({
      title: "تم تسجيل الخروج",
      description: "تم تسجيل الخروج بنجاح",
    });
    navigate("/");
  };

  const tabs = [
    { id: "announcements" as Tab, label: "الإعلانات", icon: Megaphone },
    { id: "courses" as Tab, label: "الدورات", icon: GraduationCap },
    { id: "media" as Tab, label: "الوسائط", icon: Image },
    { id: "settings" as Tab, label: "الإعدادات", icon: Settings },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex" dir="rtl">
      {/* Sidebar */}
      <aside className={`
        fixed md:static inset-y-0 right-0 z-50
        ${sidebarOpen ? "translate-x-0" : "translate-x-full md:translate-x-0"}
        w-64 bg-card border-l border-border
        transition-transform duration-300
        flex flex-col
      `}>
        {/* Logo */}
        <div className="p-6 border-b border-border">
          <div className="flex items-center gap-3">
            <img src={logo} alt="ÉLITE ZONE" className="h-12 w-auto rounded-lg" />
            <div>
              <h1 className="font-bold text-foreground">ÉLITE ZONE</h1>
              <p className="text-xs text-muted-foreground">لوحة التحكم</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id);
                  setSidebarOpen(false);
                }}
                className={`
                  w-full flex items-center gap-3 px-4 py-3 rounded-xl
                  transition-all duration-200
                  ${activeTab === tab.id 
                    ? "bg-primary text-primary-foreground shadow-lg" 
                    : "text-foreground/70 hover:bg-muted hover:text-foreground"
                  }
                `}
              >
                <Icon className="w-5 h-5" />
                <span className="font-medium">{tab.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Logout */}
        <div className="p-4 border-t border-border">
          <Button
            variant="ghost"
            className="w-full justify-start gap-3 text-destructive hover:text-destructive hover:bg-destructive/10"
            onClick={handleLogout}
          >
            <LogOut className="w-5 h-5" />
            تسجيل الخروج
          </Button>
        </div>
      </aside>

      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-h-screen">
        {/* Header */}
        <header className="bg-card border-b border-border px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              className="md:hidden p-2 rounded-lg hover:bg-muted"
              onClick={() => setSidebarOpen(!sidebarOpen)}
            >
              {sidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
            <div className="flex items-center gap-2">
              <LayoutDashboard className="w-6 h-6 text-primary" />
              <h2 className="text-xl font-bold text-foreground">
                {tabs.find(t => t.id === activeTab)?.label}
              </h2>
            </div>
          </div>
          <a 
            href="/" 
            target="_blank" 
            className="text-sm text-muted-foreground hover:text-primary transition-colors"
          >
            عرض الموقع ←
          </a>
        </header>

        {/* Content */}
        <div className="flex-1 p-6 overflow-auto">
          {activeTab === "announcements" && <AnnouncementsManager />}
          {activeTab === "courses" && <CoursesManager />}
          {activeTab === "media" && <MediaManager />}
          {activeTab === "settings" && <SettingsManager />}
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;
