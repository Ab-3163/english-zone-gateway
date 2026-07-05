import { useState, useEffect } from "react";
import { Menu, X, Shield } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import logo from "@/assets/logo.jpeg";
import { supabase } from "@/integrations/supabase/client";
import { checkAdminSession } from "@/lib/adminAuth";
import LanguageSwitcher from "./LanguageSwitcher";

const Navbar = () => {
  const { t } = useTranslation();
  const navLinks = [
    { href: "#home", label: t("nav.home") },
    { href: "#about", label: t("nav.about") },
    { href: "#courses", label: t("nav.courses") },
    { href: "#why-us", label: t("nav.whyUs") },
    { href: "#gallery", label: t("nav.gallery") },
    { href: "#testimonials", label: t("nav.testimonials") },
    { href: "/results", label: t("nav.results") },
    { href: "/student-login", label: t("nav.studentPortal") },
    { href: "#location", label: t("nav.location") },
  ];
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState("home");
  const [logoClickCount, setLogoClickCount] = useState(0);
  const [showAdminButton, setShowAdminButton] = useState(false);
  const [isAdmin, setIsAdmin] = useState(() => {
    // Check localStorage for cached admin status
    return localStorage.getItem("isAdminUser") === "true";
  });
  const navigate = useNavigate();
  const location = useLocation();

  // Check if user is admin using the adminAuth module
  useEffect(() => {
    const checkStatus = async () => {
      const { valid } = await checkAdminSession();
      setIsAdmin(valid);
      localStorage.setItem("isAdminUser", valid ? "true" : "false");
    };

    // Initial check
    checkStatus();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === "SIGNED_OUT") {
        setIsAdmin(false);
        localStorage.setItem("isAdminUser", "false");
      } else {
        checkStatus();
      }
    });

    // Listen for admin logout event
    const handleAdminLogout = () => {
      setIsAdmin(false);
      setShowAdminButton(false);
    };
    window.addEventListener("adminLogout", handleAdminLogout);

    return () => {
      subscription.unsubscribe();
      window.removeEventListener("adminLogout", handleAdminLogout);
    };
  }, []);

  const openAdminPanel = () => {
    // If on home page, dispatch event to open panel
    if (location.pathname === "/") {
      window.dispatchEvent(new Event("openAdminPanel"));
    } else {
      // Navigate to home first, then open panel
      navigate("/");
      setTimeout(() => {
        window.dispatchEvent(new Event("openAdminPanel"));
      }, 100);
    }
  };

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
      
      // Update active section based on scroll position
      const sections = navLinks.map(link => link.href.replace("#", ""));
      for (const section of sections.reverse()) {
        const element = document.getElementById(section);
        if (element) {
          const rect = element.getBoundingClientRect();
          if (rect.top <= 100) {
            setActiveSection(section);
            break;
          }
        }
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav className={`fixed top-0 right-0 left-0 z-50 transition-all duration-500 ${
      isScrolled 
        ? "bg-background/90 backdrop-blur-xl border-b border-border/60 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.08)]" 
        : "bg-transparent"
    }`}>
      <div className="container mx-auto px-4">
        <div className={`flex items-center justify-between transition-all duration-300 ${isScrolled ? "h-16" : "h-20"}`}>
          {/* Logo with hidden admin trigger */}
          <div className="flex items-center gap-3">
            <button 
              onClick={() => {
                const newCount = logoClickCount + 1;
                setLogoClickCount(newCount);
                if (newCount >= 5) {
                  setShowAdminButton(true);
                  setLogoClickCount(0);
                }
              }}
              className="flex items-center gap-3 group"
            >
              <div className="relative">
                <img 
                  src={logo} 
                  alt="ÉLITE ZONE" 
                  className={`w-auto rounded-lg transition-all duration-300 group-hover:scale-105 ${
                    isScrolled ? "h-11" : "h-14 shadow-lg"
                  } ${location.pathname === "/" && !isScrolled ? "opacity-0 pointer-events-none" : ""}`}
                />
              <div className="absolute -inset-1 bg-primary/20 rounded-lg blur opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10" />
            </div>
          </button>
          
          {/* Admin button - shows when logged in as admin OR after secret click */}
          {(isAdmin || showAdminButton) && (
            <button
              onClick={openAdminPanel}
              className="flex items-center gap-2 px-3 py-2 bg-primary/10 rounded-lg text-primary text-sm font-medium hover:bg-primary/20 transition-colors animate-fade-in"
            >
              <Shield className="w-4 h-4" />
              {t("nav.adminPanel")}
            </button>
          )}
        </div>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-1">
          {navLinks.map((link) => {
            const isRoute = link.href.startsWith("/");
            const hrefFinal = (!isRoute && location.pathname !== "/") ? `/${link.href}` : link.href;
            return (
              <a
                key={link.href}
                href={hrefFinal}
                className={`relative px-4 py-2 rounded-lg font-medium transition-all duration-300 ${
                  !isRoute && activeSection === link.href.replace("#", "")
                    ? "text-primary"
                    : isScrolled 
                      ? "text-foreground/80 hover:text-primary" 
                      : "text-white/90 hover:text-white"
                }`}
              >
                {link.label}
                {!isRoute && activeSection === link.href.replace("#", "") && (
                  <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1/2 h-0.5 bg-primary rounded-full" />
                )}
              </a>
            );
          })}
          <LanguageSwitcher variant={isScrolled ? "dark" : "light"} className="ml-2" />
          <a 
            href="/register"
            className="btn-primary mr-4"
          >
            {t("nav.register")}
          </a>
        </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center gap-2">
            <LanguageSwitcher variant={isScrolled ? "dark" : "light"} />
            <button
              className={`p-2 rounded-lg transition-colors ${
                isScrolled ? "text-foreground" : "text-white"
              }`}
              onClick={() => setIsOpen(!isOpen)}
              aria-label={t("nav.toggleMenu")}
            >
              {isOpen ? <X size={28} /> : <Menu size={28} />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div className="md:hidden py-4 border-t border-border/50 animate-fade-in-down bg-background/95 backdrop-blur-lg rounded-b-2xl">
            <div className="flex flex-col gap-2">
              {navLinks.map((link) => {
                const isRoute = link.href.startsWith("/");
                const hrefFinal = (!isRoute && location.pathname !== "/") ? `/${link.href}` : link.href;
                return (
                  <a
                    key={link.href}
                    href={hrefFinal}
                    className={`px-4 py-3 rounded-lg font-medium transition-all duration-300 ${
                      !isRoute && activeSection === link.href.replace("#", "")
                        ? "bg-primary/10 text-primary"
                        : "text-foreground/80 hover:bg-muted hover:text-primary"
                    }`}
                    onClick={() => setIsOpen(false)}
                  >
                    {link.label}
                  </a>
                );
              })}
              {/* Admin button in mobile menu */}
              {(isAdmin || showAdminButton) && (
                <button
                  onClick={() => {
                    openAdminPanel();
                    setIsOpen(false);
                  }}
                  className="flex items-center justify-center gap-2 px-4 py-3 bg-primary/10 rounded-lg text-primary font-medium hover:bg-primary/20 transition-colors"
                >
                  <Shield className="w-4 h-4" />
                  {t("nav.adminPanel")}
                </button>
              )}
              <a 
                href="/register"
                className="btn-primary text-center mt-2" 
                onClick={() => setIsOpen(false)}
              >
                {t("nav.register")}
              </a>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
