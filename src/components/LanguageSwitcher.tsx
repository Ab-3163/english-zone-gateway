import { useTranslation } from "react-i18next";

interface Props {
  variant?: "light" | "dark";
  className?: string;
}

/**
 * Segmented language control (AR / FR) with a sliding pill indicator.
 * Compact, premium look — inspired by Apple / Stripe segmented controls.
 */
const LanguageSwitcher = ({ variant = "dark", className = "" }: Props) => {
  const { i18n } = useTranslation();
  const current = i18n.language?.startsWith("fr") ? "fr" : "ar";

  const setLang = (lang: "ar" | "fr") => {
    if (lang !== current) i18n.changeLanguage(lang);
  };

  const track =
    variant === "light"
      ? "bg-white/15 border-white/25"
      : "bg-foreground/5 border-border";

  const inactiveText =
    variant === "light" ? "text-white/85 hover:text-white" : "text-foreground/70 hover:text-foreground";

  return (
    <div
      role="group"
      aria-label="Change language"
      className={`relative inline-flex items-center p-0.5 rounded-full border ${track} backdrop-blur-md ${className}`}
    >
      {/* Sliding indicator */}
      <span
        aria-hidden
        className={`absolute top-0.5 bottom-0.5 w-[calc(50%-2px)] rounded-full bg-primary shadow-sm transition-transform duration-300 ease-out ${
          current === "ar" ? "translate-x-0" : "-translate-x-full rtl:translate-x-full"
        }`}
        style={{ left: "2px" }}
      />
      <button
        type="button"
        onClick={() => setLang("ar")}
        aria-pressed={current === "ar"}
        className={`relative z-10 px-3 py-1 rounded-full text-xs font-bold tracking-wide transition-colors duration-300 ${
          current === "ar" ? "text-white" : inactiveText
        }`}
      >
        AR
      </button>
      <button
        type="button"
        onClick={() => setLang("fr")}
        aria-pressed={current === "fr"}
        className={`relative z-10 px-3 py-1 rounded-full text-xs font-bold tracking-wide transition-colors duration-300 ${
          current === "fr" ? "text-white" : inactiveText
        }`}
      >
        FR
      </button>
    </div>
  );
};

export default LanguageSwitcher;