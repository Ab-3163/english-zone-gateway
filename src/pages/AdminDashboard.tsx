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
  Loader2,
  ClipboardList,
  FileSpreadsheet,
  Users,
  BarChart3,
  Home,
  CreditCard,
  CalendarCheck,
  Layers,
  Award,
  FileText
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { checkAdminSession, signOut } from "@/lib/adminAuth";
import { toast } from "@/hooks/use-toast";
import logo from "@/assets/logo.jpeg";
import AnnouncementsManager from "@/components/admin/AnnouncementsManager";
import CoursesManager from "@/components/admin/CoursesManager";
import MediaManager from "@/components/admin/MediaManager";
import SettingsManager from "@/components/admin/SettingsManager";
import ResultsManager from "@/components/admin/ResultsManager";
import RegistrationsManager from "@/components/admin/RegistrationsManager";
import StudentsManager from "@/components/admin/StudentsManager";
import StatsDashboard from "@/components/admin/StatsDashboard";
import { supabase } from "@/integrations/supabase/client";

type Tab = "stats" | "students" | "announcements" | "courses" | "media" | "results" | "registrations" | "settings";

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState<Tab>("stats");
  const [sidebarOpen, setSidebarOpen] = useState(() => typeof window !== "undefined" && window.innerWidth >= 768);
  const [loading, setLoading] = useState(true);
  const [pendingCount, setPendingCount] = useState(0);
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

  useEffect(() => {
    const loadPending = async () => {
      const { count } = await supabase.from("students").select("id", { count: "exact", head: true })
        .eq("status", "awaiting_confirmation");
      setPendingCount(count || 0);
    };
    loadPending();
    const interval = setInterval(loadPending, 15000);
    return () => clearInterval(interval);
  }, [activeTab]);

  const handleLogout = async () => {
    await signOut();
    toast({
      title: "تم تسجيل الخروج",
      description: "تم تسجيل الخروج بنجاح",
    });
    navigate("/");
  };

  const tabs = [
    { id: "stats" as Tab, label: "الرئيسية", icon: Home },
    { id: "students" as Tab, label: "الطلاب", icon: Users },
    { id: "registrations" as Tab, label: "الطلبات الجديدة", icon: ClipboardList, badge: pendingCount },
    { id: "announcements" as Tab, label: "الإعلانات", icon: Megaphone },
    { id: "courses" as Tab, label: "الدورات", icon: GraduationCap },
    { id: "media" as Tab, label: "الوسائط", icon: Image },
    { id: "results" as Tab, label: "النتائج", icon: FileSpreadsheet },
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
    <div className="min-h-screen bg-slate-100 dark:bg-background flex" dir="rtl">
      {/* Sidebar */}
      <aside className={`
        fixed md:static inset-y-0 right-0 z-50
        ${sidebarOpen ? "translate-x-0" : "translate-x-full md:translate-x-0"}
        w-72 md:w-64 bg-[#0f1e3d] text-white border-l border-[#1e3a6f]
        transition-transform duration-300
        flex flex-col
      `}>
        {/* Logo */}
        <div className="p-4 md:p-6 border-b border-[#1e3a6f] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src={logo} alt="ÉLITE ZONE" className="h-10 md:h-12 w-auto rounded-lg" />
            <div>
              <h1 className="font-bold text-white text-sm md:text-base">ÉLITE ZONE</h1>
              <p className="text-xs text-white/60">لوحة الإدارة</p>
            </div>
          </div>
          <button
            className="md:hidden p-2 rounded-lg hover:bg-white/10 text-white"
            onClick={() => setSidebarOpen(false)}
            aria-label="إغلاق"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id);
                  setSidebarOpen(false);
                }}
                className={`
                  w-full flex items-center justify-between gap-3 px-4 py-2.5 rounded-lg
                  transition-all duration-200
                  ${isActive
                    ? "bg-primary text-white shadow-lg"
                    : "text-white/70 hover:bg-white/5 hover:text-white"
                  }
                `}
              >
                <div className="flex items-center gap-3">
                  <Icon className="w-5 h-5" />
                  <span className="font-medium text-sm">{tab.label}</span>
                </div>
                {(tab as any).badge > 0 && (
                  <span className="bg-primary text-white text-xs font-bold rounded-full min-w-[22px] h-[22px] flex items-center justify-center px-1.5">
                    {(tab as any).badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Logout */}
        <div className="p-4 border-t border-[#1e3a6f]">
          <Button
            variant="ghost"
            className="w-full justify-start gap-3 text-red-300 hover:text-red-200 hover:bg-red-500/10"
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
      <main className="flex-1 flex flex-col min-h-screen min-w-0">
        {/* Header */}
        <header className="bg-[#0f1e3d] text-white border-b border-[#1e3a6f] px-3 md:px-6 py-3 md:py-4 flex items-center justify-between gap-2 sticky top-0 z-30">
          <div className="flex items-center gap-2 md:gap-4 min-w-0">
            <button
              className="md:hidden p-2 rounded-lg hover:bg-white/10 shrink-0"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              aria-label="القائمة"
            >
              {sidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
            <div className="flex items-center gap-2 min-w-0">
              <LayoutDashboard className="w-5 h-5 md:w-6 md:h-6 text-primary shrink-0" />
              <h2 className="text-base md:text-xl font-bold text-white truncate">
                <span className="hidden sm:inline">لوحة الإدارة – </span>
                {tabs.find(t => t.id === activeTab)?.label}
              </h2>
            </div>
          </div>
          <a 
            href="/" 
            target="_blank" 
            className="text-xs md:text-sm text-white/70 hover:text-white transition-colors whitespace-nowrap shrink-0"
          >
            <span className="hidden sm:inline">عرض الموقع ←</span>
            <span className="sm:hidden">الموقع ←</span>
          </a>
        </header>

        {/* Content */}
        <div className="flex-1 p-3 sm:p-4 md:p-6 overflow-auto">
          {activeTab === "stats" && <StatsDashboard />}
          {activeTab === "students" && <StudentsManager />}
          {activeTab === "announcements" && <AnnouncementsManager />}
          {activeTab === "courses" && <CoursesManager />}
          {activeTab === "media" && <MediaManager />}
          {activeTab === "results" && <ResultsManager />}
          {activeTab === "registrations" && <RegistrationsManager />}
          {activeTab === "settings" && <SettingsManager />}
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;
