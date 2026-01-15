import { ReactNode } from "react";
import useScrollAnimation from "@/hooks/useScrollAnimation";
import { cn } from "@/lib/utils";

interface AnimatedSectionProps {
  children: ReactNode;
  className?: string;
  animation?: "fade-in" | "fade-in-up" | "slide-in-right" | "slide-in-left" | "scale-in";
  delay?: number;
}

const AnimatedSection = ({
  children,
  className,
  animation = "fade-in-up",
  delay = 0,
}: AnimatedSectionProps) => {
  const { ref, isVisible } = useScrollAnimation({ threshold: 0.1 });

  const animationClasses = {
    "fade-in": "animate-fade-in",
    "fade-in-up": "animate-fade-in-up",
    "slide-in-right": "animate-slide-in-right",
    "slide-in-left": "animate-slide-in-left",
    "scale-in": "animate-scale-in",
  };

  return (
    <div
      ref={ref}
      className={cn(
        "opacity-0",
        isVisible && animationClasses[animation],
        className
      )}
      style={{ animationDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
};

export default AnimatedSection;
