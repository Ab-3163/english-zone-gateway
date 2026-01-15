import { useState, useEffect } from "react";
import { BookOpen, Clock, Users, CheckCircle2, Sparkles, ArrowLeft, Loader2 } from "lucide-react";
import AnimatedSection from "./AnimatedSection";
import { supabase } from "@/integrations/supabase/client";

// Flag components as SVG for better compatibility
const USFlag = () => (
  <svg viewBox="0 0 190 100" className="w-20 h-12 rounded shadow-lg">
    <rect width="190" height="100" fill="#bf0a30"/>
    <rect y="7.69" width="190" height="7.69" fill="#fff"/>
    <rect y="23.07" width="190" height="7.69" fill="#fff"/>
    <rect y="38.45" width="190" height="7.69" fill="#fff"/>
    <rect y="53.83" width="190" height="7.69" fill="#fff"/>
    <rect y="69.21" width="190" height="7.69" fill="#fff"/>
    <rect y="84.59" width="190" height="7.69" fill="#fff"/>
    <rect width="76" height="53.83" fill="#002868"/>
    <g fill="#fff">
      {[0, 1, 2, 3, 4, 5, 6, 7, 8].map((row) => 
        [...Array(row % 2 === 0 ? 6 : 5)].map((_, col) => (
          <circle key={`${row}-${col}`} cx={row % 2 === 0 ? 6.3 + col * 12.7 : 12.7 + col * 12.7} cy={4.5 + row * 5.4} r="2"/>
        ))
      )}
    </g>
  </svg>
);

const FranceFlag = () => (
  <svg viewBox="0 0 150 100" className="w-20 h-12 rounded shadow-lg">
    <rect width="50" height="100" fill="#002395"/>
    <rect x="50" width="50" height="100" fill="#fff"/>
    <rect x="100" width="50" height="100" fill="#ed2939"/>
  </svg>
);

// Default courses (fallback)
const defaultCourses = [
  {
    id: "english",
    title: "دورة اللغة الإنجليزية",
    subtitle: "English Language Course",
    icon: <USFlag />,
    color: "from-blue-500 to-blue-600",
    levels: ["مبتدئ", "متوسط", "متقدم"],
    features: [
      "تعلم القراءة والكتابة",
      "مهارات المحادثة",
      "قواعد اللغة الأساسية",
      "تمارين استماع تفاعلية",
    ],
  },
  {
    id: "french",
    title: "دورة اللغة الفرنسية",
    subtitle: "Cours de Français",
    icon: <FranceFlag />,
    color: "from-red-500 to-red-600",
    levels: ["مبتدئ", "متوسط", "متقدم"],
    features: [
      "أساسيات اللغة الفرنسية",
      "النطق الصحيح",
      "المحادثة اليومية",
      "الكتابة والتعبير",
    ],
  },
];

interface DatabaseCourse {
  id: string;
  title: string;
  description: string;
  price: number;
  features: string[];
  language?: string;
}

const languageFlags: Record<string, JSX.Element> = {
  english: <USFlag />,
  french: <FranceFlag />,
  arabic: (
    <svg viewBox="0 0 150 100" className="w-20 h-12 rounded shadow-lg">
      <rect width="150" height="100" fill="#006c35"/>
      <text x="75" y="60" fill="white" fontSize="20" textAnchor="middle" fontFamily="Arial">لا إله إلا الله</text>
    </svg>
  ),
  spanish: (
    <svg viewBox="0 0 150 100" className="w-20 h-12 rounded shadow-lg">
      <rect width="150" height="25" fill="#aa151b"/>
      <rect y="25" width="150" height="50" fill="#f1bf00"/>
      <rect y="75" width="150" height="25" fill="#aa151b"/>
    </svg>
  ),
  german: (
    <svg viewBox="0 0 150 100" className="w-20 h-12 rounded shadow-lg">
      <rect width="150" height="33.33" fill="#000"/>
      <rect y="33.33" width="150" height="33.33" fill="#dd0000"/>
      <rect y="66.66" width="150" height="33.34" fill="#ffcc00"/>
    </svg>
  ),
};

