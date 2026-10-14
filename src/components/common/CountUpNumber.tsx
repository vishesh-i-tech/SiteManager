import React, { useEffect, useState } from 'react';

interface CountUpNumberProps {
  value: number;
  duration?: number;
  formatter?: (val: number) => string;
  prefix?: string;
  suffix?: string;
  className?: string;
}

export const CountUpNumber: React.FC<CountUpNumberProps> = ({
  value,
  duration = 800,
  formatter = (v) => v.toLocaleString('en-IN'),
  prefix = '',
  suffix = '',
  className = '',
}) => {
  const [displayValue, setDisplayValue] = useState<number>(0);

  useEffect(() => {
    // Check for prefers-reduced-motion
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion || duration === 0) {
      setDisplayValue(value);
      return;
    }

    let startTimestamp: number | null = null;
    const startValue = displayValue;
    const diff = value - startValue;

    const step = (timestamp: number) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      // Ease-out cubic calculation
      const easeOut = 1 - Math.pow(1 - progress, 3);
      const current = Math.round(startValue + diff * easeOut);
      setDisplayValue(current);

      if (progress < 1) {
        window.requestAnimationFrame(step);
      } else {
        setDisplayValue(value);
      }
    };

    const animId = window.requestAnimationFrame(step);
    return () => window.cancelAnimationFrame(animId);
  }, [value, duration]);

  return (
    <span className={`tabular-nums ${className}`}>
      {prefix}
      {formatter(displayValue)}
      {suffix}
    </span>
  );
};
