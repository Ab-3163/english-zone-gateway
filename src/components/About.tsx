import { GraduationCap, Target, Eye, Award, Zap } from "lucide-react";
import AnimatedSection from "./AnimatedSection";

const features = [
  {
    icon: GraduationCap,
    title: "خبرة طويلة",
    description: "أكثر من 10 سنوات في تعليم اللغات مع نتائج مضمونة",
  },
  {
    icon: Target,
    title: "مناهج متطورة",
    description: "نستخدم أحدث الأساليب التعليمية المعتمدة دولياً",
  },
  {
    icon: Award,
    title: "شهادات معتمدة",
    description: "نمنح شهادات إتمام معتمدة لجميع طلابنا",
  },
];

const About = () => {
  return (
    <section id="about" className="section-padding bg-secondary relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] border border-primary/5 rounded-full" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] border border-primary/5 rounded-full" />
      </div>

      <div className="container mx-auto relative z-10">
        {/* Section Header */}
        <AnimatedSection className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full mb-4">
            <Zap className="w-4 h-4 text-primary" />
            <span className="text-primary font-semibold">من نحن</span>
          </div>
          <h2 className="text-3xl md:text-5xl font-bold text-foreground mb-6">
            نبني جسور التواصل مع العالم
          </h2>
          <p className="text-muted-foreground text-lg leading-relaxed">
            ÉLITE ZONE هو مركز متخصص في تعليم اللغة الإنجليزية والفرنسية في قلب نواكشوط - موريتانيا.
            نفخر بتخريج مئات الطلاب الناجحين الذين أصبحوا اليوم قادرين على التواصل بثقة مع العالم.
          </p>
        </AnimatedSection>

        {/* Vision & Mission */}
        <div className="grid md:grid-cols-2 gap-8 mb-16">
          <AnimatedSection delay={100} animation="slide-in-right">
            <div className="bg-card rounded-3xl p-8 shadow-xl card-hover border border-border group relative overflow-hidden h-full">
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -translate-y-1/2 translate-x-1/2" />
              <div className="w-16 h-16 bg-gradient-to-br from-primary to-primary/60 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                <Eye className="w-8 h-8 text-primary-foreground" />
              </div>
              <h3 className="text-2xl font-bold text-foreground mb-4">رؤيتنا</h3>
              <p className="text-muted-foreground leading-relaxed">
                أن نكون المركز الرائد في تعليم اللغات في موريتانيا، ونساهم في بناء جيل قادر على التواصل
                مع مختلف الثقافات والاستفادة من الفرص العالمية.
              </p>
            </div>
          </AnimatedSection>

          <AnimatedSection delay={200} animation="slide-in-left">
            <div className="bg-card rounded-3xl p-8 shadow-xl card-hover border border-border group relative overflow-hidden h-full">
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -translate-y-1/2 translate-x-1/2" />
              <div className="w-16 h-16 bg-gradient-to-br from-primary to-primary/60 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                <Target className="w-8 h-8 text-primary-foreground" />
              </div>
              <h3 className="text-2xl font-bold text-foreground mb-4">رسالتنا</h3>
              <p className="text-muted-foreground leading-relaxed">
                تقديم تعليم لغوي عالي الجودة بأسعار مناسبة، مع التركيز على المهارات العملية
                التي تمكّن طلابنا من استخدام اللغة في حياتهم اليومية والمهنية.
              </p>
            </div>
          </AnimatedSection>
        </div>

        {/* Features */}
        <div className="grid md:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <AnimatedSection 
              key={index}
              delay={300 + index * 100}
              animation="fade-in-up"
            >
              <div className="text-center p-8 rounded-3xl hover:bg-card hover:shadow-2xl transition-all duration-500 group border border-transparent hover:border-border">
                <div className="w-24 h-24 bg-gradient-to-br from-primary/20 to-primary/5 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 group-hover:bg-primary transition-all duration-500 relative">
                  <feature.icon className="w-12 h-12 text-primary group-hover:text-primary-foreground transition-colors duration-500" />
                  <div className="absolute inset-0 rounded-full bg-primary/20 blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                </div>
                <h3 className="text-xl font-bold text-foreground mb-3">{feature.title}</h3>
                <p className="text-muted-foreground leading-relaxed">{feature.description}</p>
              </div>
            </AnimatedSection>
          ))}
        </div>
      </div>
    </section>
  );
};

export default About;
