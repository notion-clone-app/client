import { useTranslation } from "@/shared/model/localization"
import { Button } from "@/shared/ui/kit/button"
import { useRef, type FC } from "react"
import { LandingContainer } from "../container"
import { CursorTrail } from "../cursor-trail"
import { Logo } from "../../logo"
import { TypographyH1, TypographyLead } from "@/shared/ui/typography"
import { motion, useScroll, useTransform } from "motion/react"

const VIDEO_URL = "https://www.pexels.com/download/video/33352808/"

export const HeroSection: FC = () => {
    const { t } = useTranslation()

    const containerRef = useRef<HTMLDivElement>(null)

    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ["start start", "end start"]
    })

    const contentY = useTransform(scrollYProgress, [0, 1], ["0%", "45%"])
    const contentOpacity = useTransform(scrollYProgress, [0, 0.5], [1, 0])

    return (
        <section
            ref={containerRef}
            className="min-h-screen relative flex items-center justify-center bg-black overflow-hidden"
        >
            <motion.video
                className="absolute size-full top-0 left-0 object-cover pointer-events-none"
                src={VIDEO_URL}
                loop
                autoPlay
                muted
                playsInline
            />
            <div className="absolute inset-0 pointer-events-none" />
            <CursorTrail />

            <LandingContainer>
                <motion.div className="relative flex flex-col items-center z-10 w-full"
                    style={{ y: contentY, opacity: contentOpacity }}

                >
                    <div className="flex flex-col items-center gap-10 max-w-4xl text-center">
                        <motion.div className="flex items-center justify-start gap-2 bg-white/10 backdrop-blur-md text-white rounded-full px-4 py-2"
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] }}
                        >
                            <Logo />
                            <span className="font-medium text-sm text-black">
                                {t('landing:hero.badge', { defaultValue: 'Notion clone' })}
                            </span>
                        </motion.div>

                        <motion.div
                            className="flex flex-col gap-8 items-center text-white"
                        >
                            <motion.div
                                initial={{ opacity: 0, y: 30 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.9, ease: [0.25, 0.46, 0.45, 0.94] }}
                            >
                                <TypographyH1 className="select-none leading-[1.1] text-black">
                                    {t('landing:hero.title')}
                                </TypographyH1>
                            </motion.div>
                            <motion.div
                                initial={{ opacity: 0, y: 30 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 1.0, ease: [0.25, 0.46, 0.45, 0.94], delay: 0.2 }}
                            >
                                <TypographyLead className="select-none max-w-2xl mx-auto text-black">
                                    {t('landing:hero.subtitle')}
                                </TypographyLead>
                            </motion.div>

                            <motion.div
                                initial={{ opacity: 0, y: 30 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 1.2, ease: [0.25, 0.46, 0.45, 0.94], delay: 0.5 }}
                                className="flex flex-wrap items-center justify-center gap-4 mt-6"
                            >
                                <Button size="lg" className="h-12 px-8 text-base font-mediumi bg-black text-white border-none shadow-lg">
                                    {t('landing:hero.buttons.cta')}
                                </Button>
                                <Button size="lg" className="h-12 px-8 text-base font-medium bg-white/10 hover:bg-white/20 text-white backdrop-blur-md border-none transition-colors">
                                    {t('landing:hero.buttons.github')}
                                </Button>
                            </motion.div>
                        </motion.div>
                    </div>
                </motion.div>
            </LandingContainer>
        </section>
    )
}