const languageColors: Record<string, string> = {
  english: "from-blue-500 to-blue-600",
  french: "from-red-500 to-red-600",
  arabic: "from-green-600 to-green-700",
  spanish: "from-yellow-500 to-red-500",
  german: "from-gray-800 to-red-600",
};

const Courses = () => {
  const [dbCourses, setDbCourses] = useState<DatabaseCourse[]>([]);
  const [defaultPrice, setDefaultPrice] = useState<number>(1700);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      // Fetch published courses from database
      const { data: coursesData } = await supabase
        .from("courses")
        .select("id, title, description, price, features, language")
        .eq("published", true)
        .order("created_at", { ascending: false });

      if (coursesData) {
        setDbCourses(coursesData);
      }

      // Fetch default price setting
      const { data: priceData } = await supabase
        .from("settings")
        .select("value")
        .eq("key", "default_course_price")
        .maybeSingle();

      if (priceData && priceData.value) {
        setDefaultPrice(parseFloat(priceData.value));
      }

      setLoading(false);
    };

    fetchData();
  }, []);

  // Combine database courses and default courses
  const allCourses = [
    // Database courses first
    ...dbCourses.map((course) => ({
      ...course,
      subtitle: "",
      icon: languageFlags[course.language || "english"] || <USFlag />,
      color: languageColors[course.language || "english"] || "from-blue-500 to-blue-600",
      levels: ["مبتدئ", "متوسط", "متقدم"],
    })),
    // Then default courses if no DB courses exist
    ...(dbCourses.length === 0 ? defaultCourses : []),
  ];

  const displayCourses = allCourses;

  const displayPrice = dbCourses.length > 0 && dbCourses[0]?.price 
    ? dbCourses[0].price 
    : defaultPrice;

  return (
    <section id="courses" className="section-padding bg-background relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />
      
      <div className="container mx-auto relative z-10">
        {/* Section Header */}
        <AnimatedSection className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full mb-4">
            <Sparkles className="w-4 h-4 text-primary" />
            <span className="text-primary font-semibold">دوراتنا</span>
          </div>
          <h2 className="text-3xl md:text-5xl font-bold text-foreground mb-6">
            اختر الدورة <span className="text-gradient">المناسبة</span> لك
          </h2>
          <p className="text-muted-foreground text-lg">
            نقدم دورات متخصصة في اللغة الإنجليزية والفرنسية لجميع المستويات
          </p>
        </AnimatedSection>

        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : (
          <>
            {/* Courses Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto mb-12 px-4">
              {displayCourses.map((course, index) => (
                <AnimatedSection
                  key={course.id}
                  delay={index * 200}
                  animation={index === 0 ? "slide-in-right" : "slide-in-left"}
                  className="h-full w-full"
                >
                  <div className="bg-card border border-border rounded-3xl overflow-hidden shadow-xl card-hover group relative h-full flex flex-col">
                    {/* Course Header */}
                    <div className={`relative bg-gradient-to-l ${course.color} p-8 overflow-hidden`}>
                      <div className="absolute inset-0 bg-black/10" />
                      <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
                      <div className="relative z-10 flex flex-col items-center text-center">
                        <div className="mb-4 group-hover:scale-110 transition-transform duration-500">{course.icon}</div>
                        <h3 className="text-2xl font-bold text-white mb-1">{course.title}</h3>
                        {course.subtitle && <p className="text-white/80">{course.subtitle}</p>}
                      </div>
                    </div>

                    {/* Course Content */}
                    <div className="p-8 flex-1 flex flex-col">
                      {/* Levels */}
                      <div className="flex gap-2 mb-6 flex-wrap">
                        {course.levels.map((level, i) => (
                          <span
                            key={i}
                            className="bg-secondary text-secondary-foreground px-4 py-1.5 rounded-full text-sm font-medium hover:bg-primary hover:text-primary-foreground transition-colors duration-300 cursor-default"
                          >
                            {level}
                          </span>
                        ))}
                      </div>

                      {/* Features */}
                      <ul className="space-y-3 mb-8 flex-1">
                        {(course.features || []).slice(0, 4).map((feature, i) => (
                          <li key={i} className="flex items-center gap-3 text-foreground group/item">
                            <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 group-hover/item:bg-primary group-hover/item:scale-110 transition-all duration-300">
                              <CheckCircle2 className="w-4 h-4 text-primary group-hover/item:text-primary-foreground transition-colors duration-300" />
                            </div>
                            <span className="group-hover/item:text-primary transition-colors duration-300">{feature}</span>
                          </li>
                        ))}
                      </ul>

                      {/* Info */}
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs text-muted-foreground mb-6 pb-6 border-b border-border">
                        <div className="flex items-center justify-center gap-1">
                          <Clock className="w-3 h-3 text-primary flex-shrink-0" />
                          <span>تكوين سنة</span>
                        </div>
                        <div className="flex items-center justify-center gap-1">
                          <Clock className="w-3 h-3 text-primary flex-shrink-0" />
                          <span>مدة الدورة 45 يوم</span>
                        </div>
                        <div className="flex items-center justify-center gap-1">
                          <Users className="w-3 h-3 text-primary flex-shrink-0" />
                          <span>جميع الأعمار</span>
                        </div>
                        <div className="flex items-center justify-center gap-1">
                          <BookOpen className="w-3 h-3 text-primary flex-shrink-0" />
                          <span>مناهج حديثة</span>
                        </div>
                      </div>

                      {/* CTA */}
                      <a 
                        href="https://wa.me/+22220454530?text=%D9%85%D8%B1%D8%AD%D8%A8%D8%A7%D9%8B%D8%8C%20%D8%A3%D8%B1%D9%8A%D8%AF%20%D8%A7%D9%84%D8%AA%D8%B3%D8%AC%D9%8A%D9%84%20%D9%81%D9%8A%20%C3%89LITE%20ZONE"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn-primary w-full text-center flex items-center justify-center gap-2 group/btn"
                      >
                        سجّل الآن
                        <ArrowLeft className="w-4 h-4 group-hover/btn:-translate-x-1 transition-transform duration-300" />
                      </a>
                    </div>

                    {/* Decorative corner */}
                    <div className="absolute bottom-0 left-0 w-20 h-20 bg-gradient-to-br from-primary/5 to-transparent rounded-tr-full" />
                  </div>
                </AnimatedSection>
              ))}
            </div>

            {/* Price Box */}
            <AnimatedSection delay={400}>
              <div className="bg-gradient-to-l from-primary to-primary/80 rounded-3xl p-8 md:p-12 text-center max-w-3xl mx-auto relative overflow-hidden shadow-2xl">
                {/* Decorative elements */}
                <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
                <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/10 rounded-full translate-y-1/2 -translate-x-1/2" />
                <div className="absolute inset-0 shimmer-bg opacity-30" />
                
                <div className="relative z-10">
                  <span className="inline-block px-4 py-1 bg-white/20 rounded-full text-white/90 text-sm font-medium mb-4">
                    عرض خاص
                  </span>
                  <h3 className="text-2xl md:text-3xl font-bold text-white mb-4">
                    رسوم الدورة الواحدة
                  </h3>
                  <div className="flex items-center justify-center gap-2 mb-4">
                    <span className="text-5xl md:text-7xl font-bold text-white animate-pulse-glow">{displayPrice}</span>
                    <span className="text-2xl text-white/90">MRU</span>
                  </div>
                  <p className="text-white/80 text-lg mb-8">
                    أوقية جديدة فقط — شاملة جميع المواد التعليمية
                  </p>
                  <a 
                    href="https://wa.me/+22220454530?text=%D9%85%D8%B1%D8%AD%D8%A8%D8%A7%D9%8B%D8%8C%20%D8%A3%D8%B1%D9%8A%D8%AF%20%D8%A7%D9%84%D8%AA%D8%B3%D8%AC%D9%8A%D9%84%20%D9%81%D9%8A%20%C3%89LITE%20ZONE"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 bg-white text-primary px-10 py-4 rounded-xl font-bold text-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 hover:scale-105"
                  >
                    ابدأ رحلتك التعليمية
                    <ArrowLeft className="w-5 h-5" />
                  </a>
                </div>
              </div>
            </AnimatedSection>
          </>
        )}
      </div>
    </section>
  );
};

export default Courses;
