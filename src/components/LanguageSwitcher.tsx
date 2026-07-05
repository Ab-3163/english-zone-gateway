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
    "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all duration-300 border";
  const styles =
    variant === "light"
      ? "bg-white/10 hover:bg-white/20 text-white border-white/25 backdrop-blur-md"
      : "bg-primary/10 hover:bg-primary/20 text-primary border-primary/20";

  return (
    <button
      onClick={toggle}
      aria-label="Change language"
      className={`${base} ${styles} ${className}`}
    >
      <Languages className="w-3.5 h-3.5" />
      <span>{next === "fr" ? "FR" : "ع"}</span>
    </button>
  );
};

export default LanguageSwitcher;