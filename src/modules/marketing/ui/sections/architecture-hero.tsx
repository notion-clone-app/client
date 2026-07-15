import { useRef, type FC } from "react";
import { motion, useScroll, useTransform } from "motion/react";
import { LandingContainer } from "../container";
import { TypographyH1 } from "@/shared/ui/typography";
import { ChevronDown } from "lucide-react";
import { SpaceParticles } from "../space-particles";
import { Button } from "@/shared/ui/kit/button";
import { Link } from "react-router";
import { ROUTES } from "@/shared/model";

export const ArchitectureHero: FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"],
  });

  const backgroundY = useTransform(scrollYProgress, [0, 1], ["0%", "25%"]);
  const contentY = useTransform(scrollYProgress, [0, 1], ["0%", "45%"]);
  const contentOpacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);
  const arrowOpacity = useTransform(scrollYProgress, [0, 0.15], [1, 0]);

  return (
    <section
      ref={containerRef}
      className="relative flex min-h-[100vh] items-center justify-center overflow-hidden bg-background"
    >
      <motion.div className="absolute inset-0 left-0 w-full" style={{ y: backgroundY }}>
        <SpaceParticles />
      </motion.div>

      <motion.div style={{ y: contentY, opacity: contentOpacity }} className="relative z-10 w-full">
        <LandingContainer>
          <motion.div
            className="flex flex-col items-center gap-8 text-center"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] }}
          >
            <div className="max-w-3xl space-y-4">
              <TypographyH1>System Design</TypographyH1>
              <Button asChild variant="secondary">
                <Link to={ROUTES.BUSINESS_REQUIREMENTS}>View business requirements</Link>
              </Button>
            </div>
          </motion.div>
        </LandingContainer>
      </motion.div>

      <motion.div
        style={{ opacity: arrowOpacity }}
        className="absolute bottom-8 left-1/2 z-10 -translate-x-1/2"
      >
        <ChevronDown className="h-6 w-6 animate-bounce text-muted-foreground" />
      </motion.div>
    </section>
  );
};
