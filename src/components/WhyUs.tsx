import { Users, BookOpen, Trophy, Building2, Star } from "lucide-react";
import AnimatedSection from "./AnimatedSection";

const reasons = [
  {
    icon: Users,
    title: "أساتذة مؤهلون",
    description: "فريق من المدرسين ذوي الخبرة والكفاءة العالية في تدريس اللغات",
    color: "from-blue-500 to-blue-600",
  },
  {
    icon: BookOpen,
    title: "مناهج حديثة",
    description: "نستخدم أحدث المناهج والتقنيات التعليمية المعتمدة دولياً",
    color: "from-green-500 to-green-600",
  },
  {
    icon: Trophy,
    title: "نتائج مضمونة",
    description: "سجل حافل بالنجاحات مع مئات الطلاب المتخرجين بمستوى ممتاز",
    color: "from-yellow-500 to-orange-500",
  },
  {
    icon: Building2,
    title: "بيئة تعليمية ممتازة",
    description: "فصول دراسية مجهزة بأحدث الوسائل التعليمية المتطورة",
    color: "from-purple-500 to-purple-600",
  },
];

const WhyUs = () => {
  return (
    <section id="why-us" className="section-padding bg-gradient-to-b from-secondary to-background relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ef4444' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }} />
      </div>

      <div className="container mx-auto relative z-10">
        {/* Section Header */}
        <AnimatedSection className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full mb-4">
            <Star className="w-4 h-4 text-primary fill-primary" />
            <span className="text-primary font-semibold">مميزاتنا</span>
          </div>
          <h2 className="text-3xl md:text-5xl font-bold text-foreground mb-6">
            لماذا تختار <span className="text-gradient">ÉLITE ZONE</span>؟
          </h2>
          <p className="text-muted-foreground text-lg">
            نلتزم بتقديم أعلى معايير الجودة في التعليم
          </p>
        </AnimatedSection>

        {/* Reasons Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {reasons.map((reason, index) => (
            <AnimatedSection
              key={index}
              delay={index * 100}
              animation="fade-in-up"
            >
              <div className="bg-card border border-border rounded-3xl p-8 text-center card-hover group relative overflow-hidden h-full">
                {/* Gradient overlay on hover */}
                <div className={`absolute inset-0 bg-gradient-to-br ${reason.color} opacity-0 group-hover:opacity-5 transition-opacity duration-500`} />
                
                <div className="w-20 h-20 bg-gradient-to-br from-primary/10 to-primary/5 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-all duration-500 relative">
                  <reason.icon className="w-10 h-10 text-primary transition-all duration-500" />
                  <div className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${reason.color} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
                  <reason.icon className="w-10 h-10 text-white absolute opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                </div>
                <h3 className="text-xl font-bold text-foreground mb-4 group-hover:text-primary transition-colors duration-300">{reason.title}</h3>
                <p className="text-muted-foreground leading-relaxed">{reason.description}</p>
              </div>
            </AnimatedSection>
          ))}
        </div>

        {/* Call to Action */}
        <AnimatedSection delay={500} className="text-center mt-16">
          <div className="bg-gradient-to-r from-primary/10 via-transparent to-primary/10 rounded-3xl p-12 relative overflow-hidden">
            <div className="absolute inset-0 shimmer-bg" />
            <p className="text-xl md:text-2xl text-foreground mb-6 relative z-10">
              انضم إلى آلاف الطلاب الذين حققوا أحلامهم معنا
            </p>
            <a 
              href="https://wa.me/+22220454530?text=%D9%85%D8%B1%D8%AD%D8%A8%D8%A7%D9%8B%D8%8C%20%D8%A3%D8%B1%D9%8A%D8%AF%20%D8%A7%D9%84%D8%AA%D8%B3%D8%AC%D9%8A%D9%84%20%D9%81%D9%8A%20%C3%89LITE%20ZONE"
              target="_blank"
              rel="noopener noreferrer"
              className="btn-primary text-lg relative z-10 inline-flex items-center gap-2"
            >
              ابدأ الآن
              <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
              </svg>
            </a>
          </div>
        </AnimatedSection>
      </div>
    </section>
  );
};

export default WhyUs;
