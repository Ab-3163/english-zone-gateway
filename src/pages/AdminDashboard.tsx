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
  Home,
  Award,
  Bell
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
import CertificatesManager from "@/components/admin/CertificatesManager";
import { supabase } from "@/integrations/supabase/client";

type Tab = "stats" | "students" | "announcements" | "courses" | "media" | "results" | "registrations" | "certificates" | "settings";

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState<Tab>("stats");
  const [sidebarOpen, setSidebarOpen] = useState(() => typeof window !== "undefined" && window.innerWidth >= 768);
  const [loading, setLoading] = useState(true);
  const [counters, setCounters] = useState({ pending: 0, students: 0, courses: 0, results: 0, certificates: 0 });
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
    const loadCounters = async () => {
      const [pending, students, courses, results, certificates] = await Promise.all([
        supabase.from("registrations").select("id", { count: "exact", head: true }).eq("status", "new"),
        supabase.from("students").select("id", { count: "exact", head: true }),
        supabase.from("courses").select("id", { count: "exact", head: true }),
        supabase.from("student_results").select("id", { count: "exact", head: true }),
        supabase.from("certificates" as any).select("id", { count: "exact", head: true }),
      ]);
      setCounters({
        pending: pending.count || 0,
        students: students.count || 0,
        courses: courses.count || 0,
        results: results.count || 0,
        certificates: certificates.count || 0,
      });
    };
    loadCounters();
    const interval = setInterval(loadCounters, 20000);
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
    { id: "students" as Tab, label: "الطلاب", icon: Users, badge: counters.students },
    { id: "registrations" as Tab, label: "الطلبات الجديدة", icon: ClipboardList, badge: counters.pending, accent: true },
    { id: "announcements" as Tab, label: "الإعلانات", icon: Megaphone },
    { id: "courses" as Tab, label: "الدورات", icon: GraduationCap, badge: counters.courses },
    { id: "media" as Tab, label: "الوسائط", icon: Image },
    { id: "results" as Tab, label: "النتائج", icon: FileSpreadsheet, badge: counters.results },
    { id: "certificates" as Tab, label: "الشهادات", icon: Award, badge: counters.certificates },
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
    <div className="min-h-screen bg-[#F3F4F6] dark:bg-background flex" dir="rtl">
      {/* Sidebar */}
      <aside className={`
        fixed md:static inset-y-0 right-0 z-50
        ${sidebarOpen ? "translate-x-0" : "translate-x-full md:translate-x-0"}
        w-72 md:w-64 bg-[#0B1F4D] text-white border-l border-white/5 shadow-xl
        transition-transform duration-300
        flex flex-col
      `}>
        {/* Logo */}
        <div className="p-4 md:p-5 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-3 min-w-0">
            <img src={logo} alt="ÉLITE ZONE" className="h-9 w-9 rounded-lg object-cover shrink-0 ring-2 ring-white/10" />
            <div>
              <h1 className="font-bold text-white text-sm md:text-base tracking-wide">ÉLITE ZONE</h1>
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
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            const badge = (tab as any).badge;
            const accent = (tab as any).accent;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id);
                  setSidebarOpen(false);
                }}
                className={`
                  w-full flex items-center justify-between gap-3 px-3.5 py-2.5 rounded-xl
                  transition-all duration-200
                  ${isActive
                    ? "bg-[#EF4444] text-white shadow-lg shadow-red-500/20"
                    : "text-white/75 hover:bg-white/10 hover:text-white"
                  }
                `}
              >
                <div className="flex items-center gap-3">
                  <Icon className="w-5 h-5" />
                  <span className="font-medium text-sm">{tab.label}</span>
                </div>
                {badge > 0 && (
                  <span className={`text-xs font-bold rounded-full min-w-[22px] h-[22px] flex items-center justify-center px-1.5 ${
                    accent ? "bg-[#EF4444] text-white ring-2 ring-red-300/30 animate-pulse"
                           : isActive ? "bg-white/20 text-white" : "bg-white/10 text-white/80"
                  }`}>
                    {badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Logout */}
        <div className="p-3 border-t border-white/10">
          <Button
            variant="ghost"
            className="w-full justify-start gap-3 text-white/80 hover:text-white bg-white/5 hover:bg-[#EF4444]/90 rounded-xl"
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
        <header className="bg-white border-b border-border px-3 md:px-6 py-3 flex items-center justify-between gap-2 sticky top-0 z-30 shadow-sm">
          <div className="flex items-center gap-2 min-w-0 flex-1">
            <button
              className="md:hidden p-2 rounded-lg hover:bg-muted shrink-0 text-[#0B1F4D]"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              aria-label="القائمة"
            >
              <Menu className="w-6 h-6" />
            </button>
            <div className="flex items-center gap-2 min-w-0">
              <div className="w-9 h-9 rounded-xl bg-[#0B1F4D] flex items-center justify-center shrink-0">
                <LayoutDashboard className="w-4.5 h-4.5 text-white" />
              </div>
              <h2 className="text-base md:text-lg font-bold text-[#0B1F4D] truncate">
                {tabs.find(t => t.id === activeTab)?.label}
              </h2>
            </div>
          </div>
          <div className="flex items-center gap-1.5 shrink-0">
            <button
              onClick={() => setActiveTab("registrations")}
              className="relative p-2 rounded-lg hover:bg-muted transition text-[#0B1F4D]"
              aria-label="الإشعارات"
            >
              <Bell className="w-5 h-5" />
              {counters.pending > 0 && (
                <span className="absolute top-1 left-1 min-w-[16px] h-4 bg-[#EF4444] text-white text-[10px] font-bold rounded-full flex items-center justify-center px-1">
                  {counters.pending}
                </span>
              )}
            </button>
            <a
              href="/"
              target="_blank"
              className="hidden sm:inline-block text-xs font-medium text-[#0B1F4D] hover:text-[#EF4444] transition px-3 py-1.5 rounded-lg border border-border hover:border-[#EF4444]/30"
            >
              عرض الموقع ←
            </a>
          </div>
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
          {activeTab === "certificates" && <CertificatesManager />}
          {activeTab === "settings" && <SettingsManager />}
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;
