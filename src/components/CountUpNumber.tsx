import { useEffect, useState } from "react";
import useScrollAnimation from "@/hooks/useScrollAnimation";

interface CountUpNumberProps {
  end: number;
  duration?: number;
  prefix?: string;
  suffix?: string;
  className?: string;
}

const CountUpNumber = ({
  end,
  duration = 2000,
  prefix = "",
  suffix = "",
  className = "",
}: CountUpNumberProps) => {
  const [count, setCount] = useState(0);
  const { ref, isVisible } = useScrollAnimation({ threshold: 0.5 });

  useEffect(() => {
    if (!isVisible) return;

    let startTime: number | null = null;
    const startValue = 0;

    const animate = (currentTime: number) => {
      if (!startTime) startTime = currentTime;
      const progress = Math.min((currentTime - startTime) / duration, 1);
      
      // Easing function for smooth animation
      const easeOutQuart = 1 - Math.pow(1 - progress, 4);
      const currentCount = Math.floor(easeOutQuart * (end - startValue) + startValue);
      
      setCount(currentCount);

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
  }, [isVisible, end, duration]);

  return (
    <div ref={ref} className={className}>
      {prefix}{count}{suffix}
    </div>
  );
};

export default CountUpNumber;
