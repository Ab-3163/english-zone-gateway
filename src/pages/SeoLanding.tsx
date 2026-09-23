import { Link } from "react-router-dom";
import logo from "@/assets/logo.jpeg";
import Seo from "@/components/Seo";
import Footer from "@/components/Footer";
import WhatsAppButton from "@/components/WhatsAppButton";

type PageKey = "english" | "french" | "school";

const pages: Record<PageKey, {
  path: string; title: string; description: string; h1: string;
  sections: { h2: string; p: string }[];
}> = {
  english: {
    path: "/english-courses-nouakchott",
    title: "دورات اللغة الإنجليزية في نواكشوط | ÉLITE ZONE",
    description: "تعلم الإنجليزية في نواكشوط مع ÉLITE ZONE: دورات من A1 إلى C1، أساتذة مؤهلون وشهادات. English courses in Nouakchott, Mauritania.",
    h1: "دورات اللغة الإنجليزية في نواكشوط",
    sections: [
      { h2: "تعلم الإنجليزية بثقة", p: "برامجنا تغطي المحادثة، الاستماع، القواعد والكتابة، مع تمارين عملية في كل حصة تساعدك على استخدام اللغة في الدراسة والعمل والسفر." },
      { h2: "مستويات تناسب الجميع", p: "نبدأ باختبار تحديد مستوى ثم نضعك في المجموعة المناسبة من المبتدئ (A1) إلى المتقدم (C1). دورات الإنجليزية في موريتانيا متاحة حضورياً وأونلاين." },
      { h2: "English courses in Nouakchott", p: "ÉLITE ZONE offers practical English courses in Nouakchott for students, employees and professionals, with qualified teachers and a certificate for each level." },
    ],
  },
  french: {
    path: "/french-courses-nouakchott",
    title: "دورات اللغة الفرنسية في نواكشوط | ÉLITE ZONE",
    description: "تعلم الفرنسية في نواكشوط مع ÉLITE ZONE: دورات لكل المستويات بمنهج حديث. Cours de français à Nouakchott, Mauritanie.",
    h1: "دورات اللغة الفرنسية في نواكشوط",
    sections: [
      { h2: "تعلم الفرنسية للدراسة والعمل", p: "الفرنسية لغة أساسية في موريتانيا للدراسة الجامعية والإدارة وسوق العمل. دوراتنا تركّز على التواصل الشفهي والكتابة الصحيحة." },
      { h2: "دورات الفرنسية في موريتانيا", p: "مجموعات صغيرة، مواعيد مرنة، ومتابعة فردية لتقدّم كل طالب، مع شهادة عند إتمام كل مستوى." },
      { h2: "Cours de français à Nouakchott", p: "ÉLITE ZONE propose des French courses in Nouakchott pour tous les niveaux, avec des enseignants qualifiés et une méthode moderne." },
    ],
  },
  school: {
    path: "/language-school-nouakchott",
    title: "مركز تعليم اللغات في نواكشوط | ÉLITE ZONE",
    description: "ÉLITE ZONE مركز تعليم اللغات في نواكشوط، موريتانيا: دورات الإنجليزية والفرنسية بأساتذة مؤهلين. Language school in Nouakchott.",
    h1: "ÉLITE ZONE – مركز تعليم اللغات في نواكشوط",
    sections: [
      { h2: "من نحن", p: "ÉLITE ZONE مركز متخصص في تعليم اللغتين الإنجليزية والفرنسية في نواكشوط، يعتمد مناهج حديثة وأساتذة ذوي خبرة." },
      { h2: "لماذا تختار ÉLITE ZONE؟", p: "مجموعات صغيرة، أسعار مناسبة، دورات حضورية وأونلاين، نتائج وشهادات يمكن متابعتها عبر بوابة الطالب." },
      { h2: "Language school in Nouakchott", p: "A modern language school in Nouakchott, Mauritania, offering English and French courses for all ages and levels." },
    ],
  },
};

const links: { to: string; label: string }[] = [
  { to: "/", label: "الصفحة الرئيسية" },
  { to: "/english-courses-nouakchott", label: "دورات الإنجليزية" },
  { to: "/french-courses-nouakchott", label: "دورات الفرنسية" },
  { to: "/language-school-nouakchott", label: "مركز اللغات" },
];

const SeoLanding = ({ page }: { page: PageKey }) => {
  const d = pages[page];
  return (
    <div className="min-h-screen bg-background">
      <Seo title={d.title} description={d.description} path={d.path} />
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between gap-4">
          <Link to="/" className="flex items-center gap-2">
            <img src={logo} alt="شعار ÉLITE ZONE" className="h-10 w-auto rounded-md" />
          </Link>
          <nav className="flex flex-wrap gap-3 text-sm">
            {links.filter((l) => l.to !== d.path).map((l) => (
              <Link key={l.to} to={l.to} className="text-muted-foreground hover:text-primary">{l.label}</Link>
            ))}
          </nav>
        </div>
      </header>
      <main className="section-padding">
        <div className="container mx-auto max-w-3xl">
          <h1 className="text-3xl md:text-5xl font-bold text-foreground mb-6">{d.h1}</h1>
          <p className="text-muted-foreground text-lg leading-relaxed mb-10">{d.description}</p>
          {d.sections.map((s) => (
            <section key={s.h2} className="mb-8">
              <h2 className="text-2xl font-bold text-foreground mb-3">{s.h2}</h2>
              <p className="text-muted-foreground leading-relaxed">{s.p}</p>
            </section>
          ))}
          <div className="flex flex-col sm:flex-row gap-3 mt-10">
            <Link to="/register" className="btn-primary text-center">سجل الآن</Link>
            <a href="https://wa.me/22220454530" target="_blank" rel="noreferrer" className="border-2 border-primary text-primary px-8 py-3 rounded-lg font-semibold text-center hover:bg-primary/10">
              تواصل عبر واتساب
            </a>
          </div>
        </div>
      </main>
      <Footer />
      <WhatsAppButton />
    </div>
  );
};

export default SeoLanding;
