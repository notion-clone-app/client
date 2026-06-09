import { useTranslation } from "@/shared/model/localization"
import { Button } from "@/shared/ui/kit/button"
import type { FC } from "react"
import { LandingContainer } from "../container"
import { CursorTrail } from "../cursor-trail"
import { Logo } from "../../logo"

export const HeroSection: FC = () => {
    const { t } = useTranslation()

    // TODO: move to own S3 storage
    const VIDEO_URL = "https://www.pexels.com/download/video/33352808/";
    // const HERO_IMAGE_URL =
    // "https://images.ctfassets.net/kftzwdyauwt9/6fhVzTDLf4b0tTvinYmopC/513ebcedcac6ef4c67d667e74df7a200/tablet_m_hero_dark__3_.png?w=3840&q=80&fm=webp";

    return (
        <section className="min-h-screen relative bg-gray-100">
            <LandingContainer>
                <video
                    className="absolute size-full top-0 left-0 object-cover"
                    src={VIDEO_URL}
                    loop
                    autoPlay
                />
                <CursorTrail />
                <div className="relative flex flex-col gap-10 items-center h-full z-10 pt-50">
                    <div className="flex-1 flex flex-col items-center gap-10">
                        <div className="flex flex-col gap-3 items-center">
                            <div className="flex items-center justify-center gap-3 bg-white rounded-2xl px-5 py-3">
                                <Logo />
                                <span className="text-black">
                                    Notion clone
                                </span>
                            </div>
                            <h1 className="text-black text-[100px] text-center leading-[100%] select-none">{t('landing:hero.title')}</h1>
                            <p className="text-black select-none">
                                {t('landing:hero.subtitle')}
                            </p>
                        </div>

                        <div className="flex gap-3">
                            <Button className="bg-primary text-primary-foreground dark:bg-primary-reverse dark:text-primary-reverse-foreground">{t('landing:hero.buttons.cta')}</Button>
                            <Button variant="secondary">{t('landing:hero.buttons.github')}</Button>
                        </div>
                    </div>

                    {/* <div className="flex items-center">
                        <img src={HERO_IMAGE_URL} className="select-none" />
                    </div> */}
                </div>
            </LandingContainer>
        </section>
    )
}