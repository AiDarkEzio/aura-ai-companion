// components/AnimatedSection.tsx
"use client";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";

interface AnimatedSectionProps extends React.HTMLAttributes<HTMLElement> {
  children: React.ReactNode;
}

export const AnimatedSection = ({
  children,
  className = "",
  ...props
}: AnimatedSectionProps) => {
  const ref = useScrollAnimation<HTMLElement>();
  return (
    <section ref={ref} className={`animate-on-scroll ${className}`} {...props}>
      {children}
    </section>
  );
};