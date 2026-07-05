import heroBg from "@/assets/hero-bg.jpg";
import logo from "@/assets/logo.jpeg";
import ParticlesBackground from "./ParticlesBackground";
import CountUpNumber from "./CountUpNumber";
import { ChevronDown, Sparkles, Award, GraduationCap, Users, BookOpen, ArrowDown } from "lucide-react";
import { useTranslation } from "react-i18next";

const Hero = () => {
  const { t } = useTranslation();
  return (
    <section id="home" className="relative min-h-[100svh] flex items-center justify-center overflow-hidden">
      {/* Background Image */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat scale-110 blur-[2px]"
        style={{ backgroundImage: `url(${heroBg})` }}
      />

      {/* Overlay */}
      <div className="absolute inset-0 hero-overlay" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(0,0,0,0.35)_0%,rgba(0,0,0,0.7)_100%)]" />

      {/* Particles */}
      <ParticlesBackground />

      {/* Animated gradient orbs */}
      <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-primary/25 rounded-full blur-3xl animate-pulse-glow" />
      <div className="absolute bottom-1/4 left-1/4 w-72 h-72 bg-primary/15 rounded-full blur-3xl animate-pulse-glow" style={{ animationDelay: "1s" }} />

      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 text-center pt-24 pb-10">
        <div className="max-w-4xl mx-auto">
          {/* Logo */}
          <div className="mb-6 sm:mb-8 animate-fade-in-up" style={{ animationDelay: "0.1s", animationFillMode: "both" }}>
            <div className="relative inline-block">
              <img
                src={logo}
                alt="ÉLITE ZONE"
                className="h-24 sm:h-32 md:h-44 lg:h-52 w-auto mx-auto rounded-2xl shadow-2xl ring-2 ring-white/30"
              />
              <div className="absolute -inset-2 bg-gradient-to-r from-primary to-primary/50 rounded-3xl blur-2xl opacity-50 -z-10" />
            </div>
          </div>

          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-white/10 backdrop-blur-md rounded-full border border-white/25 mb-4 animate-fade-in">
            <Sparkles className="w-3.5 h-3.5 text-primary" />
            <span className="text-white text-xs sm:text-sm font-medium">{t("hero.badge")}</span>
          </div>

          {/* Title */}
          <h1 className="text-[2.15rem] leading-[1.15] sm:text-5xl md:text-6xl lg:text-7xl font-black text-white mb-4 sm:mb-5 tracking-tight animate-fade-in-up drop-shadow-[0_2px_8px_rgba(0,0,0,0.5)]" style={{ animationDelay: "0.3s", animationFillMode: "both" }}>
            {t("hero.welcome")}
            <br className="sm:hidden" />
            <span className="inline-block mt-1 sm:mt-0 sm:mr-3 bg-gradient-to-r from-primary via-white to-primary bg-clip-text text-transparent bg-[length:200%_auto]">
              ÉLITE ZONE
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-lg sm:text-2xl md:text-3xl text-white font-bold mb-6 sm:mb-7 text-shadow-hero animate-fade-in-up" style={{ animationDelay: "0.5s", animationFillMode: "both" }}>
            {t("hero.subtitle")}
          </p>

          {/* Description — shorter */}
          <p className="text-sm sm:text-base md:text-lg text-white/90 max-w-xl mx-auto mb-9 sm:mb-10 leading-relaxed text-shadow-hero animate-fade-in-up" style={{ animationDelay: "0.7s", animationFillMode: "both" }}>
            {t("hero.description")}
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center animate-fade-in-up" style={{ animationDelay: "0.9s", animationFillMode: "both" }}>
            <a
              href="/register"
              className="btn-primary text-base sm:text-lg group shadow-2xl shadow-primary/40"
            >
              <span className="relative z-10 flex items-center justify-center gap-2">
                <GraduationCap className="w-5 h-5" />
                {t("hero.cta")}
              </span>
            </a>
            <a
              href="#about"
              className="group border-2 border-white/70 text-white px-8 py-3 rounded-lg font-semibold transition-all duration-300 hover:bg-white/10 hover:border-white backdrop-blur-sm bg-white/5"
            >
              <span className="relative z-10">{t("hero.secondaryCta")}</span>
            </a>
          </div>

          {/* Explore courses arrow */}
          <a
            href="#courses"
            className="mt-8 inline-flex flex-col items-center gap-1.5 text-white/80 hover:text-primary transition-colors animate-fade-in-up group"
            style={{ animationDelay: "1.1s", animationFillMode: "both" }}
          >
            <span className="text-sm font-medium">{t("hero.exploreCourses", "استكشف الدورات")}</span>
            <ArrowDown className="w-5 h-5 animate-bounce-subtle group-hover:translate-y-0.5 transition-transform" />
          </a>
          
          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-6 max-w-4xl mx-auto mt-10 md:mt-14 animate-fade-in-up" style={{ animationDelay: "1.3s", animationFillMode: "both" }}>
            {[
              { icon: Users, end: 500, suffix: "+", label: t("hero.stats.students") },
              { icon: BookOpen, end: 12, suffix: "+", label: t("hero.stats.courses") },
              { icon: GraduationCap, end: 98, suffix: "%", label: t("hero.stats.success") },
              { icon: Award, end: 450, suffix: "+", label: t("hero.stats.certificates") },
            ].map((stat, i) => {
              const Icon = stat.icon;
              return (
                <div key={i} className="group bg-white/10 hover:bg-white/15 backdrop-blur-xl border border-white/15 rounded-2xl p-3 md:p-5 transition-all duration-300 hover:-translate-y-1 hover:border-primary/40 shadow-lg">
                  <Icon className="w-5 h-5 md:w-7 md:h-7 text-primary mx-auto mb-1.5 group-hover:scale-110 transition-transform" />
                  <CountUpNumber 
                    end={stat.end} 
                    suffix={stat.suffix} 
                    className="text-xl md:text-4xl font-extrabold text-white block"
                  />
                  <div className="text-white/80 text-[11px] md:text-sm mt-1 font-medium">{stat.label}</div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
      
      {/* Scroll indicator */}
      <a href="#about" className="hidden md:flex absolute bottom-6 left-1/2 -translate-x-1/2 animate-bounce-subtle group cursor-pointer">
        <div className="flex flex-col items-center gap-2">
          <span className="text-white/70 text-sm group-hover:text-primary transition-colors">{t("hero.scroll")}</span>
          <ChevronDown className="w-6 h-6 text-white/70 group-hover:text-primary transition-colors" />
        </div>
      </a>
    </section>
  );
};

export default Hero;
