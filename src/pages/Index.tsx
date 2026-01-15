import { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import About from "@/components/About";
import Courses from "@/components/Courses";
import WhyUs from "@/components/WhyUs";
import Gallery from "@/components/Gallery";
import Testimonials from "@/components/Testimonials";
import Footer from "@/components/Footer";
import WhatsAppButton from "@/components/WhatsAppButton";
import Announcements from "@/components/Announcements";
import AdminPanel from "@/components/AdminPanel";

const Index = () => {
  const [adminPanelOpen, setAdminPanelOpen] = useState(false);

  // Listen for admin panel open event from navbar
  useEffect(() => {
    const handleOpenAdminPanel = () => {
      setAdminPanelOpen(true);
    };

    window.addEventListener("openAdminPanel", handleOpenAdminPanel);
    return () => window.removeEventListener("openAdminPanel", handleOpenAdminPanel);
  }, []);

  const handleAdminLogout = () => {
    // Trigger re-check of admin status in navbar
    window.dispatchEvent(new Event("adminLogout"));
  };

  return (
    <div className="min-h-screen">
      <Navbar />
      <Announcements />
      <Hero />
      <About />
      <Courses />
      <WhyUs />
      <Gallery />
      <Testimonials />
      <Footer />
      <WhatsAppButton />
      <AdminPanel 
        open={adminPanelOpen} 
        onOpenChange={setAdminPanelOpen}
        onLogout={handleAdminLogout}
      />
    </div>
  );
};

export default Index;
