import heroBg from "@/assets/hero-bg.jpg";
import logo from "@/assets/logo.jpeg";
import ParticlesBackground from "./ParticlesBackground";
import CountUpNumber from "./CountUpNumber";
import { ChevronDown, Sparkles, Award, GraduationCap, Users, BookOpen } from "lucide-react";

const Hero = () => {
  return (
    <section id="home" className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background Image */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat scale-105"
        style={{ backgroundImage: `url(${heroBg})` }}
      />
      
      {/* Overlay */}
      <div className="absolute inset-0 hero-overlay" />
      
      {/* Particles */}
      <ParticlesBackground />
      
      {/* Animated gradient orbs */}
      <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-primary/20 rounded-full blur-3xl animate-pulse-glow" />
      <div className="absolute bottom-1/4 left-1/4 w-72 h-72 bg-primary/10 rounded-full blur-3xl animate-pulse-glow" style={{ animationDelay: "1s" }} />
      
      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 text-center pt-20">
        <div className="max-w-4xl mx-auto">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-md rounded-full border border-white/20 mb-8 animate-fade-in">
            <Sparkles className="w-4 h-4 text-primary" />
            <span className="text-white/90 text-sm font-medium">مركز تكوين وتعليم اللغات</span>
          </div>
          
          {/* Logo */}
          <div className="mb-6 md:mb-10 animate-float">
            <div className="relative inline-block">
              <img 
                src={logo} 
                alt="ÉLITE ZONE" 
                className="h-40 sm:h-48 md:h-56 lg:h-64 w-auto mx-auto rounded-3xl shadow-2xl animate-pulse-glow ring-2 ring-white/20"
              />
              <div className="absolute -inset-2 bg-gradient-to-r from-primary to-primary/50 rounded-3xl blur-xl opacity-40 -z-10" />
            </div>
          </div>
          
          {/* Title */}
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-extrabold text-white mb-6 leading-tight tracking-tight animate-fade-in-up" style={{ animationDelay: "0.2s", animationFillMode: "both" }}>
            مرحباً بكم في{" "}
            <span className="text-gradient-animated bg-gradient-to-r from-primary via-white to-primary bg-clip-text text-transparent bg-[length:200%_auto]">
              ÉLITE ZONE
            </span>
          </h1>
          
          {/* Subtitle */}
          <p className="text-xl sm:text-2xl md:text-3xl text-white/95 font-semibold mb-6 animate-fade-in-up" style={{ animationDelay: "0.4s", animationFillMode: "both" }}>
            بوابتك نحو إتقان اللغات العالمية
          </p>
          
          {/* Description */}
          <p className="text-base sm:text-lg md:text-xl text-white/80 max-w-2xl mx-auto mb-10 animate-fade-in-up leading-relaxed" style={{ animationDelay: "0.6s", animationFillMode: "both" }}>
            نقدم لكم أفضل دورات تعليم اللغة الإنجليزية والفرنسية في نواكشوط - موريتانيا
            <br />
            مع أساتذة متخصصين ومناهج حديثة تضمن لكم النجاح
          </p>
          
          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-in-up" style={{ animationDelay: "0.8s", animationFillMode: "both" }}>
            <a 
              href="https://wa.me/+22220454530?text=%D9%85%D8%B1%D8%AD%D8%A8%D8%A7%D9%8B%D8%8C%20%D8%A3%D8%B1%D9%8A%D8%AF%20%D8%A7%D9%84%D8%AA%D8%B3%D8%AC%D9%8A%D9%84%20%D9%81%D9%8A%20%C3%89LITE%20ZONE"
              target="_blank"
              rel="noopener noreferrer"
              className="btn-primary text-lg group"
            >
              <span className="relative z-10 flex items-center justify-center gap-2">
                سجّل الآن
                <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                </svg>
              </span>
            </a>
            <a href="#about" className="group border-2 border-white text-white px-8 py-3 rounded-lg font-semibold transition-all duration-300 hover:bg-white hover:text-foreground relative overflow-hidden">
              <span className="relative z-10">تعرف علينا</span>
              <div className="absolute inset-0 bg-white transform -translate-x-full group-hover:translate-x-0 transition-transform duration-300" />
            </a>
          </div>
          
          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 max-w-4xl mx-auto mt-14 md:mt-16 animate-fade-in-up" style={{ animationDelay: "1s", animationFillMode: "both" }}>
            {[
              { icon: Users, end: 500, suffix: "+", label: "طالب ناجح" },
              { icon: BookOpen, end: 12, suffix: "+", label: "دورة تعليمية" },
              { icon: GraduationCap, end: 98, suffix: "%", label: "نسبة النجاح" },
              { icon: Award, end: 450, suffix: "+", label: "شهادة مُصدَرة" },
            ].map((stat, i) => {
              const Icon = stat.icon;
              return (
                <div key={i} className="group bg-white/5 hover:bg-white/10 backdrop-blur-md border border-white/10 rounded-2xl p-4 md:p-5 transition-all duration-300 hover:-translate-y-1 hover:border-primary/40">
                  <Icon className="w-6 h-6 md:w-7 md:h-7 text-primary mx-auto mb-2 group-hover:scale-110 transition-transform" />
                  <CountUpNumber 
                    end={stat.end} 
                    suffix={stat.suffix} 
                    className="text-2xl md:text-4xl font-extrabold text-white"
                  />
                  <div className="text-white/70 text-xs md:text-sm mt-1 font-medium">{stat.label}</div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
      
      {/* Scroll indicator */}
      <a href="#about" className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce-subtle group cursor-pointer">
        <div className="flex flex-col items-center gap-2">
          <span className="text-white/60 text-sm group-hover:text-primary transition-colors">اكتشف المزيد</span>
          <ChevronDown className="w-6 h-6 text-white/60 group-hover:text-primary transition-colors" />
        </div>
      </a>
    </section>
  );
};

export default Hero;
