import { Link } from "react-router-dom";

const blocks = [
  {
    title: "تعلم اللغة الإنجليزية في نواكشوط",
    text: "يقدّم ÉLITE ZONE دورات الإنجليزية في موريتانيا لجميع المستويات من A1 إلى C1، مع تركيز على المحادثة والقواعد والكتابة. English courses in Nouakchott for students and professionals.",
    to: "/english-courses-nouakchott",
  },
  {
    title: "تعلم اللغة الفرنسية في نواكشوط",
    text: "دورات الفرنسية في موريتانيا بمنهج حديث يساعدك على الدراسة والعمل والتواصل بثقة. French courses in Nouakchott with qualified teachers.",
    to: "/french-courses-nouakchott",
  },
  {
    title: "دورات اللغات في موريتانيا",
    text: "مركز تعليم اللغات في نواكشوط يوفّر مجموعات حضورية وأونلاين بمواعيد مرنة وشهادات عند إتمام كل مستوى. Language school in Nouakchott.",
    to: "/language-school-nouakchott",
  },
];

const SeoContent = () => (
  <section className="section-padding bg-background" aria-labelledby="seo-why">
    <div className="container mx-auto">
      <div className="grid md:grid-cols-3 gap-6 mb-10">
        {blocks.map((b) => (
          <div key={b.to} className="bg-card border border-border rounded-2xl p-6 shadow-sm">
            <h2 className="text-xl font-bold text-foreground mb-3">{b.title}</h2>
            <p className="text-muted-foreground text-sm leading-relaxed mb-4">{b.text}</p>
            <Link to={b.to} className="text-primary font-semibold text-sm hover:underline">
              اقرأ المزيد ←
            </Link>
          </div>
        ))}
      </div>
      <div className="max-w-3xl mx-auto text-center">
        <h2 id="seo-why" className="text-2xl md:text-3xl font-bold text-foreground mb-3">لماذا تختار ÉLITE ZONE؟</h2>
        <p className="text-muted-foreground leading-relaxed">
          أساتذة مؤهلون، مجموعات صغيرة، متابعة مستمرة لتقدّم كل طالب، وأسعار مناسبة — كل ذلك في مركز واحد لتعلم الإنجليزية والفرنسية في نواكشوط.
        </p>
      </div>
    </div>
  </section>
);

export default SeoContent;
