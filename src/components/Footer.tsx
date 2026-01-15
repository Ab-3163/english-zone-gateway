import { MapPin, Phone, Clock, Heart, ArrowUp } from "lucide-react";
import logo from "@/assets/logo.jpeg";
import { useState, useEffect } from "react";

const Footer = () => {
  const [showScrollTop, setShowScrollTop] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 500);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <footer className="bg-gradient-to-b from-foreground to-foreground/95 text-background relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-primary/5 rounded-full blur-3xl" />
      
      {/* Main Footer */}
      <div className="section-padding pb-8 relative z-10">
        <div className="container mx-auto">
          <div className="grid md:grid-cols-3 gap-12 mb-12">
            {/* About */}
            <div>
              <div className="inline-block mb-6">
                <img 
                  src={logo} 
                  alt="ÉLITE ZONE" 
                  className="h-20 w-auto rounded-xl shadow-lg hover:scale-105 transition-transform duration-300" 
                />
              </div>
              <p className="text-background/80 leading-relaxed mb-6">
                مركز متخصص في تعليم اللغات الأجنبية في موريتانيا. نساعدك على إتقان اللغة الإنجليزية والفرنسية بأساليب حديثة وفعّالة.
              </p>
              {/* Social proof */}
              <div className="flex items-center gap-2 text-background/60">
                <Heart className="w-4 h-4 text-primary fill-primary" />
                <span>+500 طالب يثقون بنا</span>
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                <div className="w-1 h-6 bg-primary rounded-full" />
                روابط سريعة
              </h3>
              <ul className="space-y-3">
                {[
                  { href: "#home", label: "الرئيسية" },
                  { href: "#about", label: "من نحن" },
                  { href: "#courses", label: "الدورات" },
                  { href: "#why-us", label: "لماذا نحن" },
                  { href: "#gallery", label: "المعرض" },
                  { href: "#testimonials", label: "آراء الطلاب" },
                ].map((link) => (
                  <li key={link.href}>
                    <a 
                      href={link.href} 
                      className="text-background/80 hover:text-primary transition-colors duration-300 flex items-center gap-2 group"
                    >
                      <span className="w-0 h-0.5 bg-primary group-hover:w-4 transition-all duration-300" />
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Contact Info */}
            <div>
              <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                <div className="w-1 h-6 bg-primary rounded-full" />
                تواصل معنا
              </h3>
              <ul className="space-y-4">
                <li className="group">
                  <a 
                    href="https://maps.app.goo.gl/GVxX5ModjnFMthbB7" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-start gap-3 hover:translate-x-1 transition-transform duration-300"
                  >
                    <div className="w-10 h-10 bg-primary/20 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:bg-primary transition-colors duration-300">
                      <MapPin className="w-5 h-5 text-primary group-hover:text-primary-foreground transition-colors duration-300" />
                    </div>
                    <span className="text-background/80 group-hover:text-primary transition-colors duration-300">
                      لكصر، قرب مجمع الصين - نواكشوط، موريتانيا
                    </span>
                  </a>
                </li>
                <li className="group">
                  <a 
                    href="tel:+22220454530" 
                    className="flex items-center gap-3 hover:translate-x-1 transition-transform duration-300"
                  >
                    <div className="w-10 h-10 bg-primary/20 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:bg-primary transition-colors duration-300">
                      <Phone className="w-5 h-5 text-primary group-hover:text-primary-foreground transition-colors duration-300" />
                    </div>
                    <span className="text-background/80 group-hover:text-primary transition-colors duration-300" dir="ltr">+222 20 45 45 30</span>
                  </a>
                </li>
                <li className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary/20 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Clock className="w-5 h-5 text-primary" />
                  </div>
                  <span className="text-background/80">السبت - الخميس: 8:00 ص - 8:00 م</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-background/10 py-6 relative z-10">
        <div className="container mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-background/60 text-center md:text-right">
            © {new Date().getFullYear()} ÉLITE ZONE. جميع الحقوق محفوظة.
          </p>
          <div className="flex items-center gap-2 text-background/60">
            <span>صُنع بـ</span>
            <Heart className="w-4 h-4 text-primary fill-primary animate-pulse" />
            <span>في موريتانيا</span>
          </div>
        </div>
      </div>

      {/* Scroll to top button */}
      {showScrollTop && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-24 left-6 z-40 w-12 h-12 bg-primary rounded-full flex items-center justify-center shadow-lg hover:shadow-xl hover:scale-110 transition-all duration-300 animate-fade-in"
          aria-label="العودة للأعلى"
        >
          <ArrowUp className="w-5 h-5 text-primary-foreground" />
        </button>
      )}
    </footer>
  );
};

export default Footer;
