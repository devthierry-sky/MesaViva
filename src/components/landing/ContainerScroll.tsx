"use client";

import { useRef, useState, useEffect, type ReactNode } from "react";
import { motion, useScroll, useTransform, type MotionValue } from "framer-motion";

export function ContainerScroll({ titleComponent, children }: { titleComponent: string | ReactNode; children: ReactNode }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: containerRef });
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth <= 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const rotate = useTransform(scrollYProgress, [0, 1], [20, 0]);
  const scale = useTransform(scrollYProgress, [0, 1], isMobile ? [0.7, 0.9] : [1.05, 1]);
  const translate = useTransform(scrollYProgress, [0, 1], [0, -100]);

  return <div ref={containerRef} className="relative flex h-[60rem] items-center justify-center p-2 md:h-[80rem] md:p-12">
    <div className="relative w-full py-10 md:py-32" style={{ perspective: "1000px" }}>
      <motion.div style={{ y: translate }} className="mx-auto max-w-5xl text-center">{titleComponent}</motion.div>
      <ScrollCard rotate={rotate} scale={scale}>{children}</ScrollCard>
    </div>
  </div>;
}

function ScrollCard({ rotate, scale, children }: { rotate: MotionValue<number>; scale: MotionValue<number>; children: ReactNode }) {
  return <motion.div style={{ rotateX: rotate, scale, boxShadow: "0 9px 20px #00000020, 0 37px 37px #0000001c, 0 84px 50px #00000012" }} className="mx-auto -mt-12 h-[30rem] w-full max-w-5xl rounded-[28px] border-4 border-[#315F42]/35 bg-[#234B39] p-2 shadow-2xl md:h-[40rem] md:rounded-[32px] md:p-5">
    <div className="h-full w-full overflow-hidden rounded-[20px] bg-[#F6F4EE]">{children}</div>
  </motion.div>;
}
