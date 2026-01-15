import { Quote, Star, MessageSquare } from "lucide-react";
import AnimatedSection from "./AnimatedSection";

const testimonials = [
  {
    name: "محمد أحمد",
    role: "طالب اللغة الإنجليزية",
    content: "بفضل ÉLITE ZONE تمكنت من إتقان اللغة الإنجليزية خلال 6 أشهر فقط. الأساتذة ممتازون والمنهج عملي جداً.",
    rating: 5,
    avatar: "م",
  },
  {
    name: "فاطمة محمود",
    role: "طالبة اللغة الفرنسية",
    content: "تجربة رائعة! استفدت كثيراً من دورة اللغة الفرنسية وأصبحت قادرة على التحدث بطلاقة. شكراً ÉLITE ZONE.",
    rating: 5,
    avatar: "ف",
  },
  {
    name: "عبد الله سيدي",
    role: "طالب الدورتين",
    content: "أنصح الجميع بالتسجيل في ÉLITE ZONE. بيئة تعليمية ممتازة وأسعار مناسبة جداً مقارنة بالجودة المقدمة.",
    rating: 5,
    avatar: "ع",
  },
  {
    name: "آمنة بنت أحمد",
    role: "طالبة اللغة الإنجليزية",
    content: "كنت أخاف من تعلم اللغات لكن الأساتذة هنا جعلوا الأمر سهلاً وممتعاً. الآن أستطيع التواصل بثقة!",
    rating: 5,
    avatar: "آ",
  },
];

const Testimonials = () => {
  return (
    <section id="testimonials" className="section-padding bg-gradient-to-b from-background to-secondary relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute top-20 right-10 w-64 h-64 bg-primary/5 rounded-full blur-3xl" />
      <div className="absolute bottom-20 left-10 w-80 h-80 bg-primary/5 rounded-full blur-3xl" />
      
      <div className="container mx-auto relative z-10">
        {/* Section Header */}
        <AnimatedSection className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full mb-4">
            <MessageSquare className="w-4 h-4 text-primary" />
            <span className="text-primary font-semibold">آراء طلابنا</span>
          </div>
          <h2 className="text-3xl md:text-5xl font-bold text-foreground mb-6">
            ماذا يقول <span className="text-gradient">طلابنا</span>؟
          </h2>
          <p className="text-muted-foreground text-lg">
            نفخر بثقة طلابنا وتجاربهم الإيجابية معنا
          </p>
        </AnimatedSection>

        {/* Testimonials Grid */}
        <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {testimonials.map((testimonial, index) => (
            <AnimatedSection
              key={index}
              delay={index * 150}
              animation={index % 2 === 0 ? "slide-in-right" : "slide-in-left"}
            >
              <div className="bg-card border border-border rounded-3xl p-8 relative card-hover group h-full">
                {/* Quote Icon */}
                <div className="absolute -top-4 right-8">
                  <div className="w-12 h-12 bg-gradient-to-br from-primary to-primary/80 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                    <Quote className="w-6 h-6 text-primary-foreground" />
                  </div>
                </div>

                {/* Decorative gradient */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-primary/5 to-transparent rounded-br-3xl" />

                {/* Content */}
                <p className="text-foreground leading-relaxed text-lg mb-6 mt-4 relative z-10">
                  "{testimonial.content}"
                </p>

                {/* Rating */}
                <div className="flex gap-1 mb-6">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star 
                      key={i} 
                      className="w-5 h-5 text-yellow-500 fill-yellow-500 drop-shadow-sm" 
                      style={{ animationDelay: `${i * 0.1}s` }}
                    />
                  ))}
                </div>

                {/* Author */}
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-gradient-to-br from-primary to-primary/60 rounded-full flex items-center justify-center text-primary-foreground font-bold text-lg shadow-lg group-hover:scale-110 transition-transform duration-300">
                    {testimonial.avatar}
                  </div>
                  <div>
                    <h4 className="font-bold text-foreground text-lg">{testimonial.name}</h4>
                    <p className="text-muted-foreground">{testimonial.role}</p>
                  </div>
                </div>

                {/* Hover effect line */}
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-primary to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-b-3xl" />
              </div>
            </AnimatedSection>
          ))}
        </div>

        {/* Trust indicators */}
        <AnimatedSection delay={600} className="mt-16 text-center">
          <div className="inline-flex items-center gap-4 px-8 py-4 bg-card rounded-2xl border border-border shadow-lg">
            <div className="flex -space-x-3 space-x-reverse">
              {["م", "ف", "ع", "آ"].map((letter, i) => (
                <div
                  key={i}
                  className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center text-white text-sm font-bold border-2 border-background"
                >
                  {letter}
                </div>
              ))}
            </div>
            <div className="text-right">
              <div className="font-bold text-foreground">+500 طالب سعيد</div>
              <div className="text-sm text-muted-foreground">انضموا إلينا هذا العام</div>
            </div>
          </div>
        </AnimatedSection>
      </div>
    </section>
  );
};

export default Testimonials;
