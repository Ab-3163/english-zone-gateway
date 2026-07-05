import { useState, useEffect } from "react";
import { BookOpen, Clock, Users, CheckCircle2, Sparkles, ArrowLeft, Loader2, Award, Calendar, Star, TrendingUp } from "lucide-react";
import AnimatedSection from "./AnimatedSection";
import { supabase } from "@/integrations/supabase/client";
import { useTranslation } from "react-i18next";

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
  const { t } = useTranslation();
  const defaultCourses = [
    {
      id: "english",
      title: t("courses.english"),
      subtitle: t("courses.englishSub"),
      icon: <USFlag />,
      color: "from-blue-500 to-blue-600",
      levels: [t("courses.beginner"), t("courses.intermediate"), t("courses.advanced")],
      features: [
        "Reading & Writing / القراءة والكتابة",
        "Conversation skills / مهارات المحادثة",
        "Grammar essentials / قواعد اللغة",
        "Interactive listening / تمارين استماع",
      ],
    },
    {
      id: "french",
      title: t("courses.french"),
      subtitle: t("courses.frenchSub"),
      icon: <FranceFlag />,
      color: "from-red-500 to-red-600",
      levels: [t("courses.beginner"), t("courses.intermediate"), t("courses.advanced")],
      features: [
        "Fondamentaux / أساسيات",
        "Prononciation / النطق الصحيح",
        "Conversation quotidienne / المحادثة اليومية",
        "Écriture / الكتابة والتعبير",
      ],
    },
  ];
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
      levels: [t("courses.beginner"), t("courses.intermediate"), t("courses.advanced")],
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
            <span className="text-primary font-semibold">{t("courses.badge")}</span>
          </div>
          <h2 className="text-3xl md:text-5xl font-bold text-foreground mb-6">
            {t("courses.title")} <span className="text-gradient">{t("courses.titleHighlight")}</span> {t("courses.titleEnd")}
          </h2>
          <p className="text-muted-foreground text-lg">
            {t("courses.subtitle")}
          </p>
        </AnimatedSection>

        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : (
          <>
            {/* Courses Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-7 max-w-7xl mx-auto mb-12">
              {displayCourses.map((course, index) => (
                <AnimatedSection
                  key={course.id}
                  delay={index * 200}
                  animation={index === 0 ? "slide-in-right" : "slide-in-left"}
                  className="h-full w-full flex justify-center"
                >
                  <div className="w-full max-w-[420px] md:max-w-none bg-card border border-border/60 rounded-3xl overflow-hidden shadow-[0_10px_40px_-15px_rgba(0,0,0,0.15)] hover:shadow-[0_25px_60px_-15px_rgba(239,68,68,0.35)] group relative h-full flex flex-col hover:border-primary/50 hover:-translate-y-2 transition-all duration-500">
                    {/* Course Visual Header */}
                    <div className={`relative bg-gradient-to-br ${course.color} h-[220px] md:h-56 overflow-hidden`}>
                      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.25),transparent_60%)]" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
                      <div className="absolute -top-10 -right-10 w-48 h-48 bg-white/10 rounded-full blur-2xl" />
                      <div className="absolute -bottom-16 -left-10 w-56 h-56 bg-white/10 rounded-full blur-2xl" />

                      {/* Top badges */}
                      <div className="absolute top-4 right-4 left-4 flex items-start justify-between z-10">
                        <div className="flex items-center gap-1.5 bg-white/95 backdrop-blur-md text-foreground px-2.5 py-1.5 rounded-full text-xs font-bold shadow-lg">
                          <Award className="w-3.5 h-3.5 text-primary" />
                          {t("courses.certified")}
                        </div>
                        <div className="flex items-center gap-1 bg-black/40 backdrop-blur-md text-white px-2.5 py-1.5 rounded-full text-xs font-bold">
                          <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                          4.9
                        </div>
                      </div>

                      {/* Flag/Icon centered */}
                      <div className="absolute inset-0 flex items-center justify-center z-0">
                        <div className="group-hover:scale-110 transition-transform duration-700 [&_svg]:w-36 [&_svg]:h-24 md:[&_svg]:w-40 md:[&_svg]:h-28 [&_svg]:drop-shadow-2xl [&_svg]:rounded-lg">
                          {course.icon}
                        </div>
                      </div>

                      {/* Title overlay bottom */}
                      <div className="absolute bottom-0 inset-x-0 p-4 md:p-5 z-10">
                        <h3 className="text-xl md:text-2xl font-black text-white leading-tight" style={{ textShadow: "0 2px 8px rgba(0,0,0,0.5)" }}>
                          {course.title}
                        </h3>
                        {course.subtitle && <p className="text-white/85 text-xs md:text-sm mt-0.5">{course.subtitle}</p>}
                      </div>
                    </div>

                    {/* Course Content */}
                    <div className="p-5 md:p-6 flex-1 flex flex-col gap-5">
                      {/* Levels with colored dots */}
                      <div>
                        <div className="text-xs font-bold text-muted-foreground mb-2">{t("courses.levels")}</div>
                        <div className="grid grid-cols-3 gap-2">
                          {course.levels.map((level, i) => {
                            const dotColors = ["bg-emerald-500", "bg-amber-500", "bg-rose-500"];
                            return (
                              <span
                                key={i}
                                className="inline-flex items-center justify-center gap-1.5 bg-secondary/70 border border-border text-secondary-foreground px-2 py-2 rounded-lg text-xs font-semibold hover:border-primary/40 hover:bg-primary/5 transition-all"
                              >
                                <span className={`w-2 h-2 rounded-full ${dotColors[i] || "bg-primary"}`} />
                                {level}
                              </span>
                            );
                          })}
                        </div>
                      </div>

                      {/* Features */}
                      <ul className="space-y-2.5 flex-1">
                        {(course.features || []).slice(0, 4).map((feature, i) => (
                          <li key={i} className="flex items-start gap-2.5 text-sm text-foreground">
                            <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                              <CheckCircle2 className="w-3.5 h-3.5 text-primary" />
                            </div>
                            <span className="leading-snug break-words">{feature}</span>
                          </li>
                        ))}
                      </ul>

                      {/* Course info grid (2 cols) */}
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div className="flex items-center gap-2 bg-primary/5 rounded-lg px-3 py-2">
                          <Calendar className="w-4 h-4 text-primary flex-shrink-0" />
                          <span className="font-semibold text-foreground">{t("courses.duration")}</span>
                        </div>
                        <div className="flex items-center gap-2 bg-primary/5 rounded-lg px-3 py-2">
                          <Award className="w-4 h-4 text-primary flex-shrink-0" />
                          <span className="font-semibold text-foreground">{t("courses.certified")}</span>
                        </div>
                        <div className="flex items-center gap-2 bg-primary/5 rounded-lg px-3 py-2">
                          <Users className="w-4 h-4 text-primary flex-shrink-0" />
                          <span className="font-semibold text-foreground">{t("courses.ages")}</span>
                        </div>
                        <div className="flex items-center gap-2 bg-primary/5 rounded-lg px-3 py-2">
                          <BookOpen className="w-4 h-4 text-primary flex-shrink-0" />
                          <span className="font-semibold text-foreground">{t("courses.modern")}</span>
                        </div>
                      </div>

                      {/* Price + CTA */}
                      <div className="pt-4 border-t border-border">
                        <div className="flex items-end justify-between mb-3">
                          <div>
                            <div className="text-[11px] text-muted-foreground font-medium">{t("courses.price")}</div>
                            <div className="flex items-baseline gap-1">
                              <span className="text-2xl md:text-3xl font-black text-foreground">{displayPrice}</span>
                              <span className="text-sm font-bold text-muted-foreground">MRU</span>
                            </div>
                          </div>
                          <div className="text-left">
                            <div className="text-[11px] text-muted-foreground">{t("courses.includes")}</div>
                            <div className="text-xs font-bold text-green-600">{t("courses.onePay")}</div>
                          </div>
                        </div>
                        <a
                          href="/register"
                          className="btn-primary w-full text-center flex items-center justify-center gap-2 group/btn shadow-lg shadow-primary/30 hover:shadow-primary/50 py-4 text-base"
                        >
                          {t("courses.register")}
                          <ArrowLeft className="w-4 h-4 group-hover/btn:-translate-x-1 transition-transform duration-300" />
                        </a>
                      </div>
                    </div>
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
                    {t("courses.specialOffer")}
                  </span>
                  <h3 className="text-2xl md:text-3xl font-bold text-white mb-4">
                    {t("courses.oneCourse")}
                  </h3>
                  <div className="flex items-center justify-center gap-2 mb-4">
                    <span className="text-5xl md:text-7xl font-bold text-white animate-pulse-glow">{displayPrice}</span>
                    <span className="text-2xl text-white/90">MRU</span>
                  </div>
                  <p className="text-white/80 text-lg mb-8">
                    {t("courses.currencyNote")}
                  </p>
                  <a 
                    href="/register"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 bg-white text-primary px-10 py-4 rounded-xl font-bold text-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 hover:scale-105"
                  >
                    {t("courses.startJourney")}
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
