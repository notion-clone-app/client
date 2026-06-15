import { type FC, useState, useRef } from "react"
import { motion, useScroll, useTransform, useInView } from "motion/react"
import { LandingContainer } from "../container"
import { TypographyH2, TypographyLead } from "@/shared/ui/typography"
import { useTranslation } from "@/shared/model/localization"
import {
    Globe, Shield, ShieldCheck, FileText, Database,
    HardDrive, Search, Radio, ArrowDownLeft
} from "lucide-react"

// Step definitions
const STEP_KEYS = [
    "browser", "gateway", "auth", "document", "postgres",
    "kafka", "search", "realtime", "response",
] as const

type StepKey = typeof STEP_KEYS[number]

const STEP_ICONS: Record<StepKey, FC<{ className?: string }>> = {
    browser: Globe,
    gateway: Shield,
    auth: ShieldCheck,
    document: FileText,
    postgres: Database,
    kafka: HardDrive,
    search: Search,
    realtime: Radio,
    response: ArrowDownLeft,
}

const STEP_COLORS: Record<StepKey, { accent: string; glow: string; bg: string }> = {
    browser:  { accent: "text-blue-400",    glow: "shadow-blue-500/30",    bg: "bg-blue-500/10 dark:bg-blue-500/10" },
    gateway:  { accent: "text-violet-400",  glow: "shadow-violet-500/30",  bg: "bg-violet-500/10 dark:bg-violet-500/10" },
    auth:     { accent: "text-amber-400",   glow: "shadow-amber-500/30",   bg: "bg-amber-500/10 dark:bg-amber-500/10" },
    document: { accent: "text-cyan-400",    glow: "shadow-cyan-500/30",    bg: "bg-cyan-500/10 dark:bg-cyan-500/10" },
    postgres: { accent: "text-blue-300",    glow: "shadow-blue-400/30",    bg: "bg-blue-400/10 dark:bg-blue-400/10" },
    kafka:    { accent: "text-teal-400",    glow: "shadow-teal-500/30",    bg: "bg-teal-500/10 dark:bg-teal-500/10" },
    search:   { accent: "text-orange-400",  glow: "shadow-orange-500/30",  bg: "bg-orange-500/10 dark:bg-orange-500/10" },
    realtime: { accent: "text-pink-400",    glow: "shadow-pink-500/30",    bg: "bg-pink-500/10 dark:bg-pink-500/10" },
    response: { accent: "text-emerald-400", glow: "shadow-emerald-500/30", bg: "bg-emerald-500/10 dark:bg-emerald-500/10" },
}

// --- Step Card ---

const JourneyStep: FC<{
    stepKey: StepKey
    index: number
    isActive: boolean
    isExpanded: boolean
    onToggle: () => void
}> = ({ stepKey, index, isActive, isExpanded, onToggle }) => {
    const { t } = useTranslation()
    const stepRef = useRef<HTMLDivElement>(null)
    const isInView = useInView(stepRef, { once: true, margin: "-50px" })
    const Icon = STEP_ICONS[stepKey]
    const colors = STEP_COLORS[stepKey]

    const label = t(`landing:architecture.journey.steps.${stepKey}.label`)
    const detail = t(`landing:architecture.journey.steps.${stepKey}.detail`)
    const description = t(`landing:architecture.journey.steps.${stepKey}.description`)
    const code = t(`landing:architecture.journey.steps.${stepKey}.code`)

    const isLeft = index % 2 === 0

    return (
        <div
            ref={stepRef}
            className={`relative flex items-start gap-4 md:gap-8 ${
                isLeft ? "md:flex-row" : "md:flex-row-reverse"
            }`}
        >
            {/* Content card */}
            <motion.div
                className={`flex-1 ${isLeft ? "md:text-right" : "md:text-left"}`}
                initial={{ opacity: 0, x: isLeft ? -30 : 30 }}
                animate={isInView ? { opacity: 1, x: 0 } : {}}
                transition={{ duration: 0.5, delay: 0.1 }}
            >
                <button
                    onClick={onToggle}
                    className={`
                        w-full text-left group rounded-xl border p-4 md:p-5 
                        transition-all duration-300 cursor-pointer
                        ${isActive
                            ? `border-current/20 ${colors.bg} shadow-lg ${colors.glow} ${colors.accent}`
                            : "border-border/40 bg-card/50 dark:bg-white/[0.02] hover:border-border hover:bg-secondary/30 dark:hover:bg-white/[0.04]"
                        }
                    `}
                >
                    <div className={`flex items-center gap-3 ${isLeft ? "md:flex-row-reverse" : ""}`}>
                        <div className={`
                            flex items-center justify-center w-10 h-10 rounded-lg shrink-0
                            transition-colors duration-300
                            ${isActive ? `${colors.bg} ${colors.accent}` : "bg-secondary/80 dark:bg-white/5 text-muted-foreground"}
                        `}>
                            <Icon className="h-5 w-5" />
                        </div>
                        <div className={`flex flex-col ${isLeft ? "md:items-end" : ""}`}>
                            <span className={`font-medium text-sm transition-colors duration-300 ${
                                isActive ? "text-foreground" : "text-foreground/80"
                            }`}>
                                {label}
                            </span>
                            <span className={`text-xs font-mono transition-colors duration-300 ${
                                isActive ? colors.accent : "text-muted-foreground"
                            }`}>
                                {detail}
                            </span>
                        </div>
                    </div>

                    {/* Description */}
                    <motion.div
                        initial={false}
                        animate={{ height: isExpanded ? "auto" : 0, opacity: isExpanded ? 1 : 0 }}
                        transition={{ duration: 0.3 }}
                        className="overflow-hidden"
                    >
                        <p className={`mt-3 text-sm leading-relaxed text-muted-foreground ${isLeft ? "md:text-right" : ""}`}>
                            {description}
                        </p>
                        {/* Code snippet */}
                        <pre className={`
                            mt-3 rounded-lg border border-border/40 bg-secondary/50 dark:bg-black/30 
                            p-3 text-xs font-mono leading-relaxed text-foreground/70 
                            overflow-x-auto text-left
                        `}>
                            {code}
                        </pre>
                    </motion.div>
                </button>
            </motion.div>

            {/* Timeline node */}
            <div className="relative flex flex-col items-center shrink-0 z-10">
                <motion.div
                    className={`
                        relative w-10 h-10 md:w-12 md:h-12 rounded-full border-2 flex items-center justify-center
                        transition-all duration-300 font-mono text-xs font-semibold
                        ${isActive
                            ? `border-current ${colors.accent} ${colors.bg} shadow-lg ${colors.glow}`
                            : "border-border bg-card dark:bg-gray-900 text-muted-foreground"
                        }
                    `}
                    initial={{ scale: 0 }}
                    animate={isInView ? { scale: 1 } : {}}
                    transition={{ delay: 0.05, type: "spring", stiffness: 300, damping: 20 }}
                >
                    {index + 1}
                    {isActive && (
                        <motion.div
                            className={`absolute inset-0 rounded-full border ${colors.accent} opacity-40`}
                            animate={{ scale: [1, 1.5], opacity: [0.4, 0] }}
                            transition={{ repeat: Infinity, duration: 2, ease: "easeOut" }}
                        />
                    )}
                </motion.div>
            </div>

            {/* Empty space for alternating layout */}
            <div className="flex-1 hidden md:block" />
        </div>
    )
}

