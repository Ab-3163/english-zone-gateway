import { useTranslation } from "react-i18next";
import { Languages } from "lucide-react";

interface Props {
  variant?: "light" | "dark";
  className?: string;
}

const LanguageSwitcher = ({ variant = "dark", className = "" }: Props) => {
  const { i18n } = useTranslation();
  const current = i18n.language?.startsWith("fr") ? "fr" : "ar";
  const next = current === "ar" ? "fr" : "ar";

  const toggle = () => {
    i18n.changeLanguage(next);
  };

  const base =
    "inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-extrabold transition-all duration-300 border-2 shadow-md hover:scale-105 active:scale-95";
  const styles =
    variant === "light"
      ? "bg-white/95 hover:bg-white text-primary border-white backdrop-blur-md"
      : "bg-primary hover:bg-primary/90 text-white border-primary";

  return (
    <button
      onClick={toggle}
      aria-label="Change language / تغيير اللغة"
      title={next === "fr" ? "Passer au Français" : "التبديل إلى العربية"}
      className={`${base} ${styles} ${className}`}
    >
      <Languages className="w-4 h-4" />
      <span className="tracking-wide">{next === "fr" ? "FR" : "AR"}</span>
    </button>
  );
};

export default LanguageSwitcher;