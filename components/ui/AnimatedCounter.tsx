"use client";

import { useEffect, useRef } from "react";
import { motion, useMotionValue, useTransform, animate, useInView } from "framer-motion";

interface AnimatedCounterProps {
  target: number;
  duration?: number;
  suffix?: string;
  prefix?: string;
}

export function AnimatedCounter({ 
  target, 
  duration = 2, 
  suffix = "", 
  prefix = "" 
}: AnimatedCounterProps) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });
  const count = useMotionValue(0);
  const rounded = useTransform(count, (latest) => Math.round(latest));

  useEffect(() => {
    if (isInView) {
      const controls = animate(count, target, { duration });
      return controls.stop;
    }
  }, [count, target, duration, isInView]);

  return (
    <span ref={ref} className="inline-block">
      {prefix}<motion.span>{rounded}</motion.span>{suffix}
    </span>
  );
}