export const RequestJourney: FC = () => {
    const { t } = useTranslation()
    const containerRef = useRef<HTMLDivElement>(null)
    const timelineRef = useRef<HTMLDivElement>(null)
    const sectionRef = useRef<HTMLDivElement>(null)
    const isInView = useInView(sectionRef, { once: true, margin: "-100px" })
    const [expandedStep, setExpandedStep] = useState<StepKey | null>(null)

    // Scroll-driven progress for the timeline line
    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ["start 80%", "end 20%"],
    })

    const lineHeight = useTransform(scrollYProgress, [0, 1], ["0%", "100%"])

    // Determine which step is "active" based on scroll
    const activeIndex = useTransform(scrollYProgress, [0, 1], [0, STEP_KEYS.length - 1])

    // Use state to track the rounded active index
    const [activeStepIndex, setActiveStepIndex] = useState(0)
    activeIndex.on("change", v => setActiveStepIndex(Math.round(v)))

    return (
        <section className="py-24 md:py-32 overflow-hidden" ref={sectionRef}>
            <LandingContainer>
                <div className="flex flex-col gap-16">
                    {/* Header */}
                    <motion.div
                        className="flex flex-col items-center gap-6 text-center"
                        initial={{ opacity: 0, y: 20 }}
                        animate={isInView ? { opacity: 1, y: 0 } : {}}
                        transition={{ duration: 0.6 }}
                    >
                        <TypographyH2>{t('landing:architecture.journey.title')}</TypographyH2>
                        <TypographyLead className="max-w-2xl">
                            {t('landing:architecture.journey.subtitle')}
                        </TypographyLead>
                    </motion.div>

                    {/* Timeline */}
                    <div className="relative max-w-4xl mx-auto w-full" ref={containerRef}>
                        {/* Vertical line - background */}
                        <div className="absolute left-5 md:left-1/2 top-0 bottom-0 w-px bg-border/40 dark:bg-white/10 -translate-x-1/2" />

                        {/* Vertical line - progress fill */}
                        <motion.div
                            className="absolute left-5 md:left-1/2 top-0 w-px -translate-x-1/2 bg-gradient-to-b from-blue-400 via-violet-400 to-emerald-400"
                            style={{ height: lineHeight }}
                            ref={timelineRef}
                        />

                        {/* Steps */}
                        <div className="flex flex-col gap-8 md:gap-12 relative">
                            {STEP_KEYS.map((key, i) => (
                                <JourneyStep
                                    key={key}
                                    stepKey={key}
                                    index={i}
                                    isActive={i <= activeStepIndex}
                                    isExpanded={expandedStep === key}
                                    onToggle={() => setExpandedStep(prev => prev === key ? null : key)}
                                />
                            ))}
                        </div>
                    </div>
                </div>
            </LandingContainer>
        </section>
    )
}
