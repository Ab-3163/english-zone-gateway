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
    "inline-flex items-center gap-1 px-1.5 py-1.5 rounded-full border-2 shadow-lg backdrop-blur-md transition-all duration-300 hover:shadow-xl";
  const wrapperTheme =
    variant === "light"
      ? "bg-white/95 border-white"
      : "bg-background/95 border-border";

  const base =
    "px-3 py-1.5 rounded-full text-sm sm:text-base font-extrabold tracking-wide transition-all duration-300";

  const active =
    variant === "light"
      ? "bg-primary text-white shadow-md"
      : "bg-primary text-white shadow-md";
  const inactive =
    variant === "light"
      ? "text-primary hover:bg-primary/10"
      : "text-foreground hover:bg-primary/10";

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