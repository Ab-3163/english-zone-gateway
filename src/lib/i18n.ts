import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";

const resources = {
  ar: {
    translation: {
      lang: { ar: "العربية", fr: "Français", switchTo: "Français" },
      nav: {
        home: "الرئيسية",
        about: "من نحن",
        courses: "الدورات",
        whyUs: "لماذا نحن",
        gallery: "المعرض",
        testimonials: "آراء الطلاب",
        results: "النتائج",
        studentPortal: "بوابة الطالب",
        location: "موقعنا",
        register: "سجّل الآن",
        adminPanel: "لوحة التحكم",
        toggleMenu: "القائمة",
      },
      hero: {
        badge: "مركز تكوين وتعليم اللغات",
        welcome: "مرحباً بكم في",
        subtitle: "بوابتك نحو إتقان اللغات العالمية",
        description: "دورات الإنجليزية والفرنسية بإشراف أساتذة متخصصين في نواكشوط",
        cta: "سجّل الآن",
        secondaryCta: "تعرف علينا",
        scroll: "اكتشف المزيد",
        exploreCourses: "استكشف الدورات",
        stats: {
          students: "طالب ناجح",
          courses: "دورة تعليمية",
          success: "نسبة النجاح",
          certificates: "شهادة مُصدَرة",
        },
      },
      about: {
        badge: "من نحن",
        title: "نبني جسور التواصل مع العالم",
        description:
          "ÉLITE ZONE هو مركز متخصص في تعليم اللغة الإنجليزية والفرنسية في قلب نواكشوط - موريتانيا. نفخر بتخريج مئات الطلاب الناجحين الذين أصبحوا اليوم قادرين على التواصل بثقة مع العالم.",
        vision: "رؤيتنا",
        visionText:
          "أن نكون المركز الرائد في تعليم اللغات في موريتانيا، ونساهم في بناء جيل قادر على التواصل مع مختلف الثقافات والاستفادة من الفرص العالمية.",
        mission: "رسالتنا",
        missionText:
          "تقديم تعليم لغوي عالي الجودة بأسعار مناسبة، مع التركيز على المهارات العملية التي تمكّن طلابنا من استخدام اللغة في حياتهم اليومية والمهنية.",
        features: {
          experience: { title: "خبرة طويلة", desc: "أكثر من 10 سنوات في تعليم اللغات مع نتائج مضمونة" },
          curriculum: { title: "مناهج متطورة", desc: "نستخدم أحدث الأساليب التعليمية المعتمدة دولياً" },
          certificates: { title: "شهادات معتمدة", desc: "نمنح شهادات إتمام معتمدة لجميع طلابنا" },
        },
      },
      whyUs: {
        badge: "مميزاتنا",
        title: "لماذا تختار",
        subtitle: "نلتزم بتقديم أعلى معايير الجودة في التعليم",
        cta: "انضم إلى آلاف الطلاب الذين حققوا أحلامهم معنا",
        start: "ابدأ الآن",
        reasons: {
          teachers: { title: "أساتذة مؤهلون", desc: "فريق من المدرسين ذوي الخبرة والكفاءة العالية في تدريس اللغات" },
          modern: { title: "مناهج حديثة", desc: "نستخدم أحدث المناهج والتقنيات التعليمية المعتمدة دولياً" },
          results: { title: "نتائج مضمونة", desc: "سجل حافل بالنجاحات مع مئات الطلاب المتخرجين بمستوى ممتاز" },
          env: { title: "بيئة تعليمية ممتازة", desc: "فصول دراسية مجهزة بأحدث الوسائل التعليمية المتطورة" },
        },
      },
      courses: {
        badge: "دوراتنا",
        title: "اختر الدورة",
        titleHighlight: "المناسبة",
        titleEnd: "لك",
        subtitle: "نقدم دورات متخصصة في اللغة الإنجليزية والفرنسية لجميع المستويات",
        levels: "المستويات المتاحة",
        beginner: "مبتدئ",
        intermediate: "متوسط",
        advanced: "متقدم",
        certified: "شهادة معتمدة",
        duration: "45 يوم",
        ages: "جميع الأعمار",
        modern: "مناهج حديثة",
        price: "السعر",
        includes: "شامل المواد",
        onePay: "✓ دفعة واحدة",
        register: "سجّل الآن",
        specialOffer: "عرض خاص",
        oneCourse: "رسوم الدورة الواحدة",
        currencyNote: "أوقية جديدة فقط — شاملة جميع المواد التعليمية",
        startJourney: "ابدأ رحلتك التعليمية",
        english: "دورة اللغة الإنجليزية",
        french: "دورة اللغة الفرنسية",
        englishSub: "English Language Course",
        frenchSub: "Cours de Français",
      },
      footer: {
        about:
          "مركز متخصص في تعليم اللغات الأجنبية في موريتانيا. نساعدك على إتقان اللغة الإنجليزية والفرنسية بأساليب حديثة وفعّالة.",
        trust: "+500 طالب يثقون بنا",
        quickLinks: "روابط سريعة",
        contact: "تواصل معنا",
        address: "لكصر، قرب مجمع الصين - نواكشوط، موريتانيا",
        hours: "السبت - الخميس: 8:00 ص - 8:00 م",
        rights: "جميع الحقوق محفوظة.",
        madeWith: "صُنع بـ",
        inCountry: "في موريتانيا",
        backToTop: "العودة للأعلى",
      },
      common: {
        loading: "جاري التحميل...",
        error: "حدث خطأ",
        success: "تم بنجاح",
      },
    },
  },
  fr: {
    translation: {
      lang: { ar: "Arabe", fr: "Français", switchTo: "العربية" },
      nav: {
        home: "Accueil",
        about: "À propos",
        courses: "Cours",
        whyUs: "Pourquoi nous",
        gallery: "Galerie",
        testimonials: "Témoignages",
        results: "Résultats",
        studentPortal: "Espace étudiant",
        location: "Localisation",
        register: "S'inscrire",
        adminPanel: "Administration",
        toggleMenu: "Menu",
      },
      hero: {
        badge: "Centre de formation et d'enseignement des langues",
        welcome: "Bienvenue à",
        subtitle: "Votre porte vers la maîtrise des langues du monde",
        description: "Cours d'anglais et de français encadrés par des professeurs spécialisés à Nouakchott",
        cta: "S'inscrire maintenant",
        secondaryCta: "En savoir plus",
        scroll: "Découvrir plus",
        exploreCourses: "Découvrir les cours",
        stats: {
          students: "étudiants diplômés",
          courses: "cours proposés",
          success: "de réussite",
          certificates: "certificats délivrés",
        },
      },
      about: {
        badge: "À propos",
        title: "Nous construisons des ponts avec le monde",
        description:
          "ÉLITE ZONE est un centre spécialisé dans l'enseignement de l'anglais et du français au cœur de Nouakchott — Mauritanie. Nous sommes fiers d'avoir formé des centaines d'étudiants aujourd'hui capables de communiquer avec confiance avec le monde entier.",
        vision: "Notre vision",
        visionText:
          "Être le centre de référence pour l'enseignement des langues en Mauritanie et contribuer à former une génération capable de communiquer avec différentes cultures et de saisir les opportunités mondiales.",
        mission: "Notre mission",
        missionText:
          "Offrir un enseignement linguistique de haute qualité à des prix accessibles, en mettant l'accent sur les compétences pratiques qui permettent à nos étudiants d'utiliser la langue dans leur vie quotidienne et professionnelle.",
        features: {
          experience: { title: "Longue expérience", desc: "Plus de 10 ans dans l'enseignement des langues avec des résultats garantis" },
          curriculum: { title: "Programmes modernes", desc: "Nous utilisons les méthodes pédagogiques les plus récentes reconnues à l'international" },
          certificates: { title: "Certificats reconnus", desc: "Nous délivrons des certificats de fin de formation reconnus à tous nos étudiants" },
        },
      },
      whyUs: {
        badge: "Nos atouts",
        title: "Pourquoi choisir",
        subtitle: "Nous nous engageons à offrir les plus hauts standards de qualité",
        cta: "Rejoignez des milliers d'étudiants qui ont réalisé leurs rêves avec nous",
        start: "Commencer",
        reasons: {
          teachers: { title: "Professeurs qualifiés", desc: "Une équipe d'enseignants expérimentés et hautement compétents dans l'enseignement des langues" },
          modern: { title: "Programmes modernes", desc: "Nous utilisons les programmes et technologies pédagogiques les plus récents" },
          results: { title: "Résultats garantis", desc: "Un historique de réussite avec des centaines d'étudiants diplômés à un excellent niveau" },
          env: { title: "Environnement d'excellence", desc: "Salles de classe équipées des outils pédagogiques les plus modernes" },
        },
      },
      courses: {
        badge: "Nos cours",
        title: "Choisissez le cours",
        titleHighlight: "qui vous convient",
        titleEnd: "",
        subtitle: "Nous proposons des cours spécialisés en anglais et en français pour tous les niveaux",
        levels: "Niveaux disponibles",
        beginner: "Débutant",
        intermediate: "Intermédiaire",
        advanced: "Avancé",
        certified: "Certificat reconnu",
        duration: "45 jours",
        ages: "Tous âges",
        modern: "Programmes modernes",
        price: "Prix",
        includes: "Matériel inclus",
        onePay: "✓ Paiement unique",
        register: "S'inscrire",
        specialOffer: "Offre spéciale",
        oneCourse: "Frais d'un cours",
        currencyNote: "Ouguiya nouvelle — tout le matériel pédagogique inclus",
        startJourney: "Commencer votre parcours",
        english: "Cours d'anglais",
        french: "Cours de français",
        englishSub: "English Language Course",
        frenchSub: "Cours de Français",
      },
      footer: {
        about:
          "Centre spécialisé dans l'enseignement des langues étrangères en Mauritanie. Nous vous aidons à maîtriser l'anglais et le français avec des méthodes modernes et efficaces.",
        trust: "+500 étudiants nous font confiance",
        quickLinks: "Liens rapides",
        contact: "Contactez-nous",
        address: "Ksar, près du complexe chinois — Nouakchott, Mauritanie",
        hours: "Samedi – Jeudi : 8h00 – 20h00",
        rights: "Tous droits réservés.",
        madeWith: "Fait avec",
        inCountry: "en Mauritanie",
        backToTop: "Retour en haut",
      },
      common: {
        loading: "Chargement...",
        error: "Une erreur s'est produite",
        success: "Opération réussie",
      },
    },
  },
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: "ar",
    supportedLngs: ["ar", "fr"],
    interpolation: { escapeValue: false },
    detection: {
      order: ["localStorage", "navigator"],
      lookupLocalStorage: "elite_lang",
      caches: ["localStorage"],
    },
  });

// Sync html dir/lang whenever language changes
const applyDir = (lng: string) => {
  const dir = lng === "fr" ? "ltr" : "rtl";
  document.documentElement.setAttribute("dir", dir);
  document.documentElement.setAttribute("lang", lng);
};
applyDir(i18n.language || "ar");
i18n.on("languageChanged", applyDir);

export default i18n;