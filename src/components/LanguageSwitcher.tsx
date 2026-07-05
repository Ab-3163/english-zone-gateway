import { useTranslation } from "react-i18next";
import { Globe } from "lucide-react";

interface Props {
  variant?: "light" | "dark";
  className?: string;
}

const LanguageSwitcher = ({ variant = "dark", className = "" }: Props) => {
  const { i18n } = useTranslation();
  const current = i18n.language?.startsWith("fr") ? "fr" : "ar";

  const setLang = (lang: "ar" | "fr") => {
    i18n.changeLanguage(lang);
  };

  // Higher contrast, always visible labels
  const wrapper =
    "inline-flex items-center gap-1 px-1.5 py-1.5 rounded-full border-2 shadow-xl backdrop-blur-md transition-all duration-300 hover:shadow-2xl";
  const wrapperTheme =
    variant === "light"
      ? "bg-white/98 border-white"
      : "bg-background/98 border-border";

  const base =
    "px-3.5 py-2 rounded-full text-base sm:text-lg font-extrabold tracking-wider transition-all duration-300 border-2";

  const active =
    "bg-primary text-white border-primary shadow-md scale-105";
  const inactive =
    variant === "light"
      ? "bg-white text-foreground border-foreground/20 hover:border-primary/60 hover:bg-primary/5"
      : "bg-background text-foreground border-border hover:border-primary/60 hover:bg-primary/5";

  return (
    <div
      className={`${wrapper} ${wrapperTheme} ${className}`}
      role="group"
      aria-label="Change language / Changer de langue / تغيير اللغة"
    >
      <Globe className="w-4 h-4 sm:w-5 sm:h-5 text-primary mx-1" />
      <button
        type="button"
        onClick={() => setLang("ar")}
        className={`${base} ${current === "ar" ? active : inactive}`}
        aria-pressed={current === "ar"}
        title="العربية"
      >
        AR
      </button>
      <button
        type="button"
        onClick={() => setLang("fr")}
        className={`${base} ${current === "fr" ? active : inactive}`}
        aria-pressed={current === "fr"}
        title="Français"
      >
        FR
      </button>
    </div>
  );
};

export default LanguageSwitcher;