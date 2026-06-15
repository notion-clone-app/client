import type { FC } from "react"
import { motion } from "motion/react"
import { LandingContainer } from "../container"
import { TypographyH1, TypographyLead } from "@/shared/ui/typography"
import { useTranslation } from "@/shared/model/localization"
import { ChevronDown } from "lucide-react"

export const ArchitectureHero: FC = () => {
    const { t } = useTranslation()

    return (
        <section className="relative min-h-[80vh] flex items-center justify-center overflow-hidden">
            {/* Animated dot grid background */}
            <div
                className="absolute inset-0 opacity-[0.4] dark:opacity-[0.15]"
                style={{
                    backgroundImage: `radial-gradient(circle, currentColor 1px, transparent 1px)`,
                    backgroundSize: "32px 32px",
                }}
            />

            {/* Radial gradient overlay */}
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,var(--color-background)_70%)]" />

            <LandingContainer>
                <motion.div
                    className="relative z-10 flex flex-col items-center gap-8 text-center"
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] }}
                >
                    {/* Badge */}
                    <motion.div
                        className="flex items-center gap-2 rounded-full border border-border/60 bg-secondary/50 px-4 py-1.5 backdrop-blur-sm"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.2, duration: 0.5 }}
                    >
                        <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                        <span className="text-sm font-medium text-muted-foreground">
                            {t('landing:architecture.hero.badge')}
                        </span>
                    </motion.div>

                    {/* Title */}
                    <TypographyH1 className="max-w-4xl">
                        {t('landing:architecture.hero.title')}
                    </TypographyH1>

                    {/* Subtitle */}
                    <TypographyLead className="max-w-2xl">
                        {t('landing:architecture.hero.subtitle')}
                    </TypographyLead>
                </motion.div>
            </LandingContainer>

            {/* Scroll indicator */}
            <motion.div
                className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1, duration: 0.6 }}
            >
                <motion.div
                    animate={{ y: [0, 8, 0] }}
                    transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
                >
                    <ChevronDown className="h-5 w-5 text-muted-foreground" />
                </motion.div>
            </motion.div>
        </section>
    )
}
