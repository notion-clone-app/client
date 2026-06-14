import { useTranslation } from "@/shared/model/localization"
import { Button } from "@/shared/ui/kit/button"
import type { FC } from "react"
import { LandingContainer } from "../container"
import { CursorTrail } from "../cursor-trail"
import { Logo } from "../../logo"
import { TypographyH1, TypographyLead } from "@/shared/ui/typography"

const VIDEO_URL = "https://www.pexels.com/download/video/33352808/"

export const HeroSection: FC = () => {
    const { t } = useTranslation()

    return (
        <section className="min-h-screen relative flex items-center justify-center bg-black overflow-hidden">
            <video
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
                <div className="relative flex flex-col items-center z-10 w-full">
                    <div className="flex flex-col items-center gap-10 max-w-4xl text-center">
                        <div className="flex items-center justify-start gap-2 bg-white/10 backdrop-blur-md text-white rounded-full px-4 py-2">
                            <Logo />
                            <span className="font-medium text-sm text-black">
                                {t('landing:hero.badge', { defaultValue: 'Notion clone' })}
                            </span>
                        </div>

                        <div className="flex flex-col gap-8 items-center text-white">
                            <TypographyH1 className="select-none leading-[1.1] text-black">
                                {t('landing:hero.title')}
                            </TypographyH1>
                            <TypographyLead className="select-none max-w-2xl mx-auto text-black">
                                {t('landing:hero.subtitle')}
                            </TypographyLead>
                        </div>

                        <div className="flex flex-wrap items-center justify-center gap-4 mt-6">
                            <Button size="lg" className="h-12 px-8 text-base font-mediumi bg-black text-white border-none shadow-lg">
                                {t('landing:hero.buttons.cta')}
                            </Button>
                            <Button size="lg" className="h-12 px-8 text-base font-medium bg-white/10 hover:bg-white/20 text-white backdrop-blur-md border-none transition-colors">
                                {t('landing:hero.buttons.github')}
                            </Button>
                        </div>
                    </div>
                </div>
            </LandingContainer>
        </section>
    )
}