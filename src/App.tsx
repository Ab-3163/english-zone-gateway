import { lazy, Suspense } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import Index from "./pages/Index";
import Seo from "./components/Seo";

const NotFound = lazy(() => import("./pages/NotFound"));
const AdminLogin = lazy(() => import("./pages/AdminLogin"));
const AdminDashboard = lazy(() => import("./pages/AdminDashboard"));
const Results = lazy(() => import("./pages/Results"));
const Register = lazy(() => import("./pages/Register"));
const StudentRegister = lazy(() => import("./pages/StudentRegister"));
const StudentLogin = lazy(() => import("./pages/StudentLogin"));
const StudentPortal = lazy(() => import("./pages/StudentPortal"));
const SeoLanding = lazy(() => import("./pages/SeoLanding"));

const queryClient = new QueryClient();

const HOME_DESC =
  "ÉLITE ZONE مركز تعليم اللغات في نواكشوط: دورات الإنجليزية والفرنسية بأساتذة مؤهلين. Centre de langues à Nouakchott : cours d'anglais et de français.";

const meta: Record<string, { title: string; description: string; noindex?: boolean }> = {
  "/": { title: "ÉLITE ZONE | مركز تعليم اللغات في نواكشوط، موريتانيا", description: HOME_DESC },
  "/results": { title: "نتائج الطلاب | ÉLITE ZONE نواكشوط", description: "اطّلع على نتائج طلاب مركز ÉLITE ZONE لتعليم اللغات في نواكشوط." },
  "/register": { title: "التسجيل في دورات اللغات | ÉLITE ZONE نواكشوط", description: "سجّل الآن في دورات الإنجليزية والفرنسية لدى ÉLITE ZONE في نواكشوط، موريتانيا." },
  "/student-login": { title: "دخول الطالب | ÉLITE ZONE", description: "بوابة الطالب في مركز ÉLITE ZONE.", noindex: true },
  "/student-portal": { title: "بوابة الطالب | ÉLITE ZONE", description: "بوابة الطالب في مركز ÉLITE ZONE.", noindex: true },
  "/student-register": { title: "تسجيل طالب | ÉLITE ZONE", description: "تسجيل طالب في ÉLITE ZONE.", noindex: true },
  "/admin": { title: "ÉLITE ZONE", description: "Admin", noindex: true },
  "/admin/dashboard": { title: "ÉLITE ZONE", description: "Admin", noindex: true },
};

const RouteSeo = () => {
  const { pathname } = useLocation();
  const m = meta[pathname];
  if (!m) return null;
  return <Seo title={m.title} description={m.description} path={pathname} noindex={m.noindex} />;
};

const App = () => (
  <HelmetProvider>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <RouteSeo />
          <Suspense fallback={<div className="min-h-screen" />}>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/results" element={<Results />} />
              <Route path="/register" element={<Register />} />
              <Route path="/student-register" element={<StudentRegister />} />
              <Route path="/student-login" element={<StudentLogin />} />
              <Route path="/student-portal" element={<StudentPortal />} />
              <Route path="/english-courses-nouakchott" element={<SeoLanding page="english" />} />
              <Route path="/french-courses-nouakchott" element={<SeoLanding page="french" />} />
              <Route path="/language-school-nouakchott" element={<SeoLanding page="school" />} />
              <Route path="/admin" element={<AdminLogin />} />
              <Route path="/admin/dashboard" element={<AdminDashboard />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  </HelmetProvider>
);

export default App;
